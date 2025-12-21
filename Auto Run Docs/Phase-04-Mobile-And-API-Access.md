# Phase 04: Mobile Experience and API Access

Make HEARTH accessible anywhere through mobile optimization and programmatic access via REST API, enabling integration with other security tools and workflows.

## Tasks

- [ ] Create mobile-first CSS refactor in style-mobile.css with responsive breakpoints for tablet and phone
- [ ] Implement hamburger menu navigation for mobile devices replacing horizontal header links
- [ ] Add touch-optimized hunt cards with swipe gestures for next/previous in detail view
- [ ] Create Progressive Web App (PWA) manifest.json with app icons and offline capabilities
- [ ] Add service worker in sw.js for offline caching of hunt database and assets
- [ ] Implement "Install App" prompt for mobile users to add HEARTH to home screen
- [ ] Build compact mobile search interface with slide-up filter panel
- [ ] Create mobile-optimized analytics charts using responsive SVG viewBox
- [ ] Add pull-to-refresh functionality for mobile users to update hunt database
- [ ] Optimize images and assets for mobile bandwidth with lazy loading
- [ ] Create api/ directory for REST API endpoints using GitHub Pages + Functions or Cloudflare Workers
- [ ] Build GET /api/hunts endpoint returning paginated hunt list with query parameters
- [ ] Add GET /api/hunts/{id} endpoint returning single hunt details
- [ ] Create GET /api/search endpoint with full-text search and filtering
- [ ] Implement GET /api/tactics endpoint listing all MITRE ATT&CK tactics with hunt counts
- [ ] Add GET /api/tags endpoint returning all tags with usage statistics
- [ ] Create GET /api/contributors endpoint listing contributor information and stats
- [ ] Build GET /api/stats endpoint providing database-wide analytics and metrics
- [ ] Add API rate limiting and authentication using GitHub tokens for higher limits
- [ ] Create OpenAPI/Swagger documentation at /api/docs describing all endpoints
- [ ] Build API client libraries in Python and JavaScript for easy integration
- [ ] Add webhook support for notifications when new hunts are added
- [ ] Create API usage examples showing integration with Splunk, Elastic, and Jupyter notebooks
- [ ] Build STIX/TAXII export endpoint for threat intelligence platform integration
- [ ] Add CSV/JSON bulk export functionality for all hunts
- [ ] Create sample Splunk app that queries HEARTH API and imports hunts
- [ ] Test mobile interface on iOS Safari, Android Chrome, and tablets
- [ ] Test PWA installs correctly and works offline with cached data
- [ ] Test API endpoints return correct data with proper pagination
- [ ] Verify API documentation is complete and examples work
