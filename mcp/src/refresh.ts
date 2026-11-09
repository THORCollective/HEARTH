/**
 * Keeps hunt data fresh between releases. Order of preference:
 * a fresh fetch from the HEARTH site, then the local cache, then the snapshot
 * bundled in the package. Every fetched payload is validated with the same
 * schemas as the bundle (data.ts) and is only used, or cached, if it passes.
 *
 * Network use: at most one check per 24 hours, as conditional GETs
 * (If-None-Match) for the five public JSON files. Nothing is sent except the
 * request itself and a `hearth-mcp/<version>` User-Agent.
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DATA_FILES, loadData, parseData, type HearthData } from "./data";

type DataFile = (typeof DATA_FILES)[number];

export const DEFAULT_DATA_URL = "https://hearth.thorcollective.com/";
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Per file. hunts-data.json is about 4 MB today. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
const TIMEOUT_MS = 30_000;

export interface RefreshConfig {
  offline: boolean;
  /** Base URL ending in "/"; the data files are fetched relative to it. */
  baseUrl: string;
}

export interface RefreshOptions extends RefreshConfig {
  bundledDir: string;
  cacheDir: string;
  /** When the bundled snapshot was built (ISO date). A cache older than this is ignored. */
  snapshotAt?: string;
  userAgent: string;
  now?: () => number;
  log?: (msg: string) => void;
}

/** Saved in cacheDir/meta.json; written last, so it only ever names a complete set. */
interface CacheMeta {
  source: string;
  dir: string;
  checkedAt: number;
  /** Last-Modified of hunts-data.json: when the cached data was published. */
  dataDate?: string;
  etags: Partial<Record<DataFile, string>>;
}

export interface LocalData {
  data: HearthData;
  from: "cache" | "bundled";
  meta?: CacheMeta;
}

export type RefreshResult =
  | { status: "updated"; data: HearthData; meta: CacheMeta }
  | { status: "not-modified" | "skipped"; meta?: CacheMeta }
  | { status: "failed"; reason: string; meta?: CacheMeta };

/** Reads HEARTH_OFFLINE and HEARTH_DATA_URL. Throws on an unusable URL rather than guessing. */
export function resolveConfig(env: NodeJS.ProcessEnv): RefreshConfig {
  const offline = ["1", "true", "yes"].includes(
    (env.HEARTH_OFFLINE ?? "").trim().toLowerCase(),
  );
  const raw = env.HEARTH_DATA_URL?.trim() || DEFAULT_DATA_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      `HEARTH_DATA_URL is not a valid URL: ${JSON.stringify(raw.slice(0, 200))}`,
    );
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    throw new Error(
      "HEARTH_DATA_URL must use https (http is allowed only for localhost)",
    );
  if (url.username || url.password)
    throw new Error("HEARTH_DATA_URL must not contain credentials");
  url.search = "";
  url.hash = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return { offline, baseUrl: url.href };
}

/** Per-user cache directory, following each platform's convention. */
export function defaultCacheDir(env: NodeJS.ProcessEnv = process.env): string {
  if (process.platform === "win32")
    return join(
      env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
      "hearth-mcp",
      "Cache",
    );
  if (process.platform === "darwin")
    return join(homedir(), "Library", "Caches", "hearth-mcp");
  return join(env.XDG_CACHE_HOME || join(homedir(), ".cache"), "hearth-mcp");
}

function readMeta(cacheDir: string): CacheMeta | undefined {
  try {
    const m = JSON.parse(readFileSync(join(cacheDir, "meta.json"), "utf8"));
    if (
      typeof m.source === "string" &&
      typeof m.dir === "string" &&
      /^data-\d+$/.test(m.dir) &&
      typeof m.checkedAt === "number" &&
      m.etags &&
      typeof m.etags === "object"
    )
      return m as CacheMeta;
  } catch {
    // No cache yet, or unreadable: treated as no cache.
  }
  return undefined;
}

function writeMeta(cacheDir: string, meta: CacheMeta): void {
  const tmp = join(cacheDir, `meta.json.${process.pid}.tmp`);
  writeFileSync(tmp, JSON.stringify(meta));
  renameSync(tmp, join(cacheDir, "meta.json"));
}

/** Cached data if it is valid, from the same source, and newer than the bundle; else the bundle. */
export function loadLocal(opts: RefreshOptions): LocalData {
  const log = opts.log ?? (() => {});
  const meta = readMeta(opts.cacheDir);
  const sameSource = meta?.source === opts.baseUrl ? meta : undefined;
  if (sameSource) {
    const older =
      opts.snapshotAt &&
      sameSource.dataDate &&
      Date.parse(sameSource.dataDate) < Date.parse(opts.snapshotAt);
    if (!older) {
      try {
        return {
          data: loadData(join(opts.cacheDir, sameSource.dir)),
          from: "cache",
          meta: sameSource,
        };
      } catch (err) {
        log(
          `cached data is unusable (${errorText(err)}); using the bundled snapshot`,
        );
        // Forget its ETags so the next refresh downloads a whole new set.
        return { data: loadData(opts.bundledDir), from: "bundled" };
      }
    }
  }
  return { data: loadData(opts.bundledDir), from: "bundled", meta: sameSource };
}

