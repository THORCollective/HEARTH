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
- [x] Create `css/layout.css`
- [x] Extract grid system styles
- [x] Extract flexbox layouts
- [x] Extract container and wrapper styles
- [x] Extract responsive layout rules

**Notes:** Created comprehensive layout.css file including:
  - Header layout (header-content, logo-link, title-section from style.css:1097-1152)
  - Main layout container (main from style.css:1154-1161)
  - Intro section grid layout (intro-content, intro-highlights from style.css:1181-1193)
  - Controls section layouts (controls, controls-top, search-container from style.css:1268-1417)
  - Stats and filters layouts (stats, active-filters from style.css:1347-1406)
  - Section headers and chip groups (section-header, chip-group from style.css:1484-1516)
  - Hunts grid system (hunts-grid with auto-fill grid from style.css:1622-1710)
  - Pagination layout (pagination from style.css:1805-1845)
  - Responsive breakpoints (@media max-width: 768px from style.css:2062-2122)

### Extract Typography Styles
- [x] Create `css/typography.css`
- [x] Extract font-family declarations
- [x] Extract heading styles (h1-h6)
- [x] Extract paragraph and text styles
- [x] Extract font loading rules

**Notes:** Created comprehensive typography.css file including:
  - Font family declarations for body, chat widget, monospace code (extracted from style.css:774, 39, 1034, 1073, 961)
  - Heading styles (h1 from style.css:1135-1140, h2 from style.css:1239-1242, h3 from style.css:1476-1482, 1997-2004, 2056-2059, and others)
  - Paragraph and text styles (from style.css:1142-1146, 1244-1248, 1967-1971, and others)
  - Font sizing, weights, letter-spacing, and text-transform utilities
  - Text rendering optimizations (extracted from style.css:776)
  - Typography for all major components: titles, labels, buttons, cards, modals, forms
  - Monospace font stack for code elements (Consolas, Monaco, Courier New)
  - Responsive font sizing using clamp() for fluid typography

### Extract Component Styles

#### Card Components
- [x] Create `css/components/cards.css`
- [x] Extract hunt card styles
- [x] Extract card layouts and animations
- [x] Extract hover effects

**Notes:** Created comprehensive cards.css file including:
  - Hunt cards grid system (from style.css:1622-1626)
  - Hunt card base styles with gradient overlay (from style.css:1628-1660)
  - Hunt card hover effects and animations
  - Hunt card header layout and badges (hunt-id, hunt-category from style.css:1662-1686)
  - Hunt title, tactic badges, tags container (from style.css:1688-1718)
  - Hunt submitter info (from style.css:1720-1727)
  - Expandable hunt preview section with smooth animations (from style.css:1729-1788)
  - Preview elements (title, body, links, toggle button)
  - Card footer layout (from style.css:1790-1803)
  - Hunt search result cards for chat widget (from style.css:790-842)
  - Hunt count badge (from style.css:1354)
  - Hunt detail modal content styles (from style.css:1933-2019)
  - Hunt detail header, ID, category, title, tactic, tags
  - Hunt detail why/references sections with special styling
  - JSON data display container styles (from style.css:1017-1028)
  - Light theme overrides for all card components (from style.css:442-465, 467-472, 610-639, 749-753)

#### Modal Components
- [x] Create `css/components/modals.css`
- [x] Extract modal dialog styles
- [x] Extract overlay/backdrop styles
- [x] Extract modal animations

**Notes:** Created comprehensive modals.css file including:
  - Modal overlay/backdrop with blur effect (from style.css:1849-1858)
  - Modal content container with responsive width (from style.css:1860-1872)
  - Close button with hover effects (from style.css:1874-1888)
  - Modal toolbar and navigation controls (from style.css:1890-1895)
  - Modal counter display (from style.css:1897-1902)
  - Modal navigation buttons with disabled states (from style.css:1904-1925)
  - Modal body container layout (from style.css:1927-1931)
  - Light theme overrides for modals, overlays, and notebook modals (from style.css:498-505, 712-723)
  - Responsive mobile styles (from style.css:2118-2121)
  - Documentation noting transitions handled via --transition variable

