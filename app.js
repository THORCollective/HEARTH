// HEARTH Hunt Database Webfront
// Requires: hunts-data.js (defines HUNTS_DATA)

// Enhanced HEARTH Application with Performance Optimizations
class HearthApp {
  constructor() {
    this.huntsData = HUNTS_DATA;
    this.filteredHunts = [...this.huntsData];
    this.searchCache = new Map();
    this.renderCache = new Map();
    this.debounceTimer = null;
    this.selectedTactics = new Set();
    this.selectedTags = new Set();
    this.currentPage = 1;
    this.pageSize = 9;
    this.totalHunts = this.huntsData.length;
    this.sortedHunts = [...this.huntsData];
    this.presets = new Map();
    this.presetStorageKey = 'hearth.presets.v1';
    this.defaultPresets = [
      {
        id: 'baseline-core',
        label: 'Baseline sweeps',
        filters: { tags: ['baseline'] },
        builtIn: true
      },
      {
        id: 'exfil-watch',
        label: 'Exfil & C2 watchlist',
        filters: { tactics: ['Command and Control', 'Exfiltration'] },
        builtIn: true
      }
    ];
    this.tacticGroupConfig = [
      { label: 'Recon & Prep', keywords: ['reconnaissance', 'resource development'] },
      { label: 'Initial Access', keywords: ['initial access'] },
      { label: 'Execution', keywords: ['execution'] },
      { label: 'Persistence', keywords: ['persistence'] },
      { label: 'Privilege Escalation', keywords: ['privilege escalation'] },
      { label: 'Defense Evasion', keywords: ['defense evasion'] },
      { label: 'Credential Access', keywords: ['credential access'] },
      { label: 'Discovery', keywords: ['discovery'] },
      { label: 'Lateral Movement', keywords: ['lateral movement'] },
      { label: 'Collection', keywords: ['collection'] },
      { label: 'Command & Control', keywords: ['command and control'] },
      { label: 'Exfiltration & Impact', keywords: ['exfiltration', 'impact'] },
      { label: 'Additional tactics', keywords: [] }
    ];
    this.currentModalIndex = 0;
    this.numberFormatter = new Intl.NumberFormat('en-US');

    this.updatePageSize();

    this.initializeElements();
    this.setupEventListeners();
    this.initializeApp();
  }
  
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

    // Validate required elements
    const missingElements = Object.entries(this.elements)
      .filter(([name, element]) => !element)
      .map(([name]) => name);
    
