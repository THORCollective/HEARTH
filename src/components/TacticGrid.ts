import type { TacticCoverage } from '../lib/coverage';

export interface TacticGridOptions {
  container: HTMLElement;
  tactics: TacticCoverage[];
  onTacticClick: (shortname: string) => void;
}

/** Render the tactic-level grid: one big card per tactic, color intensity scales with hunt count. */
export function renderTacticGrid(opts: TacticGridOptions): void {
  const { container, tactics, onTacticClick } = opts;

  while (container.firstChild) container.removeChild(container.firstChild);

  const maxCount = tactics.reduce((m, t) => Math.max(m, t.huntCount), 0);

  const grid = document.createElement('div');
  grid.className = 'tactic-grid';

  for (const tactic of tactics) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `tactic-card${tactic.huntCount === 0 ? ' tactic-card--gap' : ''}`;
    card.dataset.tactic = tactic.shortname;
    const intensity = maxCount > 0 ? tactic.huntCount / maxCount : 0;
    card.style.setProperty('--intensity', intensity.toFixed(3));

    const name = document.createElement('span');
    name.className = 'tactic-card__name';
    name.textContent = tactic.name;

    const count = document.createElement('span');
    count.className = 'tactic-card__count';
    const huntsLabel = tactic.huntCount === 1 ? 'hunt' : 'hunts';
    count.textContent = `${tactic.huntCount} ${huntsLabel}`;

    card.appendChild(name);
    card.appendChild(count);
    card.addEventListener('click', () => onTacticClick(tactic.shortname));

    grid.appendChild(card);
  }

  container.appendChild(grid);
}
