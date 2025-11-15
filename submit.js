document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('huntSubmissionForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const issueTitle = `Hunt Submission: ${data.huntTitle}`;

    const issueBody = `
### New Threat Hunt Submission

**Idea / Hypothesis:**
${data.huntTitle}

**Category:**
${data.huntCategory}

**Tactic(s):**
${data.huntTactic}

**Tags:**
${data.huntTags}

---

### Implementation Details

**Notes:**
${data.huntNotes || 'N/A'}

**"Why" Section:**
${data.huntWhy}

**References:**
${data.huntReferences}

---

### Submitter Information

**Submitted by:** ${data.submitterName}
**Profile:** ${data.submitterLink || 'N/A'}
`;

    const encodedTitle = encodeURIComponent(issueTitle);
    const encodedBody = encodeURIComponent(issueBody);
    const githubUrl = `https://github.com/THORCollective/HEARTH/issues/new?title=${encodedTitle}&body=${encodedBody}&labels=hunt-submission`;

    window.open(githubUrl, '_blank');
  });
}); 