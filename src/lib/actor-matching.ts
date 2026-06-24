import type { Hunt } from "../types/Hunt";
import type {
  Actor,
  ActorMatchResult,
  CoverageSummary,
  GapTechnique,
  MatchedHunt,
  TacticCoverage,
} from "../types/Actor";

/* ─────────────────────────────────────────────
   Inputs (mirrors public/context-graph-data.json)
   ───────────────────────────────────────────── */

interface ContextGraphNode {
  id: string;
  type: string;
  label?: string;
  aliases?: string[];
  description?: string;
  technique_count?: number; // HEARTH-scoped count (drives EMPLOYS edges / graph viz)
  mitre_techniques?: string[]; // full MITRE ATT&CK profile (coverage denominator)
  mitre_technique_count?: number;
  external_references?: { source: string; url: string }[];
  tactics?: string[];
}

interface ContextGraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface ContextGraphData {
  nodes: ContextGraphNode[];
  edges: ContextGraphEdge[];
}

export interface ActorMentionsData {
  mentions: Record<string, string[]>; // actor_id -> [hunt_id, ...]
}

/* ─────────────────────────────────────────────
   MITRE Enterprise kill-chain tactic order
   ───────────────────────────────────────────── */

export const KILL_CHAIN_TACTICS: readonly string[] = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

/* ─────────────────────────────────────────────
   Index built once from the loaded JSON
   ───────────────────────────────────────────── */

export interface ActorIndex {
  actors: Actor[];
  actorById: Map<string, Actor>;
  actorTechniques: Map<string, Set<string>>; // actor_id -> set of technique IDs
  techniqueTactics: Map<string, string[]>; // technique_id -> tactic names
}

/* ─────────────────────────────────────────────
   MITRE matrix → technique tactic lookup
   (mirrors public/mitre-matrix.json — supplies tactics for techniques
   outside HEARTH's universe so the expanded coverage profile stays honest)
   ───────────────────────────────────────────── */

export interface MitreMatrixData {
  tactics?: { id: string; shortname: string; name: string }[];
  techniques?: { id: string; tactic_shortnames?: string[] }[];
}

export function buildTechniqueTactics(
  matrix: MitreMatrixData,
): Map<string, string[]> {
  const shortToName = new Map<string, string>();
  for (const t of matrix.tactics ?? []) shortToName.set(t.shortname, t.name);

  const map = new Map<string, string[]>();
  for (const tech of matrix.techniques ?? []) {
    const names = (tech.tactic_shortnames ?? [])
      .map((s) => shortToName.get(s))
      .filter((n): n is string => Boolean(n));
    if (names.length) map.set(tech.id, names);
  }
  return map;
}

export function buildActorIndex(
  graph: ContextGraphData,
  techniqueTacticLookup?: Map<string, string[]>,
): ActorIndex {
  const actors: Actor[] = [];
  const actorById = new Map<string, Actor>();
  // Seed from the full MITRE matrix; graph technique nodes override below when they
  // carry their own (HEARTH-authoritative) tactics.
  const techniqueTactics = new Map<string, string[]>(
    techniqueTacticLookup ?? [],
  );
  const actorTechniques = new Map<string, Set<string>>();

  for (const node of graph.nodes) {
    if (node.type === "threat_actor" && node.id && node.label) {
      const actor: Actor = {
        id: node.id,
        label: node.label,
        aliases: node.aliases ?? [],
        description: node.description,
        technique_count: node.technique_count,
        external_references: node.external_references,
      };
      actors.push(actor);
      actorById.set(actor.id, actor);

      // Seed from the full MITRE profile when present.
      if (node.mitre_techniques?.length) {
        actorTechniques.set(node.id, new Set(node.mitre_techniques));
      }
    }
    if (node.type === "technique" && node.id) {
      const tactics = node.tactics ?? [];
      if (tactics.length || !techniqueTactics.has(node.id)) {
        techniqueTactics.set(node.id, tactics);
      }
    }
  }

  // Union EMPLOYS edges in for every actor — these are HEARTH-scoped techniques
  // that may not appear in a (separately-sourced) MITRE profile, and are the sole
  // source for actors without one. actorTechniques is therefore the union of the
  // actor's full MITRE profile and its EMPLOYS-mapped techniques.
  for (const edge of graph.edges) {
    if (edge.type === "EMPLOYS" && actorById.has(edge.source)) {
      let set = actorTechniques.get(edge.source);
      if (!set) {
        set = new Set();
        actorTechniques.set(edge.source, set);
      }
      set.add(edge.target);
    }
  }

  return { actors, actorById, actorTechniques, techniqueTactics };
}

/* ─────────────────────────────────────────────
   Resolve a query string to an actor
   ───────────────────────────────────────────── */

export interface ResolvedActor {
  actor: Actor;
  matchType: "id" | "exact" | "alias" | "prefix" | "alias-prefix" | "fuzzy";
}

