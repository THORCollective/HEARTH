import type { Hunt } from '../types/Hunt';
import type { MitreMatrix } from '../types/Mitre';

export type PeakCategory = 'Flames' | 'Embers' | 'Alchemy';
export type CoverageBucket = 'gap' | 'thin' | 'covered';

export interface CoverageCell {
  techniqueId: string;
  count: number;
  peakBreakdown: Record<PeakCategory, number>;
  hunts: Hunt[];
}

export type CoverageMap = Map<string, CoverageCell>;

/**
 * Build a coverage map keyed by technique ID. Includes every technique from
 * the MITRE matrix (zero-count cells are present, so the matrix renders fully).
 * Optional peakFilter restricts which hunts contribute to counts.
 */
export function buildCoverageMap(
  hunts: Hunt[],
  matrix: MitreMatrix,
  peakFilter?: PeakCategory,
): CoverageMap {
  const map: CoverageMap = new Map();

  for (const tech of matrix.techniques) {
    map.set(tech.id, {
      techniqueId: tech.id,
      count: 0,
      peakBreakdown: { Flames: 0, Embers: 0, Alchemy: 0 },
      hunts: [],
    });
  }

  for (const hunt of hunts) {
    const category = hunt.category as PeakCategory | undefined;
    if (!category) continue;
    if (peakFilter && category !== peakFilter) continue;

    for (const techId of hunt.techniques ?? []) {
      const cell = map.get(techId);
      if (!cell) {
        console.warn(`[coverage] Unknown technique ${techId} in hunt ${hunt.id}`);
        continue;
      }
      cell.count += 1;
      cell.peakBreakdown[category] += 1;
      cell.hunts.push(hunt);
    }
  }

  return map;
}

/** Map a hunt count to a coverage bucket. Thresholds: 0 = gap, 1-2 = thin, 3+ = covered. */
export function bucketFor(count: number): CoverageBucket {
  if (count === 0) return 'gap';
  if (count <= 2) return 'thin';
  return 'covered';
}

/** Totals for the stats strip. */
export function summarize(map: CoverageMap): {
  huntsCount: number;
  coveredCount: number;
  totalCount: number;
  gapCount: number;
} {
  let covered = 0;
  let total = 0;
  const huntsSet = new Set<string>();
  for (const cell of map.values()) {
    total += 1;
    if (cell.count > 0) covered += 1;
    for (const h of cell.hunts) huntsSet.add(h.id);
  }
  return {
    huntsCount: huntsSet.size,
    coveredCount: covered,
    totalCount: total,
    gapCount: total - covered,
  };
}
