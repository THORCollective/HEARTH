/**
 * Pagination Module
 *
 * Handles pagination logic for the HEARTH hunt database.
 * Provides page navigation, items per page calculation, and responsive page size updates.
 *
 * @module Pagination
 */

/**
 * Pagination class for managing paginated hunt results
 *
 * @class Pagination
 * @example
 * const pagination = new Pagination({
 *   onPageChange: (pageNumber) => { renderHunts(pageNumber); }
 * });
 * pagination.initialize(hunts.length);
 */
export class Pagination {
  /**
   * Creates a new Pagination instance
   *
   * @param {Object} options - Configuration options
   * @param {Function} options.onPageChange - Callback when page changes (pageNumber) => void
   */
  constructor(options = {}) {
    this.onPageChange = options.onPageChange || (() => {});

    this.currentPage = 1;
    this.pageSize = 9;
    this.totalItems = 0;

    // Calculate initial page size based on viewport
    this.updatePageSize();

    // Setup resize listener
    this.setupResizeListener();
  }

  /**
   * Updates page size based on current viewport width
   * Uses responsive breakpoints to determine optimal items per page
   *
   * @returns {boolean} True if page size changed, false otherwise
   */
  updatePageSize() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const previousPageSize = this.pageSize;

    if (width < 640) {
      this.pageSize = 6;  // Mobile: 6 items (2 columns x 3 rows)
    } else if (width < 1024) {
      this.pageSize = 8;  // Tablet: 8 items (2 columns x 4 rows)
    } else {
      this.pageSize = 9;  // Desktop: 9 items (3 columns x 3 rows)
    }

    return previousPageSize !== this.pageSize;
  }

  /**
   * Sets up window resize listener to handle responsive page size updates
   *
   * @private
   */
  setupResizeListener() {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('resize', () => {
      const pageSizeChanged = this.updatePageSize();
      if (pageSizeChanged) {
        // Recalculate current page to maintain position when page size changes
        this.onPageChange(this.currentPage);
      }
    });
  }

  /**
   * Initializes pagination with total item count
   *
   * @param {number} totalItems - Total number of items to paginate
   */
  initialize(totalItems) {
    this.totalItems = totalItems;
    this.currentPage = 1;
  }

  /**
   * Updates the total item count (e.g., after filtering)
   *
   * @param {number} totalItems - New total number of items
   * @param {Object} options - Update options
   * @param {boolean} options.preservePage - If true, maintain current page if valid
   */
  updateTotalItems(totalItems, options = {}) {
    const { preservePage = false } = options;
    this.totalItems = totalItems;

    if (!preservePage) {
      this.currentPage = 1;
    } else {
      // Ensure current page is still valid
      const totalPages = this.getTotalPages();
      if (this.currentPage > totalPages) {
        this.currentPage = Math.max(1, totalPages);
      }
    }
  }

  /**
   * Gets the total number of pages
   *
   * @returns {number} Total number of pages (minimum 1)
   */
  getTotalPages() {
    return Math.max(1, Math.ceil((this.totalItems || 1) / this.pageSize));
  }

  /**
   * Changes to a specific page number
   *
   * @param {number} pageNumber - The page number to navigate to (1-indexed)
   * @returns {boolean} True if page changed, false if invalid or same page
   */
  changePage(pageNumber) {
    const totalPages = this.getTotalPages();
    const targetPage = Math.min(Math.max(1, pageNumber), totalPages);

    if (targetPage === this.currentPage) {
      return false;
    }

    this.currentPage = targetPage;
    this.onPageChange(this.currentPage);
    return true;
  }

  /**
   * Navigates to the next page
   *
   * @returns {boolean} True if page changed, false if already on last page
   */
  nextPage() {
    return this.changePage(this.currentPage + 1);
  }

  /**
   * Navigates to the previous page
   *
   * @returns {boolean} True if page changed, false if already on first page
   */
  prevPage() {
    return this.changePage(this.currentPage - 1);
  }

  /**
   * Gets the current page number
   *
   * @returns {number} Current page number (1-indexed)
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Gets the current page size
   *
   * @returns {number} Number of items per page
   */
  getPageSize() {
    return this.pageSize;
  }

  /**
   * Gets the start index for the current page (0-indexed)
   *
   * @returns {number} Start index for current page
   */
  getStartIndex() {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize;
  }

  /**
   * Gets the end index for the current page (exclusive, 0-indexed)
   *
   * @returns {number} End index for current page
   */
  getEndIndex() {
    if (this.totalItems === 0) {
      return 0;
    }
    return this.getStartIndex() + this.pageSize;
  }

  /**
   * Gets a slice of items for the current page
   *
   * @param {Array} items - Array of items to paginate
   * @returns {Array} Slice of items for current page
   */
  getPageItems(items) {
    if (!items || items.length === 0) {
      return [];
    }

    const startIndex = this.getStartIndex();
    const endIndex = this.getEndIndex();
    return items.slice(startIndex, endIndex);
  }

  /**
   * Checks if pagination should be visible
   * Pagination is hidden when there are no results or only one page
   *
   * @returns {boolean} True if pagination controls should be visible
   */
  shouldShowPagination() {
    return this.totalItems > 0 && this.getTotalPages() > 1;
  }

  /**
   * Checks if the previous page button should be disabled
   *
   * @returns {boolean} True if on first page
   */
  isPrevDisabled() {
    return this.currentPage <= 1;
  }

  /**
   * Checks if the next page button should be disabled
   *
   * @returns {boolean} True if on last page
   */
  isNextDisabled() {
    return this.currentPage >= this.getTotalPages();
  }

  /**
   * Gets pagination info for display
   *
   * @returns {Object} Pagination information
   * @property {number} startDisplay - Display number for first item on page (1-indexed)
   * @property {number} endDisplay - Display number for last item on page (1-indexed)
   * @property {number} total - Total number of items
   * @property {number} currentPage - Current page number
   * @property {number} totalPages - Total number of pages
   */
  getPaginationInfo() {
    const totalPages = this.getTotalPages();
    const startIndex = this.getStartIndex();

    // Calculate display numbers (1-indexed for user display)
    const startDisplay = this.totalItems === 0 ? 0 : startIndex + 1;
    const pageItemCount = Math.min(this.pageSize, this.totalItems - startIndex);
    const endDisplay = this.totalItems === 0 ? 0 : startIndex + pageItemCount;

    return {
      startDisplay,
      endDisplay,
      total: this.totalItems,
      currentPage: this.currentPage,
      totalPages
    };
  }

  /**
   * Formats pagination info as a readable string
   *
   * @returns {string} Formatted pagination info (e.g., "Showing 1-9 of 42 hunts")
   */
  formatPaginationInfo() {
    const info = this.getPaginationInfo();

    if (info.total === 0) {
      return 'No results';
    }

    const itemLabel = info.total === 1 ? 'hunt' : 'hunts';
    return `Showing ${info.startDisplay}-${info.endDisplay} of ${info.total} ${itemLabel}`;
  }

  /**
   * Formats page counter string
   *
   * @returns {string} Page counter (e.g., "Page 1 of 5" or "No results")
   */
  formatPageCounter() {
    const totalPages = this.getTotalPages();

    if (this.totalItems === 0) {
      return 'No results';
    }

    return `Page ${this.currentPage} of ${totalPages}`;
  }

  /**
   * Resets pagination to initial state
   */
  reset() {
    this.currentPage = 1;
    this.totalItems = 0;
  }
}

export default Pagination;
