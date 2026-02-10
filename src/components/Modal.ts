import type { AppState } from '../state/AppState';
import type { Hunt } from '../types/Hunt';

/**
 * Modal component - displays hunt details with keyboard navigation
 */
export class Modal {
  private state: AppState;
  private modalElement: HTMLElement | null = null;
  private currentHunt: Hunt | null = null;

  constructor(state: AppState) {
    this.state = state;
    this.createModalElement();
    this.setupEventListeners();
    this.checkURLForHunt();
  }

  /**
   * Create modal DOM element
   */
  private createModalElement(): void {
    const modal = document.createElement('div');
    modal.id = 'huntModal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__content">
        <button class="modal__close" aria-label="Close modal">×</button>
        <div class="modal__body"></div>
        <div class="modal__nav">
          <button class="modal__nav-btn modal__nav-btn--prev" aria-label="Previous hunt">← Previous</button>
          <button class="modal__nav-btn modal__nav-btn--next" aria-label="Next hunt">Next →</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalElement = modal;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.modalElement) return;

    // Close button
    const closeButton = this.modalElement.querySelector('.modal__close');
    closeButton?.addEventListener('click', () => this.close());

    // Overlay click
    const overlay = this.modalElement.querySelector('.modal__overlay');
    overlay?.addEventListener('click', () => this.close());

    // Navigation buttons
    const prevButton = this.modalElement.querySelector('.modal__nav-btn--prev');
    const nextButton = this.modalElement.querySelector('.modal__nav-btn--next');

    prevButton?.addEventListener('click', () => this.navigatePrev());
    nextButton?.addEventListener('click', () => this.navigateNext());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen()) return;

      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.navigatePrev();
          break;
        case 'ArrowRight':
          this.navigateNext();
          break;
      }
    });

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.checkURLForHunt();
    });
  }

  /**
   * Open modal with hunt details
   */
  open(hunt: Hunt): void {
    this.currentHunt = hunt;
    this.render(hunt);

    if (this.modalElement) {
      this.modalElement.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // Update URL
    this.updateURL(hunt.id);
  }

  /**
   * Close modal
   */
  close(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
      document.body.style.overflow = ''; // Restore scroll
    }

    this.currentHunt = null;

    // Clear URL parameter
    this.updateURL(null);
  }

  /**
   * Check if modal is open
   */
  isOpen(): boolean {
    return this.modalElement?.style.display === 'flex';
  }

  /**
   * Render hunt details in modal
   */
  private render(hunt: Hunt): void {
    const body = this.modalElement?.querySelector('.modal__body');
    if (!body) return;

    const categoryClass = `hunt-category--${hunt.category.toLowerCase()}`;

    body.innerHTML = `
      <div class="modal__header">
        <div class="modal__meta">
          <span class="modal__id">${this.escapeHtml(hunt.id)}</span>
          <span class="modal__category ${categoryClass}">${this.escapeHtml(hunt.category)}</span>
        </div>
        <h2 class="modal__title">${this.escapeHtml(hunt.title)}</h2>
        <div class="modal__tactic">${this.escapeHtml(hunt.tactic)}</div>
      </div>

      ${hunt.notes ? `
        <div class="modal__section">
          <h3 class="modal__section-title">Notes</h3>
          <p class="modal__section-content">${this.escapeHtml(hunt.notes)}</p>
        </div>
      ` : ''}

      ${hunt.why ? `
        <div class="modal__section">
          <h3 class="modal__section-title">Why This Hunt?</h3>
          <div class="modal__section-content modal__section-content--markdown">${this.formatMarkdown(hunt.why)}</div>
        </div>
      ` : ''}

      ${hunt.references ? `
        <div class="modal__section">
          <h3 class="modal__section-title">References</h3>
          <div class="modal__section-content modal__section-content--markdown">${this.formatMarkdown(hunt.references)}</div>
        </div>
      ` : ''}

      <div class="modal__section">
        <h3 class="modal__section-title">Tags</h3>
        <div class="modal__tags">
          ${hunt.tags.map(tag => `<span class="modal__tag">#${this.escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>

      <div class="modal__footer">
        <div class="modal__submitter">
          Submitted by:
          ${hunt.submitter.link
            ? `<a href="${this.escapeHtml(hunt.submitter.link)}" target="_blank" rel="noopener">${this.escapeHtml(hunt.submitter.name)}</a>`
            : this.escapeHtml(hunt.submitter.name)
          }
        </div>
        <div class="modal__github">
          <a href="https://github.com/THORCollective/HEARTH/blob/main/${this.escapeHtml(hunt.file_path)}" target="_blank" rel="noopener" class="modal__github-link">
            <span class="modal__github-icon">📄</span>
            View on GitHub
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Navigate to previous hunt
   */
  private navigatePrev(): void {
    if (!this.currentHunt) return;

    const hunts = this.state.getPaginatedHunts();
    const currentIndex = hunts.findIndex(h => h.id === this.currentHunt?.id);

    if (currentIndex > 0) {
      this.open(hunts[currentIndex - 1]);
    }
  }

  /**
   * Navigate to next hunt
   */
  private navigateNext(): void {
    if (!this.currentHunt) return;

    const hunts = this.state.getPaginatedHunts();
    const currentIndex = hunts.findIndex(h => h.id === this.currentHunt?.id);

    if (currentIndex >= 0 && currentIndex < hunts.length - 1) {
      this.open(hunts[currentIndex + 1]);
    }
  }

  /**
   * Update URL with hunt ID
   */
  private updateURL(huntId: string | null): void {
    const url = new URL(window.location.href);

    if (huntId) {
      url.searchParams.set('hunt', huntId);
    } else {
      url.searchParams.delete('hunt');
    }

    window.history.pushState({}, '', url.toString());
  }

  /**
   * Check URL for hunt parameter and open modal if present
   */
  private checkURLForHunt(): void {
    const params = new URLSearchParams(window.location.search);
    const huntId = params.get('hunt');

    if (huntId) {
      const hunt = this.state.getAllHunts().find(h => h.id === huntId);
      if (hunt) {
        this.open(hunt);
      } else {
        // Invalid hunt ID, clear URL
        this.updateURL(null);
      }
    } else {
      // No hunt parameter, ensure modal is closed
      if (this.isOpen()) {
        if (this.modalElement) {
          this.modalElement.style.display = 'none';
          document.body.style.overflow = '';
        }
        this.currentHunt = null;
      }
    }
  }

  /**
   * Simple markdown formatting (convert - bullets and URLs)
   */
  private formatMarkdown(text: string): string {
    return text
      .split('\n')
      .map(line => {
        // Convert bullet points
        if (line.trim().startsWith('-')) {
          return `<li>${this.escapeHtml(line.trim().substring(1).trim())}</li>`;
        }
        // Convert URLs
        return this.linkify(this.escapeHtml(line));
      })
      .join('\n')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  }

  /**
   * Convert URLs to links
   */
  private linkify(text: string): string {
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get modal instance for hunt click handlers
   */
  getModalElement(): HTMLElement | null {
    return this.modalElement;
  }
}
