import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { searchHunts, type HuntQuery } from "../../src/lib/hunt-search";
import { loadData } from "./data";

/**
 * Golden queries: real questions an analyst would ask, with the hunts a good
 * answer must include. Expected ids come from an independent title match
 * (see each entry's `source`), not from the search code under test.
 * Add one by appending to mcp/golden/search.json.
 */
interface Golden {
  name: string;
  args: { query?: string; tactic?: string; data_sources?: string[]; category?: string };
  expect_ids: string[];
  source: string;
  /** Minimum share of expect_ids that must appear in the first 20 results. */
  min_recall?: number;
}

const data = loadData(join(__dirname, "..", "..", "public"));
const golden: Golden[] = JSON.parse(readFileSync(join(__dirname, "..", "golden", "search.json"), "utf8"));

function run(g: Golden) {
  const q: HuntQuery = {
    query: g.args.query,
    tactic: g.args.tactic,
    category: g.args.category as HuntQuery["category"],
    dataSources: g.args.data_sources as HuntQuery["dataSources"],
    limit: 20,
  };
  return searchHunts(data.hunts, q, data.index);
}

describe("golden search queries", () => {
  it.each(golden)("$name", (g) => {
    const { hunts } = run(g);
    const got = new Set(hunts.map((h) => h.id));
    const found = g.expect_ids.filter((id) => got.has(id));
    const recall = g.expect_ids.length ? found.length / g.expect_ids.length : 1;
    const missing = g.expect_ids.filter((id) => !got.has(id));
    expect(recall, `missing from top 20: ${missing.join(", ")}`).toBeGreaterThanOrEqual(g.min_recall ?? 0.8);
  });
});
