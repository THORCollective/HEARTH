/**
 * HEARTH - Threat Hunting Exchange and Research Threat Hub
 * Main Application Orchestrator
 *
 * This module serves as the main application controller, coordinating between
 * all specialized modules (HuntFilter, HuntRenderer, ModalManager, etc.)
 */

import { HuntFilter } from './js/hunt-filter.js';
import { HuntRenderer } from './js/hunt-renderer.js';
import { ModalManager } from './js/modal-manager.js';
import { NotebookGenerator } from './js/notebook-generator.js';
import { PresetManager } from './js/preset-manager.js';
import { Pagination } from './js/pagination.js';
import { validateElements, debounce, getNow } from './js/utils.js';

/**
 * Main HEARTH Application class
 * Orchestrates all application modules and manages their interactions
 */
class HearthApp {
  constructor() {
    this.huntsData = HUNTS_DATA;
    this.filteredHunts = [...this.huntsData];
    this.sortedHunts = [...this.huntsData];

    this.initializeElements();
    this.initializeModules();
    this.setupEventListeners();
    this.initializeApp();
  }

  /**
   * Initialize and validate required DOM elements
   */
  initializeElements() {
    this.elements = {
      huntsGrid: document.getElementById('huntsGrid'),
      searchInput: document.getElementById('searchInput'),
      clearSearch: document.getElementById('clearSearch'),
      categoryFilter: document.getElementById('categoryFilter'),
      huntCount: document.getElementById('huntCount'),
      resultMeta: document.getElementById('resultMeta'),
      searchFeedback: document.getElementById('searchFeedback'),
      loadingSection: document.getElementById('loading'),
      sortHuntsSelect: document.getElementById('sortHunts'),
      advancedFilters: document.getElementById('advancedFilters'),
      toggleAdvancedFilters: document.getElementById('toggleAdvancedFilters'),
      tacticChips: document.getElementById('tacticChips'),
      tagChips: document.getElementById('tagChips'),
      clearTactics: document.getElementById('clearTactics'),
      clearTags: document.getElementById('clearTags'),
      presetSelect: document.getElementById('presetSelect'),
      savePreset: document.getElementById('savePreset'),
      deletePreset: document.getElementById('deletePreset'),
      pagination: document.getElementById('pagination'),
      prevPage: document.getElementById('prevPage'),
      nextPage: document.getElementById('nextPage'),
      paginationInfo: document.getElementById('paginationInfo'),
      activeFilters: document.getElementById('activeFilters'),
      introTotalHunts: document.getElementById('introTotalHunts'),
      introTotalTactics: document.getElementById('introTotalTactics'),
      introTotalContributors: document.getElementById('introTotalContributors')
    };

    validateElements(this.elements);
  }

