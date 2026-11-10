import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// End-to-end over the real transport: build the package exactly as it ships,
// spawn dist/index.js with node, and speak MCP to it over stdin/stdout. Any
// stray stdout write from the server would corrupt the protocol and fail here.

const MCP_DIR = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(MCP_DIR, "package.json"), "utf8"));
let client: Client;
let stderr = "";

beforeAll(async () => {
  execFileSync(process.execPath, ["build.mjs"], {
    cwd: MCP_DIR,
    stdio: "pipe",
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(MCP_DIR, pkg.bin["hearth-mcp"])],
    stderr: "pipe",
    // Tests never touch the network or the user's real cache.
    env: { HEARTH_OFFLINE: "1", HEARTH_CACHE_DIR: mkdtempSync(join(tmpdir(), "hearth-mcp-stdio-")) },
  });
  transport.stderr?.on("data", (d) => (stderr += d));
  client = new Client({ name: "stdio-test", version: "1.0" });
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client?.close();
});

describe("stdio server", () => {
  it("completes the MCP handshake and identifies itself", () => {
    expect(client.getServerVersion()).toEqual({
      name: "hearth",
      version: pkg.version,
    });
    expect(client.getServerCapabilities()?.tools).toBeDefined();
    expect(client.getInstructions()).toMatch(/untrusted/);
  });

  it("lists exactly the four read-only tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_hunt",
      "hunts_for_actor",
      "hunts_for_datasources",
      "search_hunts",
    ]);
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint, t.name).toBe(true);
      expect(t.annotations?.openWorldHint, t.name).toBe(false);
      expect(t.outputSchema, t.name).toBeDefined();
    }
  });

  it("answers each tool with structured content", async () => {
    const calls: [string, Record<string, unknown>][] = [
      ["get_hunt", { id: "H432" }],
      ["search_hunts", { query: "kerberoasting", limit: 3 }],
      [
        "hunts_for_actor",
        {
          actor: "Volt Typhoon",
          data_sources: ["network", "appliance"],
          limit: 3,
        },
      ],
      ["hunts_for_datasources", { data_sources: ["appliance"], limit: 3 }],
    ];
    for (const [name, args] of calls) {
      const r = (await client.callTool({ name, arguments: args })) as {
        isError?: boolean;
        structuredContent?: unknown;
      };
      expect(r.isError, name).toBeFalsy();
      expect(r.structuredContent, name).toBeTruthy();
    }
  });

  it("returns tool errors for bad input without crashing", async () => {
    const r = (await client.callTool({
      name: "get_hunt",
      arguments: { id: "H99999" },
    })) as {
      isError?: boolean;
    };
    expect(r.isError).toBe(true);
    // Still serving afterwards.
    const ok = (await client.callTool({
      name: "get_hunt",
      arguments: { id: "H432" },
    })) as {
      isError?: boolean;
    };
    expect(ok.isError).toBeFalsy();
  });

  it("logs only to stderr", () => {
    expect(stderr).toMatch(/hearth-mcp: serving \d+ hunts over stdio \(bundled data\)/);
    expect(stderr).toMatch(/HEARTH_OFFLINE is set/);
  });
});

describe("published package", () => {
  it("ships only the bundle, data snapshot, LICENSE, README and package.json", () => {
    const out = execFileSync(
      "npm",
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      {
        cwd: MCP_DIR,
        encoding: "utf8",
      },
    );
    const files = (JSON.parse(out)[0].files as { path: string }[])
      .map((f) => f.path)
      .sort();
    expect(files).toEqual([
      "LICENSE",
      "README.md",
      "data/actor-mentions.json",
      "data/context-graph-data.json",
      "data/datasource-mapping.json",
      "data/hunts-data.json",
      "data/mitre-matrix.json",
      "dist/index.js",
      "package.json",
    ]);
  });

  it("ships the same LICENSE as the repository", () => {
    expect(readFileSync(join(MCP_DIR, "LICENSE"), "utf8")).toBe(
      readFileSync(join(MCP_DIR, "..", "LICENSE"), "utf8"),
    );
  });

  it("has a shebang so npx can run the bin directly", () => {
    expect(
      readFileSync(join(MCP_DIR, "dist", "index.js"), "utf8").startsWith(
        "#!/usr/bin/env node",
      ),
    ).toBe(true);
  });

  it("keeps server.json in step with package.json", () => {
    const server = JSON.parse(
      readFileSync(join(MCP_DIR, "server.json"), "utf8"),
    );
    expect(server.name).toBe(pkg.mcpName);
    expect(server.version).toBe(pkg.version);
    expect(server.packages[0].identifier).toBe(pkg.name);
    expect(server.packages[0].version).toBe(pkg.version);
  });

  it("keeps the README's pinned-version example current", () => {
    const readme = readFileSync(join(MCP_DIR, "README.md"), "utf8");
    const pinned = [
      ...readme.matchAll(/@thorcollective\/hearth-mcp@(\d+\.\d+\.\d+)/g),
    ].map((m) => m[1]);
    expect(pinned.length).toBeGreaterThan(0);
    for (const v of pinned) expect(v).toBe(pkg.version);
  });
});
