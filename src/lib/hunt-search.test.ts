import { describe, expect, it } from "vitest";
import type { Hunt } from "../types/Hunt";
import { buildTechniqueIndex } from "./datasources";
import { searchHunts } from "./hunt-search";

function hunt(overrides: Partial<Hunt>): Hunt {
  return {
    id: "H001",
    category: "Flames",
    title: "t",
    tactic: "Persistence",
    notes: "",
    tags: [],
    submitter: { name: "someone", link: "" },
    why: "",
    references: "",
    file_path: "Flames/H001.md",
    status: "current",
    ...overrides,
  };
}

const HUNTS: Hunt[] = [
  hunt({
    id: "H001",
    title: "Kerberoasting via RC4 kerberos service tickets",
    tactic: "Credential Access",
    techniques: ["T1558.003"],
    data_source_categories: ["windows", "identity"],
  }),
  hunt({
    id: "H010",
    title: "LaunchAgent persistence on developer Macs",
    tactic: "Persistence",
    tags: ["launchagent", "macos"],
    techniques: ["T1543.001"],
    data_source_categories: ["endpoint", "macos"],
  }),
  hunt({
    id: "B002",
    category: "Embers",
    title: "Baseline of scheduled task creation",
    tactic: "Persistence, Execution",
    techniques: ["T1053.005"],
    data_source_categories: ["endpoint", "windows"],
  }),
  hunt({
    id: "H099",
    title: "Old retired kerberos hunt",
    tactic: "Credential Access",
    status: "retired",
    data_source_categories: ["identity"],
  }),
  hunt({
    id: "M005",
    category: "Alchemy",
    title: "Model of cloud console logins",
    tactic: "Initial Access",
    techniques: ["T1078.004"],
  }),
];

const ids = (r: ReturnType<typeof searchHunts>) => r.hunts.map((h) => h.id);

describe("searchHunts", () => {
  it("matches words across title, techniques and tags", () => {
    expect(ids(searchHunts(HUNTS, { query: "kerberoasting" }))).toEqual(["H001"]);
    expect(ids(searchHunts(HUNTS, { query: "T1543" }))).toEqual(["H010"]);
    expect(ids(searchHunts(HUNTS, { query: "launchagent developer" }))).toEqual(["H010"]);
  });

  it("ranks hunts matching more of the query first instead of requiring every word", () => {
    // Only B002 is a Windows scheduled task; H010 only matches "persistence".
    const r = ids(searchHunts(HUNTS, { query: "windows scheduled task persistence" }));
    expect(r[0]).toBe("B002");
  });

  it("ignores stopwords and normalises plurals and spacing", () => {
    expect(ids(searchHunts(HUNTS, { query: "persistence on macs" }))[0]).toBe("H010");
    expect(ids(searchHunts(HUNTS, { query: "launch agents" }))).toEqual(["H010"]);
    expect(ids(searchHunts(HUNTS, { query: "the of on" }))).toHaveLength(4); // no real terms: list all
  });

  it("keeps technique ids exact apart from sub-technique prefixes", () => {
    expect(ids(searchHunts(HUNTS, { query: "T1053" }))).toEqual(["B002"]);
    expect(ids(searchHunts(HUNTS, { query: "T1053.005" }))).toEqual(["B002"]);
    expect(ids(searchHunts(HUNTS, { query: "T1558" }))).toEqual(["H001"]);
  });

  it("matches hunt ids and is case-insensitive", () => {
    expect(ids(searchHunts(HUNTS, { query: "b002" }))).toEqual(["B002"]);
  });

  it("hides retired hunts unless asked", () => {
    expect(ids(searchHunts(HUNTS, { query: "kerberos" }))).toEqual(["H001"]);
    expect(
      ids(searchHunts(HUNTS, { query: "kerberos", includeRetired: true })),
    ).toEqual(["H099", "H001"]); // equal score: newest id first
  });

  it("ranks title matches above tag-only matches, then newest first", () => {
    const r = searchHunts(HUNTS, { query: "persistence" });
    // B002 and H010 both have persistence in tactic; H010 also in title.
    expect(ids(r)[0]).toBe("H010");
  });

  it("filters by category and tactic", () => {
    expect(ids(searchHunts(HUNTS, { category: "Embers" }))).toEqual(["B002"]);
    expect(ids(searchHunts(HUNTS, { tactic: "execution" }))).toEqual(["B002"]);
  });

  it("filters by data sources with any-of matching", () => {
    expect(ids(searchHunts(HUNTS, { dataSources: ["macos"] }))).toEqual([
      "H010",
    ]);
    expect(
      ids(searchHunts(HUNTS, { dataSources: ["macos", "identity"] })).sort(),
    ).toEqual(["H001", "H010"]);
  });

  it("uses the ATT&CK fallback for hunts without declared categories", () => {
    const index = buildTechniqueIndex({
      categories: [
        {
          id: "cloud",
          name: "Cloud",
          icon: "",
          description: "",
          examples: "",
          techniques: ["T1078.004"],
        },
      ],
      metadata: {},
    });
    expect(ids(searchHunts(HUNTS, { dataSources: ["cloud"] }, index))).toEqual([
      "M005",
    ]);
    expect(ids(searchHunts(HUNTS, { dataSources: ["cloud"] }))).toEqual([]);
  });

  it("reports the total and caps results at the limit", () => {
    const r = searchHunts(HUNTS, { limit: 2 });
    expect(r.total).toBe(4);
    expect(r.hunts).toHaveLength(2);
  });

  it("returns nothing for an empty filter set with no matches rather than throwing", () => {
    expect(searchHunts([], { query: "anything" })).toEqual({
      total: 0,
      hunts: [],
    });
  });
});