  /**
   * Initialize all application modules
   */
  initializeModules() {
    // Initialize filter module
    this.filter = new HuntFilter(this.huntsData);

    // Initialize renderer module with callbacks
    this.renderer = new HuntRenderer(this.huntsData, {
      onCardClick: (index) => this.showHuntDetailsByIndex(index),
      onFilterClear: (filter) => this.clearSingleFilter(filter),
      onChipToggle: (value, type, button) => this.toggleChipSelection(value, type, button)
    });

    // Initialize modal manager with callbacks
    this.modal = new ModalManager(this.huntsData, {
      onNavigate: (index) => this.showHuntDetailsByIndex(index)
    });

    // Initialize notebook generator
    this.notebookGenerator = new NotebookGenerator();

    // Initialize preset manager
    this.presetManager = new PresetManager();
    this.presetManager.initialize();

    // Initialize pagination with callback
    this.pagination = new Pagination({
      onPageChange: () => this.renderCurrentPage()
    });
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Search input with debouncing
    this.elements.searchInput.addEventListener('input', debounce(() => {
      this.filterAndSortHunts();
    }, 300));

    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.filterAndSortHunts();
    });

    // Filter controls
    this.elements.categoryFilter.addEventListener('change', () => this.filterAndSortHunts());
    this.elements.sortHuntsSelect.addEventListener('change', () => this.filterAndSortHunts({ preservePage: true }));

    // Advanced filters toggle
    this.elements.toggleAdvancedFilters.addEventListener('click', () => {
      const isOpen = this.elements.advancedFilters.classList.toggle('is-open');
      this.elements.toggleAdvancedFilters.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Tactic and tag clear buttons
    this.elements.clearTactics.addEventListener('click', () => this.clearFilterGroup('tactic'));
    this.elements.clearTags.addEventListener('click', () => this.clearFilterGroup('tag'));

    // Preset controls using PresetManager's setupEventListeners
    this.presetManager.setupEventListeners(
      (presetId) => this.applyPresetById(presetId),
      () => this.saveCurrentPreset(),
      () => this.deleteCurrentPreset()
    );

    // Pagination controls
    this.elements.prevPage.addEventListener('click', () => this.pagination.prevPage());
    this.elements.nextPage.addEventListener('click', () => this.pagination.nextPage());

    // Window resize for responsive pagination
    window.addEventListener('resize', () => {
      if (this.pagination.updatePageSize()) {
        this.renderCurrentPage();
      }
    });
  }

  /**
   * Initialize the application
   */
  initializeApp() {
    // Initialize dropdowns and chips
    const tactics = this.filter.getUniqueValues('tactic');
    const tags = this.filter.getUniqueValues('tags');

    this.renderer.renderTacticChips(tactics, this.filter.selectedTactics);
    this.renderer.renderTagChips(tags, this.filter.selectedTags);
    this.presetManager.renderPresetOptions();

    // Update intro statistics
    this.renderer.updateIntroStats(this.huntsData, tactics);

    // Set initial advanced filters state
    this.elements.toggleAdvancedFilters.setAttribute('aria-expanded', 'false');

    // Initialize pagination
    this.pagination.initialize(this.huntsData.length);

    // Hide loading, show grid
    this.elements.loadingSection.style.display = 'none';
    this.elements.huntsGrid.style.display = 'grid';

    // Initial render
    this.filterAndSortHunts();
  }

  /**
   * Filter, sort, and render hunts
   * @param {Object} options - Options for filtering
   * @param {boolean} options.preservePage - Whether to preserve current page
   */
  filterAndSortHunts(options = {}) {
    const { preservePage = false } = options;
    const start = getNow();

    // Get filter criteria
    const searchTerm = (this.elements.searchInput.value || '').toLowerCase();
    const selectedCategory = this.elements.categoryFilter.value;

    // Apply filters using HuntFilter module
    this.filteredHunts = this.filter.filterHunts(searchTerm, selectedCategory);

    // Sort hunts
    this.sortedHunts = this.sortHunts(this.filteredHunts);

    // Update modal with new sorted hunts
    this.modal.setSortedHunts(this.sortedHunts);

    // Update pagination
    this.pagination.updateTotalItems(this.sortedHunts.length, { preservePage });

    // Render current page
    this.renderCurrentPage();

    // Update search feedback
    const duration = getNow() - start;
    this.renderer.updateSearchFeedback(
      duration,
      this.filteredHunts.length,
      this.hasActiveFilters()
    );
  }

  /**
   * Render the current page of hunts
   */
  renderCurrentPage() {
    const pageItems = this.pagination.getPageItems(this.sortedHunts);
    const startIndex = this.pagination.getStartIndex();

    // Build state object for renderer
    const state = {
      huntsGrid: this.elements.huntsGrid,
      huntCount: this.elements.huntCount,
      resultMeta: this.elements.resultMeta,
      searchFeedback: this.elements.searchFeedback,
      pagination: this.elements.pagination,
      paginationInfo: this.elements.paginationInfo,
      prevPage: this.elements.prevPage,
      nextPage: this.elements.nextPage,
      activeFilters: this.elements.activeFilters,
      searchInput: this.elements.searchInput,
      categoryFilter: this.elements.categoryFilter,
      selectedTactics: this.filter.selectedTactics,
      selectedTags: this.filter.selectedTags,
      pageItems,
      startIndex,
      totalItems: this.sortedHunts.length,
      totalHunts: this.huntsData.length,
      currentPage: this.pagination.getCurrentPage(),
      totalPages: this.pagination.getTotalPages(),
      isPrevDisabled: this.pagination.isPrevDisabled(),
      isNextDisabled: this.pagination.isNextDisabled()
    };

    // Render hunts
    this.renderer.renderHunts(pageItems, state);

    // Build and update result metadata
    const resultMeta = this.renderer.buildResultMeta(state);
    this.elements.resultMeta.textContent = resultMeta;

    // Update active filters display
    this.renderer.updateActiveFiltersDisplay(state);

    // Update pagination info
    const paginationInfo = this.pagination.formatPageCounter();
    this.elements.paginationInfo.textContent = paginationInfo;

    // Update pagination button states
    this.elements.prevPage.disabled = state.isPrevDisabled;
    this.elements.nextPage.disabled = state.isNextDisabled;
    this.elements.pagination.style.visibility = this.pagination.shouldShowPagination() ? 'visible' : 'hidden';

    // Update hunt count
    const huntCountText = this.pagination.formatPaginationInfo();
    this.elements.huntCount.textContent = huntCountText;
  }

  /**
   * Sort hunts based on current sort selection
   * @param {Array<Object>} hunts - Hunts to sort
   * @returns {Array<Object>} Sorted hunts
   */
  sortHunts(hunts) {
    const sortValue = this.elements.sortHuntsSelect.value;
    const [key, direction = 'asc'] = sortValue.split('-');

    const compareId = (a, b) => {
      const valA = a.id;
      const valB = b.id;
      const letterA = valA.charAt(0);
      const letterB = valB.charAt(0);
      const numA = parseInt(valA.substring(1), 10);
      const numB = parseInt(valB.substring(1), 10);
      if (letterA !== letterB) {
        return direction === 'asc' ? letterA.localeCompare(letterB) : letterB.localeCompare(letterA);
      }
      return direction === 'asc' ? numA - numB : numB - numA;
    };

    const compareTitle = (a, b) => {
      const titleA = (a.title || '').toLowerCase();
      const titleB = (b.title || '').toLowerCase();
      return direction === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    };

    const compareCategory = (a, b) => {
      const categoryA = (a.category || '').toLowerCase();
      const categoryB = (b.category || '').toLowerCase();
      return direction === 'asc' ? categoryA.localeCompare(categoryB) : categoryB.localeCompare(categoryA);
    };

    switch (key) {
    case 'title':
      return [...hunts].sort(compareTitle);
    case 'category':
      return [...hunts].sort(compareCategory);
    case 'id':
    default:
      return [...hunts].sort(compareId);
    }
  }

  /**
   * Check if any filters are active
   * @returns {boolean} True if filters are active
   */
  hasActiveFilters() {
    const searchTerm = (this.elements.searchInput.value || '').trim();
    const category = this.elements.categoryFilter.value;
    return Boolean(
      searchTerm || category || this.filter.hasActiveFilters()
    );
  }

  /**
   * Show hunt details by index
   * @param {number} index - Index of hunt in sortedHunts
   */
  showHuntDetailsByIndex(index) {
    this.modal.showHuntDetailsByIndex(index);
  }

  /**
   * Toggle chip selection (tactic or tag)
   */
  toggleChipSelection(value, type, button) {
    const isSelected = type === 'tactic'
      ? this.filter.toggleTactic(value)
      : this.filter.toggleTag(value);

    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    this.filterAndSortHunts();
  }

  /**
   * Clear a filter group (tactics or tags)
   */
  clearFilterGroup(type) {
    if (type === 'tactic') {
      this.filter.clearTactics();
    } else {
      this.filter.clearTags();
    }

    this.renderer.updateChipSelections(this.filter.selectedTactics, this.filter.selectedTags);
    this.filterAndSortHunts();
  }

  /**
   * Clear a single filter
   */
  clearSingleFilter(filter) {
    if (!filter) return;

    switch (filter.type) {
    case 'search':
      this.elements.searchInput.value = '';
      break;
    case 'category':
      this.elements.categoryFilter.value = '';
      break;
    case 'tactic':
      this.filter.toggleTactic(filter.value);
      break;
    case 'tag':
      this.filter.toggleTag(filter.value);
      break;
    default:
      return;
    }

    this.renderer.updateChipSelections(this.filter.selectedTactics, this.filter.selectedTags);
    this.filterAndSortHunts();
  }

  /**
   * Apply preset by ID
   */
  applyPresetById(presetId) {
    const preset = this.presetManager.applyPreset(presetId, (filters) => {
      this.elements.categoryFilter.value = filters.category || '';
      this.filter.setTactics(filters.tactics || []);
      this.filter.setTags(filters.tags || []);
      this.renderer.updateChipSelections(this.filter.selectedTactics, this.filter.selectedTags);
      this.filterAndSortHunts();
    });
  }

  /**
   * Save current filter state as a preset
   */
  saveCurrentPreset() {
    const filters = {
      category: this.elements.categoryFilter.value || '',
      tactics: this.filter.getSelectedTactics(),
      tags: this.filter.getSelectedTags()
    };

    if (this.presetManager.saveCurrentPreset(filters)) {
      this.presetManager.renderPresetOptions();
    }
  }

  /**
   * Delete currently selected preset
   */
  deleteCurrentPreset() {
    if (this.presetManager.deleteCurrentPreset()) {
      this.presetManager.renderPresetOptions();
    }
  }
}

// Make generateNotebook globally accessible for modal button onclick handlers
window.generateNotebook = async function(huntId) {
  const hunt = HUNTS_DATA.find(h => h.id === huntId);
  if (!hunt) return;

  const modalBody = document.getElementById('modal-body');
  const notebookGenerator = new NotebookGenerator();

  await notebookGenerator.generateNotebook(
    huntId,
    HUNTS_DATA,
    modalBody,
    (id) => window.generateNotebook(id),
    (id) => window.generateNotebook(id)
  );
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.hearthApp = new HearthApp();
});
