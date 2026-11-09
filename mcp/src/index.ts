import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadData } from "./data";
import { createServer } from "./server";

// Bundled snapshot sits next to dist/ in the published package (mcp/data/).
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

async function main(): Promise<void> {
  const data = loadData(DATA_DIR);
  await createServer(data).connect(new StdioServerTransport());
  // stdout is the protocol channel; diagnostics go to stderr only.
  console.error(`hearth-mcp: serving ${data.hunts.length} hunts over stdio`);
}

main().catch((err) => {
  console.error(
    "hearth-mcp failed to start:",
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