async function readLimited(res: Response, max: number): Promise<string> {
  const declared = Number(res.headers.get("content-length"));
  if (declared > max) throw new Error(`response larger than ${max} bytes`);
  if (!res.body) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    size += chunk.byteLength;
    if (size > max) throw new Error(`response larger than ${max} bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Checks the site for new data if the last check was over 24 hours ago.
 * Never throws: on any failure the caller keeps serving what it has.
 */
export async function refresh(
  opts: RefreshOptions,
  meta?: CacheMeta,
): Promise<RefreshResult> {
  const now = (opts.now ?? Date.now)();
  if (opts.offline) return { status: "skipped", meta };
  if (meta && meta.source === opts.baseUrl && now - meta.checkedAt < MAX_AGE_MS)
    return { status: "skipped", meta };

  const prior = meta?.source === opts.baseUrl ? meta : undefined;
  let bodies: Record<DataFile, string | null>;
  let etags: Partial<Record<DataFile, string>>;
  let dataDate: string | undefined;
  try {
    const responses = await Promise.all(
      DATA_FILES.map(async (file) => {
        const headers: Record<string, string> = {
          "user-agent": opts.userAgent,
          accept: "application/json",
        };
        const etag = prior?.etags[file];
        if (etag) headers["if-none-match"] = etag;
        const res = await fetch(new URL(file, opts.baseUrl), {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (res.status === 304 && etag)
          return { file, body: null, etag, date: undefined };
        if (res.status !== 200) throw new Error(`${file}: HTTP ${res.status}`);
        return {
          file,
          body: await readLimited(res, MAX_FILE_BYTES),
          etag: res.headers.get("etag") ?? undefined,
          date: res.headers.get("last-modified") ?? undefined,
        };
      }),
    );
    bodies = Object.fromEntries(
      responses.map((r) => [r.file, r.body]),
    ) as typeof bodies;
    etags = Object.fromEntries(
      responses.filter((r) => r.etag).map((r) => [r.file, r.etag]),
    );
    dataDate =
      responses.find((r) => r.file === "hunts-data.json")?.date ??
      prior?.dataDate;
  } catch (err) {
    // Network trouble: try again next start rather than waiting 24 hours.
    return {
      status: "failed",
      reason: `could not reach ${opts.baseUrl}: ${errorText(err)}`,
      meta,
    };
  }

  if (prior && Object.values(bodies).every((b) => b === null)) {
    const next = { ...prior, checkedAt: now };
    writeMeta(opts.cacheDir, next);
    return { status: "not-modified", meta: next };
  }

  // Fill 304s from the cache, then validate the whole set before using any of it.
  let data: HearthData;
  const texts = {} as Record<DataFile, string>;
  try {
    for (const file of DATA_FILES)
      texts[file] =
        bodies[file] ??
        readFileSync(join(opts.cacheDir, prior!.dir, file), "utf8");
    const json = (f: DataFile) => JSON.parse(texts[f]);
    data = parseData({
      hunts: json("hunts-data.json"),
      mapping: json("datasource-mapping.json"),
      graph: json("context-graph-data.json"),
      mentions: json("actor-mentions.json"),
      matrix: json("mitre-matrix.json"),
    });
  } catch (err) {
    // Bad data from the site: keep the last good copy and don't retry for 24 hours.
    mkdirSync(opts.cacheDir, { recursive: true });
    if (prior) writeMeta(opts.cacheDir, { ...prior, checkedAt: now });
    const reason =
      err instanceof Error && "issues" in err
        ? "failed validation"
        : errorText(err);
    return {
      status: "failed",
      reason: `fetched data rejected: ${reason}`,
      meta: prior,
    };
  }

  // Write the new set to its own directory, then point meta.json at it, so a
  // crash mid-write can never leave a mixed set in use.
  const dir = `data-${now}`;
  mkdirSync(join(opts.cacheDir, dir), { recursive: true });
  for (const file of DATA_FILES)
    writeFileSync(join(opts.cacheDir, dir, file), texts[file]);
  const next: CacheMeta = {
    source: opts.baseUrl,
    dir,
    checkedAt: now,
    dataDate,
    etags,
  };
  writeMeta(opts.cacheDir, next);
  for (const old of readdirSync(opts.cacheDir))
    if (/^data-\d+$/.test(old) && old !== dir)
      rmSync(join(opts.cacheDir, old), { recursive: true, force: true });
  return { status: "updated", data, meta: next };
}
