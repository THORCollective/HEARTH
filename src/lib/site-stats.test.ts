import { describe, expect, it } from "vitest";
import type { Hunt, HuntCategory } from "../types/Hunt";
import type { MitreMatrix } from "../types/Mitre";
import {
  canonicalTactics,
  computeSiteStats,
  contributorName,
} from "./site-stats";

const MATRIX: MitreMatrix = {
  tactics: [
    { id: "TA0002", shortname: "execution", name: "Execution" },
    { id: "TA0003", shortname: "persistence", name: "Persistence" },
    { id: "TA0006", shortname: "credential-access", name: "Credential Access" },
  ],
  techniques: ["T1059", "T1059.001", "T1105", "T1547.001"].map((id) => ({
    id,
    name: id,
    parent: null,
    tactic_shortnames: [],
    description: "",
    url: "",
    is_subtechnique: id.includes("."),
  })),
};

function hunt(
  id: string,
  opts: {
    category?: HuntCategory;
    tactic?: string;
    techniques?: string[];
    submitter?: string;
  } = {},
): Hunt {
  return {
    id,
    category: opts.category ?? "Flames",
    title: id,
    tactic: opts.tactic ?? "",
    notes: "",
    tags: [],
    techniques: opts.techniques ?? [],
    submitter: { name: opts.submitter ?? "Alice", link: "" },
    why: "",
    references: "",
    file_path: `Flames/${id}.md`,
  };
}

describe("contributorName", () => {
  it("drops parenthetical suffixes so one person counts once", () => {
    expect(contributorName("Jinx (THOR Collective)")).toBe("Jinx");
  });

  it("returns null for bots and placeholders", () => {
    for (const n of [
      "HEARTH Bot",
      "Anonymous",
      "anonymous",
      "_No response_",
      "",
      "  ",
    ]) {
      expect(contributorName(n)).toBeNull();
    }
  });

  it("keeps ordinary names", () => {
    expect(contributorName("  Lauren Proehl ")).toBe("Lauren Proehl");
  });
});

describe("canonicalTactics", () => {
  const known = [
    "Execution",
    "Persistence",
    "Credential Access",
    "Defense Evasion",
  ];

  it("maps messy tactic fields to real tactic names", () => {
    expect(canonicalTactics("Execution (T1059), Persistence", known)).toEqual([
      "Execution",
      "Persistence",
    ]);
    expect(canonicalTactics("Defense Evasion (TA0005)", known)).toEqual([
      "Defense Evasion",
    ]);
    expect(
      canonicalTactics(
        "Tactic: Defense Evasion (TA0005) - Technique: Impair Defenses (T1562.004)",
        known,
      ),
    ).toEqual(["Defense Evasion"]);
    // A comma inside the parenthetical must not leak a fake tactic.
    expect(
      canonicalTactics("Defense Evasion (T1218, T1566.002)", known),
    ).toEqual(["Defense Evasion"]);
  });

  it("is case-insensitive and dedupes", () => {
    expect(canonicalTactics("execution, EXECUTION", known)).toEqual([
      "Execution",
    ]);
  });

  it("ignores values that are not tactics", () => {
    expect(
      canonicalTactics("Valid Accounts, Multiple, Masquerading (T1036)", known),
    ).toEqual([]);
    expect(canonicalTactics("", known)).toEqual([]);
  });
});

describe("computeSiteStats", () => {
  const hunts = [
    hunt("H1", {
      tactic: "Execution",
      techniques: ["T1059", "T1059.001"],
      submitter: "Alice",
    }),
    hunt("H2", {
      tactic: "Execution (T1059), Persistence",
      techniques: ["T1059.001", "T1562.001"], // T1562.001 is not in the matrix
      submitter: "Jinx (THOR Collective)",
    }),
    hunt("B1", {
      category: "Embers",
      tactic: "Credential Access, Defense Evasion, Multiple",
      techniques: ["T1105"],
      submitter: "Jinx",
    }),
    hunt("M1", {
      category: "Alchemy",
      tactic: "Valid Accounts",
      submitter: "HEARTH Bot",
    }),
    hunt("M2", { category: "Alchemy", submitter: "Anonymous" }),
  ];

  const s = computeSiteStats(hunts, MATRIX);

  it("counts every hunt", () => {
    expect(s.hunts).toBe(5);
  });

  it("counts distinct techniques that exist in the current matrix", () => {
    expect(s.techniques).toBe(3); // T1059, T1059.001, T1105
  });

  it("counts people, not bots or placeholders", () => {
    expect(s.contributors).toBe(2); // Alice, Jinx
  });

  it("counts only current ATT&CK tactics (v19 retired Defense Evasion)", () => {
    expect(s.tactics).toBe(3); // Execution, Persistence, Credential Access
  });

  it("lists covered tactics in ATT&CK matrix order, for filters", () => {
    expect(s.tacticNames).toEqual(["Execution", "Persistence", "Credential Access"]);
  });

  it("breaks hunts and tactics down by PEAK category", () => {
    expect(s.byCategory).toEqual({
      Flames: { hunts: 2, tactics: 2 },
      Embers: { hunts: 1, tactics: 1 },
      Alchemy: { hunts: 2, tactics: 0 },
    });
  });
});
