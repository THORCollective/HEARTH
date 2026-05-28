import type { MitreMatrix, MitreTechnique } from '../types/Mitre';
import { bucketFor, type CoverageMap } from '../lib/coverage';

export interface MatrixOptions {
  container: HTMLElement;
  matrix: MitreMatrix;
  coverage: CoverageMap;
  onCellClick: (techniqueId: string) => void;
}

/** Render the matrix into the container. Re-call to rerender (e.g. on filter change). */
export function renderMatrix(opts: MatrixOptions): void {
  const { container, matrix, coverage, onCellClick } = opts;
  const techniquesByTactic = groupByTactic(matrix);

  while (container.firstChild) container.removeChild(container.firstChild);

  const grid = document.createElement('div');
  grid.className = 'matrix';

  for (const tactic of matrix.tactics) {
    const col = document.createElement('div');
    col.className = 'matrix__col';
    col.dataset.tactic = tactic.shortname;

    const head = document.createElement('div');
    head.className = 'matrix__colhead';
    head.textContent = tactic.name;
    col.appendChild(head);

    const techs = techniquesByTactic.get(tactic.shortname) ?? [];
    for (const tech of techs) {
      col.appendChild(renderCell(tech, coverage, onCellClick));
    }
    grid.appendChild(col);
  }

  container.appendChild(grid);
}

function groupByTactic(matrix: MitreMatrix): Map<string, MitreTechnique[]> {
  const out = new Map<string, MitreTechnique[]>();
  for (const tactic of matrix.tactics) out.set(tactic.shortname, []);
  for (const tech of matrix.techniques) {
    for (const shortname of tech.tactic_shortnames) {
      const list = out.get(shortname);
      if (list) list.push(tech);
    }
  }
  return out;
}

function renderCell(
  tech: MitreTechnique,
  coverage: CoverageMap,
  onCellClick: (id: string) => void,
): HTMLButtonElement {
  const cell = coverage.get(tech.id);
  const count = cell?.count ?? 0;
  const bucket = bucketFor(count);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `matrix__cell matrix__cell--${bucket}${tech.is_subtechnique ? ' matrix__cell--sub' : ''}`;
  btn.dataset.tech = tech.id;
  const huntsLabel = count === 1 ? 'hunt' : 'hunts';
  btn.title = `${tech.id} · ${tech.name} — ${count} ${huntsLabel}`;
  btn.addEventListener('click', () => onCellClick(tech.id));

  const idSpan = document.createElement('span');
  idSpan.className = 'matrix__cell-id';
  idSpan.textContent = tech.id;
  btn.appendChild(idSpan);

  return btn;
}
