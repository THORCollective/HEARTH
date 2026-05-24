import type { Hunt } from '../types/Hunt';
import type {
  Actor,
  ActorMatchResult,
  CoverageSummary,
  GapTechnique,
  MatchedHunt,
  TacticCoverage,
} from '../types/Actor';

/* ─────────────────────────────────────────────
   Inputs (mirrors public/context-graph-data.json)
   ───────────────────────────────────────────── */

interface ContextGraphNode {
  id: string;
  type: string;
  label?: string;
  aliases?: string[];
  description?: string;
  technique_count?: number;
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
  mentions: Record<string, string[]>;   // actor_id -> [hunt_id, ...]
}

/* ─────────────────────────────────────────────
   MITRE Enterprise kill-chain tactic order
   ───────────────────────────────────────────── */

export const KILL_CHAIN_TACTICS: readonly string[] = [
  'Reconnaissance',
  'Resource Development',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Credential Access',
  'Discovery',
  'Lateral Movement',
  'Collection',
  'Command and Control',
  'Exfiltration',
  'Impact',
];

/* ─────────────────────────────────────────────
   Index built once from the loaded JSON
   ───────────────────────────────────────────── */

export interface ActorIndex {
  actors: Actor[];
  actorById: Map<string, Actor>;
  actorTechniques: Map<string, Set<string>>;   // actor_id -> set of technique IDs
  techniqueTactics: Map<string, string[]>;     // technique_id -> tactic names
}

export function buildActorIndex(graph: ContextGraphData): ActorIndex {
  const actors: Actor[] = [];
  const actorById = new Map<string, Actor>();
  const techniqueTactics = new Map<string, string[]>();

  for (const node of graph.nodes) {
    if (node.type === 'threat_actor' && node.id && node.label) {
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
    }
    if (node.type === 'technique' && node.id) {
      techniqueTactics.set(node.id, node.tactics ?? []);
    }
  }

  const actorTechniques = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    if (edge.type === 'EMPLOYS' && actorById.has(edge.source)) {
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
  matchType: 'id' | 'exact' | 'alias' | 'prefix' | 'alias-prefix' | 'fuzzy';
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
  const idKey = q.startsWith('actor:') ? q : `actor:${q.toUpperCase()}`;
  const byId = index.actorById.get(idKey);
  if (byId) {
    results.push({ actor: byId, matchType: 'id' });
    seen.add(byId.id);
  }

  const qLower = q.toLowerCase();

  // 2. Exact label match
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.label.toLowerCase() === qLower) {
      results.push({ actor: a, matchType: 'exact' });
      seen.add(a.id);
    }
  }

  // 3. Exact alias match
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.aliases.some((al) => al.toLowerCase() === qLower)) {
      results.push({ actor: a, matchType: 'alias' });
      seen.add(a.id);
    }
  }

  const push = (a: Actor, t: ResolvedActor['matchType']) => {
    if (seen.has(a.id)) return;
    seen.add(a.id);
    results.push({ actor: a, matchType: t });
  };

  // 4. Label prefix match — shorter labels rank first so the canonical name
  //    (e.g. "APT29") sorts above longer variants.
  const labelPrefixes = index.actors
    .filter((a) => !seen.has(a.id) && a.label.toLowerCase().startsWith(qLower))
    .sort((a, b) => a.label.length - b.label.length);
  for (const a of labelPrefixes) push(a, 'prefix');

  // 5. Alias prefix match.
  for (const a of index.actors) {
    if (seen.has(a.id)) continue;
    if (a.aliases.some((al) => al.toLowerCase().startsWith(qLower))) {
      push(a, 'alias-prefix');
    }
  }

  // 6. Substring fallback — only when the query is long enough that an
  //    anywhere-match is likely intentional. A bare "s" would otherwise drag in
  //    every actor whose alias contains a lowercase s.
  if (q.length >= 3) {
    for (const a of index.actors) {
      if (results.length >= limit) break;
      if (seen.has(a.id)) continue;
      const hay = [a.label, ...a.aliases].join('  ').toLowerCase();
      if (hay.includes(qLower)) push(a, 'fuzzy');
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

    const reasons: MatchedHunt['reasons'] = [];
    if (shared.length > 0) reasons.push('TECH');
    if (hasMention) reasons.push('MENTION');

    matches.push({ hunt, reasons, sharedTechniques: shared });
  }

  // Sort: TECH matches first (by # shared desc), then MENTION-only (alpha by title)
  matches.sort((a, b) => {
    const aHasTech = a.reasons.includes('TECH');
    const bHasTech = b.reasons.includes('TECH');
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
    gaps.push({ id: tech, tactic: tactics[0] ?? 'Unknown' });
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
 * Actors with the most HEARTH hunts in their corner. Sorted by raw matched-hunt
 * count rather than coverage % because the context graph only maps techniques
 * HEARTH already touches — so any percentage trends artificially toward 100%
 * and would mislead the reader. Match count is honest data either way.
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
 * Actors with the largest absolute gap, restricted to actors HEARTH already
 * has *some* coverage of — surfaces partially-covered groups worth filling in,
 * not random untouched ones nobody on the team has hunted yet.
 */
export function biggestGapActors(
  rows: ActorLeaderRow[],
  limit = 5,
  minTechniqueCount = 10,
): ActorLeaderRow[] {
  return rows
    .filter((r) => r.coverage.actorTechniqueCount >= minTechniqueCount)
    .filter((r) => r.coverage.techniquesCovered > 0)
    .filter((r) => r.coverage.gapTechniqueCount > 0)
    .sort((a, b) => b.coverage.gapTechniqueCount - a.coverage.gapTechniqueCount)
    .slice(0, limit);
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