    if (missingElements.length > 0) {
      console.error('Missing required elements:', missingElements);
      throw new Error(`Required DOM elements not found: ${missingElements.join(', ')}`);
    }

  }

  updatePageSize() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    if (width < 640) {
      this.pageSize = 6;
    } else if (width < 1024) {
      this.pageSize = 8;
    } else {
      this.pageSize = 9;
    }
  }
  
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close" aria-label="Close">&times;</button>
        <div class="modal-toolbar">
          <button class="modal-nav-btn" data-direction="prev" aria-label="Previous hunt">◀</button>
          <span class="modal-counter" id="modalCounter"></span>
          <button class="modal-nav-btn" data-direction="next" aria-label="Next hunt">▶</button>
        </div>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close');
    const modalBody = document.getElementById('modal-body');
    const modalCounter = document.getElementById('modalCounter');
    const [prevBtn, nextBtn] = modal.querySelectorAll('.modal-nav-btn');

    // Enhanced modal controls
    const closeModal = () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          this.navigateModal(-1);
        } else if (e.key === 'ArrowRight') {
          this.navigateModal(1);
        }
      }
    });

    prevBtn.addEventListener('click', () => this.navigateModal(-1));
    nextBtn.addEventListener('click', () => this.navigateModal(1));

    this.modal = modal;
    this.modalBody = modalBody;
    this.modalCounter = modalCounter;
    this.modalPrevButton = prevBtn;
    this.modalNextButton = nextBtn;
  }

  // Helper: Get unique values for dropdowns
  getUniqueValues(fieldName) {
    // Use cache for expensive operations
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
              if (tactic) uniqueValues.add(tactic);
            });
          }
          break;
        default:
          if (hunt[fieldName]) uniqueValues.add(hunt[fieldName]);
      }
    });
    
    const result = Array.from(uniqueValues).filter(Boolean).sort();
    this.searchCache.set(cacheKey, result);
    return result;
  }

  // Initialize dropdowns
  initializeDropdowns() {
    this.renderTacticChips();
    this.renderTagChips();
    this.initializePresets();
  }

  renderTacticChips() {
    const tactics = this.getUniqueValues('tactic');
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
        chipsWrapper.appendChild(this.createChip(value, 'tactic'));
      });

      cluster.appendChild(heading);
      cluster.appendChild(chipsWrapper);
      container.appendChild(cluster);
    });
  }

  renderTagChips() {
    const tags = this.getUniqueValues('tags');
    const container = this.elements.tagChips;
    container.innerHTML = '';
    tags.forEach(tag => {
      container.appendChild(this.createChip(tag, 'tag'));
    });
  }

  updateIntroStats() {
    const {
      introTotalHunts,
      introTotalTactics,
      introTotalContributors
    } = this.elements;

    if (!introTotalHunts || !introTotalTactics || !introTotalContributors) {
      return;
    }

    introTotalHunts.textContent = this.formatNumber(this.huntsData.length);
    introTotalTactics.textContent = this.formatNumber(this.getUniqueValues('tactic').length);

    const contributors = new Set();
    this.huntsData.forEach(hunt => {
      const name = hunt.submitter && hunt.submitter.name;
      if (name) {
        contributors.add(name.trim());
      }
    });

    introTotalContributors.textContent = this.formatNumber(contributors.size);
  }

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

  resolveTacticGroup(tactic) {
    const normalized = (tactic || '').toLowerCase();
    const entry = this.tacticGroupConfig.find(group =>
      group.keywords.some(keyword => normalized.includes(keyword))
    );
    return entry ? entry.label : 'Additional tactics';
  }

  createChip(value, type) {
    const button = document.createElement('button');
    button.className = 'chip';
    button.type = 'button';
    button.textContent = value;
    button.setAttribute('data-value', value);
    button.setAttribute('data-type', type);
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggleChipSelection(value, type, button);
    });

    return button;
  }

  toggleChipSelection(value, type, button) {
    const targetSet = type === 'tactic' ? this.selectedTactics : this.selectedTags;
    if (targetSet.has(value)) {
      targetSet.delete(value);
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    } else {
      targetSet.add(value);
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    }
    this.filterAndSortHunts();
  }

  clearFilterGroup(type) {
    const targetSet = type === 'tactic' ? this.selectedTactics : this.selectedTags;
    targetSet.clear();
    const container = type === 'tactic' ? this.elements.tacticChips : this.elements.tagChips;
    container.querySelectorAll('.chip').forEach(chip => {
      chip.classList.remove('is-selected');
      chip.setAttribute('aria-pressed', 'false');
    });
    this.filterAndSortHunts();
  }

  initializePresets() {
    this.presets.clear();
    this.defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });

    const storedPresets = this.loadStoredPresets();
    storedPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });

    this.renderPresetOptions();
  }

  loadStoredPresets() {
    try {
      const raw = window.localStorage.getItem(this.presetStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to load filter presets:', error);
      return [];
    }
  }

  persistPresets() {
    try {
      const customPresets = [...this.presets.values()].filter(preset => !preset.builtIn);
      window.localStorage.setItem(this.presetStorageKey, JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Unable to persist filter presets:', error);
    }
  }

  renderPresetOptions() {
    const select = this.elements.presetSelect;
    const options = ['<option value="">Select a preset...</option>'];
    [...this.presets.values()]
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach(preset => {
        const attrs = preset.builtIn ? ' data-built-in="true"' : '';
        options.push(`<option value="${preset.id}"${attrs}>${preset.label}</option>`);
      });
    select.innerHTML = options.join('');
  }

  applyPreset(presetId) {
    const preset = this.presets.get(presetId);
    if (!preset) return;

    const { filters = {} } = preset;
    this.elements.categoryFilter.value = filters.category || '';
    this.selectedTactics = new Set(filters.tactics || []);
    this.selectedTags = new Set(filters.tags || []);

    this.updateChipSelections();
    this.filterAndSortHunts();
  }

  updateChipSelections() {
    this.elements.tacticChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = this.selectedTactics.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    this.elements.tagChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = this.selectedTags.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  saveCurrentPreset() {
    const rawLabel = window.prompt('Name this saved view');
    const label = rawLabel ? rawLabel.trim() : '';
    if (!label) return;

    const id = `user-${Date.now()}`;
    const preset = {
      id,
      label,
      filters: {
        category: this.elements.categoryFilter.value || '',
        tactics: [...this.selectedTactics],
        tags: [...this.selectedTags]
      },
      builtIn: false
    };

    this.presets.set(id, preset);
    this.persistPresets();
    this.renderPresetOptions();
    this.elements.presetSelect.value = id;
  }

  deleteCurrentPreset() {
    const { presetSelect } = this.elements;
    const presetId = presetSelect.value;
    if (!presetId) return;

    const preset = this.presets.get(presetId);
    if (!preset || preset.builtIn) {
      alert('Built-in presets cannot be deleted.');
      return;
    }

    this.presets.delete(presetId);
    this.persistPresets();
    this.renderPresetOptions();
    presetSelect.value = '';
  }

  // Show hunt details in modal
  showHuntDetailsByIndex(index) {
    const hunt = this.sortedHunts[index];
    if (!hunt) return;
    this.currentModalIndex = index;
    this.showHuntDetails(hunt);
  }

  showHuntDetails(hunt) {
    const modalContent = this.buildHuntDetailContent(hunt);
    this.modalBody.innerHTML = modalContent;
    this.modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    this.updateModalNavigation();
  }

  // Build hunt detail content
  buildHuntDetailContent(hunt) {
    const header = this.buildHuntHeader(hunt);
    const sections = this.buildHuntSections(hunt);
    const footer = this.buildHuntFooter(hunt);
    return header + sections + footer;
  }

  // Build hunt header
  buildHuntHeader(hunt) {
    return `
      <div class="hunt-detail-header">
        <div class="hunt-detail-id">${hunt.id}</div>
        <div class="hunt-detail-category">${hunt.category}</div>
      </div>
      <h2 class="hunt-detail-title">${hunt.title}</h2>
    `;
  }

  // Build hunt sections
  buildHuntSections(hunt) {
    let sections = '';
    
    if (hunt.tactic) {
      sections += `<div class="hunt-detail-tactic"><strong>Tactic:</strong> ${hunt.tactic}</div>`;
    }
    
    if (hunt.notes) {
      sections += `<div class="hunt-detail-notes"><strong>Notes:</strong> ${hunt.notes}</div>`;
    }
    
    if (hunt.tags && hunt.tags.length) {
      const tagElements = hunt.tags.map(tag => `<span class="hunt-tag">#${tag}</span>`).join('');
      sections += `<div class="hunt-detail-tags"><strong>Tags:</strong> ${tagElements}</div>`;
    }
    
    if (hunt.submitter && hunt.submitter.name) {
      const submitterLink = hunt.submitter.link ? 
        `<a href="${hunt.submitter.link}" target="_blank">${hunt.submitter.name}</a>` : 
        hunt.submitter.name;
      sections += `<div class="hunt-detail-submitter"><strong>Submitter:</strong> ${submitterLink}</div>`;
    }
    
    if (hunt.why) {
      sections += `<div class="hunt-detail-why"><h3>Why</h3><div class="hunt-detail-content">${hunt.why.replace(/\n/g, '<br>')}</div></div>`;
    }
    
    if (hunt.references) {
      sections += `<div class="hunt-detail-references"><h3>References</h3><div class="hunt-detail-content">${hunt.references.replace(/\n/g, '<br>')}</div></div>`;
    }
    
    return sections;
  }

  // Build hunt footer
  buildHuntFooter(hunt) {
    return `
      <div class="hunt-detail-footer">
        <a href="https://github.com/THORCollective/HEARTH/blob/main/${hunt.file_path}" target="_blank" class="btn">
          View Source
        </a>
        <button class="btn btn-primary" onclick="generateNotebook('${hunt.id}')">
          Generate Notebook
        </button>
      </div>
    `;
  }

  // Render hunts
  renderHunts(hunts) {
    const { huntsGrid, huntCount, paginationInfo, pagination, resultMeta } = this.elements;
    const total = hunts.length;
    const totalPages = Math.max(1, Math.ceil((total || 1) / this.pageSize));

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIndex = total === 0 ? 0 : (this.currentPage - 1) * this.pageSize;
    const pageItems = total === 0 ? [] : hunts.slice(startIndex, startIndex + this.pageSize);

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
    resultMeta.textContent = this.buildResultMeta();

    if (total === 0) {
      pagination.style.visibility = 'hidden';
    } else {
      pagination.style.visibility = totalPages > 1 ? 'visible' : 'hidden';
    }

    paginationInfo.textContent = total ? `Page ${this.currentPage} of ${totalPages}` : 'No results';
    this.elements.prevPage.disabled = this.currentPage <= 1;
    this.elements.nextPage.disabled = this.currentPage >= totalPages;
    this.updateActiveFiltersDisplay();
  }

  buildResultMeta() {
    const filters = [];
    const searchTerm = (this.elements.searchInput.value || '').trim();
    const category = this.elements.categoryFilter.value;

    if (searchTerm) {
      filters.push(`Search: “${searchTerm}”`);
    }

    if (category) {
      filters.push(`Category: ${category}`);
    }

    if (this.selectedTactics.size) {
      filters.push(`${this.selectedTactics.size} tactic${this.selectedTactics.size > 1 ? 's' : ''}`);
    }

    if (this.selectedTags.size) {
      filters.push(`${this.selectedTags.size} tag${this.selectedTags.size > 1 ? 's' : ''}`);
    }

    const base = `${this.totalHunts} hunts cataloged`;
    return filters.length ? `${filters.join(' • ')} • ${base}` : `All hunts • ${base}`;
  }

  hasActiveFilters() {
    const searchTerm = (this.elements.searchInput.value || '').trim();
    const category = this.elements.categoryFilter.value;
    return Boolean(
      searchTerm ||
      category ||
      this.selectedTactics.size ||
      this.selectedTags.size
    );
  }

  updateActiveFiltersDisplay() {
    const { activeFilters } = this.elements;
    if (!activeFilters) return;

    const searchTerm = (this.elements.searchInput.value || '').trim();
    const category = this.elements.categoryFilter.value;
    const filters = [];

    if (searchTerm) {
      filters.push({ type: 'search', value: searchTerm, label: `Search “${searchTerm}”` });
    }

    if (category) {
      filters.push({ type: 'category', value: category, label: `Category: ${category}` });
    }

    [...this.selectedTactics]
      .sort((a, b) => a.localeCompare(b))
      .forEach(tactic => {
        filters.push({ type: 'tactic', value: tactic, label: `Tactic: ${tactic}` });
      });

    [...this.selectedTags]
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
      button.addEventListener('click', () => this.clearSingleFilter(filter));
      activeFilters.appendChild(button);
    });
  }

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
        this.selectedTactics.delete(filter.value);
        break;
      case 'tag':
        this.selectedTags.delete(filter.value);
        break;
      default:
        return;
    }

    this.updateChipSelections();
    this.filterAndSortHunts();
  }

  updateSearchFeedback(duration, totalMatches) {
    const { searchFeedback } = this.elements;
    if (!searchFeedback) return;

    if (typeof duration !== 'number' || Number.isNaN(duration)) {
      searchFeedback.textContent = '';
      return;
    }

    const displayDuration = duration < 1 ? '<1ms' : `${Math.round(duration)}ms`;

    if (!totalMatches) {
      searchFeedback.textContent = `No hunts matched • ${displayDuration}`;
      return;
    }

    if (!this.hasActiveFilters()) {
      searchFeedback.textContent = `All hunts • ${displayDuration}`;
      return;
    }

    const matchesLabel = totalMatches === 1 ? 'hunt' : 'hunts';
    searchFeedback.textContent = `Matched ${this.formatNumber(totalMatches)} ${matchesLabel} • ${displayDuration}`;
  }

  formatNumber(value) {
    return this.numberFormatter.format(typeof value === 'number' ? value : 0);
  }

  changePage(pageNumber) {
    const totalPages = Math.max(1, Math.ceil((this.filteredHunts.length || 1) / this.pageSize));
    const targetPage = Math.min(Math.max(1, pageNumber), totalPages);
    if (targetPage === this.currentPage) return;
    this.currentPage = targetPage;
    this.renderHunts(this.sortedHunts);
  }

  updateModalNavigation() {
    if (!this.modalCounter) return;
    const total = this.sortedHunts.length;
    const current = total ? this.currentModalIndex + 1 : 0;
    this.modalCounter.textContent = total ? `${current} / ${total}` : 'No hunts';

    if (this.modalPrevButton) {
      this.modalPrevButton.disabled = this.currentModalIndex <= 0;
    }
    if (this.modalNextButton) {
      this.modalNextButton.disabled = this.currentModalIndex >= total - 1;
    }
  }

  navigateModal(direction) {
    if (!this.modal || this.modal.style.display !== 'block') return;
    const targetIndex = this.currentModalIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.sortedHunts.length) return;
    this.showHuntDetailsByIndex(targetIndex);
  }

  // Create a hunt card element
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

    card.addEventListener('click', () => this.showHuntDetailsByIndex(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.showHuntDetailsByIndex(index);
      }
    });

    return card;
  }

  getHuntTactics(hunt) {
    if (!hunt || !hunt.tactic) return [];
    return hunt.tactic
      .split(',')
      .map(tactic => tactic.trim())
      .filter(Boolean);
  }

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

  buildPreviewMeta(hunt) {
    const meta = [];
    if (hunt.why) meta.push('Why notes');
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

  // Sorting logic
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

  // Filter and sort hunts
  filterAndSortHunts(options = {}) {
    const { preservePage = false } = options;
    const getNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
    const start = getNow();
    const searchTerm = (this.elements.searchInput.value || '').toLowerCase();
    const selectedCategory = this.elements.categoryFilter.value;

    this.filteredHunts = this.huntsData.filter(hunt => {
      return this.matchesSearchCriteria(hunt, searchTerm) &&
             this.matchesCategory(hunt, selectedCategory) &&
             this.matchesTactic(hunt) &&
             this.matchesTag(hunt);
    });

    this.sortedHunts = this.sortHunts(this.filteredHunts);

    if (!preservePage) {
      this.currentPage = 1;
    }

    this.renderHunts(this.sortedHunts);
    const duration = getNow() - start;
    this.updateSearchFeedback(duration, this.filteredHunts.length);
  }

  // Search criteria matching
  matchesSearchCriteria(hunt, searchTerm) {
    if (!searchTerm) return true;
    
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

  // Category matching
  matchesCategory(hunt, category) {
    return !category || hunt.category === category;
  }

  // Tactic matching
  matchesTactic(hunt) {
    if (!this.selectedTactics.size) return true;
    const huntTactics = this.getHuntTactics(hunt);
    if (!huntTactics.length) return false;
    return [...this.selectedTactics].every(tactic => huntTactics.includes(tactic));
  }

  // Tag matching
  matchesTag(hunt) {
    if (!this.selectedTags.size) return true;
    const tags = hunt.tags || [];
    if (!tags.length) return false;
    return [...this.selectedTags].every(tag => tags.includes(tag));
  }

  // Setup event listeners
  setupEventListeners() {
    // Debounced search
    this.elements.searchInput.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.filterAndSortHunts(), 300);
    });

    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.filterAndSortHunts();
    });

    this.elements.categoryFilter.addEventListener('change', () => this.filterAndSortHunts());
    this.elements.sortHuntsSelect.addEventListener('change', () => this.filterAndSortHunts({ preservePage: true }));

    this.elements.toggleAdvancedFilters.addEventListener('click', () => {
      const { advancedFilters, toggleAdvancedFilters } = this.elements;
      const isOpen = advancedFilters.classList.toggle('is-open');
      toggleAdvancedFilters.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    this.elements.clearTactics.addEventListener('click', () => this.clearFilterGroup('tactic'));
    this.elements.clearTags.addEventListener('click', () => this.clearFilterGroup('tag'));

    this.elements.presetSelect.addEventListener('change', (event) => {
      const presetId = event.target.value;
      if (presetId) {
        this.applyPreset(presetId);
      }
    });

    this.elements.savePreset.addEventListener('click', () => this.saveCurrentPreset());
    this.elements.deletePreset.addEventListener('click', () => this.deleteCurrentPreset());

    this.elements.prevPage.addEventListener('click', () => this.changePage(this.currentPage - 1));
    this.elements.nextPage.addEventListener('click', () => this.changePage(this.currentPage + 1));

    window.addEventListener('resize', () => {
      const previousPageSize = this.pageSize;
      this.updatePageSize();
      if (previousPageSize !== this.pageSize) {
        this.filterAndSortHunts({ preservePage: true });
      } else {
        this.renderHunts(this.sortedHunts);
      }
    });
  }

  // Initialize the application
  initializeApp() {
    this.createModal();
    this.initializeDropdowns();
    this.updateIntroStats();

    if (this.elements.toggleAdvancedFilters) {
      this.elements.toggleAdvancedFilters.setAttribute('aria-expanded', 'false');
    }

    // Hide loading, show grid
    this.elements.loadingSection.style.display = 'none';
    this.elements.huntsGrid.style.display = 'grid';

    // Initial render
    this.filterAndSortHunts();
  }
}

