// Submit page TypeScript entry point
import './styles/main.css';
import './styles/pages/submit.css';

const TECHNIQUE_ID_RE = /^T\d{4}(?:\.\d{3})?$/;

document.addEventListener('DOMContentLoaded', () => {
  const techniqueId = readTechniqueParam();
  if (techniqueId) {
    showTechniqueHint(techniqueId);
  }

  const form = document.getElementById('ctiSubmissionForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const ctiUrl = (document.getElementById('ctiUrl') as HTMLInputElement).value;
    const submitterName = (document.getElementById('submitterName') as HTMLInputElement).value;
    const submitterLink = (document.getElementById('submitterLink') as HTMLInputElement).value;

    const repoUrl = 'https://github.com/THORCollective/HEARTH/issues/new';
    const template = 'cti_submission.yml';

    const titlePrefix = techniqueId ? `[gap: ${techniqueId}] ` : '';
    const title = `${titlePrefix}CTI Submission: ${ctiUrl.substring(0, 50)}...`;

    const issueUrl = `${repoUrl}?template=${template}&title=${encodeURIComponent(title)}&cti-source=${encodeURIComponent(ctiUrl)}&submitter-name=${encodeURIComponent(submitterName)}&submitter-link=${encodeURIComponent(submitterLink)}`;

    window.open(issueUrl, '_blank');
  });
});

function readTechniqueParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('technique');
  if (!raw) return null;
  if (!TECHNIQUE_ID_RE.test(raw)) return null;
  return raw;
}

function showTechniqueHint(techniqueId: string): void {
  const hint = document.getElementById('techniqueHint');
  const link = document.getElementById('techniqueHintLink') as HTMLAnchorElement | null;
  if (!hint || !link) return;
  link.textContent = techniqueId;
  link.href = `https://attack.mitre.org/techniques/${techniqueId.replace('.', '/')}/`;
  hint.hidden = false;
}
