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
| **🤖 AI-Powered CTI Analysis** | Submit a link to a CTI report, and our system uses **GPT-4** to automatically read, analyze, and draft a complete hunt hypothesis for you. |
| **🛡️ Duplicate Detection** | An AI-powered system analyzes new submissions against the existing database to flag potential duplicates and ensure content quality. |
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
*   **Hosting**:
    *   GitHub Pages

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
