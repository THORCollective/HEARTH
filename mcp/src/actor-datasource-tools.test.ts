import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadData, type HearthData } from "./data";
import { createServer } from "./server";

const PUBLIC = join(__dirname, "..", "..", "public");
let data: HearthData;
let client: Client;

async function call(name: string, args: Record<string, unknown>) {
  return (await client.callTool({ name, arguments: args })) as {
    isError?: boolean;
    structuredContent?: any;
    content: { type: string; text: string }[];
  };
}

beforeAll(async () => {
  data = loadData(PUBLIC);
  client = new Client({ name: "test", version: "1.0" });
  const [c, s] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(c), createServer(data).connect(s)]);
});

describe("tools/list", () => {
  it("exposes all four v0.1 tools, all read-only", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_hunt",
      "hunts_for_actor",
      "hunts_for_datasources",
      "search_hunts",
    ]);
    for (const t of tools) expect(t.annotations?.readOnlyHint).toBe(true);
  });
});

describe("hunts_for_actor", () => {
  it("resolves an actor by name and returns matched hunts with reasons", async () => {
    const r = await call("hunts_for_actor", { actor: "APT29" });
    expect(r.isError).toBeFalsy();
    const out = r.structuredContent;
    expect(out.actor.name).toBe("APT29");
    expect(out.actor.id).toBe("G0016");
    expect(out.actor.url).toBe("https://attack.mitre.org/groups/G0016");
    expect(out.coverage.actor_techniques).toBeGreaterThan(0);
    expect(out.coverage.techniques_covered).toBeLessThanOrEqual(
      out.coverage.actor_techniques,
    );
    expect(out.hunts.length).toBeGreaterThan(0);
    for (const h of out.hunts) {
      expect(h.reasons.length).toBeGreaterThan(0);
      if (h.reasons.includes("technique"))
        expect(h.shared_techniques.length).toBeGreaterThan(0);
    }
  });

  it("resolves aliases, ATT&CK group ids and partial names", async () => {
    expect(
      (await call("hunts_for_actor", { actor: "g0016" })).structuredContent
        .actor.name,
    ).toBe("APT29");
    const laz = await call("hunts_for_actor", { actor: "Lazarus" });
    expect(laz.structuredContent.actor.name).toMatch(/Lazarus/);
  });

  it("ranks hunts that name the actor first", async () => {
    const out = (await call("hunts_for_actor", { actor: "Scattered Spider", limit: 5 })).structuredContent;
    const named = new Set(data.mentions.mentions["actor:G1015"]);
    expect(named.size).toBeGreaterThan(0);
    const top = out.hunts.slice(0, named.size).map((h: any) => h.id);
    expect(new Set(top)).toEqual(named);
    for (const h of out.hunts.slice(0, named.size)) expect(h.reasons).toContain("mention");
  });

  it("lists other candidates when the name is ambiguous", async () => {
    const r = await call("hunts_for_actor", { actor: "APT" });
    expect(r.structuredContent.other_matches.length).toBeGreaterThan(0);
  });

  it("returns a tool error naming the input for unknown actors", async () => {
    const r = await call("hunts_for_actor", {
      actor: "Definitely Not A Real Group",
    });
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toMatch(/No threat actor matches/);
  });

  it("can narrow to hunts runnable with given data sources", async () => {
    const all = (await call("hunts_for_actor", { actor: "APT29", limit: 100 }))
      .structuredContent;
    const some = (
      await call("hunts_for_actor", {
        actor: "APT29",
        data_sources: ["email"],
        limit: 100,
      })
    ).structuredContent;
    expect(some.total_hunts).toBeLessThan(all.total_hunts);
    for (const h of some.hunts)
      expect(h.data_sources.categories).toContain("email");
  });

  it("lists uncovered techniques as gaps, capped", async () => {
    const out = (await call("hunts_for_actor", { actor: "APT29" }))
      .structuredContent;
    expect(out.gaps.length).toBeLessThanOrEqual(25);
    expect(out.coverage.gap_techniques).toBe(
      out.coverage.actor_techniques - out.coverage.techniques_covered,
    );
    for (const g of out.gaps) expect(g.technique).toMatch(/^T\d{4}/);
  });
});

describe("hunts_for_datasources", () => {
  it("returns runnable hunts with full matches ranked first", async () => {
    const r = await call("hunts_for_datasources", {
      data_sources: ["endpoint", "windows"],
      limit: 100,
    });
    const out = r.structuredContent;
    expect(out.total).toBeGreaterThan(100);
    const fulls = out.hunts.map((h: any) => h.have_all_sources);
    // every "true" comes before every "false"
    expect(
      fulls.indexOf(false) === -1 ||
        fulls.lastIndexOf(true) < fulls.indexOf(false),
    ).toBe(true);
    for (const h of out.hunts) {
      expect(h.missing_sources).toEqual(
        h.data_sources.categories.filter(
          (c: string) => !["endpoint", "windows"].includes(c),
        ),
      );
    }
  });

  it("matches the any-of count used by the site", async () => {
    const out = (
      await call("hunts_for_datasources", { data_sources: ["appliance"] })
    ).structuredContent;
    expect(out.total).toBe(
      data.hunts.filter((h) => h.data_source_categories?.includes("appliance"))
        .length,
    );
    expect(out.full_matches).toBe(
      data.hunts.filter(
        (h) =>
          h.data_source_categories?.length === 1 &&
          h.data_source_categories[0] === "appliance",
      ).length,
    );
  });

  it("breaks the total down by category and accepts tactic filters", async () => {
    const out = (
      await call("hunts_for_datasources", {
        data_sources: ["cloud", "identity"],
        tactic: "Initial Access",
      })
    ).structuredContent;
    const sum = Object.values(out.by_category as Record<string, number>).reduce(
      (a, b) => a + b,
      0,
    );
    expect(sum).toBe(out.total);
    for (const h of out.hunts) expect(h.tactic).toMatch(/Initial Access/);
  });

  it("requires at least one valid data source", async () => {
    expect(
      (await call("hunts_for_datasources", { data_sources: [] })).isError,
    ).toBe(true);
    expect(
      (await call("hunts_for_datasources", { data_sources: ["mainframe"] }))
        .isError,
    ).toBe(true);
  });
});
