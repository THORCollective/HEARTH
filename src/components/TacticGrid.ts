import type { TacticCoverage } from '../lib/coverage';

export interface TacticGridOptions {
  container: HTMLElement;
  tactics: TacticCoverage[];
  onTacticClick: (shortname: string) => void;
}

/** Render the tactic-level grid: one big card per tactic with name + hunt count. */
export function renderTacticGrid(opts: TacticGridOptions): void {
  const { container, tactics, onTacticClick } = opts;

  while (container.firstChild) container.removeChild(container.firstChild);

  const grid = document.createElement('div');
  grid.className = 'tactic-grid';

  for (const tactic of tactics) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tactic-card';
    card.dataset.tactic = tactic.shortname;

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
