import type { TacticCoverage, TacticTechnique } from '../lib/coverage';

export interface TacticPanelData {
  tactic: TacticCoverage;
  onTechniqueClick: (techniqueId: string) => void;
}

interface ParentRow {
  parent: TacticTechnique;
  subCount: number;
  aggregateCount: number;
  subTechniqueCount: number;
}

/** Drawer content for a tactic: parent techniques only, with sub-counts aggregated in. */
export function renderTacticPanel(data: TacticPanelData): DocumentFragment {
  const { tactic, onTechniqueClick } = data;
  const frag = document.createDocumentFragment();

  const header = el('div', 'tp-header');
  const eyebrow = el('div', 'tp-id');
  eyebrow.textContent = 'TACTIC';
  const title = el('h2', 'tp-title');
  title.textContent = tactic.name;
  header.appendChild(eyebrow);
  header.appendChild(title);
  frag.appendChild(header);

  const rows = buildParentRows(tactic.techniques);

  const meta = el('div', 'tp-meta');
  meta.appendChild(chip('tp-chip tp-chip--count', `${tactic.huntCount} ${tactic.huntCount === 1 ? 'hunt' : 'hunts'}`));
  meta.appendChild(chip('tp-chip', `${tactic.coveredTechniqueCount} / ${tactic.techniqueCount} techniques covered`));
  frag.appendChild(meta);

  const section = el('div', 'tp-hunts-section');
  const sectionTitle = el('h3', 'tp-section-title');
  sectionTitle.textContent = `Top-level techniques (${rows.length})`;
  section.appendChild(sectionTitle);

  const list = el('div', 'tg-technique-list');
  if (rows.length === 0) {
    const empty = el('p', 'tg-empty-note');
    empty.textContent = 'No techniques in this tactic carry HEARTH hunts yet.';
    list.appendChild(empty);
  } else {
    const maxAgg = rows.reduce((m, r) => Math.max(m, r.aggregateCount), 0);
    for (const row of rows) {
      list.appendChild(renderTechniqueRow(row, maxAgg, onTechniqueClick));
    }
  }
  section.appendChild(list);

  const note = el('p', 'tg-subtech-note');
  note.textContent = 'Subtechniques are folded into their parent. Open the Technique view to see them individually.';
  section.appendChild(note);

  frag.appendChild(section);
  return frag;
}

/**
 * Collapse the tactic's technique list into parent rows.
 * Each parent row's count = parent's direct hunt count + sum of its subtechniques' hunt counts.
 * (May overcount when a hunt references both a parent and one of its subs; that's rare and tolerable.)
 */
function buildParentRows(techniques: TacticTechnique[]): ParentRow[] {
  const parentMap = new Map<string, ParentRow>();
  const subsByParent = new Map<string, TacticTechnique[]>();

  for (const t of techniques) {
    if (t.is_subtechnique && t.parent) {
      const arr = subsByParent.get(t.parent) ?? [];
      arr.push(t);
      subsByParent.set(t.parent, arr);
    } else if (!t.is_subtechnique) {
      parentMap.set(t.id, {
        parent: t,
        subCount: 0,
        aggregateCount: t.count,
        subTechniqueCount: 0,
      });
    }
  }

  for (const [parentId, subs] of subsByParent) {
    let row = parentMap.get(parentId);
    if (!row) {
      // Parent isn't listed in this tactic (rare); synthesize a row so its subs aren't dropped.
      row = {
        parent: { id: parentId, name: parentId, count: 0, is_subtechnique: false, parent: null },
        subCount: 0,
        aggregateCount: 0,
        subTechniqueCount: 0,
      };
      parentMap.set(parentId, row);
    }
    for (const sub of subs) {
      row.subCount += sub.count;
      row.aggregateCount += sub.count;
      row.subTechniqueCount += 1;
    }
  }

  const rows = Array.from(parentMap.values());
  rows.sort((a, b) => b.aggregateCount - a.aggregateCount || a.parent.id.localeCompare(b.parent.id));
  return rows;
}

function renderTechniqueRow(
  row: ParentRow,
  maxCount: number,
  onTechniqueClick: (id: string) => void,
): HTMLButtonElement {
  const { parent, aggregateCount, subTechniqueCount } = row;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `tg-technique${aggregateCount === 0 ? ' tg-technique--gap' : ''}`;
  const intensity = maxCount > 0 ? aggregateCount / maxCount : 0;
  btn.style.setProperty('--intensity', intensity.toFixed(3));

  const idSpan = el('span', 'tg-technique-id');
  idSpan.textContent = parent.id;

  const nameSpan = el('span', 'tg-technique-name');
  nameSpan.textContent = parent.name;
  if (subTechniqueCount > 0) {
    const subNote = el('span', 'tg-technique-subnote');
    subNote.textContent = ` · +${subTechniqueCount} sub${subTechniqueCount === 1 ? '' : 's'}`;
    nameSpan.appendChild(subNote);
  }

  const countSpan = el('span', 'tg-technique-count');
  countSpan.textContent = aggregateCount === 0
    ? 'gap'
    : `${aggregateCount} ${aggregateCount === 1 ? 'hunt' : 'hunts'}`;

  btn.appendChild(idSpan);
  btn.appendChild(nameSpan);
  btn.appendChild(countSpan);
  btn.addEventListener('click', () => onTechniqueClick(parent.id));

  return btn;
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function chip(className: string, text: string): HTMLElement {
  const c = el('span', className);
  c.textContent = text;
  return c;
}
