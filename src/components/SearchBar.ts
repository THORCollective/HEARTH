import type { AppState } from '../state/AppState';
import type { Observer } from '../types/Observer';
import { debounce } from '../utils/debounce';

/**
 * SearchBar component - handles search input with debouncing
 */
export class SearchBar implements Observer {
  private inputElement: HTMLInputElement;
  private clearButton: HTMLButtonElement;
  private feedbackElement: HTMLElement;

  constructor(state: AppState) {
    // Get DOM elements
    this.inputElement = this.getElement('searchInput') as HTMLInputElement;
    this.clearButton = this.getElement('clearSearch') as HTMLButtonElement;
    this.feedbackElement = this.getElement('searchFeedback');

    // Set up event listeners
    this.setupEventListeners(state);

    // Subscribe to state changes
    state.subscribe(this);
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(state: AppState): void {
    // Debounce search input for performance (300ms)
    const debouncedSearch = debounce((query: string) => {
      state.setSearchQuery(query);
    }, 300);

    this.inputElement.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      debouncedSearch(query);
    });

    // Clear button
    this.clearButton.addEventListener('click', () => {
      this.inputElement.value = '';
      state.setSearchQuery('');
      this.inputElement.focus();
    });
  }

  /**
   * Called when state changes
   */
  onStateChange(state: AppState): void {
    const query = state.getSearchQuery();
    const hasQuery = query.length > 0;
    const filteredCount = state.getFilteredHuntCount();

    // Show/hide clear button
    this.clearButton.style.display = hasQuery ? 'block' : 'none';

    // Update feedback
    if (hasQuery && filteredCount === 0) {
      this.feedbackElement.textContent = 'No hunts match your search';
      this.feedbackElement.style.color = 'var(--color-error)';
    } else {
      this.feedbackElement.textContent = '';
    }
  }

  /**
   * Get element by ID with error checking
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`SearchBar: Required element #${id} not found`);
    }
    return element;
  }
}