// Generate notebook content based on PEAK framework
async function generateNotebookContent(huntData) {
  const timestamp = new Date().toISOString();
  const huntTitle = huntData.title || 'Threat Hunting Notebook';
  
  // Create Jupyter notebook structure
  const notebook = {
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '*This notebook provides a structured and consistent way to document threat hunting activities using the PEAK Framework (Prepare, Execute, Act with Knowledge). It guides threat hunters through defining clear hypotheses, scoping the hunt precisely using the ABLE methodology, executing targeted queries, and documenting findings to ensure thorough and actionable results.*\n',
          '\n',
          `**Generated:** ${timestamp}  \n`,
          `**Source:** THOR Collective HEARTH Database  \n`,
          `**Database:** https://hearth.thorcollective.com  \n`,
          `**Framework:** PEAK (Prepare, Execute, Act with Knowledge)  \n`,
          `**Template:** https://dispatch.thorcollective.com/p/the-peak-threat-hunting-template\n`,
          '\n',
          '---\n',
          '\n',
          '# Threat Hunting Report - PEAK Framework\n',
          '\n',
          `## Hunt ID: ${huntData.id}\n`,
          `*(${huntData.category} - ${huntData.category === 'Flames' ? 'Hypothesis-driven' : huntData.category === 'Embers' ? 'Baseline' : 'Model-Assisted'})*\n`,
          '\n',
          `## Hunt Title: ${huntTitle}`
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '---\n',
          '\n',
          '## PREPARE: Define the Hunt\n',
          '\n',
          '| **Hunt Information**            | **Details** |\n',
          '|----------------------------------|-------------|\n',
          `| **Hypothesis**                  | ${huntData.hypothesis} |\n`,
          '| **Threat Hunter Name**          | [Your Name] |\n',
          `| **Date**                        | ${new Date().toLocaleDateString()} |\n`,
          '| **Requestor**                   | [Requestor Name] |\n',
          '| **Timeframe for hunt**          | [Expected Duration] |\n',
          '\n',
          '## Scoping with the ABLE Methodology\n',
          '\n',
          '*Clearly define your hunt scope using the ABLE framework. Replace all placeholders with relevant details for your scenario.*\n',
          '\n',
          '| **Field**   | **Description**                                                                                                                                                                                                                                                                             | **Your Input**                   |\n',
          '|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|\n',
          '| **Actor**   | *(Optional)* Identify the threat actor involved with the behavior, if applicable. This step is optional because hunts aren\'t always tied to a specific actor. You may be investigating techniques used across multiple adversaries or looking for suspicious activity regardless of attribution. Focus on the what and how before the who, unless actor context adds meaningful value to the hunt.  | `[Threat Actor or N/A]`          |\n',
          '| **Behavior**| Describe the actions observed or expected, including tactics, techniques, and procedures (TTPs). Specify methods or tools involved.                                                                                                                                                 | `[Describe observed or expected behavior]` |\n',
          '| **Location**| Specify where the activity occurred, such as an endpoint, network segment, or cloud environment.                                                                                                                                 | `[Location]`            |\n',
          '| **Evidence**| Clearly list logs, artifacts, or telemetry supporting your hypothesis. For each source, provide critical fields required to validate the behavior, and include specific examples of observed or known malicious activity to illustrate expected findings. | `- Source: [Log Source]`<br>`- Key Fields: [Critical Fields]`<br>`- Example: [Expected Example of Malicious Activity]`<br><br>`- Source: [Additional Source]`<br>`- Key Fields: [Critical Fields]`<br>`- Example: [Expected Example of Malicious Activity]` |\n',
          '\n',
          '## Related Tickets (detection coverage, previous incidents, etc.)\n',
          '\n',
          '| **Role**                        | **Ticket and Other Details** |\n',
          '|----------------------------------|------------------------------|\n',
          '| **SOC/IR**                      | [Insert related ticket or incident details] |\n',
          '| **Threat Intel (TI)**            | [Insert related ticket] |\n',
          '| **Detection Engineering (DE)**   | [Insert related ticket] |\n',
          '| **Red Team / Pen Testing**       | [Insert related ticket] |\n',
          '| **Other**                        | [Insert related ticket] |\n',
          '\n',
          '## **Threat Intel & Research**\n',
          '- **MITRE ATT&CK Techniques:**\n',
          `  - \`${huntData.tactic || 'TAxxxx - Tactic Name'}\`\n`,
          '  - `Txxxx - Technique Name`\n',
          '- **Related Reports, Blogs, or Threat Intel Sources:**\n',
          `  - ${huntData.references || '[Link to references]'}\n`,
          '- **Historical Prevalence & Relevance:**\n',
          `  - ${huntData.why || '*(Has this been observed before in your environment? Are there any detections/mitigations for this activity already in place?)*'}\n`,
          '\n',
          '---'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# Threat Hunting Environment Setup\n',
          'import pandas as pd\n',
          'import numpy as np\n',
          'import matplotlib.pyplot as plt\n',
          'import seaborn as sns\n',
          'from datetime import datetime, timedelta\n',
          'import json\n',
          'import warnings\n',
          'warnings.filterwarnings(\'ignore\')\n',
          '\n',
          '# Configure plotting style\n',
          'plt.style.use(\'default\')\n',
          'sns.set_palette("husl")\n',
          'plt.rcParams[\'figure.figsize\'] = (12, 8)\n',
          '\n',
          '# Hunt tracking variables\n',
          `hunt_id = "${huntData.id}"\n`,
          `hunt_title = "${huntTitle}"\n`,
          `hunt_hypothesis = "${huntData.hypothesis}"\n`,
          'hunt_start_time = datetime.now()\n',
          '\n',
          '# Helper functions for hunt analysis\n',
          'def log_hunt_step(step_name, details=""):\n',
          '    """Log hunt steps for documentation."""\n',
          '    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")\n',
          '    print(f"[{timestamp}] {step_name}: {details}")\n',
          '\n',
          'def analyze_results(data, description=""):\n',
          '    """Analyze and summarize hunt results."""\n',
          '    if isinstance(data, pd.DataFrame):\n',
          '        print(f"Analysis: {description}")\n',
          '        print(f"Total Records: {len(data):,}")\n',
          '        print(f"Columns: {list(data.columns)}")\n',
          '        print(f"Date Range: {data.index.min() if hasattr(data.index, \'min\') else \'N/A\'} to {data.index.max() if hasattr(data.index, \'max\') else \'N/A\'}")\n',
          '        print("-" * 50)\n',
          '    else:\n',
          '        print(f"Analysis: {description} - {len(data) if hasattr(data, \'__len__\') else \'N/A\'} items")\n',
          '\n',
          'print("🔥 THOR Collective HEARTH - Threat Hunting Environment Initialized")\n',
          'print(f"Hunt ID: {hunt_id}")\n',
          'print(f"Hunt Title: {hunt_title}")\n',
          'print(f"Started: {hunt_start_time}")\n',
          'print("-" * 60)'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '## EXECUTE: Run the Hunt\n',
          '\n',
          '### Hunting Queries\n',
          '*(Document queries for Splunk, Sigma, KQL, or another query language to execute the hunt. Capture any adjustments made during analysis and iterate on findings.)*\n',
          '\n',
          '#### Initial Query'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# Initial Hunt Query\n',
          '# Replace this with your actual query for your SIEM/logging platform\n',
          '\n',
          '# Example Splunk query:\n',
          '# index=main sourcetype=windows:security EventCode=4688\n',
          '# | search CommandLine="*suspicious_pattern*"\n',
          '# | stats count by host, user, CommandLine\n',
          '\n',
          '# Example KQL query:\n',
          '# SecurityEvent\n',
          '# | where EventID == 4688\n',
          '# | where CommandLine contains "suspicious_pattern"\n',
          '# | summarize count() by Computer, Account, CommandLine\n',
          '\n',
          '# For demonstration, we\'ll simulate some data\n',
          'log_hunt_step("Initial Query Execution", "Running initial hunt query")\n',
          '\n',
          '# Simulate initial query results\n',
          'initial_results = pd.DataFrame({\n',
          '    \'timestamp\': pd.date_range(start=\'2024-01-01\', periods=100, freq=\'H\'),\n',
          '    \'host\': np.random.choice([\'srv-01\', \'srv-02\', \'ws-001\', \'ws-002\'], 100),\n',
          '    \'user\': np.random.choice([\'admin\', \'user1\', \'service_account\'], 100),\n',
          '    \'event_type\': np.random.choice([\'process_creation\', \'network_connection\', \'file_access\'], 100),\n',
          '    \'suspicious_score\': np.random.uniform(0, 1, 100)\n',
          '})\n',
          '\n',
          'analyze_results(initial_results, "Initial hunt query results")\n',
          'print(f"\\nTop 10 results:")\n',
          'print(initial_results.head(10))'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '**Notes:**\n',
          '- Did this query return expected results?\n',
          '- Were there false positives or gaps?\n',
          '- How did you refine the query based on findings?\n',
          '\n',
          '#### Refined Query (if applicable)'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# Refined Hunt Query\n',
          'log_hunt_step("Refined Query Execution", "Running refined hunt query based on initial findings")\n',
          '\n',
          '# Apply refinements based on initial query results\n',
          '# Example refinements:\n',
          '# - Add time-based filtering\n',
          '# - Exclude known false positives\n',
          '# - Add additional correlation criteria\n',
          '\n',
          'refined_results = initial_results[\n',
          '    (initial_results[\'suspicious_score\'] > 0.7) &  # Higher threshold\n',
          '    (initial_results[\'event_type\'] == \'process_creation\')  # Focus on process creation\n',
          '].copy()\n',
          '\n',
          'analyze_results(refined_results, "Refined hunt query results")\n',
          '\n',
          'print("\\nRationale for Refinement:")\n',
          'print("- Applied suspicious score threshold > 0.7 to reduce false positives")\n',
          'print("- Focused on process creation events for better signal-to-noise ratio")\n',
          'print("- Excluded service account activities to focus on user-driven activity")'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '### Visualization or Analytics\n',
          '*(Describe any dashboards, anomaly detection methods, or visualizations used. Capture observations and note whether visualizations revealed additional insights. **Add screenshots!**)*'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# Visualization and Analytics\n',
          'log_hunt_step("Visualization", "Creating hunt visualizations")\n',
          '\n',
          '# Create visualizations to identify patterns\n',
          'fig, axes = plt.subplots(2, 2, figsize=(15, 10))\n',
          '\n',
          '# Timeline of events\n',
          'timeline_data = refined_results.set_index(\'timestamp\').resample(\'D\').size()\n',
          'axes[0, 0].plot(timeline_data.index, timeline_data.values, marker=\'o\')\n',
          'axes[0, 0].set_title(\'Event Timeline\')\n',
          'axes[0, 0].set_xlabel(\'Date\')\n',
          'axes[0, 0].set_ylabel(\'Event Count\')\n',
          'axes[0, 0].tick_params(axis=\'x\', rotation=45)\n',
          '\n',
          '# Host distribution\n',
          'host_counts = refined_results[\'host\'].value_counts()\n',
          'axes[0, 1].bar(host_counts.index, host_counts.values)\n',
          'axes[0, 1].set_title(\'Events by Host\')\n',
          'axes[0, 1].set_xlabel(\'Host\')\n',
          'axes[0, 1].set_ylabel(\'Event Count\')\n',
          '\n',
          '# User activity distribution\n',
          'user_counts = refined_results[\'user\'].value_counts()\n',
          'axes[1, 0].pie(user_counts.values, labels=user_counts.index, autopct=\'%1.1f%%\')\n',
          'axes[1, 0].set_title(\'User Activity Distribution\')\n',
          '\n',
          '# Suspicious score distribution\n',
          'axes[1, 1].hist(refined_results[\'suspicious_score\'], bins=20, alpha=0.7)\n',
          'axes[1, 1].set_title(\'Suspicious Score Distribution\')\n',
          'axes[1, 1].set_xlabel(\'Suspicious Score\')\n',
          'axes[1, 1].set_ylabel(\'Frequency\')\n',
          '\n',
          'plt.tight_layout()\n',
          'plt.show()\n',
          '\n',
          '# Analytics observations\n',
          'print("\\n" + "="*60)\n',
          'print("VISUALIZATION INSIGHTS")\n',
          'print("="*60)\n',
          'print("- Examples:")\n',
          'print("  - Time-series charts to detect activity spikes")\n',
          'print("  - Heatmaps of unusual application installs")\n',
          'print("  - Add your specific observations here")\n',
          'print("="*60)'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '### Detection Logic\n',
          '*(How would this be turned into a detection rule? Thresholds, tuning considerations, etc.)*\n',
          '\n',
          '- **Initial Detection Criteria:**\n',
          '  - What conditions would trigger an alert?\n',
          '  - Are there threshold values that indicate malicious activity?\n',
          '\n',
          '- **Refinements After Review:**\n',
          '  - Did certain legitimate activities cause false positives?\n',
          '  - How can you tune the rule to focus on real threats?\n',
          '\n',
          '### Capturing Your Analysis & Iteration\n',
          '- **Summarize insights gained from each query modification and visualization.**\n',
          '- **Reiterate key findings:**\n',
          '  - Did this query lead to any findings, false positives, or hypotheses for further hunting?\n',
          '  - If this hunt were repeated, what changes should be made?\n',
          '  - Does this hunt generate ideas for additional hunts?\n',
          '\n',
          '- **Document the next steps for refining queries for detections and other outputs.**\n',
          '\n',
          '---'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '## ACT: Findings & Response\n',
          '\n',
          '### Hunt Review Template\n',
          '\n',
          '### **Hypothesis / Topic**\n',
          `*(Restate the hypothesis and topic of the investigation: ${huntData.hypothesis})*\n`,
          '\n',
          '### **Executive Summary**\n',
          '**Key Points:**\n',
          '- 3-5 sentences summarizing the investigation.\n',
          '- Indicate whether the hypothesis was proved or disproved.\n',
          '- Summarize the main findings (e.g., "We found..., we did not find..., we did not find... but we did find...").\n',
          '\n',
          '### **Findings**\n',
          '*(Summarize key results, including any unusual activity.)*\n',
          '\n',
          '| **Finding** | **Ticket Number and Link** | **Description** |\n',
          '|------------|----------------------------|------------------|\n',
          '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding, such as suspicious activity, new detection idea, data gap, etc.] |\n',
          '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding] |\n',
          '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding] |'
        ]
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          '# ACT Phase - Generate Hunt Summary\n',
          'hunt_end_time = datetime.now()\n',
          'hunt_duration = hunt_end_time - hunt_start_time\n',
          '\n',
          'log_hunt_step("Hunt Summary", "Generating final hunt report")\n',
          '\n',
          '# Calculate hunt metrics\n',
          'total_events_analyzed = len(initial_results) if \'initial_results\' in locals() else 0\n',
          'suspicious_events_found = len(refined_results) if \'refined_results\' in locals() else 0\n',
          'false_positive_rate = "TBD - Requires validation"\n',
          '\n',
          'hunt_summary = {\n',
          '    "hunt_id": hunt_id,\n',
          '    "hunt_title": hunt_title,\n',
          '    "hypothesis": hunt_hypothesis,\n',
          '    "start_time": hunt_start_time,\n',
          '    "end_time": hunt_end_time,\n',
          '    "duration": hunt_duration,\n',
          '    "total_events_analyzed": total_events_analyzed,\n',
          '    "suspicious_events_found": suspicious_events_found,\n',
          '    "false_positive_rate": false_positive_rate\n',
          '}\n',
          '\n',
          'print("\\n" + "="*70)\n',
          'print("🔥 THOR COLLECTIVE HEARTH - HUNT SUMMARY REPORT")\n',
          'print("="*70)\n',
          'print(f"Hunt ID: {hunt_summary[\'hunt_id\']}")\n',
          'print(f"Hunt Title: {hunt_summary[\'hunt_title\']}")\n',
          'print(f"Hypothesis: {hunt_summary[\'hypothesis\']}")\n',
          'print(f"Duration: {hunt_summary[\'duration\']}")\n',
          'print(f"Total Events Analyzed: {hunt_summary[\'total_events_analyzed\']:,}")\n',
          'print(f"Suspicious Events Found: {hunt_summary[\'suspicious_events_found\']:,}")\n',
          'print(f"False Positive Rate: {hunt_summary[\'false_positive_rate\']}")\n',
          'print("="*70)\n',
          '\n',
          '# Export summary for documentation\n',
          'import json\n',
          'with open(f"hunt_summary_{hunt_id}.json", "w") as f:\n',
          '    json.dump(hunt_summary, f, indent=2, default=str)\n',
          '\n',
          'print(f"\\nHunt summary exported to: hunt_summary_{hunt_id}.json")'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '## K - Knowledge: Lessons Learned & Documentation\n',
          '\n',
          '### **Adjustments to Future Hunts**\n',
          '- **What worked well?**\n',
          '- **What could be improved?**\n',
          '- **Should this hunt be automated as a detection?**\n',
          '- **Are there any follow-up hunts that should be conducted?**\n',
          '- **What feedback should be shared with other teams (SOC, IR, Threat Intel, Detection Engineering, etc.)?**\n',
          '\n',
          '### **Sharing Knowledge & Documentation**\n',
          '*(Ensure insights from this hunt are shared with the broader security team to improve future hunts and detections.)*\n',
          '\n',
          '- **Knowledge Base (KB) Articles**\n',
          '  - [ ] Write an internal KB article that captures:\n',
          '    - [ ] The hunt\'s objective, scope, and key findings\n',
          '    - [ ] Any detection logic or rule improvements\n',
          '    - [ ] Lessons learned that are relevant for future hunts or incident response\n',
          '  - [ ] Document newly uncovered insights or patterns that could benefit SOC, IR, or Detection Engineering teams, especially anything that could inform future detections, playbooks, or tuning decisions.\n',
          '\n',
          '- **Threat Hunt Readouts**\n',
          '  - [ ] Schedule a readout with SOC, IR, and Threat Intel teams.\n',
          '  - [ ] Present key findings and suggested improvements to detections.\n',
          '\n',
          '- **Reports & External Sharing**\n',
          '  - [ ] Publish findings in an internal hunt report.\n',
          '  - [ ] Share relevant insights with stakeholders, vendors, or industry communities if applicable.\n',
          '\n',
          '### **References**\n',
          `- ${huntData.references || '[Insert link to related documentation, reports, or sources]'}\n`,
          '- [Insert link to any external references or articles]\n',
          '\n',
          '---'
        ]
      },
      {
        cell_type: 'markdown',
        metadata: {},
        source: [
          '## 📋 Conclusion\n',
          '\n',
          'This threat hunting notebook has been generated based on the PEAK framework methodology. The hunt provides:\n',
          '\n',
          '1. **Structured approach** following PEAK phases (Prepare, Execute, Act)\n',
          '2. **Actionable search queries** and detection logic\n',
          '3. **Visualization capabilities** for findings analysis\n',
          '4. **Documentation templates** for reporting and communication\n',
          '\n',
          '### Next Steps\n',
          '\n',
          '1. **Customize data sources** - Replace simulated data with your actual security logs\n',
          '2. **Validate findings** - Review and confirm any suspicious activities identified\n',
          '3. **Implement automation** - Convert successful hunts into automated detection rules\n',
          '4. **Schedule regular execution** - Run hunts periodically to maintain security posture\n',
          '\n',
          '### Knowledge Integration\n',
          '\n',
          'The Knowledge component of PEAK is integrated throughout this hunt:\n',
          '- Threat intelligence from research and CTI sources\n',
          '- Organizational context and business knowledge\n',
          '- Technical expertise and hunting experience\n',
          '- Findings from previous hunt iterations\n',
          '\n',
          '---\n',
          '\n',
          '## Credits & Additional Resources\n',
          '\n',
          'This notebook was generated by **THOR Collective HEARTH** using the official PEAK Threat Hunting Framework template.\n',
          '\n',
          '### THOR Collective Resources\n',
          '- **HEARTH Database:** https://hearth.thorcollective.com\n',
          '- **THOR Collective GitHub:** https://github.com/THORCollective\n',
          '- **Submit New Hunts:** https://github.com/THORCollective/HEARTH/issues/new/choose\n',
          '- **Notebook Generator:** https://github.com/THORCollective/threat-hunting-notebook-generator\n',
          '\n',
          '### PEAK Framework Resources\n',
          '- **PEAK Template Guide:** https://dispatch.thorcollective.com/p/the-peak-threat-hunting-template\n',
          '- **Framework Documentation:** https://github.com/THORCollective/HEARTH/blob/main/Kindling/PEAK-Template.md\n',
          '\n',
          '### Community\n',
          '- **Join the Community:** Contribute your own hunts to help the security community\n',
          '- **Share Your Results:** Consider sharing interesting findings with the broader security community\n',
          '- **Follow THOR Collective:** Stay updated on new tools and threat hunting resources\n',
          '\n',
          '---\n',
          '\n',
          '*Generated using the official PEAK Threat Hunting Framework template from THOR Collective HEARTH*\n',
          '\n',
          '**Happy Hunting! 🔥**'
        ]
      }
    ],
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      },
      language_info: {
        codemirror_mode: {
          name: 'ipython',
          version: 3
        },
        file_extension: '.py',
        mimetype: 'text/x-python',
        name: 'python',
        nbconvert_exporter: 'python',
        pygments_lexer: 'ipython3',
        version: '3.8.5'
      }
    },
    nbformat: 4,
    nbformat_minor: 4
  };
  
  return JSON.stringify(notebook, null, 2);
}

