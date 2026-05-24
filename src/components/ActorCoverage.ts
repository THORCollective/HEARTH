import type { CoverageSummary, TacticCoverage } from '../types/Actor';

export function renderCoverageStrip(c: CoverageSummary): string {
  const pct = c.actorTechniqueCount === 0 ? '—' : `${c.coveragePercent}<em>%</em>`;
  return `
    <div class="coverage-strip">
      <div class="stat">
        <span class="n">${pct}</span>
        <span class="l">Coverage</span>
      </div>
      <div class="stat">
        <span class="n">${c.matchedHuntCount}</span>
        <span class="l">Matched hunts</span>
      </div>
      <div class="stat">
        <span class="n">${c.techniquesCovered}<em>/${c.actorTechniqueCount}</em></span>
        <span class="l">Techniques covered</span>
      </div>
      <div class="stat">
        <span class="n">${c.gapTechniqueCount}</span>
        <span class="l">Gap techniques</span>
      </div>
    </div>
  `;
}

export function renderTacticHeatmap(cells: TacticCoverage[]): string {
  const nonEmptyCells = cells.filter((c) => c.techniquesUsed > 0).length;
  if (nonEmptyCells === 0) {
    return '';
  }

  const cellsHtml = cells
    .map((cell) => {
      const empty = cell.techniquesUsed === 0;
      const ratio = empty ? 0 : cell.techniquesCovered / cell.techniquesUsed;
      // Ember gradient based on coverage: 0% → faint gray, 100% → ember
      const alpha = empty ? 0 : 0.15 + ratio * 0.55;
      const bg = empty
        ? ''
        : `--cell-bg: oklch(0.50 0.18 300 / ${alpha.toFixed(2)})`;
      const nums = empty
        ? '<span class="nums dim">—</span>'
        : `<span class="nums">${cell.techniquesCovered}<span class="den">/ ${cell.techniquesUsed}</span></span>`;
      return `<div class="tactic-cell ${empty ? 'empty' : 'has'}" style="${bg}">
        <span class="name">${escapeHtml(cell.tactic)}</span>
        ${nums}
      </div>`;
    })
    .join('');

  return `
    <div class="heatmap-wrap">
      <div class="heatmap-head">
        <h3>Coverage by tactic</h3>
        <div class="legend">
          <span>Less</span>
          <span class="swatches">
            <span class="sw" style="background:oklch(0.50 0.18 300 / .15)"></span>
            <span class="sw" style="background:oklch(0.50 0.18 300 / .30)"></span>
            <span class="sw" style="background:oklch(0.50 0.18 300 / .50)"></span>
            <span class="sw" style="background:oklch(0.50 0.18 300 / .70)"></span>
          </span>
          <span>More</span>
        </div>
      </div>
      <div class="heatmap">${cellsHtml}</div>
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
