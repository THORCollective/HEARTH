# Phase 05: Decompose app.js into Modules

This phase breaks down the 1,855-line monolithic `app.js` into smaller, focused modules.

## Current State
- `app.js`: 1,855 lines containing all application logic
- Single `HearthApp` class handling too many responsibilities
- Difficult to maintain, test, and understand

## Target Structure
```
js/
├── app.js                  (~200 lines - main orchestrator)
├── hunt-filter.js          (filtering/search logic)
├── hunt-renderer.js        (display/rendering logic)
├── modal-manager.js        (modal handling)
├── notebook-generator.js   (Jupyter notebook generation)
├── preset-manager.js       (filter preset management)
├── pagination.js           (pagination logic)
└── utils.js                (shared utilities)
```

## Tasks

### Setup
- [x] Create `js/` directory for modularized JavaScript files
- [x] Read current `app.js` to understand all functionality

### Extract Hunt Filter Module
- [x] Create `js/hunt-filter.js`
- [x] Extract filtering logic (applyFilters, filterHunts, etc.)
- [x] Extract search functionality
- [x] Export `HuntFilter` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `HuntFilter` class with all filtering logic
- Includes text search across multiple fields (id, title, tactic, notes, tags, submitter)
- Supports category, tactic (multi-select), and tag (multi-select) filtering
- Implements search result caching for performance optimization
- Added complete JSDoc documentation for all public methods
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/hunt-filter.js`

### Extract Hunt Renderer Module
- [x] Create `js/hunt-renderer.js`
- [x] Extract rendering logic (renderHuntCards, renderHuntList, etc.)
- [x] Extract HTML generation functions
- [x] Export `HuntRenderer` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `HuntRenderer` class with all rendering and display logic
- Includes hunt card generation with preview toggles and accessibility features
- Supports tactic chip grouping and tag chip rendering
- Handles active filter display with removable filter chips
- Implements search feedback and performance metrics display
- Provides intro statistics rendering (total hunts, tactics, contributors)
- Uses callback pattern for integration with main app (onCardClick, onFilterClear, onChipToggle)
- Added complete JSDoc documentation for all public methods
- Maintains separation of concerns: rendering only, no filtering or data manipulation
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/hunt-renderer.js`

### Extract Modal Manager Module
- [x] Create `js/modal-manager.js`
- [x] Extract modal opening/closing logic
- [x] Extract modal content generation
- [x] Export `ModalManager` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `ModalManager` class with all modal dialog functionality
- Includes modal creation with toolbar (prev/next navigation, counter)
- Supports keyboard navigation (Escape to close, Arrow keys to navigate)
- Handles modal open/close with body scroll management
- Generates hunt detail content (header, sections, footer)
- Implements hunt detail sections: tactic, notes, tags, submitter, why, references
- Provides navigation between hunts in modal view
- Uses callback pattern for integration with main app
- Added complete JSDoc documentation for all public methods
- Maintains separation of concerns: modal management only, no filtering or data manipulation
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/modal-manager.js`

### Extract Notebook Generator Module
- [x] Create `js/notebook-generator.js`
- [x] Extract Jupyter notebook generation logic
- [x] Extract download functionality
- [x] Export `NotebookGenerator` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `NotebookGenerator` class with all Jupyter notebook generation functionality
- Includes PEAK framework structure (Prepare, Execute, Act with Knowledge)
- Generates complete notebooks with hunt metadata, hypothesis, and analysis templates
- Supports notebook download as .ipynb files with proper MIME type
- Implements JSON data export for advanced notebook generation tools
- Provides clipboard copy functionality with visual feedback
- Uses async/await pattern for notebook generation workflow
- Includes extensive helper methods for creating notebook cells (markdown and code)
- Added complete JSDoc documentation for all public and private methods
- Maintains separation of concerns: notebook generation only, no filtering or data manipulation
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/notebook-generator.js`

