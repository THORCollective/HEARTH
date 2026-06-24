import { describe, expect, it } from "vitest";
import type { Hunt } from "../types/Hunt";
import {
  biggestGapActors,
  buildActorIndex,
  buildTechniqueTactics,
  computeAllCoverage,
  coverageBoards,
  mostCoveredActors,
  topMatchedActors,
  type ActorMentionsData,
  type ContextGraphData,
} from "./actor-matching";

const NO_MENTIONS: ActorMentionsData = { mentions: {} };

function hunt(id: string, techniques: string[]): Hunt {
  return {
    id,
    category: "Flames",
    title: id,
    tactic: "",
    notes: "",
    tags: [],
    techniques,
    submitter: { name: "", link: "" },
    why: "",
    references: "",
    file_path: "",
  };
}

/** Threat-actor node carrying a full MITRE profile. */
function actorNode(id: string, mitre_techniques: string[]) {
  return {
    id,
    type: "threat_actor",
    label: id.replace("actor:", ""),
    mitre_techniques,
    mitre_technique_count: mitre_techniques.length,
  };
}

describe("buildActorIndex", () => {
  it("sources actorTechniques from the full MITRE profile", () => {
    const graph: ContextGraphData = {
      nodes: [actorNode("actor:A", ["T1", "T2", "T3", "T4"])],
      edges: [],
    };
    const index = buildActorIndex(graph);
    expect(index.actorTechniques.get("actor:A")?.size).toBe(4);
  });

  it("falls back to EMPLOYS edges and accumulates ALL of them (regression)", () => {
    // Actor has no mitre_techniques → must collect every EMPLOYS edge, not just the first.
    const graph: ContextGraphData = {
      nodes: [{ id: "actor:B", type: "threat_actor", label: "B" }],
      edges: [
        { source: "actor:B", target: "T1", type: "EMPLOYS" },
        { source: "actor:B", target: "T2", type: "EMPLOYS" },
        { source: "actor:B", target: "T3", type: "EMPLOYS" },
      ],
    };
    const index = buildActorIndex(graph);
    expect(index.actorTechniques.get("actor:B")?.size).toBe(3);
  });

  it("unions EMPLOYS edges with the full profile (never drops a HEARTH technique)", () => {
    // Actor has a full profile AND an EMPLOYS edge for a technique not in it.
    const graph: ContextGraphData = {
      nodes: [actorNode("actor:C", ["T1", "T2"])],
      edges: [{ source: "actor:C", target: "T9", type: "EMPLOYS" }],
    };
    const index = buildActorIndex(graph);
    const set = index.actorTechniques.get("actor:C");
    expect(set?.size).toBe(3);
    expect(set?.has("T9")).toBe(true); // EMPLOYS technique not dropped
  });
});

describe("computeCoverage via full profile", () => {
  it("yields a coverage % below 100 and the correct gap when the profile exceeds hunted techniques", () => {
    const graph: ContextGraphData = {
      nodes: [actorNode("actor:A", ["T1", "T2", "T3", "T4"])],
      edges: [],
    };
    const index = buildActorIndex(graph);
    const rows = computeAllCoverage(
      [hunt("H1", ["T1", "T2"])],
      NO_MENTIONS,
      index,
    );
    const cov = rows[0].coverage;

    expect(cov.actorTechniqueCount).toBe(4);
    expect(cov.techniquesCovered).toBe(2);
    expect(cov.coveragePercent).toBe(50);
    expect(cov.gapTechniqueCount).toBe(2);
    expect(cov.matchedHuntCount).toBe(1);
  });
});

describe("biggestGapActors", () => {
  it("orders by ascending coverage % and excludes fully-covered actors", () => {
    // Disjoint technique namespaces so each hunt matches exactly one actor.
    const graph: ContextGraphData = {
      nodes: [
        actorNode("actor:Low", ["L1", "L2", "L3", "L4"]), // 1/4 = 25%
        actorNode("actor:Mid", ["M1", "M2", "M3", "M4"]), // 2/4 = 50%
        actorNode("actor:Full", ["F1", "F2"]), // 2/2 = 100%, gap 0 → excluded
      ],
      edges: [],
    };
    const index = buildActorIndex(graph);
    const rows = computeAllCoverage(
      [
        hunt("H_low", ["L1"]),
        hunt("H_mid", ["M1", "M2"]),
        hunt("H_full", ["F1", "F2"]),
      ],
      NO_MENTIONS,
      index,
    );
    // minTechniqueCount=1 so the small stub profiles qualify.
    const gaps = biggestGapActors(rows, 5, 1);
    const ids = gaps.map((r) => r.actor.id);

    expect(ids).toEqual(["actor:Low", "actor:Mid"]);
    expect(ids).not.toContain("actor:Full");
    expect(gaps[0].coverage.coveragePercent).toBeLessThan(
      gaps[1].coverage.coveragePercent,
    );
  });
});

