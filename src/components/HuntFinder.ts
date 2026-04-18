import type { Hunt } from '../types/Hunt';
import { HuntRanker, type RankedHunt, type RankingResult } from '../lib/hunt-ranker';
import '../styles/components/hunt-finder.css';

interface DataSourceCategory {
  name: string;
  description: string;
  icon: string;
  techniques: string[];
}

interface DatasourceMapping {
  categories: DataSourceCategory[];
  metadata: Record<string, unknown>;
}

/**
 * HuntFinder component - "What Can I Hunt?" feature
 * Users select available data sources and see which HEARTH hunts they can run,
 * ranked by context graph intelligence (prevalence, actor coverage, campaign recency).
 */
export class HuntFinder {
  private container: HTMLElement;
  private hunts: Hunt[];
  private mapping: DatasourceMapping | null = null;
  private selectedCategories: Set<string> = new Set();
  private ranker: HuntRanker;

  constructor(container: HTMLElement, hunts: Hunt[]) {
    this.container = container;
    this.hunts = hunts;
    this.ranker = new HuntRanker();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Load datasource mapping and context graph in parallel
      const [mappingResp] = await Promise.all([
        fetch('/datasource-mapping.json'),
        this.ranker.load(),
      ]);

      if (!mappingResp.ok) throw new Error(`HTTP ${mappingResp.status}`);
      this.mapping = await mappingResp.json();
      this.render();
    } catch (err) {
      this.container.innerHTML = `
        <div class="hf-error">
          <p>Failed to load data source mapping. <button onclick="location.reload()">Retry</button></p>
        </div>`;
    }
  }

  private render(): void {
    if (!this.mapping) return;

    this.container.innerHTML = `
      <div class="hf-layout">
        <aside class="hf-sidebar">
          <div class="hf-sidebar__header">
            <h3>Your Data Sources</h3>
            <p class="hf-sidebar__hint">Select what's available in your environment</p>
          </div>
          <div class="hf-categories" id="hfCategories"></div>
          <div class="hf-actions">
            <button class="hf-btn hf-btn--select-all" id="hfSelectAll">Select All</button>
            <button class="hf-btn hf-btn--clear" id="hfClear">Clear</button>
          </div>
        </aside>
        <section class="hf-results">
          <div class="hf-stats" id="hfStats"></div>
          <div class="hf-coverage-bar" id="hfCoverageBar"></div>
          <div class="hf-gaps" id="hfGaps"></div>
          <div class="hf-top5" id="hfTop5"></div>
          <div class="hf-grid" id="hfGrid"></div>
        </section>
      </div>
    `;

    this.renderCategories();
    this.updateResults();
    this.bindEvents();
  }

  private renderCategories(): void {
    const container = document.getElementById('hfCategories');
    if (!container || !this.mapping) return;

    container.innerHTML = this.mapping.categories.map(cat => `
      <label class="hf-category ${this.selectedCategories.has(cat.name) ? 'hf-category--active' : ''}" data-category="${cat.name}">
        <input type="checkbox" class="hf-category__check" value="${cat.name}"
          ${this.selectedCategories.has(cat.name) ? 'checked' : ''}>
        <span class="hf-category__icon">${cat.icon}</span>
        <div class="hf-category__info">
          <span class="hf-category__name">${cat.name}</span>
          <span class="hf-category__desc">${cat.description}</span>
        </div>
        <span class="hf-category__count">${cat.techniques.length}</span>
      </label>
    `).join('');
  }

  private bindEvents(): void {
    const categoriesEl = document.getElementById('hfCategories');
    categoriesEl?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type !== 'checkbox') return;
      const cat = target.value;
      if (target.checked) {
        this.selectedCategories.add(cat);
      } else {
        this.selectedCategories.delete(cat);
      }
      this.renderCategories();
      this.updateResults();
    });

    document.getElementById('hfSelectAll')?.addEventListener('click', () => {
      this.mapping?.categories.forEach(c => this.selectedCategories.add(c.name));
      this.renderCategories();
      this.updateResults();
    });

    document.getElementById('hfClear')?.addEventListener('click', () => {
      this.selectedCategories.clear();
      this.renderCategories();
      this.updateResults();
    });
  }

  private getMatchingHunts(): Hunt[] {
    if (!this.mapping || this.selectedCategories.size === 0) return [];

    const coveredTechniques = this.getCoveredTechniques();

    return this.hunts.filter(hunt => {
      const techTags = hunt.tags.filter(t => /^T\d{4}/.test(t));
      if (techTags.length === 0) return false;
      return techTags.some(t => coveredTechniques.has(t));
    });
  }

  private getCoveredTechniques(): Set<string> {
    const coveredTechniques = new Set<string>();
    if (!this.mapping) return coveredTechniques;
    for (const cat of this.mapping.categories) {
      if (this.selectedCategories.has(cat.name)) {
        cat.techniques.forEach(t => coveredTechniques.add(t));
      }
    }
    return coveredTechniques;
  }

  private getCategoryMap(): Map<string, { name: string; icon: string; techniques: string[] }> {
    const map = new Map<string, { name: string; icon: string; techniques: string[] }>();
    if (!this.mapping) return map;
    for (const cat of this.mapping.categories) {
      map.set(cat.name, { name: cat.name, icon: cat.icon, techniques: cat.techniques });
    }
    return map;
  }

  private updateResults(): void {
    const statsEl = document.getElementById('hfStats');
    const barEl = document.getElementById('hfCoverageBar');
    const gapsEl = document.getElementById('hfGaps');
    const top5El = document.getElementById('hfTop5');
    const gridEl = document.getElementById('hfGrid');
    if (!statsEl || !barEl || !gapsEl || !top5El || !gridEl) return;

    if (this.selectedCategories.size === 0) {
      statsEl.innerHTML = `
        <div class="hf-stats__prompt">
          <span class="hf-stats__icon">👈</span>
          <span>Select your available data sources to see which hunts you can run</span>
        </div>`;
      barEl.innerHTML = '';
      gapsEl.innerHTML = '';
      top5El.innerHTML = '';
      gridEl.innerHTML = `
        <div class="hf-empty">
          <div class="hf-empty__icon">🔍</div>
          <h3>What Can You Hunt?</h3>
          <p>Select your data sources on the left to discover which threat hunting hypotheses you can execute with your current telemetry.</p>
        </div>`;
      return;
    }

    const matches = this.getMatchingHunts();
    const coveredTechs = this.getCoveredTechniques();
    const categoryMap = this.getCategoryMap();

    // Rank using context graph intelligence
    const result: RankingResult = this.ranker.rank(
      matches,
      this.hunts,
      coveredTechs,
      this.selectedCategories,
      categoryMap,
    );

    const taggedHunts = this.hunts.filter(h => h.tags.some(t => /^T\d{4}/.test(t)));
    const total = taggedHunts.length;
    const pct = total > 0 ? Math.round((matches.length / total) * 100) : 0;

    // ── Stats bar ──
    const topThreatHtml = result.topThreat
      ? `<span class="hf-stats__threat">Top threat: <strong>${this.escapeHtml(result.topThreat)}</strong></span>`
      : '';
    const gapCountHtml = result.gaps.length > 0
      ? `<span class="hf-stats__gaps-count">${result.gaps.length} gap${result.gaps.length > 1 ? 's' : ''} found</span>`
      : '';
    const avgScoreHtml = this.ranker.isLoaded && result.ranked.length > 0
      ? `<span class="hf-stats__avg">Avg priority: ${Math.round(result.averageScore * 100)}/100</span>`
      : '';

    statsEl.innerHTML = `
      <div class="hf-stats__summary">
        <span class="hf-stats__number">${matches.length}</span>
        <span class="hf-stats__label">of ${total} hunts</span>
        <span class="hf-stats__pct">(${pct}% coverage)</span>
      </div>
      <div class="hf-stats__meta">
        ${topThreatHtml}${gapCountHtml}${avgScoreHtml}
      </div>
      <div class="hf-stats__sources">
        ${Array.from(this.selectedCategories).map(c => {
          const cat = this.mapping!.categories.find(x => x.name === c);
          return `<span class="hf-stats__pill">${cat?.icon || ''} ${c}</span>`;
        }).join('')}
      </div>`;

    // ── Coverage bar ──
    barEl.innerHTML = `
      <div class="hf-coverage-bar__track">
        <div class="hf-coverage-bar__fill" style="width: ${pct}%"></div>
      </div>
      <span class="hf-coverage-bar__label">${pct}% Hunt Coverage</span>`;

    // ── Coverage gap alerts ──
    if (result.gaps.length > 0) {
      gapsEl.innerHTML = result.gaps.map(gap => `
        <div class="hf-gap-alert">
          <span class="hf-gap-alert__icon">⚠️</span>
          <div class="hf-gap-alert__text">
            <strong>Gap:</strong> You have ${this.escapeHtml(gap.categoryName)} but
            <strong>${gap.techniques.length}</strong> technique${gap.techniques.length > 1 ? 's' : ''}
            (${gap.techniques.slice(0, 3).map(t => this.escapeHtml(t)).join(', ')}${gap.techniques.length > 3 ? '...' : ''})
            have no HEARTH hypotheses.
            <a href="https://github.com/THORCollective/HEARTH" target="_blank">Submit to the Forge!</a>
          </div>
        </div>
      `).join('');
    } else {
      gapsEl.innerHTML = '';
    }

    if (matches.length === 0) {
      top5El.innerHTML = '';
      gridEl.innerHTML = `
        <div class="hf-empty">
          <h3>No matching hunts</h3>
          <p>Try selecting additional data sources</p>
        </div>`;
      return;
    }

    // ── Top 5 highlighted section ──
    const top5 = result.ranked.slice(0, 5);
    if (this.ranker.isLoaded && top5.length > 0) {
      top5El.innerHTML = `
        <h3 class="hf-top5__heading">Priority Hunts</h3>
        <div class="hf-top5__cards">
          ${top5.map(rh => this.renderTopCard(rh)).join('')}
        </div>
      `;
    } else {
      top5El.innerHTML = '';
    }

    // ── Remaining hunts grid (skip first 5 if ranked) ──
    const remaining = this.ranker.isLoaded ? result.ranked.slice(5) : result.ranked;
    if (remaining.length > 0) {
      gridEl.innerHTML = `
        <h3 class="hf-grid__heading">${this.ranker.isLoaded ? 'All Hunts (by priority)' : 'Matching Hunts'}</h3>
        <div class="hf-grid__cards">
          ${remaining.map(rh => this.renderRankedCard(rh)).join('')}
        </div>
      `;
    } else if (this.ranker.isLoaded && top5.length > 0) {
      gridEl.innerHTML = '';
    } else {
      gridEl.innerHTML = '';
    }
  }

  private renderTopCard(rh: RankedHunt): string {
    const hunt = rh.hunt;
    const categoryClass = hunt.category.toLowerCase();
    const reasoning = this.ranker.buildReasoning(rh);
    const prevalenceIcon = rh.prevalenceLevel === 'hot' ? '🔥' : rh.prevalenceLevel === 'warm' ? '🌡️' : '❄️';
    const priorityClass = rh.scoreDisplay >= 60 ? 'high' : rh.scoreDisplay >= 30 ? 'medium' : 'low';

    const tags = hunt.tags.slice(0, 4).map(t =>
      `<span class="hf-card__tag">#${this.escapeHtml(t)}</span>`
    ).join('');

    return `
      <article class="hf-top-card hf-top-card--${priorityClass}">
        <div class="hf-top-card__header">
          <div class="hf-top-card__id-row">
            <span class="hf-card__id">${this.escapeHtml(hunt.id)}</span>
            <span class="hf-card__category hf-card__category--${categoryClass}">${this.escapeHtml(hunt.category)}</span>
          </div>
          <div class="hf-top-card__score hf-top-card__score--${priorityClass}">
            ${prevalenceIcon} Priority: ${rh.scoreDisplay}/100
          </div>
        </div>
        <h4 class="hf-card__title">${this.escapeHtml(hunt.title)}</h4>
        <div class="hf-card__tactic">${this.escapeHtml(hunt.tactic)}</div>
        <div class="hf-top-card__reasoning">${this.escapeHtml(reasoning)}</div>
        <div class="hf-top-card__meta">
          ${rh.actorCount > 0 ? `<span class="hf-top-card__actors">👤 ${rh.actorCount} actor${rh.actorCount > 1 ? 's' : ''}</span>` : ''}
          ${rh.activeCampaigns.length > 0 ? `<span class="hf-top-card__campaigns">📡 ${rh.activeCampaigns.length} active campaign${rh.activeCampaigns.length > 1 ? 's' : ''}</span>` : ''}
          <span class="hf-top-card__prevalence hf-top-card__prevalence--${rh.prevalenceLevel}">${prevalenceIcon} ${rh.prevalenceLevel}</span>
        </div>
        <div class="hf-card__tags">${tags}</div>
        <div class="hf-card__footer">
          <span class="hf-card__submitter">by ${this.escapeHtml(hunt.submitter.name)}</span>
          <a href="https://github.com/THORCollective/HEARTH/blob/main/${this.escapeHtml(hunt.file_path)}" class="hf-card__link" target="_blank" rel="noopener">View hypothesis</a>
        </div>
      </article>`;
  }

  private renderRankedCard(rh: RankedHunt): string {
    const hunt = rh.hunt;
    const categoryClass = hunt.category.toLowerCase();
    const priorityClass = rh.scoreDisplay >= 60 ? 'high' : rh.scoreDisplay >= 30 ? 'medium' : 'low';
    const prevalenceIcon = rh.prevalenceLevel === 'hot' ? '🔥' : rh.prevalenceLevel === 'warm' ? '🌡️' : '❄️';

    const tags = hunt.tags.slice(0, 4).map(t =>
      `<span class="hf-card__tag">#${this.escapeHtml(t)}</span>`
    ).join('');

    const scoreBadge = this.ranker.isLoaded
      ? `<span class="hf-card__score hf-card__score--${priorityClass}">${prevalenceIcon} ${rh.scoreDisplay}</span>`
      : '';

    return `
      <article class="hf-card">
        <div class="hf-card__header">
          <span class="hf-card__id">${this.escapeHtml(hunt.id)}</span>
          <div class="hf-card__header-right">
            ${scoreBadge}
            <span class="hf-card__category hf-card__category--${categoryClass}">${this.escapeHtml(hunt.category)}</span>
          </div>
        </div>
        <h4 class="hf-card__title">${this.escapeHtml(hunt.title)}</h4>
        <div class="hf-card__tactic">${this.escapeHtml(hunt.tactic)}</div>
        ${rh.actorCount > 0 ? `<div class="hf-card__actor-count">👤 ${rh.actorCount} threat actor${rh.actorCount > 1 ? 's' : ''}</div>` : ''}
        <div class="hf-card__tags">${tags}</div>
        <div class="hf-card__footer">
          <span class="hf-card__submitter">by ${this.escapeHtml(hunt.submitter.name)}</span>
        </div>
      </article>`;
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
