# Phase 03: Advanced Discovery Tools

Implement intelligent recommendation systems, advanced filtering, and discovery tools that help users find exactly what they need even when they don't know what to search for.

## Tasks

- [ ] Create recommendation engine in scripts/generate_recommendations.py using cosine similarity on hunt embeddings
- [ ] Add OpenAI API integration to generate hunt embeddings from title, hypothesis, and tags
- [ ] Build recommendations database in database/recommendations.db storing hunt similarity scores
- [ ] Add "Recommended for You" section to index.html based on user's browsing history (tracked in localStorage)
- [ ] Implement "Hunt Pathways" feature showing logical progression of related hunts (e.g., Initial Access → Persistence → Lateral Movement)
- [ ] Create visual hunt relationship graph using D3.js showing connections between related hunts
- [ ] Add "Attack Chain Builder" tool allowing users to select hunts and create custom detection chain
- [ ] Build export functionality to download selected hunt chain as PDF report
- [ ] Create advanced boolean search supporting operators (AND, OR, NOT) in search input
- [ ] Add "Hunt Difficulty" rating system (Beginner, Intermediate, Advanced) based on data sources and complexity
- [ ] Implement multi-select tag filtering with AND/OR logic toggle
- [ ] Create "Data Source" faceted filter showing required data sources (Windows Events, Network Logs, EDR, etc.)
- [ ] Add "Detection Coverage" calculator showing what percentage of MITRE ATT&CK tactics user's selected hunts cover
- [ ] Build "Hunt Collections" feature allowing users to create and save custom hunt bundles
- [ ] Add collection sharing functionality with unique URLs and optional passwords
- [ ] Create "Similar CTI Reports" section in hunt modals suggesting related threat intelligence articles
- [ ] Implement full-text search using Lunr.js for searching hunt content, not just metadata
- [ ] Add search operators documentation modal explaining advanced search syntax
- [ ] Create "Hunt Comparison" tool allowing side-by-side comparison of up to 3 hunts
- [ ] Build "Missing Coverage" advisor that suggests hunts based on user's current coverage gaps
- [ ] Add natural language search powered by AI (e.g., "show me hunts for ransomware attacks")
- [ ] Create "Weekly Discovery" feature that emails users personalized hunt recommendations
- [ ] Test recommendation engine returns relevant similar hunts
- [ ] Test boolean search correctly filters hunts with complex queries
- [ ] Test hunt collections can be created, saved, and shared via URLs
- [ ] Verify attack chain builder exports well-formatted PDF reports
