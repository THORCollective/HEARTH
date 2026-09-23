import type { Hunt, HuntCategory } from "../types/Hunt";
import type { MitreMatrix } from "../types/Mitre";

/**
 * Site-wide headline counts. This module is the ONE definition of each number;
 * vite.config.ts serves its output as /site-stats.json, and every page reads
 * that file so the home, library, submit and coverage pages always agree.
 */
export interface SiteStats {
  hunts: number;
  /** Distinct technique IDs that exist in the current ATT&CK matrix. */
  techniques: number;
  /** Distinct people credited as submitters (no bots or placeholders). */
  contributors: number;
  /** Distinct current ATT&CK tactics the hunts cover. */
  tactics: number;
  /** Those tactics' names in ATT&CK matrix order, e.g. for filter menus. */
  tacticNames: string[];
  byCategory: Record<HuntCategory, { hunts: number; tactics: number }>;
}

const CATEGORIES: HuntCategory[] = ["Flames", "Embers", "Alchemy"];

// Submitter names that aren't a person. "_No response_" is GitHub's issue-form
// placeholder for a blank field.
const NOT_A_PERSON = new Set(["hearth bot", "anonymous", "_no response_"]);

/** The person to credit for a submitter name, or null for bots/placeholders. */
export function contributorName(name: string | undefined): string | null {
  const cleaned = (name ?? "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || NOT_A_PERSON.has(cleaned.toLowerCase())) return null;
  return cleaned;
}

/**
 * Real tactic names in a hunt's free-text tactic field, e.g.
 * "Tactic: Execution (TA0002) - Technique: …" -> ["Execution"].
 * Anything that isn't a known tactic ("Valid Accounts", "Multiple") is ignored.
 */
export function canonicalTactics(
  field: string | undefined,
  knownNames: string[],
): string[] {
  const byLower = new Map(knownNames.map((n) => [n.toLowerCase(), n]));
  // Drop parentheticals first so "(T1218, T1566.002)" can't split into a fake tactic.
  const withoutParens = (field ?? "").replace(/\([^)]*\)?/g, "");
  const found: string[] = [];
  for (const part of withoutParens.split(",")) {
    const name = part
      .replace(/^\s*tactic:\s*/i, "")
      .replace(/\s+-\s+technique:.*$/i, "")
      .trim()
      .toLowerCase();
    const known = byLower.get(name);
    if (known && !found.includes(known)) found.push(known);
  }
  return found;
}

export function computeSiteStats(
  hunts: Hunt[],
  matrix: MitreMatrix,
): SiteStats {
  const inMatrix = new Set(matrix.techniques.map((t) => t.id));
  const tacticNames = matrix.tactics.map((t) => t.name);

  const techniques = new Set<string>();
  const people = new Set<string>();
  const tactics = new Set<string>();
  const perCategory = new Map<
    HuntCategory,
    { hunts: number; tactics: Set<string> }
  >(CATEGORIES.map((c) => [c, { hunts: 0, tactics: new Set<string>() }]));

  for (const h of hunts) {
    for (const t of h.techniques ?? []) if (inMatrix.has(t)) techniques.add(t);
    const person = contributorName(h.submitter?.name);
    if (person) people.add(person.toLowerCase());
    const cat = perCategory.get(h.category);
    if (cat) cat.hunts += 1;
    for (const t of canonicalTactics(h.tactic, tacticNames)) {
      tactics.add(t);
      cat?.tactics.add(t);
    }
  }

  const byCategory = {} as SiteStats["byCategory"];
  for (const c of CATEGORIES) {
    const v = perCategory.get(c)!;
    byCategory[c] = { hunts: v.hunts, tactics: v.tactics.size };
  }

  return {
    hunts: hunts.length,
    techniques: techniques.size,
    contributors: people.size,
    tactics: tactics.size,
    tacticNames: tacticNames.filter((t) => tactics.has(t)),
    byCategory,
  };
}