/**
 * Resolve a user-supplied string to candidate actors.
 *
 * Strategy: exact-id match wins, then exact-label match (case-insensitive),
 * then exact-alias match, then substring-fuzzy. Up to `limit` results,
 * ordered by match strength. Used both for direct lookup (take first) and
 * for autocomplete (return all).
 */
export function resolveActor(
  query: string,
  index: ActorIndex,
  limit = 10,
): ResolvedActor[] {
  const q = query.trim();
  if (!q) return [];

  const results: ResolvedActor[] = [];
  const seen = new Set<string>();

  // 1. Exact ID match — accept either "actor:G0016" or "G0016"
  const idKey = q.startsWith("actor:") ? q : `actor:${q.toUpperCase()}`;
  const byId = index.actorById.get(idKey);
  if (byId) {
    results.push({ actor: byId, matchType: "id" });
    seen.add(byId.id);
  }

  const qLower = q.toLowerCase();

  // 2. Exact label match
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.label.toLowerCase() === qLower) {
      results.push({ actor: a, matchType: "exact" });
      seen.add(a.id);
    }
  }

  // 3. Exact alias match
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.aliases.some((al) => al.toLowerCase() === qLower)) {
      results.push({ actor: a, matchType: "alias" });
      seen.add(a.id);
    }
  }

  const push = (a: Actor, t: ResolvedActor["matchType"]) => {
    if (seen.has(a.id)) return;
    seen.add(a.id);
    results.push({ actor: a, matchType: t });
  };

  // 4. Label prefix match — shorter labels rank first so the canonical name
  //    (e.g. "APT29") sorts above longer variants.
  const labelPrefixes = index.actors
    .filter((a) => !seen.has(a.id) && a.label.toLowerCase().startsWith(qLower))
    .sort((a, b) => a.label.length - b.label.length);
  for (const a of labelPrefixes) push(a, "prefix");

  // 5. Alias prefix match.
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.aliases.some((al) => al.toLowerCase().startsWith(qLower))) {
      push(a, "alias-prefix");
    }
  }

  // 6. Substring fallback — only when the query is long enough that an
  //    anywhere-match is likely intentional. A bare "s" would otherwise drag in
  //    every actor whose alias contains a lowercase s.
  if (q.length >= 3) {
    for (const a of index.actors) {
      if (results.length >= limit) break;
      if (seen.has(a.id)) continue;
      const hay = [a.label, ...a.aliases].join("  ").toLowerCase();
      if (hay.includes(qLower)) push(a, "fuzzy");
    }
  }

  return results.slice(0, limit);
}

/* ─────────────────────────────────────────────
   Match hunts to an actor
   ───────────────────────────────────────────── */

export function matchHuntsForActor(
  actorId: string,
  hunts: Hunt[],
  mentions: ActorMentionsData,
  index: ActorIndex,
): MatchedHunt[] {
  const actorTechs = index.actorTechniques.get(actorId) ?? new Set<string>();
  const mentionHuntIds = new Set(mentions.mentions[actorId] ?? []);

  const matches: MatchedHunt[] = [];
  for (const hunt of hunts) {
    const huntTechs = hunt.techniques ?? [];
    const shared = huntTechs.filter((t) => actorTechs.has(t));
    const hasMention = mentionHuntIds.has(hunt.id);
    if (shared.length === 0 && !hasMention) continue;

    const reasons: MatchedHunt["reasons"] = [];
    if (shared.length > 0) reasons.push("TECH");
    if (hasMention) reasons.push("MENTION");

    matches.push({ hunt, reasons, sharedTechniques: shared });
  }

  // Sort: TECH matches first (by # shared desc), then MENTION-only (alpha by title)
  matches.sort((a, b) => {
    const aHasTech = a.reasons.includes("TECH");
    const bHasTech = b.reasons.includes("TECH");
    if (aHasTech !== bHasTech) return aHasTech ? -1 : 1;
    if (aHasTech) {
      return b.sharedTechniques.length - a.sharedTechniques.length;
    }
    return a.hunt.title.localeCompare(b.hunt.title);
  });

  return matches;
}

/* ─────────────────────────────────────────────
   Coverage stats + tactic heatmap + gap list
   ───────────────────────────────────────────── */

export function computeCoverage(
  actorId: string,
  matches: MatchedHunt[],
  index: ActorIndex,
): CoverageSummary {
  const actorTechs = index.actorTechniques.get(actorId) ?? new Set<string>();
  const coveredTechs = new Set<string>();
  for (const m of matches) {
    for (const t of m.sharedTechniques) coveredTechs.add(t);
  }
  const total = actorTechs.size;
  const covered = coveredTechs.size;
  return {
    actorTechniqueCount: total,
    techniquesCovered: covered,
    coveragePercent: total === 0 ? 0 : Math.round((covered / total) * 100),
    matchedHuntCount: matches.length,
    gapTechniqueCount: total - covered,
  };
}

