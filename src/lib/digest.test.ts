import { describe, expect, it } from "vitest";
import type { Hunt, HuntCategory } from "../types/Hunt";
import {
  buildDigest,
  extractSources,
  sourceGroup,
  isoWeekKey,
  listWeeks,
  parseWeekKey,
  weekRange,
} from "./digest";

function hunt(
  id: string,
  created: string | undefined,
  opts: {
    category?: HuntCategory;
    techniques?: string[];
    references?: string;
    submitter?: { name: string; link: string };
  } = {},
): Hunt {
  return {
    id,
    category: opts.category ?? "Flames",
    title: `Hunt ${id}`,
    tactic: "",
    notes: "",
    tags: [],
    techniques: opts.techniques ?? [],
    submitter: opts.submitter ?? { name: "Alice", link: "" },
    why: "",
    references: opts.references ?? "",
    file_path: `Flames/${id}.md`,
    created,
  };
}

describe("isoWeekKey", () => {
  it("uses ISO weeks starting Monday", () => {
    expect(isoWeekKey(new Date("2026-09-21T00:00:00Z"))).toBe("2026-W39"); // Mon
    expect(isoWeekKey(new Date("2026-09-27T23:59:59Z"))).toBe("2026-W39"); // Sun
    expect(isoWeekKey(new Date("2026-09-28T00:00:00Z"))).toBe("2026-W40"); // Mon
  });

  it("puts early-January days in the previous ISO year when needed", () => {
    expect(isoWeekKey(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53");
    expect(isoWeekKey(new Date("2026-01-01T12:00:00Z"))).toBe("2026-W01");
  });

  it("buckets by UTC, not the author's local offset", () => {
    // Sunday 21:00 in UTC-7 is Monday 04:00 UTC.
    expect(isoWeekKey(new Date("2026-09-20T21:00:00-07:00"))).toBe("2026-W39");
  });
});

describe("parseWeekKey / weekRange", () => {
  it("accepts well-formed keys", () => {
    expect(parseWeekKey("2026-W39")).toBe("2026-W39");
    expect(parseWeekKey("2026-W53")).toBe("2026-W53");
  });

  it("rejects anything else", () => {
    for (const bad of [
      null,
      "",
      "2026-39",
      "2026-W00",
      "2026-W54",
      "2025-W53",
      "<b>",
      "2026-W39x",
    ]) {
      expect(parseWeekKey(bad)).toBeNull();
    }
  });

  it("returns Monday through Sunday in UTC", () => {
    const { start, end } = weekRange("2026-W39");
    expect(start.toISOString()).toBe("2026-09-21T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-27T00:00:00.000Z");
  });

  it("round-trips with isoWeekKey", () => {
    expect(isoWeekKey(weekRange("2026-W53").start)).toBe("2026-W53");
    expect(isoWeekKey(weekRange("2026-W01").start)).toBe("2026-W01");
  });
});

describe("listWeeks", () => {
  it("returns distinct weeks that have hunts, oldest first, skipping undated hunts", () => {
    const hunts = [
      hunt("H3", "2026-09-22T10:00:00Z"),
      hunt("H1", "2026-09-01T10:00:00Z"),
      hunt("H2", "2026-09-21T10:00:00Z"),
      hunt("H4", undefined),
      hunt("H5", "not a date"),
    ];
    expect(listWeeks(hunts)).toEqual(["2026-W36", "2026-W39"]);
  });
});

describe("extractSources", () => {
  it("pulls markdown and bare links, drops MITRE, dedupes by URL", () => {
    const refs = [
      "- [MITRE T1059](https://attack.mitre.org/techniques/T1059/)",
      "- [Unit 42 report](https://unit42.example.com/post)",
      "- https://blog.example.org/a.",
      "- [Same report again](https://unit42.example.com/post)",
    ].join("\n");
    expect(extractSources(refs)).toEqual([
      {
        url: "https://unit42.example.com/post",
        title: "Unit 42 report",
        host: "unit42.example.com",
      },
      {
        url: "https://blog.example.org/a",
        title: "blog.example.org",
        host: "blog.example.org",
      },
    ]);
  });

  it("ignores non-http schemes", () => {
    expect(
      extractSources("- [x](javascript:alert(1))\n- [y](ftp://a.b/c)"),
    ).toEqual([]);
  });
});

describe("sourceGroup", () => {
  const src = (url: string) => ({ url, title: "", host: new URL(url).hostname });

  it("groups GitHub links by owner/repo", () => {
    expect(sourceGroup(src("https://github.com/SigmaHQ/sigma/blob/master/rules/x.yml"))).toBe(
      "github.com/SigmaHQ/sigma",
    );
    expect(sourceGroup(src("https://www.github.com/redcanaryco/atomic-red-team"))).toBe(
      "github.com/redcanaryco/atomic-red-team",
    );
  });

  it("falls back to the host for GitHub links without a repo", () => {
    expect(sourceGroup(src("https://github.com/SigmaHQ"))).toBe("github.com");
  });

  it("groups everything else by host, without www", () => {
    expect(sourceGroup(src("https://www.bleepingcomputer.com/news/x"))).toBe("bleepingcomputer.com");
    expect(sourceGroup(src("https://learn.microsoft.com/en-us/x"))).toBe("learn.microsoft.com");
  });
});

describe("buildDigest", () => {
  const hunts = [
    hunt("OLD", "2026-09-01T00:00:00Z", { techniques: ["T1059"] }),
    hunt("UNDATED", undefined, { techniques: ["T1003"] }),
    hunt("A", "2026-09-21T09:00:00Z", {
      category: "Flames",
      techniques: ["T1059", "T1105"],
      references: "- [Report](https://r.example.com/1)",
      submitter: { name: "Alice", link: "https://github.com/alice" },
    }),
    hunt("B", "2026-09-22T09:00:00Z", {
      category: "Embers",
      techniques: ["T1105", "T1003"],
      references:
        "- [Report](https://r.example.com/1)\n- https://other.example.com/x",
      submitter: { name: "Bob", link: "javascript:alert(1)" },
    }),
    hunt("C", "2026-09-23T09:00:00Z", {
      category: "Flames",
      submitter: { name: "Alice", link: "https://github.com/alice" },
    }),
    hunt("NEXT", "2026-09-28T09:00:00Z", { techniques: ["T1566"] }),
  ];

  const d = buildDigest(hunts, "2026-W39");

  it("includes only that week's hunts, newest first", () => {
    expect(d.hunts.map((h) => h.id)).toEqual(["C", "B", "A"]);
  });

  it("counts by PEAK category", () => {
    expect(d.byCategory).toEqual({ Flames: 2, Embers: 1, Alchemy: 0 });
  });

  it("lists techniques whose first-ever hunt landed this week", () => {
    // T1059 was covered by OLD; T1003 by an undated hunt (treated as not new).
    expect(d.gapsClosed).toEqual([
      { techniqueId: "T1105", huntIds: ["A", "B"] },
    ]);
  });

  it("dedupes sources across hunts", () => {
    expect(d.sources.map((s) => s.url)).toEqual([
      "https://r.example.com/1",
      "https://other.example.com/x",
    ]);
  });

  it("dedupes contributors, sorts by hunt count, drops unsafe links", () => {
    expect(d.contributors).toEqual([
      { name: "Alice", link: "https://github.com/alice", count: 2 },
      { name: "Bob", link: null, count: 1 },
    ]);
  });

  it("strips the issue-form '_No response_' placeholder from names", () => {
    const w = buildDigest(
      [
        hunt("X", "2026-09-21T00:00:00Z", { submitter: { name: "Dee (_No response_)", link: "" } }),
        hunt("Y", "2026-09-22T00:00:00Z", { submitter: { name: "Dee", link: "https://x.com/dee" } }),
      ],
      "2026-W39",
    );
    expect(w.contributors).toEqual([{ name: "Dee", link: "https://x.com/dee", count: 2 }]);
  });

  it("returns an empty digest for a week with no hunts", () => {
    const empty = buildDigest(hunts, "2026-W30");
    expect(empty.hunts).toEqual([]);
    expect(empty.gapsClosed).toEqual([]);
    expect(empty.sources).toEqual([]);
    expect(empty.contributors).toEqual([]);
  });
});
