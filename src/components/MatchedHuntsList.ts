import type { MatchedHunt } from '../types/Actor';

const CATEGORY_BADGE: Record<string, string> = {
  Flames: 'f',
  Embers: 'e',
  Alchemy: 'a',
};

export function renderMatchedHunts(actorLabel: string, matches: MatchedHunt[]): string {
  if (matches.length === 0) {
    return `
      <div class="matched-wrap">
        <div class="matched-head">
          <h3>Matched <em>hunts</em></h3>
        </div>
        <div class="matched-empty">
          No HEARTH hunts cover <b>${escapeHtml(actorLabel)}</b> yet. Want to be the first?
          <a class="btn primary" href="submit.html" style="margin-left:12px">Submit a hunt →</a>
        </div>
      </div>
    `;
  }

  const rows = matches
    .map((m) => {
      const h = m.hunt;
      const peakKey = CATEGORY_BADGE[h.category] ?? '';
      const techniqueCell = (h.techniques ?? []).slice(0, 3).join(', ') || '—';
      const reasonChips = m.reasons
        .map((r) =>
          r === 'TECH'
            ? `<span class="reason tech" title="Shares ${m.sharedTechniques.length} technique${m.sharedTechniques.length === 1 ? '' : 's'} with this actor">TECH ${m.sharedTechniques.length}</span>`
            : `<span class="reason mention" title="Actor name or alias mentioned in hunt prose">MENTION</span>`,
        )
        .join('');
      const tactic = h.tactic ? h.tactic.split(',')[0].trim() : '';
      const huntUrl = `index.html?hunt=${encodeURIComponent(h.id)}`;
      return `<a class="lib-row" href="${escapeAttr(huntUrl)}">
        <div class="name">${escapeHtml(h.title)}</div>
        <div class="c-peak"><span class="badge ${peakKey}">${escapeHtml(h.category)}</span></div>
        <div class="c-tech cell">${escapeHtml(techniqueCell)}</div>
        <div class="c-tac cell">${escapeHtml(tactic)}</div>
        <div class="reasons">${reasonChips}</div>
        <div class="arrow">→</div>
      </a>`;
    })
    .join('');

  return `
    <div class="matched-wrap">
      <div class="matched-head">
        <h3>Matched <em>hunts</em> · ${matches.length}</h3>
        <span class="hint">TECH = shared MITRE technique · MENTION = actor named in hunt prose</span>
      </div>
      <div class="lib">
        <div class="lib-head">
          <div>Hypothesis</div>
          <div class="h-peak">Category</div>
          <div class="h-tech">Techniques</div>
          <div class="h-tac">Tactic</div>
          <div>Match</div>
          <div></div>
        </div>
        ${rows}
      </div>
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

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
