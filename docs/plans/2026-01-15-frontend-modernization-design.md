# HEARTH Frontend Modernization Design

**Date**: 2026-01-15
**Author**: Sydney Marrone
**Status**: Approved
**Target Timeline**: 3 weeks

---

## Executive Summary

This design outlines the complete modernization of the HEARTH frontend from vanilla JavaScript to a TypeScript + Vite architecture. The refactor maintains 100% feature parity while introducing modern tooling, modular architecture, and improved maintainability.

**Key Decisions**:
- **Tech Stack**: Vite + Vanilla TypeScript (no framework)
- **Migration Approach**: Hybrid (build new alongside old, single cutover)
- **Data Pipeline**: Python generates JSON, TypeScript imports with type safety
- **Deployment**: GitHub Actions builds, deploys `dist/` to Pages
- **Timeline**: 3 weeks to feature parity

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Goals & Non-Goals](#goals--non-goals)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [TypeScript Architecture](#typescript-architecture)
6. [Build Configuration](#build-configuration)
7. [CSS Modernization](#css-modernization)
8. [Deployment Strategy](#deployment-strategy)
9. [Migration Strategy](#migration-strategy)
10. [Testing Approach](#testing-approach)
11. [Error Handling](#error-handling)
12. [Success Criteria](#success-criteria)
13. [Risks & Mitigations](#risks--mitigations)

---

## Current State Analysis

### Frontend Codebase

The HEARTH frontend currently consists of:

| File | Lines of Code | Purpose |
|------|--------------|---------|
| `app.js` | 1,855 | Monolithic application logic (HearthApp class) |
| `style.css` | 2,275 | All styles in single file |
| `hunts-data.js` | 1,488 | Auto-generated hunt data as JavaScript constant |
| `chat-widget.js` | 787 | AI chat interface |
| `submit.js` | 53 | Form submission logic |
| `index.html` | 266 | Main page markup |
| `submit.html` | 143 | Submission page markup |

**Total**: 6,867 lines of code

### Pain Points

1. **Monolithic Architecture**: Single 1,855-line class with tightly coupled concerns
2. **No Type Safety**: Runtime errors from typos, undefined values
3. **No Module System**: Everything in global scope via script tags
4. **No Build Process**: Unminified, unbundled assets served directly
5. **Difficult Maintenance**: Finding and fixing bugs requires reading entire file
6. **No Code Splitting**: All JavaScript loads upfront
7. **Manual Dependency Management**: Script tag ordering matters

### Current Deployment

- GitHub Pages serves files directly from repo root
- No build step - push HTML/CSS/JS, it goes live immediately
- Python script (`parse_hunts.py`) generates `hunts-data.js` from markdown files
- GitHub Actions workflow (`static.yml`) uploads entire repo to Pages

---

## Goals & Non-Goals

### Goals

✅ **Feature Parity**: Replicate 100% of current functionality
✅ **Modern Tooling**: Vite build system with hot reload
✅ **Type Safety**: TypeScript catches errors at compile time
✅ **Modular Architecture**: Clear separation of concerns
✅ **Maintainability**: Easy to understand, modify, debug
✅ **Performance**: Equal or better than current version
✅ **Developer Experience**: Fast local development workflow

### Non-Goals

❌ **Framework Adoption**: Not migrating to React/Vue/Svelte
❌ **New Features**: No functionality changes during refactor
❌ **Backend Changes**: Python scripts remain unchanged (except JSON output)
❌ **UI Redesign**: Keep current look and feel
❌ **Accessibility Overhaul**: Maintain current a11y (improve later)
❌ **Mobile App**: Web-only, no native mobile app

---

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           index.html (entry point)                │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│                       ▼                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │       main.ts (application initialization)        │  │
│  │  - Loads hunts-data.json                          │  │
│  │  - Creates AppState                               │  │
│  │  - Initializes components                         │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│         ┌─────────────┴─────────────┐                   │
│         ▼                           ▼                   │
│  ┌──────────────┐          ┌──────────────────┐        │
│  │   AppState   │◄─────────┤   Components     │        │
│  │  (centralized│          │  - SearchBar     │        │
│  │    state)    │          │  - FilterPanel   │        │
│  │              │          │  - HuntGrid      │        │
│  │  - hunts[]   │          │  - Pagination    │        │
│  │  - filters   │          │  - ChatWidget    │        │
│  │  - search    │          │  - Modal         │        │
│  │  - page      │          │                  │        │
│  └──────────────┘          └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
                       │
                       │ fetch()
                       ▼
              ┌──────────────────┐
              │ hunts-data.json  │
              │  (generated by   │
              │  Python script)  │
              └──────────────────┘
```

### Observer Pattern

Components subscribe to state changes using the Observer pattern:

```
AppState.notify() → All subscribed components → Component.onStateChange()
```

When state changes (search query, filter toggle, page change), all components receive notification and update their UI accordingly.

---

## Project Structure

```
HEARTH/
├── src/                          # New TypeScript frontend
│   ├── main.ts                   # Entry point, initializes app
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── Hunt.ts               # Hunt data model
│   │   ├── Observer.ts           # Observer interface
│   │   └── index.ts              # Re-exports
│   │
│   ├── state/                    # Application state management
│   │   ├── AppState.ts           # Main state class with filtering logic
│   │   └── PresetManager.ts      # Filter preset persistence
│   │
│   ├── components/               # UI component classes
│   │   ├── SearchBar.ts          # Search functionality with debouncing
│   │   ├── FilterPanel.ts        # Category, tactic, tag filters
│   │   ├── HuntGrid.ts           # Hunt card rendering & pagination
│   │   ├── Pagination.ts         # Page navigation controls
│   │   ├── Modal.ts              # Hunt detail modal with keyboard nav
│   │   └── ChatWidget.ts         # AI chat interface
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── formatters.ts         # Number/date formatting helpers
│   │   ├── debounce.ts           # Performance optimization
│   │   └── dom.ts                # DOM helper functions
│   │
│   └── styles/                   # Modular CSS
│       ├── main.css              # Entry point, imports all styles
│       ├── variables.css         # CSS custom properties (colors, spacing)
│       ├── reset.css             # Browser normalization
│       ├── typography.css        # Font styles, text utilities
│       ├── layout.css            # Global layout (header, main, footer)
│       └── components/           # Component-specific styles
│           ├── search-bar.css
│           ├── filter-panel.css
│           ├── hunt-card.css
│           ├── hunt-grid.css
│           ├── pagination.css
│           ├── modal.css
│           └── chat-widget.css
│
├── public/                       # Static assets (served as-is)
│   ├── hunts-data.json           # Generated by Python (was .js)
│   ├── Assets/                   # Images, logo
│   │   └── HEARTH-logo.png
│   └── CNAME                     # GitHub Pages custom domain
│
├── dist/                         # Build output (gitignored)
│   ├── index.html
│   ├── submit.html
│   ├── assets/
│   │   ├── main-[hash].js
│   │   ├── main-[hash].css
│   │   └── ...
│   ├── hunts-data.json
│   └── CNAME
│
├── docs/                         # Documentation
│   └── plans/
│       └── 2026-01-15-frontend-modernization-design.md (this file)
│
├── scripts/                      # Python backend scripts
│   ├── parse_hunts.py            # Modified to output JSON
│   └── ...
│
├── .github/workflows/
│   └── static.yml                # Updated with build step
│
├── index.html                    # Main HTML (root for GitHub Pages)
├── submit.html                   # Submission page
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Node dependencies & scripts
└── README.md

# Old files (keep during migration, delete at cutover)
├── app.js                        # Reference implementation
├── style.css                     # Reference styles
├── hunts-data.js                 # Replaced by hunts-data.json
├── chat-widget.js                # Ported to TypeScript
└── submit.js                     # Ported to TypeScript
```

---

## TypeScript Architecture

### Design Principles

1. **Single Responsibility**: Each class handles one concern
2. **Observer Pattern**: Components react to state changes
3. **Type Safety**: Interfaces define contracts
4. **Composition**: Build complex behavior from simple pieces
5. **Immutability**: State changes create new objects where possible

### Core Classes

#### AppState (State Management)

**Responsibility**: Centralized application state and filtering logic

```typescript
// src/state/AppState.ts
import type { Hunt } from '../types/Hunt';
import type { Observer } from '../types/Observer';

export class AppState {
  private hunts: Hunt[];
  private filteredHunts: Hunt[];
  private searchQuery: string = '';
  private selectedCategory: string = '';
  private selectedTactics: Set<string> = new Set();
  private selectedTags: Set<string> = new Set();
  private sortBy: string = 'id-desc';
  private currentPage: number = 1;
  private pageSize: number = 9;
  private observers: Set<Observer> = new Set();

  constructor(hunts: Hunt[]) {
    this.hunts = hunts;
    this.filteredHunts = [...hunts];
    this.updatePageSize();
  }

  // Observer pattern
  subscribe(observer: Observer): void {
    this.observers.add(observer);
  }

  private notify(): void {
    this.observers.forEach(obs => obs.onStateChange(this));
  }

  // State mutations
  setSearchQuery(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.currentPage = 1; // Reset to page 1 when filters change
    this.applyFilters();
    this.notify();
  }

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

  // Filtering logic
  private applyFilters(): void {
    let filtered = [...this.hunts];

    // Apply search
    if (this.searchQuery) {
      filtered = filtered.filter(hunt =>
        hunt.title.toLowerCase().includes(this.searchQuery) ||
        hunt.tactic.toLowerCase().includes(this.searchQuery) ||
        hunt.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)) ||
        hunt.submitter.name.toLowerCase().includes(this.searchQuery)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(hunt => hunt.category === this.selectedCategory);
    }

    // Apply tactic filters (OR logic within tactics)
    if (this.selectedTactics.size > 0) {
      filtered = filtered.filter(hunt =>
        Array.from(this.selectedTactics).some(tactic =>
          hunt.tactic.toLowerCase().includes(tactic.toLowerCase())
        )
      );
    }

    // Apply tag filters (OR logic within tags)
    if (this.selectedTags.size > 0) {
      filtered = filtered.filter(hunt =>
        hunt.tags.some(tag => this.selectedTags.has(tag))
      );
    }

    // Apply sorting
    this.sortHunts(filtered);

    this.filteredHunts = filtered;
  }

  // Getters for components
  getFilteredHunts(): Hunt[] {
    return this.filteredHunts;
  }

  getPaginatedHunts(): Hunt[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredHunts.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredHunts.length / this.pageSize);
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  // ... more methods
}
```

#### Component Base Pattern

**Responsibility**: Handle specific UI element and react to state changes

```typescript
// src/components/SearchBar.ts
import type { AppState } from '../state/AppState';
import type { Observer } from '../types/Observer';
import { debounce } from '../utils/debounce';

export class SearchBar implements Observer {
  private state: AppState;
  private inputElement: HTMLInputElement;
  private clearButton: HTMLButtonElement;
  private feedbackElement: HTMLElement;

  constructor(state: AppState) {
    this.state = state;

    // Get DOM elements (throw if missing)
    this.inputElement = this.getElement('searchInput') as HTMLInputElement;
    this.clearButton = this.getElement('clearSearch') as HTMLButtonElement;
    this.feedbackElement = this.getElement('searchFeedback');

    // Set up event listeners
    this.setupEventListeners();

    // Subscribe to state changes
    state.subscribe(this);
  }

  private setupEventListeners(): void {
    // Debounce search input for performance
    const debouncedSearch = debounce((query: string) => {
      this.state.setSearchQuery(query);
    }, 300);

    this.inputElement.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      debouncedSearch(query);
    });

    this.clearButton.addEventListener('click', () => {
      this.inputElement.value = '';
      this.state.setSearchQuery('');
      this.inputElement.focus();
    });
  }

  // Called when state changes
  onStateChange(state: AppState): void {
    const hasQuery = state.getSearchQuery().length > 0;

    // Show/hide clear button
    this.clearButton.style.display = hasQuery ? 'block' : 'none';

    // Update feedback
    if (hasQuery && state.getFilteredHunts().length === 0) {
      this.feedbackElement.textContent = 'No hunts match your search';
    } else {
      this.feedbackElement.textContent = '';
    }
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`SearchBar: Required element #${id} not found`);
    }
    return element;
  }
}
```

### Type Definitions

```typescript
// src/types/Hunt.ts
export interface Hunt {
  id: string;
  category: 'Flames' | 'Embers' | 'Alchemy';
  title: string;
  tactic: string;
  notes: string;
  tags: string[];
  submitter: {
    name: string;
    link: string;
  };
  why: string;
  references: string;
  file_path: string;
}
```

```typescript
// src/types/Observer.ts
import type { AppState } from '../state/AppState';

export interface Observer {
  onStateChange(state: AppState): void;
}
```

### Application Initialization

```typescript
// src/main.ts
import { AppState } from './state/AppState';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { HuntGrid } from './components/HuntGrid';
import { Pagination } from './components/Pagination';
import { Modal } from './components/Modal';
import { ChatWidget } from './components/ChatWidget';
import type { Hunt } from './types/Hunt';
import './styles/main.css';

async function loadHunts(): Promise<Hunt[]> {
  const response = await fetch('/hunts-data.json');
  if (!response.ok) {
    throw new Error(`Failed to load hunt data: ${response.statusText}`);
  }
  return await response.json();
}

async function initApp(): Promise<void> {
  try {
    // Load hunt data
    const hunts = await loadHunts();

    if (hunts.length === 0) {
      showError('No hunts found in database');
      return;
    }

    // Initialize state
    const state = new AppState(hunts);

    // Initialize components (order matters for dependencies)
    new SearchBar(state);
    new FilterPanel(state);
    const huntGrid = new HuntGrid(state);
    new Pagination(state);
    new Modal(state, huntGrid);
    new ChatWidget(state);

    // Hide loading, show app
    hideLoading();

    // Initial render
    console.log(`HEARTH initialized with ${hunts.length} hunts`);

  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load hunt data. Please refresh the page.');
  }
}

function hideLoading(): void {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

function showError(message: string): void {
  const container = document.getElementById('huntsGrid');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
  hideLoading();
}

// Start the application
initApp();
```

---

## Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Multi-page app
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        submit: resolve(__dirname, 'submit.html'),
      },
    },

    // Output configuration
    assetsDir: 'assets',

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },

    // Source maps for debugging
    sourcemap: false, // Disable in production for smaller bundle
  },

  server: {
    port: 3000,
    open: true,

    // Proxy API requests if needed in future
    // proxy: {
    //   '/api': 'http://localhost:8000'
    // }
  },

  // Optimizations
  optimizeDeps: {
    include: [], // Add dependencies to pre-bundle if needed
  },
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    // Language & Module
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",

    // Type Checking
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,

    // Misc
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,

    // Output
    "outDir": "dist",
    "declaration": false,
    "declarationMap": false,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```

### Package.json

```json
{
  "name": "hearth",
  "version": "2.0.0",
  "description": "HEARTH - Hunting Exchange and Research Threat Hub",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/THORCollective/HEARTH.git"
  },
  "keywords": ["threat-hunting", "security", "mitre-attack"],
  "author": "THOR Collective",
  "license": "MIT",
  "homepage": "https://github.com/THORCollective/HEARTH#readme",
  "devDependencies": {
    "vite": "^5.4.0",
    "typescript": "^5.6.0",
    "eslint": "^9.39.1",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0"
  }
}
```

### Data Pipeline

**Step 1: Update Python script to output JSON**

```python
# scripts/parse_hunts.py (modifications)

# Change output file from .js to .json
output_file = 'public/hunts-data.json'

# Write as clean JSON instead of JavaScript variable
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(hunts_data, f, indent=2, ensure_ascii=False)

print(f"Generated {output_file} with {len(hunts_data)} hunts")
```

**Step 2: TypeScript loads with type safety**

```typescript
// src/main.ts
import type { Hunt } from './types/Hunt';

async function loadHunts(): Promise<Hunt[]> {
  const response = await fetch('/hunts-data.json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data: Hunt[] = await response.json();
  return data;
}
```

---

## CSS Modernization

### Structure

```
src/styles/
├── main.css                # Entry point (imports all)
├── variables.css           # CSS custom properties
├── reset.css               # Browser normalization
├── typography.css          # Font styles
├── layout.css              # Page layout
└── components/
    ├── search-bar.css
    ├── filter-panel.css
    ├── hunt-card.css
    ├── hunt-grid.css
    ├── pagination.css
    ├── modal.css
    └── chat-widget.css
```

### CSS Variables (Design System)

```css
/* src/styles/variables.css */
:root {
  /* Brand Colors */
  --color-primary: #ff6b35;
  --color-accent: #f7931e;
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-surface-hover: #3a3a3a;
  --color-text: #ffffff;
  --color-text-secondary: #b0b0b0;
  --color-border: #404040;
  --color-error: #ef4444;
  --color-success: #10b981;

  /* Spacing Scale (8px base) */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                       Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Courier New', monospace;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.5rem;    /* 24px */
  --font-size-2xl: 2rem;     /* 32px */
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;

  /* Z-index Layers */
  --z-modal: 1000;
  --z-dropdown: 100;
  --z-header: 50;
  --z-base: 1;
}
```

### Component Example

```css
/* src/styles/components/hunt-card.css */
.hunt-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
  cursor: pointer;
}

.hunt-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.hunt-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.hunt-card__id {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-background);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.hunt-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: var(--line-height-tight);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.hunt-card__tactic {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  margin-bottom: var(--space-md);
}

.hunt-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.hunt-card__tag {
  font-size: var(--font-size-xs);
  background: var(--color-background);
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.hunt-card__tag:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}
```

### Main CSS Entry Point

```css
/* src/styles/main.css */

/* Foundation */
@import './variables.css';
@import './reset.css';
@import './typography.css';
@import './layout.css';

/* Components */
@import './components/search-bar.css';
@import './components/filter-panel.css';
@import './components/hunt-card.css';
@import './components/hunt-grid.css';
@import './components/pagination.css';
@import './components/modal.css';
@import './components/chat-widget.css';

/* Utility Classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.error-message {
  background: var(--color-surface);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  margin: var(--space-2xl) auto;
  max-width: 600px;
}

/* Loading state */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}
```

---

## Deployment Strategy

### Updated GitHub Actions Workflow

```yaml
# .github/workflows/static.yml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Set up Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Set up Python for hunt data generation
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      # Install Python dependencies
      - name: Install Python dependencies
        run: pip install -r requirements.txt

      # Generate hunt data JSON from markdown files
      - name: Generate hunt data
        run: python scripts/parse_hunts.py

      # Install npm dependencies
      - name: Install dependencies
        run: npm ci

      # Type check (fail build on TypeScript errors)
      - name: Type check
        run: npm run type-check

      # Build frontend with Vite
      - name: Build frontend
        run: npm run build

      # Setup GitHub Pages
      - name: Setup Pages
        uses: actions/configure-pages@v5

      # Upload built dist/ directory
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'dist'

      # Deploy to GitHub Pages
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Build Process Flow

```
1. Git push to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Checkout repository
   ↓
4. Setup Node.js 20 (with npm cache)
   ↓
5. Setup Python 3.11 (with pip cache)
   ↓
6. Install Python dependencies
   ↓
7. Generate hunts-data.json from markdown
   ↓
8. Install npm dependencies (npm ci)
   ↓
9. Run TypeScript type checking
   ↓
10. Build frontend with Vite
   ↓
11. Upload dist/ to GitHub Pages
   ↓
12. Deploy to hearth.thorcollective.com
```

### Build Output

Vite produces optimized production assets:

```
dist/
├── index.html                      # Processed, asset refs updated
├── submit.html                     # Processed
├── assets/
│   ├── main-a1b2c3d4.js          # Bundled, minified, hashed JS
│   ├── main-e5f6g7h8.css         # Bundled, minified, hashed CSS
│   ├── HEARTH-logo-i9j0k1l2.png  # Optimized image
│   └── ...
├── hunts-data.json                 # Generated hunt data
├── CNAME                           # Custom domain config
└── (other public/ assets)
```

**Benefits**:
- **Cache busting**: Hash in filename changes when content changes
- **Minification**: Smaller file sizes, faster loads
- **Tree shaking**: Unused code removed
- **Compression**: Gzip/Brotli enabled by GitHub Pages

---

## Migration Strategy

### Hybrid Approach

Build new TypeScript version alongside old JavaScript version, complete all features, then perform single cutover.

### Timeline: 3 Weeks

#### **Week 1: Foundation**

**Days 1-2: Project Setup**
- [ ] Create `src/` directory structure
- [ ] Initialize `package.json`, install Vite + TypeScript
- [ ] Create `vite.config.ts` and `tsconfig.json`
- [ ] Update Python script to generate `public/hunts-data.json`
- [ ] Create type definitions (`Hunt.ts`, `Observer.ts`)
- [ ] Set up HTML entry points (`index.html` with module script)

**Days 3-5: Core State & Loading**
- [ ] Implement `AppState` class with basic filtering
- [ ] Implement hunt data loading in `main.ts`
- [ ] Create basic `HuntGrid` component (display hunts, no filtering yet)
- [ ] Test: App loads, displays all hunts in grid

**Deliverable**: App loads hunt data and displays it (no filtering)

---

#### **Week 2: Core Features**

**Days 6-8: Search & Filters**
- [ ] Implement `SearchBar` component with debouncing
- [ ] Implement `FilterPanel` component
  - [ ] Category dropdown
  - [ ] Tactic chips
  - [ ] Tag chips
- [ ] Wire up filters to `AppState`
- [ ] Test: Search and all filters work correctly

**Days 9-10: Pagination & Sorting**
- [ ] Implement `Pagination` component
- [ ] Add sorting logic to `AppState`
- [ ] Add sorting dropdown to UI
- [ ] Test: Pagination and sorting work correctly

**Deliverable**: Core filtering, search, pagination working

---

#### **Week 3: Advanced Features & Deploy**

**Days 11-13: Advanced Features**
- [ ] Implement `PresetManager` for filter presets
- [ ] Implement `Modal` component for hunt details
  - [ ] Keyboard navigation (arrows, ESC)
  - [ ] URL state management
- [ ] Port `ChatWidget` to TypeScript
- [ ] Test: All advanced features work

**Days 14-15: CSS Modernization**
- [ ] Split `style.css` into modular files
- [ ] Migrate to CSS variables
- [ ] Ensure responsive design works
- [ ] Test: UI looks identical to old version

**Days 16-18: Testing & Deployment**
- [ ] Run side-by-side testing (old vs new)
- [ ] Complete feature checklist (see Testing section)
- [ ] Fix any discrepancies
- [ ] Update GitHub Actions workflow
- [ ] Test workflow in separate branch
- [ ] Create PR for final cutover
- [ ] Merge to main, deploy

**Deliverable**: Production deployment with feature parity

---

### Development Workflow

**During Migration (Weeks 1-3)**:
```bash
# Terminal 1: Old version (reference)
cd ~/projects/HEARTH
python -m http.server 8000

# Terminal 2: New version (development)
cd ~/projects/HEARTH
npm run dev

# Compare at:
# - http://localhost:8000  (old)
# - http://localhost:3000  (new)
```

**Post-Migration**:
```bash
# Development
npm run dev

# Production build (test locally)
npm run build
npm run preview

# Type checking
npm run type-check
```

---

## Testing Approach

### Manual Feature Checklist

Since there are no automated tests currently, use systematic manual testing.

#### Search & Display
- [ ] Search by title works
- [ ] Search by tactic works
- [ ] Search by tags works
- [ ] Search by submitter name works
- [ ] Search debouncing (doesn't trigger on every keystroke)
- [ ] Clear search button appears when query exists
- [ ] Clear search button clears and refocuses input
- [ ] Hunt cards display all fields correctly:
  - [ ] ID (e.g., "H001")
  - [ ] Title
  - [ ] Tactic
  - [ ] Tags
  - [ ] Category badge
- [ ] Hunt count updates correctly ("Showing X of Y hunts")

#### Filtering
- [ ] Category filter: "All categories" shows all
- [ ] Category filter: "Flames" shows only Flames
- [ ] Category filter: "Embers" shows only Embers
- [ ] Category filter: "Alchemy" shows only Alchemy
- [ ] Tactic chips: Click to toggle on/off
- [ ] Tactic chips: Multiple tactics OR together
- [ ] Tag chips: Click to toggle on/off
- [ ] Tag chips: Multiple tags OR together
- [ ] Combining search + category + tactics + tags (AND logic)
- [ ] Clear tactics button removes all tactic selections
- [ ] Clear tags button removes all tag selections
- [ ] Active filters display correctly above grid
- [ ] Filters reset page to 1

#### Sorting
- [ ] Sort by "Newest hunts" (id-desc) works
- [ ] Sort by "Oldest hunts" (id-asc) works
- [ ] Sort by "Title A-Z" works
- [ ] Sort by "Title Z-A" works
- [ ] Sorting persists when filtering

#### Pagination
- [ ] Shows correct page info (e.g., "Page 1 of 5")
- [ ] Next button navigates to next page
- [ ] Previous button navigates to previous page
- [ ] Next button disabled on last page
- [ ] Previous button disabled on first page
- [ ] Page size adapts to screen size:
  - [ ] Desktop: 9 hunts per page
  - [ ] Tablet: 6 hunts per page
  - [ ] Mobile: 3 hunts per page
- [ ] Pagination resets to page 1 when filters change

#### Presets
- [ ] Built-in presets appear in dropdown
- [ ] Selecting built-in preset applies correct filters
- [ ] Save preset dialog opens
- [ ] Save preset with name creates custom preset
- [ ] Custom preset appears in dropdown
- [ ] Selecting custom preset applies saved filters
- [ ] Delete preset removes it from dropdown
- [ ] Presets persist after page reload (localStorage)

#### Modal
- [ ] Click hunt card opens modal
- [ ] Modal shows full hunt details:
  - [ ] Title
  - [ ] ID
  - [ ] Category
  - [ ] Tactic
  - [ ] Notes
  - [ ] Why (rationale)
  - [ ] References (links)
  - [ ] Submitter name and link
  - [ ] Tags
- [ ] Close button (X) closes modal
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] Arrow key right navigates to next hunt
- [ ] Arrow key left navigates to previous hunt
- [ ] Modal updates browser URL (e.g., `?hunt=H001`)
- [ ] Browser back button closes modal
- [ ] Direct URL with `?hunt=H001` opens modal on load

#### Chat Widget
- [ ] Widget toggle button opens/closes chat
- [ ] Can type message and send
- [ ] AI responds to questions about hunts
- [ ] Chat history persists during session
- [ ] Widget state (open/closed) persists

#### Intro Stats
- [ ] Total hunts count displays correctly
- [ ] Total tactics count displays correctly
- [ ] Total contributors count displays correctly
- [ ] Stats update if hunt data changes

#### Responsive Design
- [ ] Mobile layout (< 768px):
  - [ ] Single column grid
  - [ ] Filters collapse/expand
  - [ ] Touch-friendly tap targets
- [ ] Tablet layout (768px - 1024px):
  - [ ] 2-column grid
  - [ ] Filters visible
- [ ] Desktop layout (> 1024px):
  - [ ] 3-column grid
  - [ ] Full filters visible

#### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Screen reader labels present (aria-label, alt text)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

#### Performance
- [ ] Initial load time ≤ 2 seconds
- [ ] Search results update quickly (< 300ms)
- [ ] Filter toggles feel instant (< 100ms)
- [ ] No layout shift during load
- [ ] Smooth animations (60fps)

---

### Side-by-Side Testing

**Process**:
1. Open old version: `http://localhost:8000`
2. Open new version: `http://localhost:3000`
3. Perform same action in both
4. Verify identical behavior
5. If different, fix new version

**Test Scenarios**:
```
Scenario 1: Basic search
- Old: Type "persistence" → 23 results
- New: Type "persistence" → Should show 23 results

Scenario 2: Combined filters
- Old: Category=Flames + Tactic=Persistence → 8 results
- New: Same filters → Should show 8 results

Scenario 3: Preset save/load
- Old: Create preset "My Research" → Save → Reload → Load
- New: Same flow → Should restore exact filters

(Continue for all features...)
```

---

### Performance Benchmarks

Measure before (old) and after (new):

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load (FCP) | ≤ 1.5s | DevTools Performance tab |
| Time to Interactive | ≤ 2.5s | DevTools Performance tab |
| Search Debounce Delay | 300ms | Visual feel |
| Filter Toggle Response | < 100ms | Visual feel |
| Total JS Bundle Size | < 300KB | Network tab (gzip) |
| Total CSS Bundle Size | < 50KB | Network tab (gzip) |
| Total Page Size | < 500KB | Network tab (all assets) |

**Acceptance**: New version must be faster or equal, never slower.

---

## Error Handling

### Data Loading Errors

```typescript
// src/main.ts
async function initApp(): Promise<void> {
  try {
    const hunts = await loadHunts();

    if (hunts.length === 0) {
      showError('No hunts found in database');
      return;
    }

    // ... initialize app

  } catch (error) {
    console.error('Failed to initialize app:', error);

    if (error instanceof TypeError) {
      showError('Failed to parse hunt data. The data format may be invalid.');
    } else if (error instanceof Error && error.message.includes('404')) {
      showError('Hunt data file not found. Please contact support.');
    } else {
      showError('Failed to load hunt data. Please refresh the page.');
    }
  }
}
```

### Component Validation

All components validate required DOM elements exist:

```typescript
constructor(state: AppState) {
  this.inputElement = this.getRequiredElement('searchInput', 'input');
  this.clearButton = this.getRequiredElement('clearSearch', 'button');
  // ...
}

private getRequiredElement<T extends HTMLElement>(
  id: string,
  expectedTag?: string
): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(
      `${this.constructor.name}: Required element #${id} not found in DOM`
    );
  }

  if (expectedTag && element.tagName.toLowerCase() !== expectedTag) {
    throw new Error(
      `${this.constructor.name}: Element #${id} should be <${expectedTag}>, ` +
      `found <${element.tagName.toLowerCase()}>`
    );
  }

  return element as T;
}
```

### Global Error Handlers

```typescript
// Catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  // Could send to analytics/logging service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Could send to analytics/logging service
});
```

### User-Friendly Error Messages

```typescript
function showError(message: string): void {
  const container = document.getElementById('huntsGrid') || document.body;

  container.innerHTML = `
    <div class="error-message">
      <h2>⚠️ Something went wrong</h2>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn btn-primary">
        Reload Page
      </button>
      <button onclick="window.history.back()" class="btn btn-ghost">
        Go Back
      </button>
    </div>
  `;

  hideLoading();
}
```

---

## Success Criteria

The migration is successful when **all** of the following are true:

### Feature Parity ✅

- [ ] All items in testing checklist pass
- [ ] No user-facing functionality removed
- [ ] All edge cases handled identically to old version
- [ ] Chat widget works with same AI integration

### Performance ✅

- [ ] Initial load time ≤ old version (measure with DevTools)
- [ ] Search/filter responsiveness ≥ old version
- [ ] Total bundle size < 500KB (gzipped)
- [ ] Lighthouse score ≥ 90 (Performance)

### Code Quality ✅

- [ ] Zero TypeScript errors (`npm run type-check` passes)
- [ ] Zero ESLint errors (`npm run lint` passes)
- [ ] No console errors in browser
- [ ] Code follows consistent patterns

### Browser Compatibility ✅

- [ ] Works on Chrome 90+
- [ ] Works on Firefox 88+
- [ ] Works on Safari 14+
- [ ] Responsive design works on mobile/tablet/desktop

### Deployment ✅

- [ ] GitHub Actions build succeeds
- [ ] Live site works at https://hearth.thorcollective.com
- [ ] Custom domain CNAME configured correctly
- [ ] Google Analytics still tracking page views
- [ ] No broken links or 404 errors

### Maintainability ✅

- [ ] Code is organized into logical modules
- [ ] CSS is split into reusable files
- [ ] Type definitions document data structures
- [ ] Clear separation between state and UI
- [ ] Easy for new developers to understand

### Documentation ✅

- [ ] This design document exists and is accurate
- [ ] README updated with new build instructions
- [ ] Comments explain complex logic
- [ ] TypeScript types serve as inline documentation

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| **Breaking changes during migration** | Medium | High | • Keep old version as reference during development<br>• Systematic feature checklist<br>• Side-by-side testing before cutover<br>• Can roll back to old version if critical issues |
| **Build failures in GitHub Actions** | Low | Medium | • Test workflow in separate branch first<br>• Add build status badge to catch failures fast<br>• Local build testing before push |
| **Performance regression** | Low | Medium | • Benchmark old vs new with DevTools<br>• Vite typically produces faster builds<br>• Lazy load chat widget if needed<br>• Monitor bundle size |
| **Missing edge cases in porting** | Medium | Medium | • Thorough manual testing checklist<br>• Test with real hunt data (current 60+ hunts)<br>• Test extreme cases (0 results, 1000+ hunts)<br>• User acceptance testing |
| **LocalStorage preset data loss** | Low | High | • Detect and migrate old preset format on first load<br>• Version localStorage keys (`hearth.presets.v2`)<br>• Add export/import backup feature |
| **CNAME/custom domain breaks** | Low | High | • Ensure `CNAME` file in `public/` directory<br>• Test domain resolution before merging<br>• Document rollback procedure |
| **TypeScript compilation errors in production** | Very Low | High | • `npm run type-check` in CI before build<br>• Strict TypeScript settings catch issues early<br>• Test production build locally first |
| **Chat widget AI integration breaks** | Medium | Medium | • Port carefully, maintain same API calls<br>• Test with real queries<br>• Fallback to old version if critical |
| **Search debouncing feels different** | Medium | Low | • Match exact debounce delay (300ms)<br>• User testing to verify feels responsive<br>• Adjust if needed based on feedback |
| **Modal keyboard navigation breaks** | Low | Medium | • Test all keyboard shortcuts<br>• Ensure event listeners properly attached<br>• Cross-browser keyboard testing |

### Rollback Plan

If critical issues discovered after deployment:

1. **Immediate**: Revert GitHub Actions workflow to deploy old files
2. **Short-term**: Fix issues in development branch
3. **Long-term**: Redeploy once fixed and tested

```bash
# Emergency rollback (if needed)
git revert <merge-commit-hash>
git push origin main
# Old version redeploys automatically
```

---

## Next Steps

Once this design is approved:

1. **Create feature branch**: `git checkout -b feature/frontend-modernization`
2. **Set up project structure**: Create `src/`, `public/` directories
3. **Initialize dependencies**: `npm init`, install Vite + TypeScript
4. **Follow migration timeline**: Week 1 → Week 2 → Week 3
5. **Test thoroughly**: Complete feature checklist
6. **Create PR**: Single PR with all changes for review
7. **Deploy**: Merge to main, GitHub Actions builds and deploys

---

## Conclusion

This modernization transforms HEARTH's frontend from vanilla JavaScript to a production-ready TypeScript + Vite architecture while maintaining 100% feature parity. The hybrid migration approach balances speed and safety, allowing focused development with the old version as a reference.

**Expected Outcomes**:
- ✅ Improved maintainability through modular architecture
- ✅ Type safety catches bugs at compile time
- ✅ Modern development workflow with hot reload
- ✅ Optimized production builds with code splitting
- ✅ Clear path for future enhancements

**Timeline**: 3 weeks from start to production deployment.

---

**Document History**:
- 2026-01-15: Initial design document created and approved