export function computeTacticCoverage(
  actorId: string,
  matches: MatchedHunt[],
  index: ActorIndex,
): TacticCoverage[] {
  const actorTechs = index.actorTechniques.get(actorId) ?? new Set<string>();
  const coveredTechs = new Set<string>();
  for (const m of matches) {
    for (const t of m.sharedTechniques) coveredTechs.add(t);
  }

  // Bucket techniques by their first listed tactic.
  const usedPerTactic = new Map<string, Set<string>>();
  const coveredPerTactic = new Map<string, Set<string>>();
  for (const tech of actorTechs) {
    const tacticList = index.techniqueTactics.get(tech) ?? [];
    if (tacticList.length === 0) continue;
    for (const tactic of tacticList) {
      let used = usedPerTactic.get(tactic);
      if (!used) {
        used = new Set();
        usedPerTactic.set(tactic, used);
      }
      used.add(tech);

      if (coveredTechs.has(tech)) {
        let cov = coveredPerTactic.get(tactic);
        if (!cov) {
          cov = new Set();
          coveredPerTactic.set(tactic, cov);
        }
        cov.add(tech);
      }
    }
  }

  return KILL_CHAIN_TACTICS.map((tactic) => ({
    tactic,
    techniquesUsed: usedPerTactic.get(tactic)?.size ?? 0,
    techniquesCovered: coveredPerTactic.get(tactic)?.size ?? 0,
  }));
}

export function computeGap(
  actorId: string,
  matches: MatchedHunt[],
  index: ActorIndex,
): GapTechnique[] {
  const actorTechs = index.actorTechniques.get(actorId) ?? new Set<string>();
  const coveredTechs = new Set<string>();
  for (const m of matches) {
    for (const t of m.sharedTechniques) coveredTechs.add(t);
  }
  const gaps: GapTechnique[] = [];
  for (const tech of actorTechs) {
    if (coveredTechs.has(tech)) continue;
    const tactics = index.techniqueTactics.get(tech) ?? [];
    gaps.push({ id: tech, tactic: tactics[0] ?? "Unknown" });
  }
  gaps.sort((a, b) => a.id.localeCompare(b.id));
  return gaps;
}

/* ─────────────────────────────────────────────
   Cross-actor leaderboards for the empty-state showcase
   ───────────────────────────────────────────── */

export interface ActorLeaderRow {
  actor: Actor;
  coverage: CoverageSummary;
}

/**
 * Compute coverage for every actor in one pass. Used to power the empty-state
 * "best covered" / "biggest gaps" lists. O(actors × hunts), trivially fast at
 * the current scale (~159 × ~120 = ~20k iterations).
 */
export function computeAllCoverage(
  hunts: Hunt[],
  mentions: ActorMentionsData,
  index: ActorIndex,
): ActorLeaderRow[] {
  const rows: ActorLeaderRow[] = [];
  for (const actor of index.actors) {
    const matches = matchHuntsForActor(actor.id, hunts, mentions, index);
    const coverage = computeCoverage(actor.id, matches, index);
    rows.push({ actor, coverage });
  }
  return rows;
}

/**
 * Minimum MITRE profile size for an actor to appear on the most/least-covered
 * leaderboards. Filters out small-profile actors whose coverage % is a
 * small-denominator artifact (e.g. 10/11 techniques = 91%, not a meaningful
 * "best covered"). Shared by both boards so they rank the same population.
 */
export const MIN_LEADERBOARD_TECHNIQUES = 20;

/**
 * Most-hunted actors: most HEARTH hunts in their corner, sorted by raw hunt
 * count. Hunt volume tracks notoriety — the big-name APTs get hunted most — so
 * this is the home page's pool for featuring a *recognizable* actor (it then
 * displays that actor's coverage %). Not a coverage ranking; see the boards below.
 */
export function topMatchedActors(
  rows: ActorLeaderRow[],
  limit = 5,
): ActorLeaderRow[] {
  return rows
    .filter((r) => r.coverage.matchedHuntCount > 0)
    .sort((a, b) => b.coverage.matchedHuntCount - a.coverage.matchedHuntCount)
    .slice(0, limit);
}

/**
 * Shared ranking for the coverage boards: filter to actors with a substantial
 * profile, sort by coverage % in `direction`, apply a per-board tiebreak, slice.
 * Centralizing the filter + primary sort keeps the two boards from drifting apart.
 */
