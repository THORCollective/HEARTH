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
const rawHunts = JSON.parse(readFileSync(join(__dirname, "..", "..", "public", "hunts-data.json"), "utf8"));
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
    if (g.expect_full_matches !== undefined) {
      expect(out.full_matches).toBe(g.expect_full_matches);
      // Fully runnable hunts come straight after any that name the actor.
      const full = out.hunts.slice(0, g.expect_full_matches);
      for (const h of full) expect(h.missing_sources).toEqual([]);
    }
    for (const id of g.expect_weak_ids ?? []) {
      const h = out.hunts.find((x: any) => x.id === id);
      expect(h?.relevance).toBeLessThan(1.5);
    }
  });
});

describe("golden hunts_for_datasources", () => {
  it.each(golden.hunts_for_datasources)("$name", async (g: any) => {
    // Counted from the raw labels, not pinned, so new hunts don't break the test.
    const have = new Set<string>(g.args.data_sources);
    const labelled = rawHunts.map((h: any) => h.data_source_categories ?? []).filter((c: string[]) => c.length);
    const out = await call("hunts_for_datasources", g.args);
    expect(out.total).toBe(labelled.filter((c: string[]) => c.some((x) => have.has(x))).length);
    expect(out.full_matches).toBe(labelled.filter((c: string[]) => c.every((x) => have.has(x))).length);
  });
});

describe("golden coverage_gaps", () => {
  // Computed from the raw matrix and hunts with the rule written out here, not
  // the tool code, so new hunts don't break the test.
  const matrix = JSON.parse(readFileSync(join(__dirname, "..", "..", "public", "mitre-matrix.json"), "utf8"));
  const tacticName = new Map<string, string>(matrix.tactics.map((t: any) => [t.shortname, t.name]));
  const covered = new Set(
    rawHunts
      .filter((h: any) => h.status !== "retired")
      .flatMap((h: any) => (h.techniques ?? []).map((t: string) => t.split(".")[0])),
  );
  const PRE = new Set(["Reconnaissance", "Resource Development"]);

  it.each(golden.coverage_gaps)("$name", async (g: any) => {
    const expected = matrix.techniques
      .filter((t: any) => !t.is_subtechnique && !covered.has(t.id))
      .filter((t: any) => {
        const tactics = (t.tactic_shortnames ?? []).map((s: string) => tacticName.get(s));
        if (g.args.tactic) return tactics.includes(g.args.tactic);
        return !(tactics.length && tactics.every((x: string) => PRE.has(x)));
      })
      .filter((t: any) => !g.args.platform || (t.platforms ?? []).includes(g.args.platform))
      .map((t: any) => t.id)
      .sort();
    const out = await call("coverage_gaps", { ...g.args, limit: 100 });
    expect(out.total_gaps).toBe(expected.length);
    expect(out.gaps.map((x: any) => x.technique).sort()).toEqual(expected.slice(0, 100));
  });
});
