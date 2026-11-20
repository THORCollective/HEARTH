import { describe, expect, it } from "vitest";
import type { DataSourceCategoryId, Hunt } from "../types/Hunt";
import { findCoverageGaps, type MatrixTechnique } from "./coverage-gaps";
import type { TechniqueIndex } from "./datasources";

const tech = (
  id: string,
  tactics: string[],
  platforms = ["Windows"],
): MatrixTechnique => ({
  id,
  name: `Name ${id}`,
  tactic_shortnames: tactics,
  platforms,
});

const TECHNIQUES: MatrixTechnique[] = [
  tech("T1003", ["credential-access"]),
  tech("T1003.001", ["credential-access"]),
  tech("T1003.006", ["credential-access"]),
  tech("T1012", ["discovery"], ["Windows"]),
  tech("T1082", ["discovery"], ["Windows", "Linux"]),
  tech("T1608", ["resource-development"], ["PRE"]),
  tech("T1059", ["execution"], ["Linux"]),
];

const hunt = (
  id: string,
  techniques: string[],
  cats: DataSourceCategoryId[] = ["endpoint"],
): Hunt =>
  ({
    id,
    techniques,
    data_source_categories: cats,
    tags: [],
  }) as unknown as Hunt;

// T1003.001 covers parent T1003 by rollup; T1059 is covered by a network-only hunt.
const HUNTS = [
  hunt("H001", ["T1003.001"]),
  hunt("H002", ["T1059"], ["network"]),
];

// G1 and G2 use T1012; G1 uses T1003 via T1003.006; three groups use T1608.
const ACTORS = new Map<string, Set<string>>([
  ["actor:G1", new Set(["T1012", "T1003.006", "T1608"])],
  ["actor:G2", new Set(["T1012", "T1608"])],
  ["actor:G3", new Set(["T1608", "T1082"])],
]);

const INDEX: TechniqueIndex = new Map();
const run = (scope = {}) =>
  findCoverageGaps(HUNTS, TECHNIQUES, ACTORS, INDEX, scope);
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("findCoverageGaps", () => {
  it("reports uncovered parents, most-used first, skipping pre-compromise tactics", () => {
    const r = run();
    // T1003 is covered through T1003.001; T1059 through H002.
    expect(ids(r.gaps)).toEqual(["T1012", "T1082"]);
    expect(r.gaps.map((g) => g.groupCount)).toEqual([2, 1]);
    expect(r.preCompromiseSkipped).toBe(1);
    expect(r.techniquesInScope).toBe(4);
  });

  it("brings pre-compromise techniques back when their tactic is asked for", () => {
    const r = run({ tactic: "resource-development" });
    expect(ids(r.gaps)).toEqual(["T1608"]);
    expect(r.gaps[0].groupCount).toBe(3);
    expect(r.preCompromiseSkipped).toBe(0);
  });

  it("filters by tactic and platform together", () => {
    expect(ids(run({ tactic: "discovery", platform: "Linux" }).gaps)).toEqual([
      "T1082",
    ]);
    expect(ids(run({ platform: "Linux" }).gaps)).toEqual(["T1082"]);
  });

  it("limits to an actor's techniques, counting a parent the actor uses only through a sub-technique", () => {
    const r = run({ actorTechniques: ACTORS.get("actor:G1") });
    expect(ids(r.gaps)).toEqual(["T1012"]);
    expect(r.techniquesInScope).toBe(2); // T1003 (via .006) and T1012
  });

  it("lists uncovered sub-techniques under their parent on request, even when the parent is covered", () => {
    const r = run({ includeSubtechniques: true });
    const t1003 = r.gaps.find((g) => g.id === "T1003");
    expect(t1003?.hasHunt).toBe(true);
    expect(ids(t1003?.subtechniques ?? [])).toEqual(["T1003.006"]);
    expect(t1003?.subtechniques?.[0].groupCount).toBe(1);
    expect(r.gaps.find((g) => g.id === "T1012")?.hasHunt).toBe(false);
  });

  it("does not list sub-techniques by default", () => {
    for (const g of run().gaps) expect(g.subtechniques).toBeUndefined();
  });

  it("with data sources, lists covered techniques whose hunts the team can't run", () => {
    const r = run({ dataSources: new Set<DataSourceCategoryId>(["endpoint"]) });
    expect(r.cantRun.map((c) => [c.id, c.huntIds, c.missingSources])).toEqual([
      ["T1059", ["H002"], ["network"]],
    ]);
    expect(run().cantRun).toEqual([]);
  });
});