### Extract Preset Manager Module
- [x] Create `js/preset-manager.js`
- [x] Extract filter preset save/load logic
- [x] Extract preset UI management
- [x] Export `PresetManager` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `PresetManager` class with all filter preset functionality
- Includes built-in presets (Baseline sweeps, Exfil & C2 watchlist)
- Supports custom preset creation, saving, and deletion
- Implements localStorage persistence for custom presets
- Provides preset application with callback pattern for filter updates
- Includes chip selection synchronization for tactics and tags
- Prevents deletion of built-in presets with validation
- Added complete JSDoc documentation for all public methods
- Maintains separation of concerns: preset management only, no direct filtering
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/preset-manager.js`

### Extract Pagination Module
- [x] Create `js/pagination.js`
- [x] Extract pagination logic (page navigation, items per page, etc.)
- [x] Export `Pagination` class
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive `Pagination` class with all pagination functionality
- Includes responsive page size calculation based on viewport width (6/8/9 items for mobile/tablet/desktop)
- Supports page navigation (next, prev, changePage) with validation
- Implements total item tracking with page preservation options
- Provides pagination info formatting for display (e.g., "Showing 1-9 of 42 hunts")
- Includes helper methods: getPageItems, shouldShowPagination, isPrevDisabled, isNextDisabled
- Handles window resize events to update page size dynamically
- Uses callback pattern for integration with main app (onPageChange)
- Added complete JSDoc documentation for all public methods
- Maintains separation of concerns: pagination logic only, no rendering or data manipulation
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/pagination.js`

### Extract Utilities Module
- [x] Create `js/utils.js`
- [x] Extract shared utility functions (debounce, throttle, etc.)
- [x] Export individual utility functions
- [x] Add JSDoc documentation

**Implementation Notes:**
- Created comprehensive utility module with shared helper functions
- Includes number formatting with `formatNumber()` using Intl.NumberFormat
- Provides data extraction utilities: `getUniqueValues()`, `getHuntTactics()`
- Implements tactic grouping: `groupTactics()`, `resolveTacticGroup()` with configurable grouping
- Adds performance utilities: `debounce()`, `throttle()`, `getNow()`
- Includes DOM helpers: `validateElements()` for element validation
- Provides data utilities: `sanitizeHtml()`, `deepClone()`, `isEmpty()`
- Added complete JSDoc documentation for all exported functions
- All functions are exported as ES modules for clean imports
- Location: `/Users/sydney/code/07-other-projects/HEARTH/js/utils.js`

### Create New Main App
- [x] Rewrite `app.js` as a thin orchestrator (~200 lines)
- [x] Import all new modules
- [x] Initialize components and wire them together
- [x] Maintain existing public API
- [x] Add JSDoc documentation

**Implementation Notes:**
- Reduced app.js from 1,856 lines to 448 lines (76% reduction!)
- Created clean orchestrator pattern using all modular components
- Imports: HuntFilter, HuntRenderer, ModalManager, NotebookGenerator, PresetManager, Pagination, Utils
- Component initialization in `initializeModules()` with proper callback wiring
- Event listeners properly delegated to modules via callbacks
- Maintains backward compatibility with existing `window.generateNotebook()` global function
- Full JSDoc documentation for all methods
- Clean separation of concerns: orchestrator only coordinates, modules handle specifics
- Location: `/Users/sydney/code/07-other-projects/HEARTH/app.js`

### Update HTML
- [x] Update `index.html` to import new module structure
- [x] Add proper script tags with type="module"
- [x] Ensure proper loading order
- [x] Update any inline script references

**Implementation Notes:**
- Updated app.js script tag to use `type="module"` for ES6 module support
- Maintained loading order: hunts-data.js → app.js (module) → chat-widget.js
- No inline script changes needed (generateNotebook remains globally accessible)
- Location: `/Users/sydney/code/07-other-projects/HEARTH/index.html:167`

### Testing
- [ ] Verify application still functions correctly
- [ ] Test all filtering operations
- [ ] Test modal functionality
- [ ] Test preset save/load
- [ ] Test notebook generation
- [ ] Test pagination
- [ ] Test on different browsers

### Cleanup
- [ ] Remove old monolithic `app.js` once new structure is verified
- [ ] Commit changes with message: "refactor: decompose app.js into focused modules"
