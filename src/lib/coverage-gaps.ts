import type { DataSourceCategoryId, Hunt } from "../types/Hunt";
import {
  canRunHunt,
  huntDataSources,
  type TechniqueIndex,
} from "./datasources";

/** A technique from public/mitre-matrix.json. */
export interface MatrixTechnique {
  id: string;
  name: string;
  tactic_shortnames?: string[];
  platforms?: string[];
}

/**
 * Reconnaissance and Resource Development happen on the attacker's own
 * infrastructure, so few teams can hunt them in their own logs. They are left
 * out unless one of them is asked for as the tactic.
 */
export const PRE_COMPROMISE_TACTICS: readonly string[] = [
  "reconnaissance",
  "resource-development",
];

export interface GapScope {
  /** Only techniques this actor uses (its ATT&CK profile). */
  actorTechniques?: ReadonlySet<string>;
  /** Tactic shortname, e.g. "discovery". */
  tactic?: string;
  /** ATT&CK platform, e.g. "Windows". */
  platform?: string;
  /** Also list uncovered sub-techniques under their parent. */
  includeSubtechniques?: boolean;
  /** Data source categories the team has; adds the cantRun list. */
  dataSources?: ReadonlySet<DataSourceCategoryId>;
}

export interface SubtechniqueGap {
  id: string;
  name: string;
  groupCount: number;
}

export interface Gap {
  id: string;
  name: string;
  tactics: string[];
  /** ATT&CK groups that use the technique or any of its sub-techniques. */
  groupCount: number;
  /** A hunt covers this technique or one of its sub-techniques. Only true when listed for its sub-techniques. */
  hasHunt: boolean;
  subtechniques?: SubtechniqueGap[];
}

export interface CantRun {
  id: string;
  name: string;
  tactics: string[];
  groupCount: number;
  huntIds: string[];
  /** Every data source category those hunts use: having any one would make a hunt runnable. */
  missingSources: DataSourceCategoryId[];
}

export interface GapReport {
  /** Parent techniques considered, after the scope and pre-compromise filters. */
  techniquesInScope: number;
  gaps: Gap[];
  cantRun: CantRun[];
  preCompromiseSkipped: number;
}

const parentOf = (id: string) => id.split(".")[0];

function count(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

const byUse = (
  a: { groupCount: number; id: string },
  b: { groupCount: number; id: string },
) => b.groupCount - a.groupCount || a.id.localeCompare(b.id);

/**
 * ATT&CK techniques no hunt covers, at parent-technique level: a parent is
 * covered when a hunt names it or any of its sub-techniques. Ranked by how many
 * ATT&CK groups use the technique, so the most common blind spots come first.
 */
export function findCoverageGaps(
  hunts: Hunt[],
  techniques: MatrixTechnique[],
  actorTechniques: Map<string, Set<string>>,
  index: TechniqueIndex,
  scope: GapScope = {},
): GapReport {
  const exact = new Set<string>();
  const huntsByParent = new Map<string, Hunt[]>();
  for (const h of hunts) {
    const ts = h.techniques ?? [];
    ts.forEach((t) => exact.add(t));
    for (const p of new Set(ts.map(parentOf)))
      huntsByParent.set(p, [...(huntsByParent.get(p) ?? []), h]);
  }

  const groupsExact = new Map<string, number>();
  const groupsParent = new Map<string, number>();
  for (const techs of actorTechniques.values()) {
    techs.forEach((t) => count(groupsExact, t));
    new Set([...techs].map(parentOf)).forEach((p) => count(groupsParent, p));
  }

  const actor = scope.actorTechniques;
  const actorParents = actor ? new Set([...actor].map(parentOf)) : null;
  const inScope = (t: MatrixTechnique) =>
    (!scope.tactic || (t.tactic_shortnames ?? []).includes(scope.tactic)) &&
    (!scope.platform || (t.platforms ?? []).includes(scope.platform));
  // An explicit tactic already decides whether pre-compromise techniques are in scope.
  const isSkippedPre = (t: MatrixTechnique) =>
    !scope.tactic &&
    (t.tactic_shortnames ?? []).length > 0 &&
    t.tactic_shortnames!.every((s) => PRE_COMPROMISE_TACTICS.includes(s));

  const subsByParent = new Map<string, MatrixTechnique[]>();
  for (const t of techniques)
    if (t.id.includes("."))
      subsByParent.set(parentOf(t.id), [
        ...(subsByParent.get(parentOf(t.id)) ?? []),
        t,
      ]);

  const report: GapReport = {
    techniquesInScope: 0,
    gaps: [],
    cantRun: [],
    preCompromiseSkipped: 0,
  };
  for (const p of techniques) {
    if (
      p.id.includes(".") ||
      !inScope(p) ||
      (actorParents && !actorParents.has(p.id))
    )
      continue;
    const covering = huntsByParent.get(p.id) ?? [];
    const subs = scope.includeSubtechniques
      ? (subsByParent.get(p.id) ?? [])
          .filter(
            (s) =>
              inScope(s) && (!actor || actor.has(s.id)) && !exact.has(s.id),
          )
          .map((s) => ({
            id: s.id,
            name: s.name,
            groupCount: groupsExact.get(s.id) ?? 0,
          }))
          .sort(byUse)
      : [];
    const isGap = covering.length === 0 || subs.length > 0;
    if (isSkippedPre(p)) {
      if (isGap) report.preCompromiseSkipped++;
      continue;
    }
    report.techniquesInScope++;
    const base = {
      id: p.id,
      name: p.name,
      tactics: p.tactic_shortnames ?? [],
      groupCount: groupsParent.get(p.id) ?? 0,
    };
    if (isGap)
      report.gaps.push({
        ...base,
        hasHunt: covering.length > 0,
        ...(scope.includeSubtechniques ? { subtechniques: subs } : {}),
      });
    const have = scope.dataSources;
    if (
      have &&
      covering.length > 0 &&
      !covering.some((h) => canRunHunt(h, have, index))
    ) {
      const missing = new Set(
        covering.flatMap((h) => huntDataSources(h, index).categories),
      );
      report.cantRun.push({
        ...base,
        huntIds: covering.map((h) => h.id),
        missingSources: [...missing].sort(),
      });
    }
  }
  report.gaps.sort(byUse);
  report.cantRun.sort(byUse);
  return report;
}
