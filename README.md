<p align="center">
  <img src="https://github.com/THORCollective/HEARTH/blob/main/Assets/HEARTH-logo.png?raw=true" alt="HEARTH Logo" width="200"/>
  <h1 align="center">HEARTH: Hunting Exchange and Research Threat Hub</h1>
  <p align="center">
    An open-source community library of threat hunting hypotheses, powered by the PEAK framework and AI.
    <br />
    Built by <a href="https://github.com/THORCollective"><strong>THE THOR Collective</strong></a>
  </p>
  <p align="center">
    <a href="https://thorcollective.github.io/HEARTH/"><img src="https://img.shields.io/badge/Live_Database-Explore_Hunts-FF6B35?style=for-the-badge&logo=firefox-browser&logoColor=white" alt="Explore the Live Database" /></a>
  </p>
  <p align="center">
    <a href="https://github.com/THORCollective/HEARTH/blob/main/LICENSE"><img src="https://img.shields.io/github/license/THORCollective/HEARTH?style=flat-square" alt="License" /></a>
    <a href="/Keepers/Contributors.md"><img src="https://img.shields.io/badge/contributors-29+-blue?style=flat-square" alt="Contributors" /></a>
    <a href="https://github.com/THORCollective/HEARTH/issues"><img src="https://img.shields.io/github/issues/THORCollective/HEARTH?style=flat-square" alt="Issues" /></a>
  </p>
  <p align="center">
    <a href="https://thorcollective.github.io/HEARTH/">Explore the Database</a>
    &middot;
    <a href="https://github.com/THORCollective/HEARTH/issues/new/choose">Submit a Hunt</a>
    &middot;
    <a href="https://github.com/THORCollective/HEARTH/issues">Report a Bug</a>
    &middot;
    <a href="https://github.com/THORCollective/HEARTH/issues">Request a Feature</a>
  </p>
</p>

---

## What is HEARTH?

Generating effective, timely threat hunts is hard. You're staring at logs wondering where to start, or you're reading CTI reports and thinking *"someone should hunt for this"* — but writing up the hypothesis takes time you don't have.

**HEARTH is a community-curated library of 130+ threat hunting hypotheses** that security teams can use, adapt, and build on. Submit a CTI link and our AI pipeline drafts a complete hunt hypothesis for you. Or browse what others have shared, fork what works, and contribute back.

Every hunt is categorized using the **[PEAK Threat Hunting Framework](https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html)**, giving you structured, actionable starting points — not vague ideas.

---

## The PEAK Framework

HEARTH organizes hunts into three categories based on the PEAK framework. Each serves a different hunting approach:

### 🔥 Flames — Hypothesis-Driven Hunts (100+)

Classic threat hunting. You have a specific theory about adversary behavior and you go looking for evidence. *"An adversary is using DLL side-loading to maintain persistence via a legitimate application."*

### 🪵 Embers — Baselining & Exploration (17)

Understand your environment before the bad stuff happens. Establish baselines, find anomalies, and discover what "normal" looks like so you can spot what isn't.

### 🔮 Alchemy — Model-Assisted Detection (14)

Algorithmic and ML-powered approaches. Statistical analysis, clustering, and other techniques that let the data surface threats you might not think to look for.

