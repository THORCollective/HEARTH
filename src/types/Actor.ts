import type { Hunt } from './Hunt';

export interface Actor {
  id: string;                   // e.g. "actor:G0016"
  label: string;                // display name, e.g. "APT29"
  aliases: string[];
  description?: string;
  technique_count?: number;
  external_references?: { source: string; url: string }[];
}

export type MatchReason = 'TECH' | 'MENTION';

export interface MatchedHunt {
  hunt: Hunt;
  reasons: MatchReason[];        // 'TECH' first if present, then 'MENTION'
  sharedTechniques: string[];    // techniques the actor and hunt have in common
}

export interface TacticCoverage {
  tactic: string;                // e.g. "Persistence"
  techniquesUsed: number;        // total techniques the actor employs in this tactic
  techniquesCovered: number;     // how many of those have at least one matched hunt
}

export interface CoverageSummary {
  actorTechniqueCount: number;
  techniquesCovered: number;
  coveragePercent: number;       // 0-100, integer
  matchedHuntCount: number;
  gapTechniqueCount: number;
}

export interface GapTechnique {
  id: string;                    // e.g. "T1547.001"
  tactic: string;                // primary tactic for display
}

export interface ActorMatchResult {
  actor: Actor;
  matchedHunts: MatchedHunt[];
  coverage: CoverageSummary;
  tacticCoverage: TacticCoverage[];
  gap: GapTechnique[];
}
