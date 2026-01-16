// Submit page TypeScript entry point
import './styles/main.css';
import './styles/pages/submit.css';

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ctiSubmissionForm') as HTMLFormElement;

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const ctiUrl = (document.getElementById('ctiUrl') as HTMLInputElement).value;
      const submitterName = (document.getElementById('submitterName') as HTMLInputElement).value;
      const submitterLink = (document.getElementById('submitterLink') as HTMLInputElement).value;

      const repoUrl = 'https://github.com/THORCollective/HEARTH/issues/new';
      const template = 'cti_submission.yml';

      const title = `CTI Submission: ${ctiUrl.substring(0, 50)}...`;

      const issueUrl = `${repoUrl}?template=${template}&title=${encodeURIComponent(title)}&cti-source=${encodeURIComponent(ctiUrl)}&submitter-name=${encodeURIComponent(submitterName)}&submitter-link=${encodeURIComponent(submitterLink)}`;

      window.open(issueUrl, '_blank');
    });
  }
});
