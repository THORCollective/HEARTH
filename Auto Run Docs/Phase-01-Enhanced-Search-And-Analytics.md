# Phase 01: Enhanced Search and Analytics Dashboard

Build a working analytics dashboard and improved search functionality to help users discover relevant threat hunting hypotheses more effectively. This phase delivers immediate value by making the existing hunt database more discoverable and providing insights into coverage gaps.

## Tasks

- [x] Create analytics.html page with basic structure and navigation header matching index.html design
- [ ] Add analytics route to app.js to handle /analytics page navigation
- [ ] Create analytics.js module that imports HUNTS_DATA and calculates key metrics (total hunts by category, hunts by tactic distribution, top contributors, tag frequency)
- [ ] Build "Coverage Overview" section in analytics.html showing MITRE ATT&CK tactic coverage as horizontal bar chart using simple SVG or canvas
- [ ] Add "Trending Tags" section displaying top 20 most-used tags as a tag cloud with font sizes proportional to usage
- [ ] Create "Contributor Stats" section showing top 10 contributors with hunt counts and percentage of total
- [ ] Implement "Hunt Timeline" visualization showing hunts added over time by month using a simple line chart
- [ ] Add "Coverage Gaps" section that identifies MITRE ATT&CK tactics with fewer than 3 hunts
- [ ] Create analytics-style.css with chart styling, responsive grid layout, and color scheme matching main HEARTH theme
- [ ] Enhance search functionality in app.js by adding fuzzy matching for typos and partial matches (implement simple Levenshtein distance algorithm)
- [ ] Add search suggestions dropdown that appears when typing, showing top 5 matching hunts, tags, or tactics
- [ ] Implement search history in localStorage that remembers last 10 searches and shows them in dropdown
- [ ] Add "Related Hunts" feature to hunt detail modal showing 3 similar hunts based on shared tags and tactics
- [ ] Create filter preset sharing feature that generates shareable URLs with encoded filter states
- [ ] Add URL parameter parsing to app.js to automatically apply filters from shared links
- [ ] Update index.html to add "Analytics" link in header navigation
- [ ] Test analytics dashboard displays correct metrics for current hunt database
- [ ] Test search suggestions appear and filter correctly as user types
- [ ] Test filter sharing URLs correctly restore filter states when loaded
- [ ] Update README.md to add Analytics Dashboard section under Key Features
