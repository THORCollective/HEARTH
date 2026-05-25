import type { Hunt } from '../types/Hunt';
import type { MitreTechnique } from '../types/Mitre';
import type { CoverageCell } from '../lib/coverage';

const CONTRIBUTE_URL =
  'https://github.com/THORCollective/HEARTH/issues/new?assignees=&labels=intel-submission%2C+needs-triage&template=cti_submission.yml';

export interface TechniquePanelData {
  technique: MitreTechnique;
  cell: CoverageCell;
  tacticName: string;
}

/** Returns a DocumentFragment to drop into Drawer.setContent(). */
export function renderTechniquePanel(data: TechniquePanelData): DocumentFragment {
  const { technique, cell, tacticName } = data;
  const frag = document.createDocumentFragment();

  // Header
  const header = el('div', 'tp-header');
  const idEl = el('div', 'tp-id');
  idEl.textContent = technique.id;
  const titleEl = el('h2', 'tp-title');
  titleEl.textContent = technique.name;
  header.appendChild(idEl);
  header.appendChild(titleEl);
  frag.appendChild(header);

  // Meta chips
  const meta = el('div', 'tp-meta');
  meta.appendChild(chip('tp-chip tp-chip--tactic', tacticName));
  const huntsLabel = cell.count === 1 ? 'hunt' : 'hunts';
  meta.appendChild(chip('tp-chip tp-chip--count', `${cell.count} ${huntsLabel}`));
  for (const category of ['Flames', 'Embers', 'Alchemy'] as const) {
    if (cell.peakBreakdown[category] > 0) {
      meta.appendChild(chip(`tp-chip tp-chip--${category.toLowerCase()}`, `${cell.peakBreakdown[category]} ${category}`));
    }
  }
  frag.appendChild(meta);

  // Description
  if (technique.description) {
    const desc = el('p', 'tp-desc');
    desc.textContent = technique.description;
    frag.appendChild(desc);
  }

  // MITRE link
  const mitreLink = el('a', 'tp-mitre') as HTMLAnchorElement;
  mitreLink.href = technique.url;
  mitreLink.target = '_blank';
  mitreLink.rel = 'noopener';
  mitreLink.textContent = 'View on attack.mitre.org →';
  frag.appendChild(mitreLink);

  // Hunts section
  const section = el('div', 'tp-hunts-section');
  const sectionTitle = el('h3', 'tp-section-title');
  sectionTitle.textContent = `Hunts (${cell.hunts.length})`;
  section.appendChild(sectionTitle);

  const huntsContainer = el('div', 'tp-hunts');
  if (cell.hunts.length === 0) {
    const empty = el('div', 'tp-empty');
    const p = document.createElement('p');
    p.textContent = 'No hunts yet for this technique.';
    const cta = el('a', 'tp-cta') as HTMLAnchorElement;
    cta.href = CONTRIBUTE_URL;
    cta.target = '_blank';
    cta.rel = 'noopener';
    cta.textContent = 'Contribute one →';
    empty.appendChild(p);
    empty.appendChild(cta);
    huntsContainer.appendChild(empty);
  } else {
    for (const hunt of cell.hunts) {
      huntsContainer.appendChild(renderHuntRow(hunt));
    }
  }
  section.appendChild(huntsContainer);
  frag.appendChild(section);

  return frag;
}

function renderHuntRow(hunt: Hunt): HTMLAnchorElement {
  const row = document.createElement('a');
  row.className = 'tp-hunt';
  row.href = `https://github.com/THORCollective/HEARTH/blob/main/${hunt.file_path}`;
  row.target = '_blank';
  row.rel = 'noopener';

  const idSpan = el('span', 'tp-hunt-id');
  idSpan.textContent = hunt.id;
  const titleSpan = el('span', 'tp-hunt-title');
  titleSpan.textContent = hunt.title;
  const catSpan = el('span', `tp-hunt-cat tp-hunt-cat--${hunt.category.toLowerCase()}`);
  catSpan.textContent = hunt.category;

  row.appendChild(idSpan);
  row.appendChild(titleSpan);
  row.appendChild(catSpan);
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
