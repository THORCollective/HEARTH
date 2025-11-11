<p align="center">
  <img src="https://github.com/THORCollective/HEARTH/blob/main/Assets/HEARTH-logo.png?raw=true" alt="HEARTH Logo" width="200"/>
  <h1 align="center">🔥 HEARTH: Hunting Exchange and Research Threat Hub 🔥</h1>
  <p align="center">
    A community-driven, AI-powered exchange for threat hunting ideas and methodologies.
    <br />
    <a href="https://thorcollective.github.io/HEARTH/"><strong>Explore the Live Database »</strong></a>
    <br />
    <br />
    <a href="https://github.com/THORCollective/HEARTH/issues/new/choose">Submit a Hunt</a>
    ·
    <a href="https://github.com/THORCollective/HEARTH/issues">Report a Bug</a>
    ·
    <a href="https://github.com/THORCollective/HEARTH/issues">Request a Feature</a>
  </p>
</p>

---

## 📖 About The Project

**HEARTH** (Hunting Exchange and Research Threat Hub) is a centralized, open-source platform for security professionals to share, discover, and collaborate on threat hunting hypotheses. Generating effective and timely hunts is a major challenge, and HEARTH aims to solve it by building a comprehensive, community-curated knowledge base.

Our goal is to create a vibrant ecosystem where hunters can:
- **Discover** new and creative hunting ideas.
- **Contribute** their own research and CTI.
- **Collaborate** with others to refine and improve detection strategies.
- **Automate** the mundane parts of hunt creation and focus on what matters.

This project uses the **[PEAK Threat Hunting Framework](https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html)** to categorize hunts into three types:
- **🔥 Flames**: Hypothesis-driven hunts with clear, testable objectives.
- **🪵 Embers**: Baselining and exploratory analysis to understand an environment.
- **🔮 Alchemy**: Model-assisted and algorithmic approaches to threat detection.

---

## ✨ Key Features

HEARTH is more than just a list of hunts; it's a fully-featured platform with a sophisticated automation backend.

| Feature | Description |
| :--- | :--- |
| **🔍 Interactive UI** | A searchable, filterable, and sortable database of all hunts, making it easy to find exactly what you're looking for. |
| **🤖 AI-Powered CTI Analysis** | Submit a link to a CTI report, and our system uses **Claude Sonnet 4.5** to automatically read, analyze, and draft a complete hunt hypothesis for you. |
| **🌐 Advanced Web Scraping** | Intelligent content extraction supporting Brotli/Zstandard compression, JavaScript-rendered content, and multiple formats (HTML, PDF, DOCX). |
| **🛡️ Duplicate Detection** | AI-powered system analyzes new submissions against the existing database to flag potential duplicates and ensure content quality. **30-60x faster** with SQLite indexing. |
| **⚡ Performance Optimized** | SQLite database index provides lightning-fast queries while keeping markdown files as the source of truth. |
| **⚙️ Automated Workflows** | GitHub Actions manage the entire lifecycle of a submission, from initial draft to final approval, including creating branches and PRs. |
| **🏆 Contributor Leaderboard** | We recognize and celebrate our contributors! An automated system tracks submissions and maintains a public [leaderboard](/Keepers/Contributors.md). |
| **✅ Review & Regeneration Loop** | Maintainers can request a new version of an AI-generated hunt by simply adding a `regenerate` label to the submission issue. |

---

## 🚀 How to Contribute

Contributing to HEARTH is designed to be as easy as possible. We use GitHub Issues as a streamlined submission hub.

### **Option 1: Automated CTI Submission (Recommended)**

Have a link to a great threat intelligence report, blog post, or whitepaper? Let our AI do the heavy lifting.

