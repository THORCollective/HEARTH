import type { DataSourceCategoryId, Hunt, HuntCategory } from "../types/Hunt";
import {
  canRunHunt,
  huntDataSources,
  type TechniqueIndex,
} from "./datasources";

/** Hunt search shared by the site and the HEARTH MCP server. DOM/Vite-free. */

export interface HuntQuery {
  /** Free text; every word must match somewhere in the hunt. */
  query?: string;
  category?: HuntCategory;
  /** Case-insensitive match against any of the hunt's comma-separated tactics. */
  tactic?: string;
  /** Show hunts runnable with ANY of these categories. */
  dataSources?: DataSourceCategoryId[];
  includeRetired?: boolean;
  limit?: number;
}

export interface HuntSearchResult {
  /** Matches before `limit` was applied. */
  total: number;
  hunts: Hunt[];
}

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

const EMPTY_INDEX: TechniqueIndex = new Map();

export function huntTactics(hunt: Hunt): string[] {
  return hunt.tactic
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Text fields searched, highest weight first. */
function fields(hunt: Hunt, index: TechniqueIndex): [string, number][] {
  return [
    [hunt.id, 5],
    [hunt.title, 4],
    [(hunt.techniques ?? []).join(" "), 3],
    [hunt.tactic, 2],
    [hunt.tags.join(" "), 2],
    [huntDataSources(hunt, index).categories.join(" "), 1],
    [hunt.submitter?.name ?? "", 1],
  ].map(([text, w]) => [String(text).toLowerCase(), w as number]);
}

/** Sum of the best field weight per query word; 0 if any word is missing. */
function score(hunt: Hunt, words: string[], index: TechniqueIndex): number {
  const fs = fields(hunt, index);
  let total = 0;
  for (const word of words) {
    let best = 0;
    for (const [text, weight] of fs) {
      if (weight > best && text.includes(word)) best = weight;
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

/** Numeric part of the id, for newest-first ordering (H442 > H010). */
function idNumber(id: string): number {
  return parseInt(id.replace(/\D/g, ""), 10) || 0;
}

export function searchHunts(
  hunts: readonly Hunt[],
  q: HuntQuery,
  index: TechniqueIndex = EMPTY_INDEX,
): HuntSearchResult {
  const words = (q.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const tactic = q.tactic?.trim().toLowerCase();
  const sources = q.dataSources?.length ? new Set(q.dataSources) : null;
  const limit = Math.min(Math.max(q.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const scored: { hunt: Hunt; score: number }[] = [];
  for (const hunt of hunts) {
    if (!q.includeRetired && hunt.status === "retired") continue;
    if (q.category && hunt.category !== q.category) continue;
    if (tactic && !huntTactics(hunt).some((t) => t.toLowerCase() === tactic))
      continue;
    if (sources && !canRunHunt(hunt, sources, index)) continue;
    const s = words.length ? score(hunt, words, index) : 1;
    if (s > 0) scored.push({ hunt, score: s });
  }

  scored.sort(
    (a, b) => b.score - a.score || idNumber(b.hunt.id) - idNumber(a.hunt.id),
  );
  return {
    total: scored.length,
    hunts: scored.slice(0, limit).map((s) => s.hunt),
  };
}