> **[Browse all hunts in the live database &rarr;](https://thorcollective.github.io/HEARTH/)**

---

## Contribute a Hunt

We've made contributing as frictionless as possible. Two paths:

### AI-Powered CTI Submission *(Recommended)*

Have a great threat intel report? Paste the URL and let our AI pipeline do the work.

1. **[Open a CTI Submission &rarr;](https://github.com/THORCollective/HEARTH/issues/new?assignees=&labels=intel-submission%2C+needs-triage&template=cti_submission.yml&title=%5BCTI%5D+Brief+Description+of+Threat+Intel)**
2. Paste the URL and your name for attribution.
3. Our bot reads the report, drafts a hunt, checks for duplicates, and opens a PR for review.

### Manual Hunt Submission

Already have a hypothesis? Submit it directly.

1. **[Open a Manual Submission &rarr;](https://github.com/THORCollective/HEARTH/issues/new?assignees=&labels=manual-submission%2C+needs-triage&template=hunt_submission_form.yml&title=%5BHunt%5D+Brief+Description+of+Hunt+Idea)**
2. Fill out the template with your hypothesis, tactic, and references.
3. Maintainers review and merge.

> All approved submissions are credited on the **[Contributors Leaderboard](/Keepers/Contributors.md)**.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Interactive Database** | [Searchable, filterable, sortable](https://thorcollective.github.io/HEARTH/) interface for all hunts. Find what you need fast. |
| **AI-Powered CTI Analysis** | Submit a CTI link — **Claude** reads, analyzes, and drafts a complete hunt hypothesis automatically. |
| **MITRE ATT&CK Integration** | Validates technique IDs against the full Enterprise framework (691 techniques, 99% accuracy). |
| **Duplicate Detection** | AI-powered similarity analysis flags potential duplicates before they're merged. 30-60x faster with SQLite indexing. |
| **Automated Workflows** | GitHub Actions manage the full submission lifecycle — from draft to PR to merge. |
| **Review & Regeneration** | Maintainers can re-roll AI-generated hunts by adding a `regenerate` label — iterate until it's right. |
| **Contributor Leaderboard** | [Automated tracking](/Keepers/Contributors.md) of submissions. We celebrate our community. |

---

<details>
<summary><strong>Architecture</strong></summary>

### Hunt Storage
- **Markdown files** in `Flames/`, `Embers/`, and `Alchemy/` are the **source of truth**
- Human-readable, version-controlled, and easy to contribute via standard Git workflows
- **Hunt schema:** Every hunt file uses YAML frontmatter — see [docs/HUNT-SCHEMA.md](docs/HUNT-SCHEMA.md).

### Database Index
- **SQLite database** (`database/hunts.db`) provides fast querying for duplicate detection
- Automatically updated when hunt files change
- **30-60x faster** duplicate detection in GitHub Actions
- See [database/README.md](database/README.md) for details

### CTI Extraction
- **Compression**: Brotli, Zstandard, and Gzip
- **JS Rendering**: Falls back to readability-lxml for JS-heavy sites
- **Formats**: HTML, PDF, and DOCX
- **Smart Parsing**: Extracts article content from common blog/report structures

### MITRE ATT&CK Integration
- **691 Techniques**: Complete Enterprise ATT&CK framework indexed
- **Real-time Validation**: Technique IDs validated against MITRE data
- **Confidence Scoring**: Multi-tier fallback (MITRE → table → keywords)

### Automation Workflows
- Duplicate detection via vector embeddings
- AI-powered hunt generation from CTI sources
- Automatic database maintenance on file changes
- TTP diversity analysis and content validation

**Further reading:**
[Database Architecture](database/README.md) · [Optimization Guide](docs/OPTIMIZATION_GUIDE.md) · [Testing Guide](docs/TESTING_GUIDE.md) · [Scripts](scripts/) · [Workflows](.github/workflows/)

</details>

<details>
<summary><strong>Built With</strong></summary>

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend & Automation**: GitHub Actions, Python, Claude (Anthropic) API, OpenAI API, SQLite
- **Hosting**: GitHub Pages

</details>

<details>
<summary><strong>Configuration</strong></summary>

For maintainers and self-hosted instances, HEARTH is configured via environment variables.

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | AI provider (`claude` or `openai`) | `claude` | No |
| `ANTHROPIC_API_KEY` | API key for Claude | - | Yes (for Claude) |
| `OPENAI_API_KEY` | API key for OpenAI | - | Yes (for OpenAI) |
| `CLAUDE_MODEL` | Claude model version | `claude-sonnet-4-5-20250929` | No |

**GitHub Actions setup:** Set `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, and `HEARTH_TOKEN` as **Repository Secrets**. Optionally set `AI_PROVIDER` and `CLAUDE_MODEL` as **Repository Variables**.

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

**"Failed to retrieve or process content from the URL"**
- Verify the URL is correct and publicly accessible
- Check if the article requires authentication or is behind a paywall
- Try submitting content manually instead

**Content appears garbled or incomplete**
- The system now supports Brotli and Zstandard compression
- If issues persist, try the manual submission workflow

**Duplicate detection is slow or failing**
- Database auto-rebuilds on file changes
- Maintainers can manually rebuild: `python scripts/build_hunt_database.py --rebuild`
- See [database/README.md](database/README.md)

**Database appears out of sync**
- Auto-updates via GitHub Actions on every merge to main
- For local testing: `python scripts/build_hunt_database.py`

For other issues, check [existing issues](https://github.com/THORCollective/HEARTH/issues) or [open a new one](https://github.com/THORCollective/HEARTH/issues/new).

</details>

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## Acknowledgements

HEARTH is a project of **THE THOR Collective**, co-founded and maintained by:

- **Lauren Proehl** ([@jotunvillur](https://x.com/jotunvillur))
- **Sydney Marrone** ([@letswastetime](https://x.com/letswastetime))
- **John Grageda** ([@AngryInfoSecGuy](https://x.com/AngryInfoSecGuy))

Built by the security community. See the full **[Contributors Leaderboard](/Keepers/Contributors.md)** for everyone who has contributed hunts.

<p align="center">
  <strong>Keep the HEARTH burning.</strong>
</p>
