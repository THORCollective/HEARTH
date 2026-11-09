import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadData } from "./data";
import { createServer } from "./server";

/**
 * Golden queries for hunts_for_actor and hunts_for_datasources. Expectations
 * are computed from the data files independently of the tool code (see each
 * entry's `source`). Add one by appending to mcp/golden/tools.json.
 */
const golden = JSON.parse(readFileSync(join(__dirname, "..", "golden", "tools.json"), "utf8"));
let client: Client;

beforeAll(async () => {
  client = new Client({ name: "golden", version: "1.0" });
  const [c, s] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(c), createServer(loadData(join(__dirname, "..", "..", "public"))).connect(s)]);
});

const call = async (name: string, args: unknown) =>
  ((await client.callTool({ name, arguments: args as Record<string, unknown> })) as any).structuredContent;

describe("golden hunts_for_actor", () => {
  it.each(golden.hunts_for_actor)("$name", async (g: any) => {
    const out = await call("hunts_for_actor", { ...g.args, limit: 100 });
    expect(out.actor.id).toBe(g.expect_actor);
    const top = new Set(out.hunts.slice(0, g.expect_top_ids.length).map((h: any) => h.id));
    expect(top).toEqual(new Set(g.expect_top_ids));
    if (g.expect_not_in_top) {
      const head = out.hunts.slice(0, g.expect_not_in_top.n).map((h: any) => h.id);
      for (const id of g.expect_not_in_top.ids) expect(head).not.toContain(id);
    }
  });
});

describe("golden hunts_for_datasources", () => {
  it.each(golden.hunts_for_datasources)("$name", async (g: any) => {
    const out = await call("hunts_for_datasources", g.args);
    expect(out.total).toBe(g.expect_total);
    expect(out.full_matches).toBe(g.expect_full);
  });
});
