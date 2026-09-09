# Contributing to HEARTH

Thank you for your interest in contributing to HEARTH! This document provides guidelines for submitting new threat hunting hypotheses.

## 🔥 Submitting a New Hunt

HEARTH offers two ways to submit new hunt hypotheses:

### Option 1: Automated CTI Submission (Recommended)

Our automated system generates threat hunting hypotheses from Cyber Threat Intelligence (CTI):

#### Quick Start

1. **Go to the [HEARTH Issues page](https://github.com/THORCollective/HEARTH/issues)**
2. **Click "New issue"**
3. **Select "🔥 HEARTH CTI Submission"** from the template options
4. **Fill out the form:**
   - **Title**: Use a descriptive name (e.g., "CTI Submission: [Threat Actor Name]")
   - **CTI Content**: Either paste the threat intelligence text directly OR upload a file (PDF, TXT, etc.)
   - **Link to Original Source**: Provide the URL to the original report/article (optional but recommended)
5. **Submit the issue**

#### What Happens Next

Our automated system will:
- Generate a hunt hypothesis from your CTI
- Create a draft pull request with the new hunt
- Add the source link to the references
- Place the hunt in the `Flames/` directory with the next available hunt ID

### Option 2: Manual Hunt Submission

If you prefer to write your own hunt hypothesis from scratch:

1. **Go to the [HEARTH Issues page](https://github.com/THORCollective/HEARTH/issues)**
2. **Click "New issue"**
3. **Select "🔥 HEARTH - Hunt Submission Form"** from the template options
4. **Fill out the hunt template** with your hypothesis, reasoning, and references
5. **Submit the issue**

The hunt will be reviewed and, if approved, added to the appropriate directory.

### Option 3: Open a Pull Request Directly

If you'd rather write the file yourself, add a draft to
[`Incoming/`](../Incoming/README.md) and open a PR.

A draft is a normal hunt file with **no `id:` field** and a descriptive
filename (`artifactory-admin-token.md`, not `H294.md`). When your PR merges,
the next free hunt ID is assigned automatically, the file moves into its
category directory, and a comment on your PR tells you which ID you got.

Don't name a hunt ID yourself. An ID chosen while your PR is open is chosen
against a `main` that keeps moving — two PRs picking the same number collide at
merge and one has to be renumbered by hand. `Incoming/README.md` has the full
format and an example.

### Tips for Better Submissions

- **Be specific**: Include technical details about the threat actor's behavior
- **Include context**: Provide background on the campaign or malware family
- **Cite sources**: Always include links to the original CTI reports
- **Focus on one technique**: Each hunt should target a single MITRE ATT&CK technique

### Review Process

1. For automated submissions: The system creates a draft pull request
2. For manual submissions: The issue is reviewed directly
3. Reviewers will assess the hunt hypothesis
4. Feedback and improvements may be requested
5. Once approved, the hunt is merged into the main repository

## Other Ways to Contribute

- **Review pull requests**: Help improve existing hunt hypotheses
- **Report issues**: Let us know about bugs or improvements needed
- **Suggest enhancements**: Propose new features or workflow improvements
- **Share feedback**: Tell us how HEARTH is being used in your organization

## Questions?

If you have questions about contributing, feel free to:
- Open a general issue in the repository
- Check existing discussions in the Issues section
- Review the [HEARTH documentation](https://github.com/THORCollective/HEARTH)

Thank you for helping make HEARTH better for the threat hunting community! 