describe("most/least covered boards are opposite ends of one metric", () => {
  // Three actors, disjoint techniques so each hunt matches exactly one actor.
  const graph: ContextGraphData = {
    nodes: [
      actorNode("actor:Hi", ["H1", "H2", "H3", "H4"]), // 3/4 = 75%
      actorNode("actor:Mid", ["M1", "M2", "M3", "M4"]), // 2/4 = 50%
      actorNode("actor:Lo", ["L1", "L2", "L3", "L4"]), // 1/4 = 25%
    ],
    edges: [],
  };
  const index = buildActorIndex(graph);
  const rows = computeAllCoverage(
    [
      hunt("Hh", ["H1", "H2", "H3"]),
      hunt("Hm", ["M1", "M2"]),
      hunt("Hl", ["L1"]),
    ],
    NO_MENTIONS,
    index,
  );

  it("mostCoveredActors ranks by descending coverage %", () => {
    const ids = mostCoveredActors(rows, 5, 1).map((r) => r.actor.id);
    expect(ids).toEqual(["actor:Hi", "actor:Mid", "actor:Lo"]);
  });

  it("opposite ends never collide (boards don't share their extremes)", () => {
    // Slices that don't meet in the middle of the population share no actor.
    const most = mostCoveredActors(rows, 1, 1).map((r) => r.actor.id);
    const least = biggestGapActors(rows, 1, 1).map((r) => r.actor.id);
    expect(most).toEqual(["actor:Hi"]);
    expect(least).toEqual(["actor:Lo"]);
    expect(most.filter((id) => least.includes(id))).toEqual([]);
  });

  it("the technique floor excludes small-profile actors from both boards", () => {
    // actor:Lo has 4 techniques; a floor of 10 drops it everywhere.
    expect(mostCoveredActors(rows, 5, 10)).toEqual([]);
    expect(biggestGapActors(rows, 5, 10)).toEqual([]);
  });

  it("coverageBoards guarantees disjoint boards even when slices would overlap", () => {
    // 3 actors, limit 5: raw top-5 and bottom-5 would both contain all three.
    // coverageBoards must still yield zero overlap.
    const { mostCovered, leastCovered } = coverageBoards(rows, 5, 1);
    const mostIds = mostCovered.map((r) => r.actor.id);
    const leastIds = leastCovered.map((r) => r.actor.id);
    expect(mostIds.filter((id) => leastIds.includes(id))).toEqual([]);
  });
});

describe("topMatchedActors", () => {
  it("ranks by raw hunt count (home-page recognizable pool), ignoring coverage %", () => {
    // Big has more hunts but lower %; Small has fewer hunts at 100%.
    const graph: ContextGraphData = {
      nodes: [
        actorNode("actor:Big", ["B1", "B2", "B3", "B4"]),
        actorNode("actor:Small", ["S1"]),
      ],
      edges: [],
    };
    const index = buildActorIndex(graph);
    const rows = computeAllCoverage(
      [hunt("b1", ["B1"]), hunt("b2", ["B2"]), hunt("s1", ["S1"])],
      NO_MENTIONS,
      index,
    );
    const ids = topMatchedActors(rows, 5).map((r) => r.actor.id);
    expect(ids[0]).toBe("actor:Big"); // 2 hunts beats Small's 1, despite Small at 100%
    expect(ids).toContain("actor:Small");
  });
});

describe("buildTechniqueTactics", () => {
  it("maps technique IDs to display-name tactics via the matrix shortname index", () => {
    const map = buildTechniqueTactics({
      tactics: [
        {
          id: "TA0011",
          shortname: "command-and-control",
          name: "Command and Control",
        },
      ],
      techniques: [{ id: "T1071", tactic_shortnames: ["command-and-control"] }],
    });
    expect(map.get("T1071")).toEqual(["Command and Control"]);
  });
});
