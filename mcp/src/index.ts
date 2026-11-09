import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultCacheDir,
  loadLocal,
  refresh,
  resolveConfig,
  type RefreshOptions,
} from "./refresh";
import { createServer, VERSION } from "./server";

// Bundled snapshot sits next to dist/ in the published package (mcp/data/).
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

// Set by build.mjs: when the bundled snapshot was built.
declare const __HEARTH_SNAPSHOT_AT__: string | undefined;

// stdout is the protocol channel; diagnostics go to stderr only.
const log = (msg: string) => console.error(`hearth-mcp: ${msg}`);

async function main(): Promise<void> {
  const config = resolveConfig(process.env);
  const opts: RefreshOptions = {
    ...config,
    bundledDir: DATA_DIR,
    cacheDir: process.env.HEARTH_CACHE_DIR || defaultCacheDir(),
    snapshotAt:
      typeof __HEARTH_SNAPSHOT_AT__ === "string"
        ? __HEARTH_SNAPSHOT_AT__
        : undefined,
    userAgent: `hearth-mcp/${VERSION}`,
    log,
  };

  // Serve local data straight away; the network check never delays startup.
  const local = loadLocal(opts);
  let data = local.data;
  await createServer(() => data).connect(new StdioServerTransport());
  log(`serving ${data.hunts.length} hunts over stdio (${local.from} data)`);

  if (config.offline)
    return log("HEARTH_OFFLINE is set: not checking for new hunts");
  const r = await refresh(opts, local.meta);
  if (r.status === "updated") {
    data = r.data;
    log(`updated to ${data.hunts.length} hunts from ${opts.baseUrl}`);
  } else if (r.status === "failed") {
    log(`${r.reason}; still serving ${local.from} data`);
  }
}

main().catch((err) => {
  log(`failed to start: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
