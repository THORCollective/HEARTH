// Submit page TypeScript entry point
import './styles/main.css';
import './styles/pages/submit.css';

import type { Hunt } from './types/Hunt';
import { libraryCounts } from './lib/digest';

const TECHNIQUE_ID_RE = /^T\d{4}(?:\.\d{3})?$/;

document.addEventListener('DOMContentLoaded', () => {
  void showLibraryCounts();
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

// Header pill, e.g. "429 hunts · 309 techniques". Stays hidden if the data
// can't load rather than showing a stale number.
async function showLibraryCounts(): Promise<void> {
  const pill = document.getElementById('library-pill');
  if (!pill) return;
  try {
    const res = await fetch('/hunts-data.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for /hunts-data.json`);
    const { hunts, techniques } = libraryCounts((await res.json()) as Hunt[]);
    pill.textContent = `${hunts} hunts · ${techniques} techniques`;
    pill.hidden = false;
  } catch (err) {
    console.error('[submit] could not load library counts', err);
  }
}
