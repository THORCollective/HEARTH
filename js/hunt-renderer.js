/**
 * HuntRenderer - Handles all rendering and display logic for hunts
 *
 * Responsibilities:
 * - Rendering hunt cards in the grid
 * - Building HTML for hunt details
 * - Managing filter chips and dropdowns
 * - Displaying statistics and metadata
 * - Formatting and presenting hunt information
 *
 * @class HuntRenderer
 */
export class HuntRenderer {
  /**
   * Create a HuntRenderer instance
   *
   * @param {Object} elements - DOM element references
   * @param {Object} config - Configuration object
   * @param {Array} config.tacticGroupConfig - Tactic grouping configuration
   * @param {Function} config.onCardClick - Callback when a hunt card is clicked
   * @param {Function} config.onFilterClear - Callback when a filter is cleared
   * @param {Function} config.onChipToggle - Callback when a chip is toggled
   */
  constructor(elements, config = {}) {
    this.elements = elements;
    this.tacticGroupConfig = config.tacticGroupConfig || [];
    this.onCardClick = config.onCardClick || (() => {});
    this.onFilterClear = config.onFilterClear || (() => {});
    this.onChipToggle = config.onChipToggle || (() => {});
    this.numberFormatter = new Intl.NumberFormat('en-US');
  }

  /**
   * Render hunts in the grid with pagination
   *
   * @param {Array} hunts - Filtered and sorted hunt data
   * @param {Object} state - Current application state
   * @param {number} state.currentPage - Current page number
   * @param {number} state.pageSize - Number of items per page
   * @param {number} state.totalHunts - Total number of hunts in database
   * @param {Set} state.selectedTactics - Currently selected tactics
   * @param {Set} state.selectedTags - Currently selected tags
   * @param {string} state.searchTerm - Current search term
   * @param {string} state.category - Selected category filter
   * @returns {number} New current page (adjusted if necessary)
   */
  renderHunts(hunts, state) {
    const { huntsGrid, huntCount, paginationInfo, pagination, resultMeta } = this.elements;
    const total = hunts.length;
    const totalPages = Math.max(1, Math.ceil((total || 1) / state.pageSize));

    // Adjust current page if it exceeds total pages
    let currentPage = state.currentPage;
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = total === 0 ? 0 : (currentPage - 1) * state.pageSize;
    const pageItems = total === 0 ? [] : hunts.slice(startIndex, startIndex + state.pageSize);

    huntsGrid.innerHTML = '';

    if (!pageItems.length) {
      huntsGrid.innerHTML = `
        <div class="no-results">
          <h3>No hunts found</h3>
          <p>Try refining your search terms or clearing filters.</p>
        </div>
      `;
    } else {
      pageItems.forEach((hunt, offset) => {
        const globalIndex = startIndex + offset;
        huntsGrid.appendChild(this.createHuntCard(hunt, globalIndex));
      });
    }

    const startDisplay = total === 0 ? 0 : startIndex + 1;
    const endDisplay = total === 0 ? 0 : startIndex + pageItems.length;
    huntCount.textContent = `Showing ${startDisplay}-${endDisplay} of ${total} hunt${total === 1 ? '' : 's'}`;
    resultMeta.textContent = this.buildResultMeta(state);

    if (total === 0) {
      pagination.style.visibility = 'hidden';
    } else {
      pagination.style.visibility = totalPages > 1 ? 'visible' : 'hidden';
    }

    paginationInfo.textContent = total ? `Page ${currentPage} of ${totalPages}` : 'No results';
    this.elements.prevPage.disabled = currentPage <= 1;
    this.elements.nextPage.disabled = currentPage >= totalPages;

    this.updateActiveFiltersDisplay(state);

    return currentPage;
  }

