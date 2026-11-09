import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DATA_FILES } from "./data";
import {
  loadLocal,
  MAX_AGE_MS,
  refresh,
  resolveConfig,
  type RefreshOptions,
} from "./refresh";

// A real HTTP server on localhost standing in for hearth.thorcollective.com,
// with GitHub Pages-style ETags, so the tests exercise real fetch, headers and
// conditional requests rather than mocks.

const PUBLIC = join(__dirname, "..", "..", "public");
const real = Object.fromEntries(
  DATA_FILES.map((f) => [f, readFileSync(join(PUBLIC, f), "utf8")]),
);
const realHunts = JSON.parse(real["hunts-data.json"]);

let files: Record<string, string>;
let lastModified: string;
let requests: { path: string; ifNoneMatch?: string; ua?: string }[];
let mode: "ok" | "500";
let server: Server;
let baseUrl: string;

const etag = (body: string) =>
  `"${createHash("sha1").update(body).digest("hex").slice(0, 12)}"`;

beforeAll(async () => {
  server = createServer((req, res) => {
    const name = (req.url ?? "/").slice(1);
    requests.push({
      path: name,
      ifNoneMatch: req.headers["if-none-match"] as string | undefined,
      ua: req.headers["user-agent"],
    });
    if (mode === "500") return res.writeHead(500).end();
    const body = files[name];
    if (body === undefined) return res.writeHead(404).end();
    const tag = etag(body);
    if (req.headers["if-none-match"] === tag)
      return res.writeHead(304, { etag: tag }).end();
    res.writeHead(200, {
      etag: tag,
      "last-modified": lastModified,
      "content-type": "application/json",
    });
    res.end(body);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}/`;
});

afterAll(() => new Promise<void>((r) => server.close(() => r())));

let cacheDir: string;
let clock: number;
let opts: RefreshOptions;

beforeEach(() => {
  files = { ...real };
  lastModified = new Date("2030-01-01").toUTCString();
  requests = [];
  mode = "ok";
  cacheDir = mkdtempSync(join(tmpdir(), "hearth-mcp-cache-"));
  clock = Date.parse("2030-01-02");
  opts = {
    offline: false,
    baseUrl,
    bundledDir: PUBLIC,
    cacheDir,
    snapshotAt: "2029-12-31T00:00:00Z",
    userAgent: "hearth-mcp/test",
    now: () => clock,
  };
});

/** Site data with one extra hunt, so a refresh is visible. */
function publishNewHunt() {
  const extra = {
    ...realHunts[0],
    id: "H9999",
    title: "Freshly published hunt",
  };
  files["hunts-data.json"] = JSON.stringify([...realHunts, extra]);
}

describe("refresh", () => {
  it("fresh fetch: validates, caches and serves new data", async () => {
    publishNewHunt();
    const r = await refresh(opts);
    expect(r.status).toBe("updated");
    if (r.status !== "updated") return;
    expect(r.data.byId.get("H9999")?.title).toBe("Freshly published hunt");
    expect(requests.map((q) => q.path).sort()).toEqual([...DATA_FILES].sort());
    expect(
      requests.every((q) => q.ua === "hearth-mcp/test" && !q.ifNoneMatch),
    ).toBe(true);

    // The next start serves the cache without touching the network.
    const local = loadLocal(opts);
    expect(local.from).toBe("cache");
    expect(local.data.byId.has("H9999")).toBe(true);
  });

  it("checks at most once every 24 hours", async () => {
    await refresh(opts);
    const { meta } = loadLocal(opts);
    requests = [];
    clock += MAX_AGE_MS - 1;
    expect((await refresh(opts, meta)).status).toBe("skipped");
    expect(requests).toEqual([]);
  });

  it("304 Not Modified: sends ETags, keeps the cache and resets the 24h clock", async () => {
    await refresh(opts);
    const before = loadLocal(opts);
    requests = [];
    clock += MAX_AGE_MS + 1;
    const r = await refresh(opts, before.meta);
    expect(r.status).toBe("not-modified");
    expect(requests).toHaveLength(DATA_FILES.length);
    expect(requests.every((q) => q.ifNoneMatch?.startsWith('"'))).toBe(true);
    expect(r.meta?.checkedAt).toBe(clock);
    expect(loadLocal(opts).meta?.dir).toBe(before.meta?.dir);
  });

  it("partial update: re-downloads only the changed file and reuses the rest", async () => {
    await refresh(opts);
    const { meta } = loadLocal(opts);
    publishNewHunt();
    requests = [];
    clock += MAX_AGE_MS + 1;
    const r = await refresh(opts, meta);
    expect(r.status).toBe("updated");
    if (r.status === "updated") expect(r.data.byId.has("H9999")).toBe(true);
    // Only the new set is kept on disk.
    expect(readdirSync(cacheDir).filter((d) => d.startsWith("data-"))).toEqual([
      r.meta!.dir,
    ]);
  });

  it("network error: fails without throwing, keeps the cache, and retries next start", async () => {
    await refresh(opts);
    const { meta } = loadLocal(opts);
    clock += MAX_AGE_MS + 1;
    mode = "500";
    const r = await refresh(opts, meta);
    expect(r.status).toBe("failed");
    expect(loadLocal(opts).from).toBe("cache");
    // Not marked as checked, so the next start tries again.
    expect(loadLocal(opts).meta?.checkedAt).toBe(meta?.checkedAt);

    const unreachable = await refresh({
      ...opts,
      baseUrl: "http://127.0.0.1:1/",
    });
    expect(unreachable).toMatchObject({ status: "failed" });
  });

  it("malformed payload: rejected, never cached, and the last good data stays", async () => {
    await refresh(opts);
    const good = loadLocal(opts);
    clock += MAX_AGE_MS + 1;

    for (const bad of [
      "{not json",
      JSON.stringify([{ id: "H001" }]),
      JSON.stringify([]),
      JSON.stringify([
        { ...realHunts[0], data_source_categories: ["made_up"] },
      ]),
    ]) {
      files["hunts-data.json"] = bad;
      const r = await refresh(opts, good.meta);
      expect(r.status, bad.slice(0, 30)).toBe("failed");
      const after = loadLocal(opts);
      expect(after.meta?.dir).toBe(good.meta?.dir);
      expect(after.data.hunts.length).toBe(good.data.hunts.length);
    }
  });

  it("rejects responses over the size limit", async () => {
    files["hunts-data.json"] = " ".repeat(51 * 1024 * 1024);
    const r = await refresh(opts);
    expect(r).toMatchObject({ status: "failed" });
    expect(r.status === "failed" && r.reason).toMatch(/larger than/);
  });

  it("offline: never touches the network", async () => {
    const r = await refresh({ ...opts, offline: true });
    expect(r.status).toBe("skipped");
    expect(requests).toEqual([]);
    expect(loadLocal({ ...opts, offline: true }).from).toBe("bundled");
  });
});

describe("loadLocal", () => {
  it("uses the bundle when there is no cache", () => {
    expect(loadLocal(opts).from).toBe("bundled");
  });

  it("ignores a cache older than the bundled snapshot", async () => {
    lastModified = new Date("2029-06-01").toUTCString();
    await refresh(opts);
    expect(loadLocal(opts).from).toBe("bundled");
  });

  it("ignores a cache downloaded from a different HEARTH_DATA_URL", async () => {
    await refresh(opts);
    expect(
      loadLocal({ ...opts, baseUrl: "https://mirror.example/" }).from,
    ).toBe("bundled");
  });

  it("falls back to the bundle if the cache was corrupted on disk, and forgets its ETags", async () => {
    await refresh(opts);
    const { meta } = loadLocal(opts);
    writeFileSync(join(cacheDir, meta!.dir, "hunts-data.json"), "garbage");
    const local = loadLocal(opts);
    expect(local.from).toBe("bundled");
    expect(local.meta).toBeUndefined();
  });

  it("ignores a meta.json pointing outside the cache, even at valid data", () => {
    // A tampered meta.json must not make the server read files elsewhere on disk.
    writeFileSync(
      join(cacheDir, "meta.json"),
      JSON.stringify({ source: baseUrl, dir: relative(cacheDir, PUBLIC), checkedAt: 0, etags: {} }),
    );
    expect(loadLocal(opts).from).toBe("bundled");
  });
});

describe("resolveConfig", () => {
  it("defaults to the HEARTH site, online", () => {
    expect(resolveConfig({})).toEqual({
      offline: false,
      baseUrl: "https://hearth.thorcollective.com/",
    });
  });

  it("reads HEARTH_OFFLINE", () => {
    for (const v of ["1", "true", "YES"])
      expect(resolveConfig({ HEARTH_OFFLINE: v }).offline).toBe(true);
    for (const v of ["", "0", "false"])
      expect(resolveConfig({ HEARTH_OFFLINE: v }).offline).toBe(false);
  });

  it("normalises HEARTH_DATA_URL to a directory and drops query and fragment", () => {
    expect(
      resolveConfig({ HEARTH_DATA_URL: "https://mirror.example/hearth?x=1#y" })
        .baseUrl,
    ).toBe("https://mirror.example/hearth/");
    expect(
      resolveConfig({ HEARTH_DATA_URL: "http://localhost:8080" }).baseUrl,
    ).toBe("http://localhost:8080/");
  });

  it("rejects unsafe or invalid HEARTH_DATA_URL values", () => {
    for (const bad of [
      "not a url",
      "http://mirror.example/",
      "file:///etc/passwd",
      "ftp://mirror.example/",
      "https://user:pass@mirror.example/",
    ])
      expect(() => resolveConfig({ HEARTH_DATA_URL: bad }), bad).toThrow(
        /HEARTH_DATA_URL/,
      );
  });
});
