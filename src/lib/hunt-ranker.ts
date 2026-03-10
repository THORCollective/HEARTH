import type { Hunt } from '../types/Hunt';

/* ────────────────────────────────────────────────────────
   Context Graph types (mirrors public/context-graph-data.json)
   ──────────────────────────────────────────────────────── */

interface GraphNode {
  id: string;
  type: 'hypothesis' | 'technique' | 'tactic' | 'datasource' | 'contributor' | 'threat_actor' | 'campaign';
  label: string;
  // technique-specific
  prevalence_score?: number;
  actor_count?: number;
  campaign_count?: number;
  // campaign-specific
  first_seen?: string;
  last_seen?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'TARGETS' | 'EMPLOYS' | 'OBSERVES' | 'BELONGS_TO' | 'SUBMITTED_BY' | 'INSPIRED_BY';
}

interface ContextGraphData {
  stats: Record<string, unknown>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ────────────────────────────────────────────────────────
   Scored hunt result
   ──────────────────────────────────────────────────────── */

export interface RankedHunt {
  hunt: Hunt;
  score: number;               // 0-1 composite
  scoreDisplay: number;        // 0-100 rounded
  subscores: {
    prevalence: number;
    actorCoverage: number;
    campaignRecency: number;
    dataSourceMatch: number;
    coverageUniqueness: number;
  };
  // Reasoning fields for top-N display
  topActors: string[];         // up to 3 actor labels
  actorCount: number;
  activeCampaigns: string[];   // campaign labels with last_seen within 2 years
  techniques: string[];        // technique IDs this hunt targets
  prevalenceLevel: 'hot' | 'warm' | 'cold';
}

export interface CoverageGap {
  categoryName: string;
  categoryIcon: string;
  techniques: string[];        // techniques covered by category but with 0 hunts
}

export interface RankingResult {
  ranked: RankedHunt[];
  gaps: CoverageGap[];
  topThreat: string | null;         // technique label with highest prevalence
  topThreatScore: number;
  averageScore: number;
}

/* ────────────────────────────────────────────────────────
   Weights
   ──────────────────────────────────────────────────────── */

const WEIGHTS = {
  prevalence: 0.4,
  actorCoverage: 0.2,
  campaignRecency: 0.2,
  dataSourceMatch: 0.1,
  coverageUniqueness: 0.1,
} as const;

/* ────────────────────────────────────────────────────────
   HuntRanker — loads context graph, scores & ranks hunts
   ──────────────────────────────────────────────────────── */

export class HuntRanker {
  private graphData: ContextGraphData | null = null;
  private loading: Promise<void> | null = null;

  // Pre-built lookup tables
  private techniqueNodes = new Map<string, GraphNode>();
  private actorNodes = new Map<string, GraphNode>();
  private campaignNodes = new Map<string, GraphNode>();

  // technique → actors that EMPLOYS it
  private techniqueActors = new Map<string, string[]>();
  // technique → campaigns that EMPLOYS it
  private techniqueCampaigns = new Map<string, string[]>();
  // technique → hypothesis IDs that TARGET it
  private techniqueHunts = new Map<string, string[]>();
  // max actor_count across all techniques (for normalization)
  private maxActorCount = 1;

  /** Load graph data (fetches once, caches in memory) */
  async load(): Promise<boolean> {
    if (this.graphData) return true;
    if (this.loading) {
      await this.loading;
      return this.graphData !== null;
    }

    this.loading = this._fetch();
    await this.loading;
    return this.graphData !== null;
  }

