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
- [ ] Create `js/notebook-generator.js`
- [ ] Extract Jupyter notebook generation logic
- [ ] Extract download functionality
- [ ] Export `NotebookGenerator` class
- [ ] Add JSDoc documentation

### Extract Preset Manager Module
- [ ] Create `js/preset-manager.js`
- [ ] Extract filter preset save/load logic
- [ ] Extract preset UI management
- [ ] Export `PresetManager` class
- [ ] Add JSDoc documentation

### Extract Pagination Module
- [ ] Create `js/pagination.js`
- [ ] Extract pagination logic (page navigation, items per page, etc.)
- [ ] Export `Pagination` class
- [ ] Add JSDoc documentation

### Extract Utilities Module
- [ ] Create `js/utils.js`
- [ ] Extract shared utility functions (debounce, throttle, etc.)
- [ ] Export individual utility functions
- [ ] Add JSDoc documentation

### Create New Main App
- [ ] Rewrite `app.js` as a thin orchestrator (~200 lines)
- [ ] Import all new modules
- [ ] Initialize components and wire them together
- [ ] Maintain existing public API
- [ ] Add JSDoc documentation

### Update HTML
- [ ] Update `index.html` to import new module structure
- [ ] Add proper script tags with type="module"
- [ ] Ensure proper loading order
- [ ] Update any inline script references

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
