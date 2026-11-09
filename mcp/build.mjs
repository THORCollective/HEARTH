// Bundles the server (and the shared ../src/lib code it imports) into one
// file, and snapshots the hunt data it serves. Runtime deps stay external.
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

// Keep in sync with DATA_FILES in src/data.ts.
const DATA_FILES = [
  "hunts-data.json",
  "datasource-mapping.json",
  "context-graph-data.json",
  "actor-mentions.json",
  "mitre-matrix.json",
];

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url)));

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  external: Object.keys(pkg.dependencies),
  banner: { js: "#!/usr/bin/env node" },
  logLevel: "warning",
});

mkdirSync("data", { recursive: true });
for (const f of DATA_FILES) {
  copyFileSync(new URL(`../public/${f}`, import.meta.url), `data/${f}`);
}
console.log("built dist/index.js and snapshotted data/");
