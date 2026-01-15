import type { AppState } from '../state/AppState';
import type { Observer } from '../types/Observer';
import type { Hunt } from '../types/Hunt';

/**
 * HuntGrid component - renders hunt cards in a grid layout
 */
export class HuntGrid implements Observer {
  private gridElement: HTMLElement;

  constructor(state: AppState) {
    // Get grid element
    const element = document.getElementById('huntsGrid');
    if (!element) {
      throw new Error('HuntGrid: Required element #huntsGrid not found');
    }
    this.gridElement = element;

    // Subscribe to state changes
    state.subscribe(this);
  }

  /**
   * Called when state changes - re-render grid
   */
  onStateChange(state: AppState): void {
    this.render(state.getPaginatedHunts());
    this.updateStats(state);
  }

  /**
   * Render hunt cards
   */
  private render(hunts: Hunt[]): void {
    // Clear existing content
    this.gridElement.innerHTML = '';

    if (hunts.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Render each hunt card
    hunts.forEach(hunt => {
      const card = this.createHuntCard(hunt);
      this.gridElement.appendChild(card);
    });
  }

  /**
   * Render empty state when no hunts match filters
   */
  private renderEmptyState(): void {
    this.gridElement.classList.add('hunts-grid--empty');
    this.gridElement.innerHTML = `
      <div class="empty-state">
        <h3>No hunts found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
  }

  /**
   * Create a hunt card element
   */
  private createHuntCard(hunt: Hunt): HTMLElement {
    const card = document.createElement('article');
    card.className = 'hunt-card';
    card.setAttribute('data-hunt-id', hunt.id);

    // Category badge class
    const categoryClass = `hunt-card__category--${hunt.category.toLowerCase()}`;

    // Limit tags displayed (show first 3)
    const displayTags = hunt.tags.slice(0, 3);
    const tagsHTML = displayTags.map(tag =>
      `<span class="hunt-card__tag">#${this.escapeHtml(tag)}</span>`
    ).join('');

    card.innerHTML = `
      <div class="hunt-card__header">
        <span class="hunt-card__id">${this.escapeHtml(hunt.id)}</span>
        <span class="hunt-card__category ${categoryClass}">${this.escapeHtml(hunt.category)}</span>
      </div>
      <h3 class="hunt-card__title">${this.escapeHtml(hunt.title)}</h3>
      <div class="hunt-card__tactic">${this.escapeHtml(hunt.tactic)}</div>
      ${hunt.notes ? `<div class="hunt-card__notes">${this.escapeHtml(hunt.notes)}</div>` : ''}
      ${displayTags.length > 0 ? `<div class="hunt-card__tags">${tagsHTML}</div>` : ''}
      <div class="hunt-card__submitter">
        By: ${hunt.submitter.link
          ? `<a href="${this.escapeHtml(hunt.submitter.link)}" target="_blank" rel="noopener">${this.escapeHtml(hunt.submitter.name)}</a>`
          : this.escapeHtml(hunt.submitter.name)
        }
      </div>
    `;

    // Add click handler for modal (will implement in Week 3)
    card.addEventListener('click', () => {
      console.log('Hunt clicked:', hunt.id);
      // TODO: Open modal with hunt details
    });

    return card;
  }

  /**
   * Update stats display
   */
  private updateStats(state: AppState): void {
    const huntCountElement = document.getElementById('huntCount');
    if (huntCountElement) {
      const filtered = state.getFilteredHuntCount();
      const total = state.getTotalHuntCount();

      if (filtered === total) {
        huntCountElement.textContent = `Showing ${total} ${total === 1 ? 'hunt' : 'hunts'}`;
      } else {
        huntCountElement.textContent = `Showing ${filtered} of ${total} hunts`;
      }
    }

    // Update intro highlights
    const totalHuntsElement = document.getElementById('introTotalHunts');
    if (totalHuntsElement) {
      totalHuntsElement.textContent = state.getTotalHuntCount().toString();
    }

    const totalTacticsElement = document.getElementById('introTotalTactics');
    if (totalTacticsElement) {
      totalTacticsElement.textContent = state.getUniqueTactics().size.toString();
    }

    const totalContributorsElement = document.getElementById('introTotalContributors');
    if (totalContributorsElement) {
      totalContributorsElement.textContent = state.getUniqueContributors().size.toString();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