  /**
   * Build result metadata string showing active filters
   *
   * @param {Object} state - Current application state
   * @returns {string} Formatted metadata string
   */
  buildResultMeta(state) {
    const filters = [];
    const { searchTerm, category, selectedTactics, selectedTags, totalHunts } = state;

    if (searchTerm && searchTerm.trim()) {
      filters.push(`Search: "${searchTerm.trim()}"`);
    }

    if (category) {
      filters.push(`Category: ${category}`);
    }

    if (selectedTactics.size) {
      filters.push(`${selectedTactics.size} tactic${selectedTactics.size > 1 ? 's' : ''}`);
    }

    if (selectedTags.size) {
      filters.push(`${selectedTags.size} tag${selectedTags.size > 1 ? 's' : ''}`);
    }

    const base = `${totalHunts} hunts cataloged`;
    return filters.length ? `${filters.join(' • ')} • ${base}` : `All hunts • ${base}`;
  }

  /**
   * Update the active filters display section
   *
   * @param {Object} state - Current application state
   */
  updateActiveFiltersDisplay(state) {
    const { activeFilters } = this.elements;
    if (!activeFilters) {
      return;
    }

    const { searchTerm, category, selectedTactics, selectedTags } = state;
    const filters = [];

    if (searchTerm && searchTerm.trim()) {
      filters.push({ type: 'search', value: searchTerm.trim(), label: `Search "${searchTerm.trim()}"` });
    }

    if (category) {
      filters.push({ type: 'category', value: category, label: `Category: ${category}` });
    }

    [...selectedTactics]
      .sort((a, b) => a.localeCompare(b))
      .forEach(tactic => {
        filters.push({ type: 'tactic', value: tactic, label: `Tactic: ${tactic}` });
      });

    [...selectedTags]
      .sort((a, b) => a.localeCompare(b))
      .forEach(tag => {
        filters.push({ type: 'tag', value: tag, label: `Tag: #${tag}` });
      });

    activeFilters.innerHTML = '';

    if (!filters.length) {
      const emptyState = document.createElement('span');
      emptyState.className = 'active-filters__empty';
      emptyState.textContent = 'No filters active — explore the full library.';
      activeFilters.appendChild(emptyState);
      return;
    }

    filters.forEach(filter => {
      const button = document.createElement('button');
      button.className = 'active-filter-chip';
      button.type = 'button';
      button.setAttribute('data-type', filter.type);
      button.setAttribute('data-value', filter.value);

      const labelSpan = document.createElement('span');
      labelSpan.textContent = filter.label;

      const removeSpan = document.createElement('span');
      removeSpan.setAttribute('aria-hidden', 'true');
      removeSpan.textContent = '✕';

      button.append(labelSpan, removeSpan);
      button.addEventListener('click', () => this.onFilterClear(filter));
      activeFilters.appendChild(button);
    });
  }

  /**
   * Update search feedback display
   *
   * @param {number} duration - Search duration in milliseconds
   * @param {number} totalMatches - Number of matches found
   * @param {boolean} hasActiveFilters - Whether any filters are active
   */
  updateSearchFeedback(duration, totalMatches, hasActiveFilters) {
    const { searchFeedback } = this.elements;
    if (!searchFeedback) {
      return;
    }

    if (typeof duration !== 'number' || Number.isNaN(duration)) {
      searchFeedback.textContent = '';
      return;
    }

    const displayDuration = duration < 1 ? '<1ms' : `${Math.round(duration)}ms`;

    if (!totalMatches) {
      searchFeedback.textContent = `No hunts matched • ${displayDuration}`;
      return;
    }

    if (!hasActiveFilters) {
      searchFeedback.textContent = `All hunts • ${displayDuration}`;
      return;
    }

    const matchesLabel = totalMatches === 1 ? 'hunt' : 'hunts';
    searchFeedback.textContent = `Matched ${this.formatNumber(totalMatches)} ${matchesLabel} • ${displayDuration}`;
  }

