import type { AppState } from '../state/AppState';
import type { Observer } from '../types/Observer';

/**
 * FilterPanel component - handles category, tactic, tag, and sorting filters
 */
export class FilterPanel implements Observer {
  private categoryFilter: HTMLSelectElement;
  private sortSelect: HTMLSelectElement;
  private tacticChipsContainer: HTMLElement;
  private tagChipsContainer: HTMLElement;
  private clearTacticsButton: HTMLButtonElement;
  private clearTagsButton: HTMLButtonElement;

  constructor(state: AppState) {
    // Get DOM elements
    this.categoryFilter = this.getElement('categoryFilter') as HTMLSelectElement;
    this.sortSelect = this.getElement('sortHunts') as HTMLSelectElement;
    this.tacticChipsContainer = this.getElement('tacticChips');
    this.tagChipsContainer = this.getElement('tagChips');
    this.clearTacticsButton = this.getElement('clearTactics') as HTMLButtonElement;
    this.clearTagsButton = this.getElement('clearTags') as HTMLButtonElement;

    // Set up event listeners
    this.setupEventListeners(state);

    // Render chips
    this.renderTacticChips(state);
    this.renderTagChips(state);

    // Subscribe to state changes
    state.subscribe(this);
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(state: AppState): void {
    // Category filter
    this.categoryFilter.addEventListener('change', (e) => {
      const category = (e.target as HTMLSelectElement).value;
      state.setCategory(category);
    });

    // Sort select
    this.sortSelect.addEventListener('change', (e) => {
      const sortBy = (e.target as HTMLSelectElement).value;
      state.setSorting(sortBy);
    });

    // Clear tactics button
    this.clearTacticsButton.addEventListener('click', () => {
      state.clearTactics();
    });

    // Clear tags button
    this.clearTagsButton.addEventListener('click', () => {
      state.clearTags();
    });
  }

  /**
   * Render tactic filter chips
   */
  private renderTacticChips(state: AppState): void {
    const tactics = Array.from(state.getUniqueTactics()).sort();
    const selectedTactics = state.getSelectedTactics();

    this.tacticChipsContainer.innerHTML = '';

    tactics.forEach(tactic => {
      const chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.textContent = tactic;
      chip.setAttribute('data-tactic', tactic);

      // Set active state
      if (selectedTactics.has(tactic)) {
        chip.classList.add('filter-chip--active');
      }

      // Click handler
      chip.addEventListener('click', () => {
        state.toggleTactic(tactic);
      });

      this.tacticChipsContainer.appendChild(chip);
    });
  }

  /**
   * Render tag filter chips (show popular tags, limit to 20)
   */
  private renderTagChips(state: AppState): void {
    // Get all tags and count their frequency
    const tagCounts = new Map<string, number>();
    state.getAllHunts().forEach(hunt => {
      hunt.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Sort by frequency and take top 20
    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);

    const selectedTags = state.getSelectedTags();

    this.tagChipsContainer.innerHTML = '';

    popularTags.forEach(tag => {
      const chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.textContent = `#${tag}`;
      chip.setAttribute('data-tag', tag);

      // Set active state
      if (selectedTags.has(tag)) {
        chip.classList.add('filter-chip--active');
      }

      // Click handler
      chip.addEventListener('click', () => {
        state.toggleTag(tag);
      });

      this.tagChipsContainer.appendChild(chip);
    });
  }

  /**
   * Called when state changes
   */
  onStateChange(state: AppState): void {
    // Update category select
    this.categoryFilter.value = state.getSelectedCategory();

    // Update sort select
    this.sortSelect.value = state.getSorting();

    // Update tactic chips
    const selectedTactics = state.getSelectedTactics();
    this.tacticChipsContainer.querySelectorAll('.filter-chip').forEach(chip => {
      const tactic = chip.getAttribute('data-tactic');
      if (tactic && selectedTactics.has(tactic)) {
        chip.classList.add('filter-chip--active');
      } else {
        chip.classList.remove('filter-chip--active');
      }
    });

    // Update tag chips
    const selectedTags = state.getSelectedTags();
    this.tagChipsContainer.querySelectorAll('.filter-chip').forEach(chip => {
      const tag = chip.getAttribute('data-tag');
      if (tag && selectedTags.has(tag)) {
        chip.classList.add('filter-chip--active');
      } else {
        chip.classList.remove('filter-chip--active');
      }
    });

    // Show/hide clear buttons
    this.clearTacticsButton.style.display = selectedTactics.size > 0 ? 'inline-block' : 'none';
    this.clearTagsButton.style.display = selectedTags.size > 0 ? 'inline-block' : 'none';
  }

  /**
   * Get element by ID with error checking
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`FilterPanel: Required element #${id} not found`);
    }
    return element;
  }
}