#### Filter Components
- [x] Create `css/components/filters.css`
- [x] Extract filter control styles
- [x] Extract dropdown styles
- [x] Extract search box styles

**Notes:** Created comprehensive filters.css file including:
  - Search container and input wrapper (from style.css:1285-1323)
  - Search input, icon, and clear button styles (from style.css:1313-1339)
  - Search hints and feedback text (from style.css:1341-1368)
  - Active filters display and chips (from style.css:1370-1406)
  - Quick filter container and labels (from style.css:1415-1426)
  - Filter select dropdowns with custom arrow (from style.css:1428-1444)
  - Toggle advanced filters button (from style.css:1446-1449)
  - Advanced filters panel with open/close animation (from style.css:1451-1469)
  - Advanced filters sections and headings (from style.css:1471-1482)
  - Chip groups and clusters for filter organization (from style.css:1491-1516)
  - Filter chips with selected and hover states (from style.css:1518-1539)
  - Preset actions and rows (from style.css:1599-1613)
  - Light theme overrides for all filter components (from style.css:405-424, 511-537, 660-683, 589-607)

#### Chat Widget Components
- [x] Create `css/components/chat-widget.css`
- [x] Extract chat interface styles
- [x] Extract message bubble styles
- [x] Extract chat input styles

**Notes:** Created comprehensive chat-widget.css file including:
  - Chat widget container with theme variations (forge, ember, frost) and resize corner indicator (from style.css:24-73)
  - Resize handles for right, bottom, and corner resize functionality (from style.css:75-103)
  - Chat header with title, status, presence dot, and controls (from style.css:105-145)
  - Theme switcher palette with color swatches (from style.css:152-177)
  - Header control buttons (size and close buttons) with hover states (from style.css:179-200)
  - Chat messages area with message bubbles for user, bot, and system messages (from style.css:214-276)
  - Quick replies section with hover effects (from style.css:224-246)
  - Chat input container with input field and send button (from style.css:278-322)
  - Chat toggle button with hover animations (from style.css:324-348)
  - Hunt search result cards displayed within chat (from style.css:790-842)
  - Typing indicator animation with dots (from style.css:844-880)
  - Light theme overrides for chat widget and header (from style.css:385-394)
  - Responsive mobile styles for smaller screens (from style.css:350-364)

#### Button Components
- [x] Create `css/components/buttons.css`
- [x] Extract button base styles
- [x] Extract button variants (primary, secondary, etc.)
- [x] Extract button states (hover, active, disabled)

**Notes:** Created comprehensive buttons.css file including:
  - Base button styles (.btn from style.css:1541-1564)
  - Button variants: btn-accent, btn-ghost, btn-chip (from style.css:1566-1597)
  - Legacy button styles: btn-primary, btn-secondary, submit-btn (from style.css:980-1014, 2182-2196)
  - Specialized buttons: clear-btn, close button (from style.css:1325-1339, 1874-1888)
  - Chat widget buttons: chat-size-btn, chat-send-btn, chat-toggle (from style.css:179-200, 302-348)
  - Navigation buttons: pagination-btn, modal-nav-btn, preview-toggle (from style.css:1817-1839, 1904-1925, 1772-1788)
  - All button states: hover, active, disabled, focus
  - Light theme overrides for all buttons (from style.css:477-497, 511-537, 644-658)
  - Responsive mobile styles (from style.css:2106-2108)

#### Form Components
- [x] Create `css/components/forms.css`
- [x] Extract input field styles
- [x] Extract select dropdown styles
- [x] Extract checkbox/radio styles

