import type { GapTechnique } from '../types/Actor';

export function renderGapList(gap: GapTechnique[]): string {
  if (gap.length === 0) {
    return `
      <div class="gap-wrap">
        <div class="gap-head">
          <h3>Coverage <em>gaps</em></h3>
        </div>
        <div class="gap-empty">No gaps. Every technique this actor employs is covered by at least one HEARTH hunt.</div>
      </div>
    `;
  }

  const rows = gap
    .map((g) => {
      const mitreUrl = `https://attack.mitre.org/techniques/${g.id.replace('.', '/')}/`;
      const submitUrl = `submit.html?technique=${encodeURIComponent(g.id)}`;
      return `<div class="gap-row">
        <a class="tid" href="${mitreUrl}" target="_blank" rel="noopener">${escapeHtml(g.id)}</a>
        <span class="tac">${escapeHtml(g.tactic)}</span>
        <a class="cta" href="${submitUrl}">Submit a hunt →</a>
      </div>`;
    })
    .join('');

  return `
    <div class="gap-wrap">
      <div class="gap-head">
        <h3>Coverage <em>gaps</em> · ${gap.length}</h3>
        <span class="hint">Techniques this actor uses with zero matching hunts</span>
      </div>
      <div class="gap-list">${rows}</div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
