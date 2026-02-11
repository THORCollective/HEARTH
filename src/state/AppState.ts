import type { Hunt } from '../types/Hunt';
import type { Observer } from '../types/Observer';

/**
 * Centralized application state with Observer pattern
 * Manages hunt data, filtering, and notifies components of changes
 */
export class AppState {
  private hunts: Hunt[];
  private filteredHunts: Hunt[];
  private observers: Set<Observer> = new Set();

  // Filter state
  private searchQuery: string = '';
  private selectedCategory: string = '';
  private selectedTactics: Set<string> = new Set();
  private selectedTags: Set<string> = new Set();

  // Pagination state
  private currentPage: number = 1;
  private pageSize: number = 9;

  // Sorting state
  private sortBy: string = 'id-desc'; // 'id-desc', 'id-asc', 'title-asc', 'title-desc'

  constructor(hunts: Hunt[]) {
    this.hunts = hunts;
    this.filteredHunts = [...hunts];
    this.updatePageSize();
  }

  /**
   * Update page size based on screen width (responsive)
   */
  private updatePageSize(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.pageSize = 15; // Mobile
    } else if (width < 1024) {
      this.pageSize = 20; // Tablet
    } else {
      this.pageSize = 25; // Desktop
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(observer: Observer): void {
    this.observers.add(observer);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(observer: Observer): void {
    this.observers.delete(observer);
  }

  /**
   * Notify all observers of state change
   */
  private notify(): void {
    this.observers.forEach(observer => {
      observer.onStateChange(this);
    });
  }

  /**
   * Set search query and reapply filters
   */
  setSearchQuery(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
    this.currentPage = 1; // Reset to page 1 when filters change
    this.applyFilters();
    this.notify();
  }

  /**
   * Get current search query
   */
  getSearchQuery(): string {
    return this.searchQuery;
  }

  /**
   * Set category filter and reapply filters
   */
  setCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
    this.notify();
  }

  /**
   * Get selected category
   */
  getSelectedCategory(): string {
    return this.selectedCategory;
  }

  /**
   * Toggle tactic filter
   */
  toggleTactic(tactic: string): void {
    if (this.selectedTactics.has(tactic)) {
      this.selectedTactics.delete(tactic);
    } else {
      this.selectedTactics.add(tactic);
    }
    this.currentPage = 1;
    this.applyFilters();
    this.notify();
  }

  /**
   * Get selected tactics
   */
  getSelectedTactics(): Set<string> {
    return this.selectedTactics;
  }

  /**
   * Clear all tactic filters
   */
  clearTactics(): void {
    this.selectedTactics.clear();
    this.currentPage = 1;
    this.applyFilters();
    this.notify();
  }

  /**
   * Toggle tag filter
   */
  toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.currentPage = 1;
    this.applyFilters();
    this.notify();
  }

  /**
   * Get selected tags
   */
  getSelectedTags(): Set<string> {
    return this.selectedTags;
  }

  /**
   * Clear all tag filters
   */
  clearTags(): void {
    this.selectedTags.clear();
    this.currentPage = 1;
    this.applyFilters();
    this.notify();
  }

  /**
   * Set sorting
   */
  setSorting(sortBy: string): void {
    this.sortBy = sortBy;
    this.applySorting();
    this.notify();
  }

  /**
   * Get current sorting
   */
  getSorting(): string {
    return this.sortBy;
  }

  /**
   * Set current page
   */
  setPage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;
    this.notify();
  }

  /**
   * Get current page
   */
  getCurrentPage(): number {
    return this.currentPage;
  }

  /**
   * Get total pages
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredHunts.length / this.pageSize) || 1;
  }

  /**
   * Get page size
   */
  getPageSize(): number {
    return this.pageSize;
  }

  /**
   * Apply all active filters to hunt list
   */
  private applyFilters(): void {
    let filtered = [...this.hunts];

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(hunt => {
        const searchableText = [
          hunt.title,
          hunt.tactic,
          hunt.notes,
          hunt.submitter.name,
          ...hunt.tags
        ].join(' ').toLowerCase();

        return searchableText.includes(this.searchQuery);
      });
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(hunt => hunt.category === this.selectedCategory);
    }

    // Apply tactic filters (OR logic - match any selected tactic)
    if (this.selectedTactics.size > 0) {
      filtered = filtered.filter(hunt => {
        return Array.from(this.selectedTactics).some(tactic =>
          hunt.tactic.toLowerCase().includes(tactic.toLowerCase())
        );
      });
    }

    // Apply tag filters (OR logic - match any selected tag)
    if (this.selectedTags.size > 0) {
      filtered = filtered.filter(hunt => {
        return hunt.tags.some(tag => this.selectedTags.has(tag));
      });
    }

    this.filteredHunts = filtered;
    this.applySorting();
  }

  /**
   * Apply sorting to filtered hunts
   */
  private applySorting(): void {
    const sorted = [...this.filteredHunts];

    switch (this.sortBy) {
      case 'id-desc':
        sorted.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'id-asc':
        sorted.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Default to id-desc
        sorted.sort((a, b) => b.id.localeCompare(a.id));
    }

    this.filteredHunts = sorted;
  }

  /**
   * Get all hunts (unfiltered)
   */
  getAllHunts(): Hunt[] {
    return this.hunts;
  }

  /**
   * Get filtered hunts
   */
  getFilteredHunts(): Hunt[] {
    return this.filteredHunts;
  }

  /**
   * Get paginated hunts (current page only)
   */
  getPaginatedHunts(): Hunt[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredHunts.slice(start, end);
  }

  /**
   * Get total hunt count
   */
  getTotalHuntCount(): number {
    return this.hunts.length;
  }

  /**
   * Get filtered hunt count
   */
  getFilteredHuntCount(): number {
    return this.filteredHunts.length;
  }

  /**
   * Get unique tactics across all hunts
   */
  getUniqueTactics(): Set<string> {
    const tactics = new Set<string>();
    this.hunts.forEach(hunt => {
      if (hunt.tactic) {
        // Split by comma for multiple tactics
        hunt.tactic.split(',').forEach(tactic => {
          tactics.add(tactic.trim());
        });
      }
    });
    return tactics;
  }

  /**
   * Get unique contributors across all hunts
   */
  getUniqueContributors(): Set<string> {
    const contributors = new Set<string>();
    this.hunts.forEach(hunt => {
      if (hunt.submitter.name) {
        contributors.add(hunt.submitter.name);
      }
    });
    return contributors;
  }

  /**
   * Get unique tags across all hunts
   */
  getUniqueTags(): Set<string> {
    const tags = new Set<string>();
    this.hunts.forEach(hunt => {
      hunt.tags.forEach(tag => tags.add(tag));
    });
    return tags;
  }

  /**
   * Force a re-render without changing state
   */
  render(): void {
    this.notify();
  }
}
