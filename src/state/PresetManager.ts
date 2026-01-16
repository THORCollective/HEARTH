/**
 * Interface for filter preset
 */
export interface FilterPreset {
  id: string;
  label: string;
  filters: {
    category?: string;
    tactics?: string[];
    tags?: string[];
    sortBy?: string;
  };
  builtIn?: boolean;
}

/**
 * PresetManager - handles saving and loading filter presets
 */
export class PresetManager {
  private storageKey = 'hearth.presets.v1';
  private presets: Map<string, FilterPreset> = new Map();

  // Built-in presets
  private defaultPresets: FilterPreset[] = [
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

  constructor() {
    this.loadPresets();
  }

  /**
   * Load presets from localStorage
   */
  private loadPresets(): void {
    // Load built-in presets
    this.defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });

    // Load custom presets from localStorage
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const customPresets = JSON.parse(stored) as FilterPreset[];
        customPresets.forEach(preset => {
          this.presets.set(preset.id, preset);
        });
      }
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error);
    }
  }

  /**
   * Save custom presets to localStorage
   */
  private savePresets(): void {
    try {
      const customPresets = Array.from(this.presets.values())
        .filter(preset => !preset.builtIn);

      localStorage.setItem(this.storageKey, JSON.stringify(customPresets));
    } catch (error) {
      console.error('Failed to save presets to localStorage:', error);
    }
  }

  /**
   * Get all presets
   */
  getAllPresets(): FilterPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get preset by ID
   */
  getPreset(id: string): FilterPreset | undefined {
    return this.presets.get(id);
  }

  /**
   * Save a new preset
   */
  savePreset(label: string, filters: FilterPreset['filters']): FilterPreset {
    const id = this.generatePresetId(label);

    const preset: FilterPreset = {
      id,
      label,
      filters,
      builtIn: false
    };

    this.presets.set(id, preset);
    this.savePresets();

    return preset;
  }

  /**
   * Delete a preset (only custom presets can be deleted)
   */
  deletePreset(id: string): boolean {
    const preset = this.presets.get(id);

    if (!preset || preset.builtIn) {
      return false;
    }

    this.presets.delete(id);
    this.savePresets();

    return true;
  }

  /**
   * Generate unique preset ID from label
   */
  private generatePresetId(label: string): string {
    const base = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let id = base;
    let counter = 1;

    while (this.presets.has(id)) {
      id = `${base}-${counter}`;
      counter++;
    }

    return id;
  }
}