  private async _fetch(): Promise<void> {
    try {
      const resp = await fetch('/context-graph-data.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.graphData = await resp.json() as ContextGraphData;
      this.buildLookups();
    } catch (err) {
      console.warn('[HuntRanker] Failed to load context graph — falling back to unranked', err);
      this.graphData = null;
    }
  }

  private buildLookups(): void {
    if (!this.graphData) return;

    for (const node of this.graphData.nodes) {
      switch (node.type) {
        case 'technique':
          this.techniqueNodes.set(node.id, node);
          break;
        case 'threat_actor':
          this.actorNodes.set(node.id, node);
          break;
        case 'campaign':
          this.campaignNodes.set(node.id, node);
          break;
      }
    }

    for (const edge of this.graphData.edges) {
      if (edge.type === 'TARGETS') {
        // hypothesis → technique
        const arr = this.techniqueHunts.get(edge.target) || [];
        arr.push(edge.source);
        this.techniqueHunts.set(edge.target, arr);
      } else if (edge.type === 'EMPLOYS') {
        if (edge.source.startsWith('actor:')) {
          const arr = this.techniqueActors.get(edge.target) || [];
          arr.push(edge.source);
          this.techniqueActors.set(edge.target, arr);
        } else if (edge.source.startsWith('campaign:')) {
          const arr = this.techniqueCampaigns.get(edge.target) || [];
          arr.push(edge.source);
          this.techniqueCampaigns.set(edge.target, arr);
        }
      }
    }

    // Find max actor count for normalization
    for (const node of this.techniqueNodes.values()) {
      if ((node.actor_count ?? 0) > this.maxActorCount) {
        this.maxActorCount = node.actor_count!;
      }
    }
  }

  /** Is graph data loaded and available? */
  get isLoaded(): boolean {
    return this.graphData !== null;
  }

  /**
   * Rank a list of matching hunts using context graph intelligence.
   *
   * @param hunts         — hunts that matched the user's selected data sources
   * @param allHunts      — full hunt list (for coverage gap detection)
   * @param coveredTechs  — technique IDs covered by selected data source categories
   * @param selectedCategories — the data source categories the user selected
   * @param categoryMap   — category name → techniques mapping
   */
  rank(
    hunts: Hunt[],
    allHunts: Hunt[],
    coveredTechs: Set<string>,
    selectedCategories: Set<string>,
    categoryMap: Map<string, { name: string; icon: string; techniques: string[] }>,
  ): RankingResult {
    if (!this.graphData) {
      // Graceful degradation: return unranked with neutral scores
      return {
        ranked: hunts.map(h => this.neutralScore(h)),
        gaps: [],
        topThreat: null,
        topThreatScore: 0,
        averageScore: 0,
      };
    }

    const now = Date.now();
    const twoYearsMs = 2 * 365.25 * 24 * 60 * 60 * 1000;

    // Count hunts per technique (for uniqueness scoring)
    const huntCountPerTechnique = new Map<string, number>();
    for (const h of allHunts) {
      for (const tag of h.tags) {
        if (/^T\d{4}/.test(tag)) {
          huntCountPerTechnique.set(tag, (huntCountPerTechnique.get(tag) || 0) + 1);
        }
      }
    }
    const maxHuntsPerTech = Math.max(1, ...huntCountPerTechnique.values());

    const ranked: RankedHunt[] = hunts.map(hunt => {
      const techTags = hunt.tags.filter(t => /^T\d{4}/.test(t));

      // Normalize technique IDs: hunt tags use T1059_001, graph uses T1059.001
      const normalizedTechs = techTags.map(t => this.normalizeTechId(t));

      // ── Prevalence (0.4) ──
      let maxPrevalence = 0;
      for (const tid of normalizedTechs) {
        const node = this.techniqueNodes.get(tid);
        if (node?.prevalence_score != null && node.prevalence_score > maxPrevalence) {
          maxPrevalence = node.prevalence_score;
        }
      }

      // ── Actor coverage (0.2) ──
      const actorSet = new Set<string>();
      for (const tid of normalizedTechs) {
        for (const a of (this.techniqueActors.get(tid) || [])) {
          actorSet.add(a);
        }
      }
      const actorCoverage = Math.min(actorSet.size / this.maxActorCount, 1);

      // Top 3 actor labels for display
      const topActors: string[] = [];
      for (const aId of actorSet) {
        const node = this.actorNodes.get(aId);
        if (node) topActors.push(node.label);
        if (topActors.length >= 3) break;
      }

      // ── Campaign recency (0.2) ──
      const campaignSet = new Set<string>();
      const activeCampaigns: string[] = [];
      for (const tid of normalizedTechs) {
        for (const cId of (this.techniqueCampaigns.get(tid) || [])) {
          if (campaignSet.has(cId)) continue;
          campaignSet.add(cId);
          const cNode = this.campaignNodes.get(cId);
          if (cNode) {
            const lastSeen = cNode.last_seen ? new Date(cNode.last_seen).getTime() : 0;
            if (now - lastSeen < twoYearsMs) {
              activeCampaigns.push(cNode.label);
            }
          }
        }
      }
      // Score: any active campaign → high, older campaigns → scaled
      let campaignRecency = 0;
      if (activeCampaigns.length > 0) {
        campaignRecency = Math.min(0.5 + activeCampaigns.length * 0.15, 1);
      } else if (campaignSet.size > 0) {
        campaignRecency = 0.2; // older but documented campaigns
      }

      // ── Data source match quality (0.1) ──
      // How many of the hunt's techniques are covered by selected sources?
      let matchedCount = 0;
      for (const tag of techTags) {
        if (coveredTechs.has(tag)) matchedCount++;
        // Also try normalized form
        else if (coveredTechs.has(this.normalizeTechId(tag))) matchedCount++;
      }
      const dataSourceMatch = techTags.length > 0 ? matchedCount / techTags.length : 0;

      // ── Coverage uniqueness (0.1) ──
      // Rare coverage = more valuable. Inverse of how many hunts cover the same technique.
      let uniquenessSum = 0;
      for (const tag of techTags) {
        const count = huntCountPerTechnique.get(tag) || 1;
        uniquenessSum += 1 - (count / maxHuntsPerTech);
      }
      const coverageUniqueness = techTags.length > 0 ? uniquenessSum / techTags.length : 0;

      // ── Composite score ──
      const score =
        WEIGHTS.prevalence * maxPrevalence +
        WEIGHTS.actorCoverage * actorCoverage +
        WEIGHTS.campaignRecency * campaignRecency +
        WEIGHTS.dataSourceMatch * dataSourceMatch +
        WEIGHTS.coverageUniqueness * coverageUniqueness;

      const prevalenceLevel: 'hot' | 'warm' | 'cold' =
        maxPrevalence >= 0.6 ? 'hot' :
        maxPrevalence >= 0.2 ? 'warm' : 'cold';

      return {
        hunt,
        score,
        scoreDisplay: Math.round(score * 100),
        subscores: {
          prevalence: maxPrevalence,
          actorCoverage,
          campaignRecency,
          dataSourceMatch,
          coverageUniqueness,
        },
        topActors,
        actorCount: actorSet.size,
        activeCampaigns: activeCampaigns.slice(0, 3),
        techniques: normalizedTechs,
        prevalenceLevel,
      };
    });

    // Sort descending by score
    ranked.sort((a, b) => b.score - a.score);

    // ── Coverage gap detection ──
    const gaps: CoverageGap[] = [];
    for (const [catName, cat] of categoryMap) {
      if (!selectedCategories.has(catName)) continue;
      const uncoveredTechs: string[] = [];
      for (const tid of cat.techniques) {
        const normalized = this.normalizeTechId(tid);
        const huntCount = (this.techniqueHunts.get(tid)?.length || 0) +
                          (this.techniqueHunts.get(normalized)?.length || 0);
        if (huntCount === 0) {
          uncoveredTechs.push(normalized);
        }
      }
      if (uncoveredTechs.length > 0) {
        gaps.push({
          categoryName: catName,
          categoryIcon: cat.icon,
          techniques: [...new Set(uncoveredTechs)],
        });
      }
    }

    // Top threat: highest prevalence technique among covered techniques
    let topThreat: string | null = null;
    let topThreatScore = 0;
    for (const tid of coveredTechs) {
      const norm = this.normalizeTechId(tid);
      const node = this.techniqueNodes.get(tid) || this.techniqueNodes.get(norm);
      if (node?.prevalence_score != null && node.prevalence_score > topThreatScore) {
        topThreatScore = node.prevalence_score;
        topThreat = node.label;
      }
    }

    const averageScore = ranked.length > 0
      ? ranked.reduce((sum, r) => sum + r.score, 0) / ranked.length
      : 0;

    return { ranked, gaps, topThreat, topThreatScore, averageScore };
  }

  /**
   * Build a "why this hunt" explanation string for a ranked hunt.
   */
  buildReasoning(rh: RankedHunt): string {
    const parts: string[] = [];

    if (rh.actorCount > 0) {
      const actorStr = rh.topActors.length > 0
        ? rh.topActors.join(', ')
        : `${rh.actorCount} actors`;
      const techStr = rh.techniques.join(', ');
      parts.push(`${rh.actorCount} threat actor${rh.actorCount > 1 ? 's' : ''} use ${techStr} including ${actorStr}`);
    }

    if (rh.activeCampaigns.length > 0) {
      parts.push(`Active campaign${rh.activeCampaigns.length > 1 ? 's' : ''}: ${rh.activeCampaigns.join(', ')}`);
    }

    if (rh.subscores.dataSourceMatch >= 1) {
      parts.push('Your data sources fully cover this hunt');
    } else if (rh.subscores.dataSourceMatch > 0) {
      parts.push(`${Math.round(rh.subscores.dataSourceMatch * 100)}% data source match`);
    }

    if (rh.subscores.coverageUniqueness > 0.5) {
      parts.push('Rare coverage — few other hunts target this technique');
    }

    return parts.join('. ') + (parts.length > 0 ? '.' : '');
  }

  /** Normalize technique ID: T1059_001 → T1059.001 */
  private normalizeTechId(id: string): string {
    return id.replace(/_/g, '.');
  }

  /** Return a neutral / unranked score for graceful degradation */
  private neutralScore(hunt: Hunt): RankedHunt {
    return {
      hunt,
      score: 0,
      scoreDisplay: 0,
      subscores: {
        prevalence: 0,
        actorCoverage: 0,
        campaignRecency: 0,
        dataSourceMatch: 0,
        coverageUniqueness: 0,
      },
      topActors: [],
      actorCount: 0,
      activeCampaigns: [],
      techniques: hunt.tags.filter(t => /^T\d{4}/.test(t)),
      prevalenceLevel: 'cold',
    };
  }
}
