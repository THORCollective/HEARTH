/**
 * HuntFilter - Manages filtering and searching of hunt data
 *
 * This module handles all filtering logic including:
 * - Text search across hunt fields
 * - Category filtering
 * - Tactic filtering (multi-select)
 * - Tag filtering (multi-select)
 * - Search result caching for performance
 *
 * @module HuntFilter
 */

export class HuntFilter {
  /**
   * Creates a new HuntFilter instance
   * @param {Array<Object>} huntsData - The complete array of hunt objects to filter
   */
  constructor(huntsData) {
    this.huntsData = huntsData;
    this.searchCache = new Map();
    this.selectedTactics = new Set();
    this.selectedTags = new Set();
  }

  /**
   * Get unique values for a specific field across all hunts
   * Results are cached for performance
   *
   * @param {string} fieldName - The field name to extract unique values from (e.g., 'tags', 'tactic')
   * @returns {Array<string>} Sorted array of unique values
   */
  getUniqueValues(fieldName) {
    const cacheKey = `unique_${fieldName}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    const uniqueValues = new Set();
    this.huntsData.forEach(hunt => {
      switch (fieldName) {
      case 'tags':
        (hunt.tags || []).forEach(tag => uniqueValues.add(tag));
        break;
      case 'tactic':
        if (hunt.tactic) {
          hunt.tactic.split(',').map(tactic => tactic.trim()).forEach(tactic => {
            if (tactic) {
              uniqueValues.add(tactic);
            }
          });
        }
        break;
      default:
        if (hunt[fieldName]) {
          uniqueValues.add(hunt[fieldName]);
        }
      }
    });

    const result = Array.from(uniqueValues).filter(Boolean).sort();
    this.searchCache.set(cacheKey, result);
    return result;
  }

  /**
   * Extract tactics from a hunt object
   *
   * @param {Object} hunt - Hunt object with tactic field
   * @returns {Array<string>} Array of tactic strings
   */
  getHuntTactics(hunt) {
    if (!hunt || !hunt.tactic) {
      return [];
    }
    return hunt.tactic
      .split(',')
      .map(tactic => tactic.trim())
      .filter(Boolean);
  }

  /**
   * Filter hunts based on all active filter criteria
   *
   * @param {string} searchTerm - Text search query (searches across id, title, tactic, notes, tags, submitter)
   * @param {string} selectedCategory - Category filter value (e.g., 'Flames', 'Embers', 'Alchemy')
   * @returns {Array<Object>} Filtered array of hunt objects
   */
  filterHunts(searchTerm = '', selectedCategory = '') {
    const normalizedSearch = searchTerm.toLowerCase();

    return this.huntsData.filter(hunt => {
      return this.matchesSearchCriteria(hunt, normalizedSearch) &&
             this.matchesCategory(hunt, selectedCategory) &&
             this.matchesTactic(hunt) &&
             this.matchesTag(hunt);
    });
  }

  /**
   * Check if a hunt matches the text search criteria
   * Searches across multiple fields: id, title, tactic, notes, tags, and submitter name
   *
   * @param {Object} hunt - Hunt object to check
   * @param {string} searchTerm - Normalized (lowercase) search term
   * @returns {boolean} True if hunt matches search criteria
   */
  matchesSearchCriteria(hunt, searchTerm) {
    if (!searchTerm) {
      return true;
    }

    const searchableContent = [
      hunt.id,
      hunt.title,
      hunt.tactic,
      hunt.notes,
      (hunt.tags || []).join(' '),
      (hunt.submitter && hunt.submitter.name) || ''
    ].join(' ').toLowerCase();

    return searchableContent.includes(searchTerm);
  }

  /**
   * Check if a hunt matches the selected category
   *
   * @param {Object} hunt - Hunt object to check
   * @param {string} category - Category to filter by
   * @returns {boolean} True if hunt matches category (or no category selected)
   */
  matchesCategory(hunt, category) {
    return !category || hunt.category === category;
  }

  /**
   * Check if a hunt matches all selected tactics
   * Uses AND logic - hunt must have ALL selected tactics
   *
   * @param {Object} hunt - Hunt object to check
   * @returns {boolean} True if hunt has all selected tactics (or no tactics selected)
   */
  matchesTactic(hunt) {
    if (!this.selectedTactics.size) {
      return true;
    }
    const huntTactics = this.getHuntTactics(hunt);
    if (!huntTactics.length) {
      return false;
    }
    return [...this.selectedTactics].every(tactic => huntTactics.includes(tactic));
  }

  /**
   * Check if a hunt matches all selected tags
   * Uses AND logic - hunt must have ALL selected tags
   *
   * @param {Object} hunt - Hunt object to check
   * @returns {boolean} True if hunt has all selected tags (or no tags selected)
   */
  matchesTag(hunt) {
    if (!this.selectedTags.size) {
      return true;
    }
    const tags = hunt.tags || [];
    if (!tags.length) {
      return false;
    }
    return [...this.selectedTags].every(tag => tags.includes(tag));
  }

  /**
   * Toggle selection of a tactic filter
   *
   * @param {string} tactic - Tactic to toggle
   * @returns {boolean} New selection state (true if selected, false if deselected)
   */
  toggleTactic(tactic) {
    if (this.selectedTactics.has(tactic)) {
      this.selectedTactics.delete(tactic);
      return false;
    } else {
      this.selectedTactics.add(tactic);
      return true;
    }
  }

  /**
   * Toggle selection of a tag filter
   *
   * @param {string} tag - Tag to toggle
   * @returns {boolean} New selection state (true if selected, false if deselected)
   */
  toggleTag(tag) {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
      return false;
    } else {
      this.selectedTags.add(tag);
      return true;
    }
  }

  /**
   * Clear all tactic selections
   */
  clearTactics() {
    this.selectedTactics.clear();
  }

  /**
   * Clear all tag selections
   */
  clearTags() {
    this.selectedTags.clear();
  }

  /**
   * Clear all filters (tactics and tags)
   */
  clearAllFilters() {
    this.selectedTactics.clear();
    this.selectedTags.clear();
  }

  /**
   * Set tactic selections from an array
   *
   * @param {Array<string>} tactics - Array of tactic strings to select
   */
  setTactics(tactics) {
    this.selectedTactics = new Set(tactics || []);
  }

  /**
   * Set tag selections from an array
   *
   * @param {Array<string>} tags - Array of tag strings to select
   */
  setTags(tags) {
    this.selectedTags = new Set(tags || []);
  }

  /**
   * Get current tactic selections as an array
   *
   * @returns {Array<string>} Array of selected tactics
   */
  getSelectedTactics() {
    return [...this.selectedTactics];
  }

  /**
   * Get current tag selections as an array
   *
   * @returns {Array<string>} Array of selected tags
   */
  getSelectedTags() {
    return [...this.selectedTags];
  }

  /**
   * Check if any filters are currently active
   *
   * @returns {boolean} True if any tactics or tags are selected
   */
  hasActiveFilters() {
    return this.selectedTactics.size > 0 || this.selectedTags.size > 0;
  }

  /**
   * Clear the search cache
   * Call this if the underlying huntsData changes
   */
  clearCache() {
    this.searchCache.clear();
  }
}
