import type { Hunt } from './types/Hunt';
import type { MitreMatrix } from './types/Mitre';
import {
  buildCoverageMap,
  summarize,
  type CoverageMap,
  type PeakCategory,
} from './lib/coverage';
import { renderMatrix } from './components/Matrix';
import { renderTechniquePanel } from './components/TechniquePanel';
import { Drawer } from './components/Drawer';

import './styles/components/matrix.css';
import './styles/components/drawer.css';
import './styles/components/techniquepanel.css';

interface State {
  hunts: Hunt[];
  matrix: MitreMatrix;
  peakFilter: PeakCategory | null;
  coverage: CoverageMap;
  drawer: Drawer;
}

async function init(): Promise<void> {
  let hunts: Hunt[];
  let matrix: MitreMatrix;
  try {
    [hunts, matrix] = await Promise.all([
      fetchJson<Hunt[]>('/hunts-data.json'),
      fetchJson<MitreMatrix>('/mitre-matrix.json'),
    ]);
  } catch (err) {
    console.error('[coverage] load failed', err);
    showError('Could not load coverage data — try refreshing.');
    return;
  }

  const peakFilter = readPeakFromUrl();
  const drawer = new Drawer({ onClose: () => clearTechniqueFromUrl() });
  const coverage = buildCoverageMap(hunts, matrix, peakFilter ?? undefined);
  const state: State = { hunts, matrix, peakFilter, coverage, drawer };

  paintFilterChips(state);
  paintStats(state);
  paintMatrix(state);

  document.getElementById('peak-filter')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const peak = target.dataset.peak;
    if (!peak) return;
    setPeak(state, peak === 'all' ? null : (peak as PeakCategory));
  });

  window.addEventListener('popstate', () => {
    const nextPeak = readPeakFromUrl();
    if (nextPeak !== state.peakFilter) applyPeak(state, nextPeak);
    const techId = readTechniqueFromUrl();
    if (techId) openTechnique(state, techId, { updateUrl: false });
    else state.drawer.close();
  });

  const initialTech = readTechniqueFromUrl();
  if (initialTech) openTechnique(state, initialTech, { updateUrl: false });
}

function setPeak(state: State, peak: PeakCategory | null): void {
  if (peak === state.peakFilter) return;
  applyPeak(state, peak);
  writePeakToUrl(peak);
}

function applyPeak(state: State, peak: PeakCategory | null): void {
  state.peakFilter = peak;
  state.coverage = buildCoverageMap(state.hunts, state.matrix, peak ?? undefined);
  paintFilterChips(state);
  paintStats(state);
  paintMatrix(state);
}

function openTechnique(state: State, techId: string, opts: { updateUrl?: boolean } = {}): void {
  const technique = state.matrix.techniques.find((t) => t.id === techId);
  const cell = state.coverage.get(techId);
  if (!technique || !cell) {
    console.warn(`[coverage] No technique found for ?t=${techId}`);
    clearTechniqueFromUrl();
    return;
  }
  const tactic = state.matrix.tactics.find((t) => t.shortname === technique.tactic_shortnames[0]);
  state.drawer.setContent(renderTechniquePanel({
    technique,
    cell,
    tacticName: tactic?.name ?? technique.tactic_shortnames[0] ?? '',
  }));
  state.drawer.open();
  if (opts.updateUrl !== false) writeTechniqueToUrl(techId);
}

function paintFilterChips(state: State): void {
  const chips = document.querySelectorAll<HTMLElement>('#peak-filter [data-peak]');
  chips.forEach((chip) => {
    const isActive = (chip.dataset.peak === 'all' && state.peakFilter === null)
      || chip.dataset.peak === state.peakFilter;
    chip.classList.toggle('filter-chip--active', isActive);
    chip.setAttribute('aria-selected', String(isActive));
  });
}

function paintStats(state: State): void {
  const el = document.getElementById('stats-strip');
  if (!el) return;
  const s = summarize(state.coverage);
  const scope = state.peakFilter ?? 'All';
  while (el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(statSpan(String(s.huntsCount), ` hunts in ${scope}`));
  el.appendChild(statSpan(`${s.coveredCount} / ${s.totalCount}`, ' techniques covered'));
  el.appendChild(statSpan(String(s.gapCount), ' gaps'));
}

function statSpan(strongText: string, suffix: string): HTMLSpanElement {
  const span = document.createElement('span');
  const strong = document.createElement('strong');
  strong.textContent = strongText;
  span.appendChild(strong);
  span.appendChild(document.createTextNode(suffix));
  return span;
}

function paintMatrix(state: State): void {
  const container = document.getElementById('matrix-container');
  if (!container) return;
  container.setAttribute('aria-busy', 'false');
  renderMatrix({
    container,
    matrix: state.matrix,
    coverage: state.coverage,
    onCellClick: (techId) => openTechnique(state, techId),
  });
}

function readPeakFromUrl(): PeakCategory | null {
  const p = new URLSearchParams(window.location.search).get('peak');
  if (p === 'Flames' || p === 'Embers' || p === 'Alchemy') return p;
  return null;
}

function readTechniqueFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('t');
}

function writePeakToUrl(peak: PeakCategory | null): void {
  const url = new URL(window.location.href);
  if (peak) url.searchParams.set('peak', peak);
  else url.searchParams.delete('peak');
  history.pushState({}, '', url.toString());
}

function writeTechniqueToUrl(techId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('t', techId);
  history.pushState({}, '', url.toString());
}

function clearTechniqueFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('t');
  history.pushState({}, '', url.toString());
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function showError(msg: string): void {
  const container = document.getElementById('matrix-container');
  if (!container) return;
  container.setAttribute('aria-busy', 'false');
  while (container.firstChild) container.removeChild(container.firstChild);
  const err = document.createElement('div');
  err.className = 'matrix-error';
  err.textContent = msg;
  container.appendChild(err);
}

init();
