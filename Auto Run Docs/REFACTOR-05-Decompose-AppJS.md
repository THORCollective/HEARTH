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
- [ ] Create `js/` directory for modularized JavaScript files
- [ ] Read current `app.js` to understand all functionality

### Extract Hunt Filter Module
- [ ] Create `js/hunt-filter.js`
- [ ] Extract filtering logic (applyFilters, filterHunts, etc.)
- [ ] Extract search functionality
- [ ] Export `HuntFilter` class
- [ ] Add JSDoc documentation

### Extract Hunt Renderer Module
- [ ] Create `js/hunt-renderer.js`
- [ ] Extract rendering logic (renderHuntCards, renderHuntList, etc.)
- [ ] Extract HTML generation functions
- [ ] Export `HuntRenderer` class
- [ ] Add JSDoc documentation

### Extract Modal Manager Module
- [ ] Create `js/modal-manager.js`
- [ ] Extract modal opening/closing logic
- [ ] Extract modal content generation
- [ ] Export `ModalManager` class
- [ ] Add JSDoc documentation

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
