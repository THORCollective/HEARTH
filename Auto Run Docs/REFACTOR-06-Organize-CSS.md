# Phase 06: Organize CSS into Components

This phase breaks down the 2,275-line monolithic `style.css` into smaller, component-based stylesheets.

## Current State
- `style.css`: 2,275 lines containing all styles
- Difficult to navigate and maintain
- No clear separation of concerns

## Target Structure
```
css/
├── main.css              (imports all other files)
├── variables.css         (CSS custom properties)
├── reset.css            (normalization/reset)
├── layout.css           (grid, flexbox layouts)
├── typography.css       (fonts, text styles)
├── components/
│   ├── cards.css        (hunt cards)
│   ├── modals.css       (modal dialogs)
│   ├── filters.css      (filter controls)
│   ├── chat-widget.css  (chat interface)
│   ├── buttons.css      (button styles)
│   ├── forms.css        (form inputs)
│   └── navigation.css   (nav, header, footer)
└── utilities.css        (helper classes)
```

## Tasks

### Setup
- [x] Create `css/` directory
- [x] Create `css/components/` subdirectory
- [x] Read current `style.css` to understand organization

### Extract Variables
- [x] Create `css/variables.css`
- [x] Extract all CSS custom properties (--primary-color, etc.)
- [x] Organize by category (colors, spacing, typography, etc.)
- [x] Add comments documenting color schemes

### Extract Reset Styles
- [x] Create `css/reset.css`
- [x] Extract normalization rules (*, html, body reset)
- [x] Extract box-sizing rules
- [x] Add any modern CSS reset improvements

**Notes:** Created comprehensive modern CSS reset including:
  - Universal box-sizing reset for all elements
  - Margin/padding reset for all elements
  - Body normalization with font-smoothing (extracted from style.css:769-777)
  - Responsive media defaults (img, video, etc.)
  - Form element normalization
  - Button, list, heading, and link resets
  - Text rendering improvements
  - Accessibility utility class (.visually-hidden extracted from style.css:779-789)
  - Focus management for keyboard vs mouse interaction

### Extract Layout Styles
- [ ] Create `css/layout.css`
- [ ] Extract grid system styles
- [ ] Extract flexbox layouts
- [ ] Extract container and wrapper styles
- [ ] Extract responsive layout rules

### Extract Typography Styles
- [ ] Create `css/typography.css`
- [ ] Extract font-family declarations
- [ ] Extract heading styles (h1-h6)
- [ ] Extract paragraph and text styles
- [ ] Extract font loading rules

### Extract Component Styles

#### Card Components
- [ ] Create `css/components/cards.css`
- [ ] Extract hunt card styles
- [ ] Extract card layouts and animations
- [ ] Extract hover effects

#### Modal Components
- [ ] Create `css/components/modals.css`
- [ ] Extract modal dialog styles
- [ ] Extract overlay/backdrop styles
- [ ] Extract modal animations

#### Filter Components
- [ ] Create `css/components/filters.css`
- [ ] Extract filter control styles
- [ ] Extract dropdown styles
- [ ] Extract search box styles

#### Chat Widget Components
- [ ] Create `css/components/chat-widget.css`
- [ ] Extract chat interface styles
- [ ] Extract message bubble styles
- [ ] Extract chat input styles

#### Button Components
- [ ] Create `css/components/buttons.css`
- [ ] Extract button base styles
- [ ] Extract button variants (primary, secondary, etc.)
- [ ] Extract button states (hover, active, disabled)

#### Form Components
- [ ] Create `css/components/forms.css`
- [ ] Extract input field styles
- [ ] Extract select dropdown styles
- [ ] Extract checkbox/radio styles

#### Navigation Components
- [ ] Create `css/components/navigation.css`
- [ ] Extract header styles
- [ ] Extract navigation menu styles
- [ ] Extract footer styles

### Extract Utilities
- [ ] Create `css/utilities.css`
- [ ] Extract helper classes (.text-center, .hidden, etc.)
- [ ] Extract spacing utilities
- [ ] Extract display utilities

### Create Main CSS File
- [ ] Create `css/main.css`
- [ ] Add @import statements for all CSS files in proper order:
  - variables.css
  - reset.css
  - typography.css
  - layout.css
  - components/*.css
  - utilities.css
- [ ] Add comments documenting organization

### Update HTML
- [ ] Update `index.html` to link to `css/main.css` instead of `style.css`
- [ ] Update any other HTML files
- [ ] Verify all styles load correctly

### Testing
- [ ] Verify visual appearance matches original
- [ ] Test responsive design on mobile, tablet, desktop
- [ ] Test dark theme
- [ ] Test all interactive components
- [ ] Test on different browsers
- [ ] Verify no broken styles

### Cleanup
- [ ] Remove old `style.css` once new structure is verified
- [ ] Commit changes with message: "refactor: organize CSS into component-based structure"
