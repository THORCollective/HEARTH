import type { Hunt } from '../types/Hunt';
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
 * Users select available data sources and see which HEARTH hunts they can run.
 */
export class HuntFinder {
  private container: HTMLElement;
  private hunts: Hunt[];
  private mapping: DatasourceMapping | null = null;
  private selectedCategories: Set<string> = new Set();

  constructor(container: HTMLElement, hunts: Hunt[]) {
    this.container = container;
    this.hunts = hunts;
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const resp = await fetch('/datasource-mapping.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.mapping = await resp.json();
      this.render();
    } catch (err) {
      this.container.innerHTML = `
        <div class="hf-error">
          <p>⚠️ Failed to load data source mapping. <button onclick="location.reload()">Retry</button></p>
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

    // Collect all technique IDs covered by selected categories
    const coveredTechniques = new Set<string>();
    for (const cat of this.mapping.categories) {
      if (this.selectedCategories.has(cat.name)) {
        cat.techniques.forEach(t => coveredTechniques.add(t));
      }
    }

    // A hunt matches if it has at least one technique tag covered
    // Hunts without technique tags are excluded (can't determine data source needs)
    return this.hunts.filter(hunt => {
      const techTags = hunt.tags.filter(t => /^T\d{4}/.test(t));
      if (techTags.length === 0) return false;
      return techTags.some(t => coveredTechniques.has(t));
    });
  }

  private updateResults(): void {
    const statsEl = document.getElementById('hfStats');
    const barEl = document.getElementById('hfCoverageBar');
    const gridEl = document.getElementById('hfGrid');
    if (!statsEl || !barEl || !gridEl) return;

    if (this.selectedCategories.size === 0) {
      statsEl.innerHTML = `
        <div class="hf-stats__prompt">
          <span class="hf-stats__icon">👈</span>
          <span>Select your available data sources to see which hunts you can run</span>
        </div>`;
      barEl.innerHTML = '';
      gridEl.innerHTML = `
        <div class="hf-empty">
          <div class="hf-empty__icon">🔍</div>
          <h3>What Can You Hunt?</h3>
          <p>Select your data sources on the left to discover which threat hunting hypotheses you can execute with your current telemetry.</p>
        </div>`;
      return;
    }

    const matches = this.getMatchingHunts();
    const taggedHunts = this.hunts.filter(h => h.tags.some(t => /^T\d{4}/.test(t)));
    const total = taggedHunts.length;
    const pct = total > 0 ? Math.round((matches.length / total) * 100) : 0;

    statsEl.innerHTML = `
      <div class="hf-stats__summary">
        <span class="hf-stats__number">${matches.length}</span>
        <span class="hf-stats__label">of ${total} hunts</span>
        <span class="hf-stats__pct">(${pct}% coverage)</span>
      </div>
      <div class="hf-stats__sources">
        ${Array.from(this.selectedCategories).map(c => {
          const cat = this.mapping!.categories.find(x => x.name === c);
          return `<span class="hf-stats__pill">${cat?.icon || ''} ${c}</span>`;
        }).join('')}
      </div>`;

    barEl.innerHTML = `
      <div class="hf-coverage-bar__track">
        <div class="hf-coverage-bar__fill" style="width: ${pct}%"></div>
      </div>
      <span class="hf-coverage-bar__label">${pct}% Hunt Coverage</span>`;

    if (matches.length === 0) {
      gridEl.innerHTML = `
        <div class="hf-empty">
          <h3>No matching hunts</h3>
          <p>Try selecting additional data sources</p>
        </div>`;
      return;
    }

    gridEl.innerHTML = matches.map(hunt => this.renderHuntCard(hunt)).join('');
  }

  private renderHuntCard(hunt: Hunt): string {
    const categoryClass = hunt.category.toLowerCase();
    const tags = hunt.tags.slice(0, 4).map(t =>
      `<span class="hf-card__tag">#${this.escapeHtml(t)}</span>`
    ).join('');

    return `
      <article class="hf-card">
        <div class="hf-card__header">
          <span class="hf-card__id">${this.escapeHtml(hunt.id)}</span>
          <span class="hf-card__category hf-card__category--${categoryClass}">${this.escapeHtml(hunt.category)}</span>
        </div>
        <h4 class="hf-card__title">${this.escapeHtml(hunt.title)}</h4>
        <div class="hf-card__tactic">${this.escapeHtml(hunt.tactic)}</div>
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
