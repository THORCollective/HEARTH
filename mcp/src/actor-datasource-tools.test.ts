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
  it("exposes all five tools, all read-only", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "coverage_gaps",
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

describe("coverage_gaps", () => {
  it("returns parent-technique gaps, most-used first, skipping pre-compromise tactics", async () => {
    const r = await call("coverage_gaps", {});
    expect(r.isError).toBeFalsy();
    const out = r.structuredContent;
    expect(out.gaps.length).toBe(Math.min(25, out.total_gaps));
    expect(out.pre_compromise_skipped).toBeGreaterThan(0);
    for (const g of out.gaps) {
      expect(g.technique).toMatch(/^T\d{4}$/);
      expect(g.tactics).not.toContain("Reconnaissance");
      expect(g.tactics).not.toContain("Resource Development");
      expect(g.submit_url).toContain(`technique=${g.technique}`);
    }
    const counts = out.gaps.map((g: any) => g.group_count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(out.submit_hunt).toContain("submit.html");
  });

  it("never lists a technique that a hunt covers directly or through a sub-technique", async () => {
    const covered = new Set(
      data.hunts.filter((h) => h.status !== "retired").flatMap((h) => (h.techniques ?? []).map((t) => t.split(".")[0])),
    );
    const out = (await call("coverage_gaps", { limit: 100 })).structuredContent;
    for (const g of out.gaps) expect(covered.has(g.technique)).toBe(false);
  });

  it("shows pre-compromise gaps when their tactic is asked for", async () => {
    const out = (await call("coverage_gaps", { tactic: "Resource Development" })).structuredContent;
    expect(out.total_gaps).toBeGreaterThan(0);
    expect(out.pre_compromise_skipped).toBe(0);
    for (const g of out.gaps) expect(g.tactics).toContain("Resource Development");
  });

  it("combines actor, tactic and platform", async () => {
    const out = (await call("coverage_gaps", { actor: "APT29", tactic: "Discovery", platform: "Windows" }))
      .structuredContent;
    expect(out.actor.id).toBe("G0016");
    const apt29 = data.actors.actorTechniques.get("actor:G0016")!;
    const parents = new Set([...apt29].map((t) => t.split(".")[0]));
    for (const g of out.gaps) {
      expect(parents.has(g.technique)).toBe(true);
      expect(g.tactics).toContain("Discovery");
    }
  });

  it("lists uncovered sub-techniques on request", async () => {
    const out = (await call("coverage_gaps", { include_subtechniques: true, limit: 100 })).structuredContent;
    const withSubs = out.gaps.filter((g: any) => g.uncovered_subtechniques.length > 0);
    expect(withSubs.length).toBeGreaterThan(0);
    expect(out.gaps.some((g: any) => g.has_hunt)).toBe(true);
    for (const g of withSubs)
      for (const s of g.uncovered_subtechniques) expect(s.technique.startsWith(`${g.technique}.`)).toBe(true);
  });

  it("with data sources, lists covered techniques you can't run", async () => {
    const out = (await call("coverage_gaps", { data_sources: ["email"], limit: 100 })).structuredContent;
    expect(out.total_cant_run).toBeGreaterThan(0);
    for (const c of out.cant_run) {
      expect(c.hunts.length).toBeGreaterThan(0);
      expect(c.missing_sources).not.toContain("email");
    }
    expect((await call("coverage_gaps", {})).structuredContent.cant_run).toBeUndefined();
  });

  it("rejects unknown actors, tactics and platforms", async () => {
    expect((await call("coverage_gaps", { actor: "zzzz-no-such-actor" })).isError).toBe(true);
    expect((await call("coverage_gaps", { tactic: "Defense Evasion" })).isError).toBe(true);
    expect((await call("coverage_gaps", { platform: "PRE" })).isError).toBe(true);
  });

  it("agrees with hunts_for_actor about an actor's gaps", async () => {
    const a = (await call("hunts_for_actor", { actor: "APT29" })).structuredContent;
    const g = (await call("coverage_gaps", { actor: "APT29" })).structuredContent;
    expect(a.total_gaps).toBe(g.total_gaps);
    expect(a.gaps.map((x: any) => x.technique)).toEqual(g.gaps.map((x: any) => x.technique));
  });
});
