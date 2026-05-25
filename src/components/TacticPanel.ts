import type { TacticCoverage } from '../lib/coverage';

export interface TacticPanelData {
  tactic: TacticCoverage;
  onTechniqueClick: (techniqueId: string) => void;
}

/** Drawer content for a selected tactic: techniques in the tactic, each clickable to open the technique drawer. */
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

  const meta = el('div', 'tp-meta');
  meta.appendChild(chip('tp-chip tp-chip--count', `${tactic.huntCount} ${tactic.huntCount === 1 ? 'hunt' : 'hunts'}`));
  meta.appendChild(chip('tp-chip', `${tactic.coveredTechniqueCount} / ${tactic.techniqueCount} techniques covered`));
  frag.appendChild(meta);

  const section = el('div', 'tp-hunts-section');
  const sectionTitle = el('h3', 'tp-section-title');
  sectionTitle.textContent = `Techniques (${tactic.techniqueCount})`;
  section.appendChild(sectionTitle);

  const list = el('div', 'tg-technique-list');
  if (tactic.techniques.length === 0) {
    const empty = el('p', 'tg-empty-note');
    empty.textContent = 'No techniques in this tactic carry HEARTH hunts yet.';
    list.appendChild(empty);
  } else {
    for (const tech of tactic.techniques) {
      list.appendChild(renderTechniqueRow(tech, onTechniqueClick));
    }
  }
  section.appendChild(list);
  frag.appendChild(section);

  return frag;
}

function renderTechniqueRow(
  tech: { id: string; name: string; count: number; is_subtechnique: boolean },
  onTechniqueClick: (id: string) => void,
): HTMLButtonElement {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = `tg-technique${tech.is_subtechnique ? ' tg-technique--sub' : ''}${tech.count === 0 ? ' tg-technique--gap' : ''}`;

  const idSpan = el('span', 'tg-technique-id');
  idSpan.textContent = tech.id;
  const nameSpan = el('span', 'tg-technique-name');
  nameSpan.textContent = tech.name;
  const countSpan = el('span', 'tg-technique-count');
  const label = tech.count === 0 ? 'gap' : `${tech.count} ${tech.count === 1 ? 'hunt' : 'hunts'}`;
  countSpan.textContent = label;

  row.appendChild(idSpan);
  row.appendChild(nameSpan);
  row.appendChild(countSpan);
  row.addEventListener('click', () => onTechniqueClick(tech.id));

  return row;
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