**Notes:** Created comprehensive forms.css file including:
  - Form group containers and labels (from style.css:2134-2143)
  - Quick filter labels (from style.css:1421-1426)
  - Chat input field with focus states (from style.css:286-300)
  - Search input field (from style.css:1313-1323)
  - Submission form inputs: text, url, email, password, textarea (from style.css:2145-2170)
  - Input focus states with accent color borders
  - Textarea with vertical resize and min-height (from style.css:2177-2180)
  - Filter select dropdowns with custom SVG arrow (from style.css:1428-1444)
  - Preset row filter select (from style.css:1611-1613)
  - Multi-select styling with fixed height (from style.css:2172-2175)
  - Search wrapper container with focus-within states (from style.css:1292-1307)
  - Submission form container (from style.css:2125-2132)
  - Light theme overrides for all form inputs and selects (from style.css:405-419, 589-607)
  - Responsive mobile styles for full-width inputs (from style.css:2103-2108)
  - Note: No explicit checkbox/radio button styles found in style.css; basic form elements rely on browser defaults

#### Navigation Components
- [x] Create `css/components/navigation.css`
- [x] Extract header styles
- [x] Extract navigation menu styles
- [x] Extract footer styles

**Notes:** Created comprehensive navigation.css file including:
  - Header container with sticky positioning and backdrop blur (from style.css:1088-1095)
  - Header content layout with responsive max-width (from style.css:1097-1105)
  - Logo link and logo image with drop shadow (from style.css:1107-1119)
  - Title section with eyebrow, h1, and paragraph (from style.css:1121-1146)
  - Header links container with flex layout (from style.css:1148-1152)
  - Footer with centered text and link styles (from style.css:2210-2225)
  - Light theme overrides for header and header-content (from style.css:396-403)
  - Responsive mobile styles for header layout (from style.css:2063-2072)

### Extract Utilities
- [x] Create `css/utilities.css`
- [x] Extract helper classes (.text-center, .hidden, etc.)
- [x] Extract spacing utilities
- [x] Extract display utilities

**Notes:** Created comprehensive utilities.css file including:
  - Visibility utilities (.visually-hidden, .hidden from style.css:779-789, 346-348)
  - Display state utilities (.open, .is-expanded, .is-open, .is-selected, .is-active from style.css:202-204, 1744-1748, 1465-1469, 1534-1539, 173-177)
  - Interaction state utilities (.chat-resizing from style.css:206-212)
  - Spacing utilities (.active-filters__empty from style.css:1403-1406)
  - Icon utilities (.btn-icon, .search-icon from style.css:1562-1564, 1309-1311)
  - Animation utilities (@keyframes spin, @keyframes typing from style.css:2041-2044, 915-918, 871-880)
  - Text utilities (.hint, .eyebrow from style.css:1799-1803, 1127-1133)
  - Content utilities (.hunt-detail-content from style.css:2006-2010)

### Create Main CSS File
- [x] Create `css/main.css`
- [x] Add @import statements for all CSS files in proper order:
  - variables.css
  - reset.css
  - typography.css
  - layout.css
  - components/*.css
  - utilities.css
- [x] Add comments documenting organization

**Notes:** Created css/main.css with properly ordered @import statements following CSS cascade best practices. Imports are ordered: variables (design tokens) → reset (browser normalization) → typography (base text) → layout (structure) → components (UI modules: cards, modals, filters, chat-widget, buttons, forms, navigation) → utilities (helper classes with highest specificity).

### Update HTML
- [x] Update `index.html` to link to `css/main.css` instead of `style.css`
- [x] Update any other HTML files
- [x] Verify all styles load correctly

**Notes:** Updated all HTML files that referenced style.css to use css/main.css:
  - index.html (main landing page)
  - submit.html (submission options page)
  - analytics.html (analytics dashboard - preserved additional analytics-style.css link)
  - test-chat-widget.html (chat widget test page)
  - test-theme.html and test-refactored-app.html use inline styles and did not need updates

**Verification:** All CSS files are accessible via HTTP server. Confirmed all 13 CSS files exist and are properly structured:
  - Base: variables.css, reset.css, typography.css, layout.css, utilities.css, main.css
  - Components: cards.css, modals.css, filters.css, chat-widget.css, buttons.css, forms.css, navigation.css

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
