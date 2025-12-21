/**
 * PresetManager - Filter Preset Management Module
 *
 * Manages filter presets for the HEARTH application, including:
 * - Loading and persisting presets to localStorage
 * - Managing built-in and custom presets
 * - Applying preset filters
 * - Rendering preset UI elements
 *
 * @module PresetManager
 */

/**
 * PresetManager class handles all filter preset operations
 */
export class PresetManager {
  /**
   * Creates a new PresetManager instance
   *
   * @param {Object} elements - DOM element references
   * @param {HTMLSelectElement} elements.presetSelect - Preset dropdown select element
   * @param {HTMLButtonElement} elements.savePreset - Save preset button
   * @param {HTMLButtonElement} elements.deletePreset - Delete preset button
   * @param {HTMLSelectElement} elements.categoryFilter - Category filter select element
   * @param {HTMLElement} elements.tacticChips - Tactic chips container
   * @param {HTMLElement} elements.tagChips - Tag chips container
   */
  constructor(elements) {
    this.elements = elements;
    this.presets = new Map();
    this.presetStorageKey = 'hearth.presets.v1';

    // Define built-in presets
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
  }

  /**
   * Initializes the preset manager by loading stored presets and rendering options
   */
  initialize() {
    this.presets.clear();

    // Load built-in presets
    this.defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });

    // Load custom presets from localStorage
    const storedPresets = this.loadStoredPresets();
    storedPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });

    this.renderPresetOptions();
  }

  /**
   * Loads custom presets from localStorage
   *
   * @returns {Array} Array of preset objects
   */
  loadStoredPresets() {
    try {
      const raw = window.localStorage.getItem(this.presetStorageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to load filter presets:', error);
      return [];
    }
  }

  /**
   * Persists custom presets to localStorage
   * Excludes built-in presets from storage
   */
  persistPresets() {
    try {
      const customPresets = [...this.presets.values()].filter(preset => !preset.builtIn);
      window.localStorage.setItem(this.presetStorageKey, JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Unable to persist filter presets:', error);
    }
  }

  /**
   * Renders preset options in the select dropdown
   * Sorts presets alphabetically and marks built-in presets
   */
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

  /**
   * Applies a preset's filters to the application
   *
   * @param {string} presetId - ID of the preset to apply
   * @param {Function} updateCallback - Callback to update chip selections and trigger filtering
   * @returns {Object|null} The applied preset's filters or null if preset not found
   */
  applyPreset(presetId, updateCallback) {
    const preset = this.presets.get(presetId);
    if (!preset) {
      return null;
    }

    const { filters = {} } = preset;

    // Apply category filter
    this.elements.categoryFilter.value = filters.category || '';

    // Return the filters so the caller can update their state
    const appliedFilters = {
      category: filters.category || '',
      tactics: new Set(filters.tactics || []),
      tags: new Set(filters.tags || [])
    };

    // Call the update callback if provided
    if (updateCallback && typeof updateCallback === 'function') {
      updateCallback(appliedFilters);
    }

    return appliedFilters;
  }

  /**
   * Updates chip selections based on selected tactics and tags
   *
   * @param {Set} selectedTactics - Set of selected tactic values
   * @param {Set} selectedTags - Set of selected tag values
   */
  updateChipSelections(selectedTactics, selectedTags) {
    // Update tactic chips
    this.elements.tacticChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = selectedTactics.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Update tag chips
    this.elements.tagChips.querySelectorAll('.chip').forEach(chip => {
      const value = chip.getAttribute('data-value');
      const isSelected = selectedTags.has(value);
      chip.classList.toggle('is-selected', isSelected);
      chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  /**
   * Saves the current filter state as a new custom preset
   * Prompts user for a preset name
   *
   * @param {Object} currentFilters - Current filter state
   * @param {string} currentFilters.category - Selected category
   * @param {Set} currentFilters.tactics - Selected tactics
   * @param {Set} currentFilters.tags - Selected tags
   * @returns {boolean} True if preset was saved, false otherwise
   */
  saveCurrentPreset(currentFilters) {
    const rawLabel = window.prompt('Name this saved view');
    const label = rawLabel ? rawLabel.trim() : '';
    if (!label) {
      return false;
    }

    const id = `user-${Date.now()}`;
    const preset = {
      id,
      label,
      filters: {
        category: currentFilters.category || '',
        tactics: [...currentFilters.tactics],
        tags: [...currentFilters.tags]
      },
      builtIn: false
    };

    this.presets.set(id, preset);
    this.persistPresets();
    this.renderPresetOptions();
    this.elements.presetSelect.value = id;

    return true;
  }

  /**
   * Deletes the currently selected preset
   * Prevents deletion of built-in presets
   *
   * @returns {boolean} True if preset was deleted, false otherwise
   */
  deleteCurrentPreset() {
    const { presetSelect } = this.elements;
    const presetId = presetSelect.value;

    if (!presetId) {
      return false;
    }

    const preset = this.presets.get(presetId);
    if (!preset || preset.builtIn) {
      alert('Built-in presets cannot be deleted.');
      return false;
    }

    this.presets.delete(presetId);
    this.persistPresets();
    this.renderPresetOptions();
    presetSelect.value = '';

    return true;
  }

  /**
   * Gets the currently selected preset ID
   *
   * @returns {string} The selected preset ID or empty string
   */
  getSelectedPresetId() {
    return this.elements.presetSelect.value;
  }

  /**
   * Gets a preset by ID
   *
   * @param {string} presetId - ID of the preset to retrieve
   * @returns {Object|undefined} The preset object or undefined if not found
   */
  getPreset(presetId) {
    return this.presets.get(presetId);
  }

  /**
   * Gets all presets
   *
   * @returns {Array} Array of all preset objects
   */
  getAllPresets() {
    return [...this.presets.values()];
  }

  /**
   * Gets all custom (non-built-in) presets
   *
   * @returns {Array} Array of custom preset objects
   */
  getCustomPresets() {
    return [...this.presets.values()].filter(preset => !preset.builtIn);
  }

  /**
   * Sets up event listeners for preset UI elements
   *
   * @param {Function} onPresetChange - Callback when preset selection changes
   * @param {Function} onSave - Callback when save button is clicked
   * @param {Function} onDelete - Callback when delete button is clicked
   */
  setupEventListeners(onPresetChange, onSave, onDelete) {
    // Preset selection change
    this.elements.presetSelect.addEventListener('change', (event) => {
      const presetId = event.target.value;
      if (presetId && onPresetChange) {
        onPresetChange(presetId);
      }
    });

    // Save preset button
    this.elements.savePreset.addEventListener('click', () => {
      if (onSave) {
        onSave();
      }
    });

    // Delete preset button
    this.elements.deletePreset.addEventListener('click', () => {
      if (onDelete) {
        onDelete();
      }
    });
  }
}