1.  **[Click here to open a CTI Submission issue](https://github.com/THORCollective/HEARTH/issues/new?assignees=&labels=intel-submission%2C+needs-triage&template=cti_submission.yml&title=%5BCTI%5D+Brief+Description+of+Threat+Intel)**.
2.  Paste the **URL to the CTI source** and provide your name/handle for attribution.
3.  Submit the issue. Our bot will:
    -   Read and analyze the content.
    -   Generate a complete hunt draft.
    -   Check for duplicates.
    -   Post the draft in a new branch and comment on your issue with a link for review.

### **Option 2: Manual Hunt Submission**

If you have a fully-formed hunt idea of your own, you can submit it manually.

1.  **[Click here to open a Manual Hunt Submission issue](https://github.com/THORCollective/HEARTH/issues/new?assignees=&labels=manual-submission%2C+needs-triage&template=hunt_submission_form.yml&title=%5BHunt%5D+Brief+Description+of+Hunt+Idea)**.
2.  Fill out the template with your hypothesis, tactic, references, and other details.
3.  Submit the issue for review by the maintainers.

> [!IMPORTANT]
> All approved submissions are integrated into the HEARTH database and credited to the submitter on our **[Contributors Leaderboard](/Keepers/Contributors.md)**.

---

## 🛠️ Built With

HEARTH combines a simple frontend with a powerful, serverless backend built on GitHub Actions.

*   **Frontend**:
    *   HTML5
    *   CSS3
    *   Vanilla JavaScript
*   **Backend & Automation**:
    *   GitHub Actions
    *   Python
    *   Claude (Anthropic) API and OpenAI API
    *   SQLite (for fast indexing and queries)
*   **Hosting**:
    *   GitHub Pages

---

## 🏗️ Architecture

HEARTH uses a hybrid approach that balances simplicity with performance:

### Hunt Storage
- **Markdown files** in `Flames/`, `Embers/`, and `Alchemy/` are the **source of truth**
- Hunt files remain human-readable and version-controlled
- Easy to browse, edit, and contribute via standard Git workflows

### Database Index
- **SQLite database** (`database/hunts.db`) provides fast querying for duplicate detection
- Automatically updated when hunt files are added, modified, or deleted
- Provides **30-60x faster** duplicate detection in GitHub Actions
- See [database/README.md](database/README.md) for technical details

### CTI Extraction
Our content extraction system handles diverse web sources:
- **Compression Support**: Brotli, Zstandard, and Gzip decompression
- **JavaScript Rendering**: Falls back to readability-lxml for JS-heavy sites
- **Multiple Formats**: HTML, PDF, and DOCX file support
- **Smart Parsing**: Extracts article content from common blog/report structures

### Automation Workflows
- **Duplicate Detection**: Fast similarity analysis using vector embeddings
- **Hunt Generation**: AI-powered draft creation from CTI sources
- **Database Updates**: Automatic index maintenance on file changes
- **Quality Checks**: TTP diversity analysis and content validation

For more details on the technical implementation, see:
- [Database Architecture](database/README.md)
- [Optimization Guide](docs/OPTIMIZATION_GUIDE.md) - Performance improvements and cost reduction strategies
- [Scripts Documentation](scripts/)
- [Workflow Configurations](.github/workflows/)

---

## ⚙️ Configuration

For maintainers and self-hosted instances, HEARTH can be configured using environment variables.

### Environment Variables

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | AI provider to use for hunt generation (`claude` or `openai`) | `claude` | No |
| `ANTHROPIC_API_KEY` | API key for Claude (required if using Claude) | - | Yes (for Claude) |
| `OPENAI_API_KEY` | API key for OpenAI (required if using OpenAI) | - | Yes (for OpenAI) |
| `CLAUDE_MODEL` | Specific Claude model version to use | `claude-sonnet-4-5-20250929` | No |

### GitHub Actions Configuration

When running in GitHub Actions, these variables should be set as:
- **Repository Secrets**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `HEARTH_TOKEN`
- **Repository Variables**: `AI_PROVIDER`, `CLAUDE_MODEL` (optional)

To update the Claude model version, you can either:
1. Set the `CLAUDE_MODEL` repository variable in GitHub Settings
2. Update the default value in [scripts/generate_from_cti.py](scripts/generate_from_cti.py)

---

## 🔧 Troubleshooting

### CTI Submission Issues

**Problem**: "Failed to retrieve or process content from the URL"
- **Solution**: Verify the URL is correct and publicly accessible
- Check if the article requires authentication or is behind a paywall
- Try submitting the content manually instead of via URL

**Problem**: Content appears garbled or incomplete
- **Solution**: This has been fixed! Ensure you're using the latest version of HEARTH
- The system now supports Brotli and Zstandard compression
- If issues persist, try the manual submission workflow

### Database Issues

**Problem**: Duplicate detection is slow or failing
- **Solution**: The database is automatically rebuilt on file changes
- Maintainers can manually rebuild: `python scripts/build_hunt_database.py --rebuild`
- Check [database/README.md](database/README.md) for more troubleshooting

**Problem**: Database appears out of sync
- **Solution**: Database auto-updates via GitHub Actions on every merge to main
- For local testing, run: `python scripts/build_hunt_database.py`

### General Issues

For other issues or questions:
1. Check existing [GitHub Issues](https://github.com/THORCollective/HEARTH/issues)
2. Search the [database documentation](database/README.md)
3. [Open a new issue](https://github.com/THORCollective/HEARTH/issues/new) with details

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ❤️ Acknowledgements

This project is made possible by the security community and our amazing contributors.

**Project Maintainers:**
- Lauren Proehl ([@jotunvillur](https://x.com/jotunvillur))
- Sydney Marrone ([@letswastetime](https://x.com/letswastetime))
- John Grageda ([@AngryInfoSecGuy](https://x.com/AngryInfoSecGuy))

<p align="center">
  🔥 **Keep the HEARTH burning!** 🔥
</p>