// Show hunt JSON data function
function showHuntJsonData(huntId) {
  const hunt = HUNTS_DATA.find(h => h.id === huntId);
  if (!hunt) return;
  
  const huntData = {
    id: hunt.id,
    title: hunt.title || hunt.notes || 'Untitled Hunt',
    category: hunt.category,
    hypothesis: hunt.notes || hunt.title || '',
    tactic: hunt.tactic || '',
    tags: hunt.tags || [],
    references: hunt.references || '',
    why: hunt.why || '',
    submitter: hunt.submitter ? hunt.submitter.name : 'Unknown',
    file_path: hunt.file_path
  };
  
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <div class="hunt-json-data">
      <h3>Hunt Data for Advanced Notebook Generation</h3>
      <p>Copy the JSON below and use it with the THOR Collective
      <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a>
      tool for more advanced notebooks:</p>
      <div class="json-container">
        <pre class="json-code">${JSON.stringify(huntData, null, 2)}</pre>
      </div>
      <div class="json-actions">
        <button class="btn btn-primary" data-action="copy-json">
          Copy JSON
        </button>
        <button class="btn btn-secondary" data-action="back-to-notebook">
          Back to Notebook
        </button>
      </div>
      <div class="usage-instructions">
        <h4>Usage Instructions:</h4>
        <ol>
          <li>Copy the JSON data above</li>
          <li>Clone the THOR Collective threat-hunting-notebook-generator repository</li>
          <li>Save the JSON to a file (e.g., hunt_data.json)</li>
          <li>Run: <code>python -m src.main --input hunt_data.json --output notebook.ipynb</code></li>
        </ol>
      </div>
    </div>
  `;

  const copyButton = modalBody.querySelector('[data-action="copy-json"]');
  if (copyButton) {
    copyButton.addEventListener('click', (event) => {
      copyToClipboard(event, JSON.stringify(huntData, null, 2));
    });
  }

  const backButton = modalBody.querySelector('[data-action="back-to-notebook"]');
  if (backButton) {
    backButton.addEventListener('click', () => {
      generateNotebook(huntId);
    });
  }
}

// Copy to clipboard function
function copyToClipboard(event, text) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const trigger = event?.currentTarget || event?.target || null;
  const originalLabel = trigger ? trigger.textContent : '';

  const restoreLabel = () => {
    if (!trigger) return;
    setTimeout(() => {
      trigger.disabled = false;
      trigger.textContent = originalLabel;
    }, 2000);
  };

  const applySuccessState = () => {
    if (!trigger) return;
    trigger.disabled = true;
    trigger.textContent = '✓ Copied!';
  };

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
    }
    document.body.removeChild(textarea);
    if (successful) {
      applySuccessState();
      restoreLabel();
    } else if (trigger) {
      trigger.textContent = 'Copy failed';
      restoreLabel();
    }
  };

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text)
      .then(() => {
        applySuccessState();
        restoreLabel();
      })
      .catch((error) => {
        console.warn('Clipboard API error, falling back to execCommand:', error);
        fallbackCopy();
      });
  } else {
    fallbackCopy();
  }
}

// Generate notebook function
async function generateNotebook(huntId) {
  try {
    // Show loading indicator
    const loadingHtml = `
      <div class="notebook-loading">
        <div class="spinner"></div>
        <p>Generating Jupyter notebook...</p>
        <p class="loading-subtext">This may take a moment while we process your hunt hypothesis</p>
      </div>
    `;
    
    // Find the modal body and show loading
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
      modalBody.innerHTML = loadingHtml;
    }
    
    // Find the hunt data
    const hunt = HUNTS_DATA.find(h => h.id === huntId);
    if (!hunt) {
      throw new Error('Hunt not found');
    }
    
    // Prepare hunt data for notebook generation
    const huntData = {
      id: hunt.id,
      title: hunt.title || hunt.notes || 'Untitled Hunt',
      category: hunt.category,
      hypothesis: hunt.notes || hunt.title || '',
      tactic: hunt.tactic || '',
      tags: hunt.tags || [],
      references: hunt.references || '',
      why: hunt.why || '',
      submitter: hunt.submitter ? hunt.submitter.name : 'Unknown',
      file_path: hunt.file_path
    };
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate notebook content using the threat-hunting-notebook-generator approach
    const notebookContent = await generateNotebookContent(huntData);
    
    // Create a blob with the notebook content
    const blob = new Blob([notebookContent], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    
    // Show success message with download link
    modalBody.innerHTML = `
      <div class="notebook-success">
        <h3>✅ Notebook Generated Successfully!</h3>
        <p>Your threat hunting notebook has been generated based on the PEAK framework.</p>
        <div class="notebook-actions">
          <a href="${downloadUrl}" class="btn btn-primary" download="${huntData.id}_threat_hunting_notebook.ipynb">
            Download Notebook (.ipynb)
          </a>
          <button class="btn btn-secondary" onclick="generateNotebook('${huntData.id}')">
            Generate Another
          </button>
        </div>
        <div class="notebook-info">
          <h4>What's included:</h4>
          <ul>
            <li>PEAK framework structure (Prepare, Execute, Act)</li>
            <li>Hunt hypothesis and research questions</li>
            <li>Sample data analysis code</li>
            <li>Visualization templates</li>
            <li>Documentation templates</li>
          </ul>
        </div>
        <div class="notebook-github">
          <p><strong>Advanced Option:</strong> For more sophisticated notebook generation, you can use the THOR Collective 
          <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a> 
          tool with the following hunt data:</p>
          <button class="btn btn-secondary" onclick="showHuntJsonData('${huntData.id}')">
            Show Hunt Data
          </button>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Error generating notebook:', error);
    
    // Show error message
    const modalBody = document.getElementById('modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="notebook-error">
          <h3>❌ Error Generating Notebook</h3>
          <p>We encountered an error while generating your notebook:</p>
          <p class="error-message">${error.message}</p>
          <div class="error-actions">
            <button class="btn btn-primary" onclick="generateNotebook('${huntId}')">
              Try Again
            </button>
            <button class="btn btn-secondary" onclick="location.reload()">
              Close
            </button>
          </div>
          <div class="error-fallback">
            <p><strong>Alternative:</strong> You can manually create a notebook using the hunt details shown above and the THOR Collective 
            <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a> tool.</p>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.hearthApp = new HearthApp();
}); 