  /**
   * Format a number using locale-specific formatting
   *
   * @param {number} value - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(value) {
    return this.numberFormatter.format(typeof value === 'number' ? value : 0);
  }

  /**
   * Create a hunt card element
   *
   * @param {Object} hunt - Hunt data object
   * @param {number} index - Index in the sorted hunts array
   * @returns {HTMLElement} Hunt card element
   */
  createHuntCard(hunt, index) {
    const card = document.createElement('article');
    card.className = 'hunt-card';
    card.dataset.index = index;
    card.setAttribute('tabindex', '0');

    const header = document.createElement('div');
    header.className = 'hunt-header';
    header.innerHTML = `
      <span class="hunt-id">${hunt.id}</span>
      <span class="hunt-category">${hunt.category || 'Uncategorized'}</span>
    `;
    card.appendChild(header);

    const title = document.createElement('h3');
    title.className = 'hunt-title';
    title.textContent = hunt.title || hunt.notes || 'Untitled hunt';
    card.appendChild(title);

    const tactics = this.getHuntTactics(hunt);
    if (tactics.length) {
      const tactic = document.createElement('div');
      tactic.className = 'hunt-tactic';
      tactic.textContent = tactics.join(' • ');
      card.appendChild(tactic);
    }

    if (hunt.tags && hunt.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'hunt-tags';
      hunt.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'hunt-tag';
        tagEl.textContent = `#${tag}`;
        tags.appendChild(tagEl);
      });
      card.appendChild(tags);
    }

    if (hunt.submitter && hunt.submitter.name) {
      const submitter = document.createElement('div');
      submitter.className = 'hunt-submitter';
      const submitterName = hunt.submitter.link
        ? `<a href="${hunt.submitter.link}" target="_blank" rel="noopener">${hunt.submitter.name}</a>`
        : `<strong>${hunt.submitter.name}</strong>`;
      submitter.innerHTML = `Authored by ${submitterName}`;
      card.appendChild(submitter);
    }

    const previewToggle = document.createElement('button');
    previewToggle.className = 'preview-toggle';
    previewToggle.type = 'button';
    previewToggle.setAttribute('aria-expanded', 'false');
    previewToggle.innerHTML = 'Quick preview <span aria-hidden="true">▼</span>';

    const preview = document.createElement('div');
    preview.className = 'hunt-preview';
    preview.innerHTML = `
      <p class="preview-title">Snapshot</p>
      <p class="preview-body">${this.buildPreviewSnippet(hunt)}</p>
      <div class="preview-links">${this.buildPreviewMeta(hunt)}</div>
    `;

    previewToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isExpanded = card.classList.toggle('is-expanded');
      previewToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      previewToggle.innerHTML = isExpanded
        ? 'Hide preview <span aria-hidden="true">▲</span>'
        : 'Quick preview <span aria-hidden="true">▼</span>';
    });

    card.appendChild(previewToggle);
    card.appendChild(preview);

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.innerHTML = `
      <span class="hint">🗂️ View full hunt brief</span>
      <span>${tactics.length ? tactics[0] : ''}</span>
    `;
    card.appendChild(footer);

    card.addEventListener('click', () => this.onCardClick(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.onCardClick(index);
      }
    });

    return card;
  }

  /**
   * Extract tactics from a hunt object
   *
   * @param {Object} hunt - Hunt data object
   * @returns {Array<string>} Array of tactic names
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
   * Build preview snippet text for a hunt card
   *
   * @param {Object} hunt - Hunt data object
   * @returns {string} Preview snippet text (truncated if needed)
   */
  buildPreviewSnippet(hunt) {
    const source = hunt.why || hunt.notes || '';
    if (!source) {
      return 'No summary has been added to this hunt yet.';
    }

    const sanitized = source
      .replace(/\r\n/g, '\n')
      .replace(/\n+/g, ' ')
      .replace(/\*\*/g, '')
      .replace(/[-•]\s*/g, '')
      .trim();

    if (sanitized.length <= 240) {
      return sanitized;
    }
    return `${sanitized.slice(0, 240).trim()}…`;
  }

  /**
   * Build preview metadata for a hunt card
   *
   * @param {Object} hunt - Hunt data object
   * @returns {string} Formatted metadata string
   */
  buildPreviewMeta(hunt) {
    const meta = [];
    if (hunt.why) {
      meta.push('Why notes');
    }
    if (hunt.references) {
      const references = hunt.references.split('\n').filter(Boolean);
      if (references.length) {
        meta.push(`${references.length} reference${references.length === 1 ? '' : 's'}`);
      }
    }
    if (hunt.tags && hunt.tags.length) {
      meta.push(`${hunt.tags.length} tag${hunt.tags.length === 1 ? '' : 's'}`);
    }
    return meta.length ? meta.join(' • ') : 'No extended details yet';
  }

  /**
   * Render tactic filter chips grouped by category
   *
   * @param {Array<string>} tactics - All available tactics
   * @param {Set} selectedTactics - Currently selected tactics
   */
  renderTacticChips(tactics, selectedTactics) {
    const container = this.elements.tacticChips;
    container.innerHTML = '';

    const groups = this.groupTactics(tactics);
    groups.forEach((values, label) => {
      const cluster = document.createElement('div');
      cluster.className = 'chip-group__cluster';
      const heading = document.createElement('span');
      heading.className = 'chip-group__title';
      heading.textContent = label;
      const chipsWrapper = document.createElement('div');
      chipsWrapper.className = 'cluster-chips';

      values.forEach(value => {
        chipsWrapper.appendChild(this.createChip(value, 'tactic', selectedTactics.has(value)));
      });

      cluster.appendChild(heading);
      cluster.appendChild(chipsWrapper);
      container.appendChild(cluster);
    });
  }

  /**
   * Render tag filter chips
   *
   * @param {Array<string>} tags - All available tags
   * @param {Set} selectedTags - Currently selected tags
   */
  renderTagChips(tags, selectedTags) {
    const container = this.elements.tagChips;
    container.innerHTML = '';
    tags.forEach(tag => {
      container.appendChild(this.createChip(tag, 'tag', selectedTags.has(tag)));
    });
  }

  /**
   * Create a filter chip element
   *
   * @param {string} value - Chip value
   * @param {string} type - Chip type ('tactic' or 'tag')
   * @param {boolean} isSelected - Whether chip is currently selected
   * @returns {HTMLElement} Chip button element
   */
  createChip(value, type, isSelected = false) {
    const button = document.createElement('button');
    button.className = 'chip';
    button.type = 'button';
    button.textContent = value;
    button.setAttribute('data-value', value);
    button.setAttribute('data-type', type);
    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

    if (isSelected) {
      button.classList.add('is-selected');
    }

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      this.onChipToggle(value, type, button);
    });

    return button;
  }

  /**
   * Group tactics by category based on configuration
   *
   * @param {Array<string>} tactics - All tactics to group
   * @returns {Map<string, Array<string>>} Map of group labels to tactic arrays
   */
  groupTactics(tactics) {
    const groups = new Map();
    const defaultLabel = 'Additional tactics';

    tactics.forEach(tactic => {
      const label = this.resolveTacticGroup(tactic) || defaultLabel;
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label).push(tactic);
    });

    groups.forEach(values => values.sort((a, b) => a.localeCompare(b)));

    return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }

  /**
   * Resolve which group a tactic belongs to
   *
   * @param {string} tactic - Tactic name
   * @returns {string} Group label
   */
  resolveTacticGroup(tactic) {
    const normalized = (tactic || '').toLowerCase();
    const entry = this.tacticGroupConfig.find(group =>
      group.keywords.some(keyword => normalized.includes(keyword))
    );
    return entry ? entry.label : 'Additional tactics';
  }

  /**
   * Update chip selections based on current state
   *
   * @param {Set} selectedTactics - Currently selected tactics
   * @param {Set} selectedTags - Currently selected tags
   */
  updateChipSelections(selectedTactics, selectedTags) {
    this.elements.tacticChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = selectedTactics.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    this.elements.tagChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = selectedTags.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  /**
   * Update introduction statistics
   *
   * @param {Array} huntsData - All hunt data
   * @param {Array<string>} tactics - All unique tactics
   */
  updateIntroStats(huntsData, tactics) {
    const {
      introTotalHunts,
      introTotalTactics,
      introTotalContributors
    } = this.elements;

    if (!introTotalHunts || !introTotalTactics || !introTotalContributors) {
      return;
    }

    introTotalHunts.textContent = this.formatNumber(huntsData.length);
    introTotalTactics.textContent = this.formatNumber(tactics.length);

    const contributors = new Set();
    huntsData.forEach(hunt => {
      const name = hunt.submitter && hunt.submitter.name;
      if (name) {
        contributors.add(name.trim());
      }
    });

    introTotalContributors.textContent = this.formatNumber(contributors.size);
  }
}
