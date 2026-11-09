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

/** IDF of a word found in under ~8% of hunts: rare enough to qualify a hunt alone. */
const DISTINCTIVE_IDF = 2.5;

export function huntTactics(hunt: Hunt): string[] {
  return hunt.tactic
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Words that carry no meaning for hunt search. Generic security words
 * ("attack", "adversary") are left in: IDF weighting makes them nearly free.
 */
const STOPWORDS = new Set(
  "a an and are as at be by for from how i in into is it of on or that the their them this to via was what when where which who with".split(" "),
);

/** Words of a text, lowercased; dots kept inside technique ids (t1053.005). */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
}

/**
 * Searchable form of a field: " w1 w2 ... " plus each adjacent pair joined,
 * so a term matches at the start of a word ("mac" -> "macos") and split
 * spellings still match ("dcsync" -> "DC Sync"), without matching inside or
 * across arbitrary words ("app" no longer matches "happen").
 */
function searchable(text: string): string {
  const ws = words(text);
  const pairs = ws.slice(1).map((w, i) => ws[i] + w);
  return ` ${ws.join(" ")} ${pairs.join(" ")} `;
}

/** Query word -> the stem matched as a substring ("macs"->"mac", "tunneling"->"tunnel"). */
function stem(word: string): string {
  if (/^t\d{4}/.test(word)) return word; // technique ids stay exact
  if (word.length > 6 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 5 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function queryTerms(query: string): string[] {
  return [...queryTermMap(query).keys()];
}

/**
 * Query terms, each with its alternative spellings: the term itself plus the
 * compound it forms with a neighbouring word, so "launch agents" also matches
 * "LaunchAgent" (and "launchagents" matches "launch agent" via joined pairs).
 */
function queryTermMap(query: string): Map<string, string[]> {
  const ws = words(query).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const terms = new Map<string, string[]>();
  ws.forEach((w, i) => {
    const t = stem(w);
    const alts = terms.get(t) ?? [t];
    if (i > 0) alts.push(stem(ws[i - 1] + w));
    if (i < ws.length - 1) alts.push(stem(w + ws[i + 1]));
    terms.set(t, alts);
  });
  return terms;
}

/** Searchable text per hunt, as [searchable text, weight], highest weight first. */
type Fields = [string, number][];

function fields(hunt: Hunt, index: TechniqueIndex): Fields {
  return (
    [
      [hunt.id, 6],
      [hunt.title, 4],
      [(hunt.techniques ?? []).join(" "), 4],
      [hunt.tags.join(" "), 3],
      [hunt.tactic, 2],
      [huntDataSources(hunt, index).categories.join(" "), 1],
      [`${hunt.why} ${hunt.notes}`, 1],
      [hunt.submitter?.name ?? "", 1],
    ] as [string, number][]
  ).map(([text, w]) => [searchable(text), w]);
}

/** Best field weight a term hits in a hunt, or 0. Technique ids also match sub-techniques. */
function bestWeight(fs: Fields, spellings: string[]): number {
  for (const [text, weight] of fs) {
    if (spellings.some((t) => text.includes(" " + t))) return weight;
  }
  return 0;
}

/** Numeric part of the id, for newest-first ordering (H442 > H010). */
function idNumber(id: string): number {
  return parseInt(id.replace(/\D/g, ""), 10) || 0;
}

/** Apply the non-text filters: retired, category, tactic and data sources. */
export function filterHunts(
  hunts: readonly Hunt[],
  q: Omit<HuntQuery, "query" | "limit">,
  index: TechniqueIndex = EMPTY_INDEX,
): Hunt[] {
  const tactic = q.tactic?.trim().toLowerCase();
  const sources = q.dataSources?.length ? new Set(q.dataSources) : null;
  return hunts.filter((hunt) => {
    if (!q.includeRetired && hunt.status === "retired") return false;
    if (q.category && hunt.category !== q.category) return false;
    if (tactic && !huntTactics(hunt).some((t) => t.toLowerCase() === tactic)) return false;
    return !sources || canRunHunt(hunt, sources, index);
  });
}

export function searchHunts(
  hunts: readonly Hunt[],
  q: HuntQuery,
  index: TechniqueIndex = EMPTY_INDEX,
): HuntSearchResult {
  const termMap = queryTermMap(q.query ?? "");
  const terms = [...termMap.values()];
  const limit = Math.min(Math.max(q.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const candidates = filterHunts(hunts, q, index);

  if (terms.length === 0) {
    const all = candidates.map((hunt) => ({ hunt, score: 1 }));
    all.sort((a, b) => idNumber(b.hunt.id) - idNumber(a.hunt.id));
    return { total: all.length, hunts: all.slice(0, limit).map((s) => s.hunt) };
  }

  // IDF over all hunts: rare words ("esxi", "clickfix") count for much more
  // than common ones ("attack", "adversary").
  const allFields = hunts.map((h) => fields(h, index));
  const idf = terms.map((t) => {
    const df = allFields.reduce((n, fs) => n + (bestWeight(fs, t) > 0 ? 1 : 0), 0);
    return Math.log((hunts.length + 1) / (df + 1)) + 0.1;
  });
  const queryWeight = idf.reduce((a, b) => a + b, 0);

  const scored: { hunt: Hunt; score: number }[] = [];
  for (const hunt of candidates) {
    const fs = fields(hunt, index);
    let score = 0;
    let covered = 0;
    let distinctive = false;
    terms.forEach((t, i) => {
      const w = bestWeight(fs, t);
      if (w > 0) {
        score += w * idf[i];
        covered += idf[i];
        if (idf[i] >= DISTINCTIVE_IDF) distinctive = true;
      }
    });
    // Keep a hunt that covers half the query's weight, or that contains a
    // rare query word ("clickfix", "esxi"); ranking puts fuller matches first.
    if (covered >= queryWeight / 2 || distinctive) scored.push({ hunt, score });
  }

  scored.sort(
    (a, b) => b.score - a.score || idNumber(b.hunt.id) - idNumber(a.hunt.id),
  );
  return {
    total: scored.length,
    hunts: scored.slice(0, limit).map((s) => s.hunt),
  };
}
