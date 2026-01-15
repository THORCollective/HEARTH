import type { AppState } from '../state/AppState';
import type { Observer } from '../types/Observer';

/**
 * Pagination component - handles page navigation
 */
export class Pagination implements Observer {
  private containerElement: HTMLElement;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;
  private pageInfo: HTMLElement | null = null;

  constructor(state: AppState) {
    // Create pagination container if it doesn't exist
    this.containerElement = this.getOrCreatePaginationContainer();

    // Render pagination controls
    this.renderPaginationControls(state);

    // Subscribe to state changes
    state.subscribe(this);
  }

  /**
   * Get or create pagination container
   */
  private getOrCreatePaginationContainer(): HTMLElement {
    let container = document.getElementById('pagination');

    if (!container) {
      container = document.createElement('div');
      container.id = 'pagination';
      container.className = 'pagination';

      // Insert after huntsGrid
      const huntsGrid = document.getElementById('huntsGrid');
      if (huntsGrid && huntsGrid.parentNode) {
        huntsGrid.parentNode.insertBefore(container, huntsGrid.nextSibling);
      } else {
        document.querySelector('main')?.appendChild(container);
      }
    }

    return container;
  }

  /**
   * Render pagination controls
   */
  private renderPaginationControls(state: AppState): void {
    this.containerElement.innerHTML = `
      <button id="prevPage" class="pagination__button pagination__button--prev">
        ← Previous
      </button>
      <span id="paginationInfo" class="pagination__info"></span>
      <button id="nextPage" class="pagination__button pagination__button--next">
        Next →
      </button>
    `;

    // Get references to elements
    this.prevButton = document.getElementById('prevPage') as HTMLButtonElement;
    this.nextButton = document.getElementById('nextPage') as HTMLButtonElement;
    this.pageInfo = document.getElementById('paginationInfo');

    // Set up event listeners
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        state.setPage(state.getCurrentPage() - 1);
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        state.setPage(state.getCurrentPage() + 1);
      });
    }

    // Initial update
    this.updatePagination(state);
  }

  /**
   * Called when state changes
   */
  onStateChange(state: AppState): void {
    this.updatePagination(state);
  }

  /**
   * Update pagination display
   */
  private updatePagination(state: AppState): void {
    const currentPage = state.getCurrentPage();
    const totalPages = state.getTotalPages();
    const filteredCount = state.getFilteredHuntCount();

    // Show/hide pagination based on filtered count
    if (filteredCount === 0 || totalPages === 1) {
      this.containerElement.style.display = 'none';
      return;
    }

    this.containerElement.style.display = 'flex';

    // Update page info
    if (this.pageInfo) {
      this.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = currentPage <= 1;
    }

    if (this.nextButton) {
      this.nextButton.disabled = currentPage >= totalPages;
    }
  }
}