function rankByCoverage(
  rows: ActorLeaderRow[],
  opts: {
    direction: "desc" | "asc";
    limit: number;
    minTechniqueCount: number;
    requireGap?: boolean;
    tiebreak: (a: ActorLeaderRow, b: ActorLeaderRow) => number;
  },
): ActorLeaderRow[] {
  const dir = opts.direction === "desc" ? 1 : -1;
  return rows
    .filter((r) => r.coverage.actorTechniqueCount >= opts.minTechniqueCount)
    .filter((r) => !opts.requireGap || r.coverage.gapTechniqueCount > 0)
    .sort(
      (a, b) =>
        dir * (b.coverage.coveragePercent - a.coverage.coveragePercent) ||
        opts.tiebreak(a, b),
    )
    .slice(0, opts.limit);
}

/**
 * Most-covered actors: highest coverage % first — "where HEARTH's detection is
 * deepest." Measured against each actor's full MITRE profile (see
 * buildActorIndex). Restricted to actors with a substantial profile so a tiny
 * fully-hunted actor doesn't outrank a broadly-covered major one. The exact
 * opposite end of biggestGapActors over the same population.
 */
export function mostCoveredActors(
  rows: ActorLeaderRow[],
  limit = 5,
  minTechniqueCount = MIN_LEADERBOARD_TECHNIQUES,
): ActorLeaderRow[] {
  return rankByCoverage(rows, {
    direction: "desc",
    limit,
    minTechniqueCount,
    // Tie: broader profile, then more hunts.
    tiebreak: (a, b) =>
      b.coverage.actorTechniqueCount - a.coverage.actorTechniqueCount ||
      b.coverage.matchedHuntCount - a.coverage.matchedHuntCount,
  });
}

/**
 * Least-covered actors: lowest coverage % first — "where a new hunt would help
 * most." Same population and metric as mostCoveredActors, opposite direction.
 * Requires a non-zero gap (a fully-covered actor is not a gap). Use
 * `coverageBoards` rather than calling this alongside mostCoveredActors directly,
 * so the two boards are guaranteed disjoint regardless of population size.
 */
export function biggestGapActors(
  rows: ActorLeaderRow[],
  limit = 5,
  minTechniqueCount = MIN_LEADERBOARD_TECHNIQUES,
): ActorLeaderRow[] {
  return rankByCoverage(rows, {
    direction: "asc",
    limit,
    minTechniqueCount,
    requireGap: true,
    // Tie: bigger absolute gap, then fewer hunts.
    tiebreak: (a, b) =>
      b.coverage.gapTechniqueCount - a.coverage.gapTechniqueCount ||
      a.coverage.matchedHuntCount - b.coverage.matchedHuntCount,
  });
}

/**
 * The two coverage boards as one disjoint pair. mostCovered is taken first; the
 * least-covered board then excludes anyone already on it, so an actor can never
 * appear on both even when the qualifying population is smaller than 2×limit.
 */
export function coverageBoards(
  rows: ActorLeaderRow[],
  limit = 5,
  minTechniqueCount = MIN_LEADERBOARD_TECHNIQUES,
): { mostCovered: ActorLeaderRow[]; leastCovered: ActorLeaderRow[] } {
  const mostCovered = mostCoveredActors(rows, limit, minTechniqueCount);
  const taken = new Set(mostCovered.map((r) => r.actor.id));
  const leastCovered = biggestGapActors(
    rows.filter((r) => !taken.has(r.actor.id)),
    limit,
    minTechniqueCount,
  );
  return { mostCovered, leastCovered };
}

/* ─────────────────────────────────────────────
   One-shot convenience wrapper
   ───────────────────────────────────────────── */

export function analyzeActor(
  actorId: string,
  hunts: Hunt[],
  mentions: ActorMentionsData,
  index: ActorIndex,
): ActorMatchResult | null {
  const actor = index.actorById.get(actorId);
  if (!actor) return null;
  const matchedHunts = matchHuntsForActor(actorId, hunts, mentions, index);
  return {
    actor,
    matchedHunts,
    coverage: computeCoverage(actorId, matchedHunts, index),
    tacticCoverage: computeTacticCoverage(actorId, matchedHunts, index),
    gap: computeGap(actorId, matchedHunts, index),
  };
}

/* ─────────────────────────────────────────────
   Data loading (shared by actors.ts and home.ts)
   ───────────────────────────────────────────── */

/** Fetch + parse JSON, throwing on a non-OK response so 404s don't parse as data. */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

/**
 * Build the actor index and full coverage table from raw inputs. Single source
 * of truth for the index/coverage pipeline so the two pages can't drift (e.g.
 * forgetting to wire the MITRE matrix into buildActorIndex).
 */
export function buildCoverage(
  graph: ContextGraphData,
  hunts: Hunt[],
  mentions: ActorMentionsData,
  matrix: MitreMatrixData,
): { index: ActorIndex; coverage: ActorLeaderRow[] } {
  const index = buildActorIndex(graph, buildTechniqueTactics(matrix));
  return { index, coverage: computeAllCoverage(hunts, mentions, index) };
}
