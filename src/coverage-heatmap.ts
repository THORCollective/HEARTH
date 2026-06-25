import type { Hunt } from "./types/Hunt";
import type { MitreMatrix } from "./types/Mitre";
import {
  buildCoverageMap,
  buildTacticCoverage,
  summarize,
  type CoverageMap,
  type PeakCategory,
  type TacticCoverage,
} from "./lib/coverage";
import { renderMatrix } from "./components/Matrix";
import { renderTacticGrid } from "./components/TacticGrid";
import { renderTechniquePanel } from "./components/TechniquePanel";
import { renderTacticPanel } from "./components/TacticPanel";
import { Drawer } from "./components/Drawer";

import "./styles/components/matrix.css";
import "./styles/components/drawer.css";
import "./styles/components/techniquepanel.css";
import "./styles/components/tactic-grid.css";

type View = "tactic" | "technique";

interface State {
  hunts: Hunt[];
  matrix: MitreMatrix;
  peakFilter: PeakCategory | null;
  view: View;
  coverage: CoverageMap;
  tacticCoverage: Map<string, TacticCoverage>;
  drawer: Drawer;
}

async function init(): Promise<void> {
  let hunts: Hunt[];
  let matrix: MitreMatrix;
  try {
    [hunts, matrix] = await Promise.all([
      fetchJson<Hunt[]>("/hunts-data.json"),
      fetchJson<MitreMatrix>("/mitre-matrix.json"),
    ]);
  } catch (err) {
    console.error("[coverage] load failed", err);
    showError("Could not load coverage data — try refreshing.");
    return;
  }

  const peakFilter = readPeakFromUrl();
  const view = readViewFromUrl();
  const drawer = new Drawer({ onClose: () => clearDrawerFromUrl() });
  const coverage = buildCoverageMap(hunts, matrix, peakFilter ?? undefined);
  const tacticCoverage = buildTacticCoverage(matrix, coverage);
  const state: State = {
    hunts,
    matrix,
    peakFilter,
    view,
    coverage,
    tacticCoverage,
    drawer,
  };

  paintFilterChips(state);
  paintViewToggle(state);
  paintStats(state);
  paintGrid(state);

  document.getElementById("peak-filter")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const peak = target.dataset.peak;
    if (!peak) return;
    setPeak(state, peak === "all" ? null : (peak as PeakCategory));
  });

  document.getElementById("view-toggle")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const v = target.dataset.view;
    if (v !== "tactic" && v !== "technique") return;
    setView(state, v);
  });

  window.addEventListener("popstate", () => {
    const nextPeak = readPeakFromUrl();
    if (nextPeak !== state.peakFilter) applyPeak(state, nextPeak);
    const nextView = readViewFromUrl();
    if (nextView !== state.view) applyView(state, nextView);
    const techId = readTechniqueFromUrl();
    const tacticShort = readTacticFromUrl();
    if (techId) openTechnique(state, techId, { updateUrl: false });
    else if (tacticShort) openTactic(state, tacticShort, { updateUrl: false });
    else state.drawer.close();
  });

  const initialTech = readTechniqueFromUrl();
  const initialTactic = readTacticFromUrl();
  if (initialTech) openTechnique(state, initialTech, { updateUrl: false });
  else if (initialTactic)
    openTactic(state, initialTactic, { updateUrl: false });
}

function setPeak(state: State, peak: PeakCategory | null): void {
  if (peak === state.peakFilter) return;
  applyPeak(state, peak);
  writePeakToUrl(peak);
}

function applyPeak(state: State, peak: PeakCategory | null): void {
  state.peakFilter = peak;
  state.coverage = buildCoverageMap(
    state.hunts,
    state.matrix,
    peak ?? undefined,
  );
  state.tacticCoverage = buildTacticCoverage(state.matrix, state.coverage);
  paintFilterChips(state);
  paintStats(state);
  paintGrid(state);
}

function setView(state: State, view: View): void {
  if (view === state.view) return;
  applyView(state, view);
  writeViewToUrl(view);
}

function applyView(state: State, view: View): void {
  state.view = view;
  paintViewToggle(state);
  paintGrid(state);
}

function openTechnique(
  state: State,
  techId: string,
  opts: { updateUrl?: boolean } = {},
): void {
  const technique = state.matrix.techniques.find((t) => t.id === techId);
  const cell = state.coverage.get(techId);
  if (!technique || !cell) {
    console.warn(`[coverage] No technique found for ?t=${techId}`);
    clearDrawerFromUrl();
    return;
  }
  const tactic = state.matrix.tactics.find(
    (t) => t.shortname === technique.tactic_shortnames[0],
  );
  state.drawer.setContent(
    renderTechniquePanel({
      technique,
      cell,
      tacticName: tactic?.name ?? technique.tactic_shortnames[0] ?? "",
    }),
  );
  state.drawer.open();
  if (opts.updateUrl !== false) writeTechniqueToUrl(techId);
}

function openTactic(
  state: State,
  shortname: string,
  opts: { updateUrl?: boolean } = {},
): void {
  const tactic = state.tacticCoverage.get(shortname);
  if (!tactic) {
    console.warn(`[coverage] No tactic found for ?tactic=${shortname}`);
    clearDrawerFromUrl();
    return;
  }
  state.drawer.setContent(
    renderTacticPanel({
      tactic,
      onTechniqueClick: (techId) => openTechnique(state, techId),
    }),
  );
  state.drawer.open();
  if (opts.updateUrl !== false) writeTacticToUrl(shortname);
}

function paintFilterChips(state: State): void {
  const chips = document.querySelectorAll<HTMLElement>(
    "#peak-filter [data-peak]",
  );
  chips.forEach((chip) => {
    const isActive =
      (chip.dataset.peak === "all" && state.peakFilter === null) ||
      chip.dataset.peak === state.peakFilter;
    chip.classList.toggle("filter-chip--active", isActive);
    chip.setAttribute("aria-selected", String(isActive));
  });
}

function paintViewToggle(state: State): void {
  const buttons = document.querySelectorAll<HTMLElement>(
    "#view-toggle [data-view]",
  );
  buttons.forEach((btn) => {
    const isActive = btn.dataset.view === state.view;
    btn.classList.toggle("view-toggle__btn--active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function paintStats(state: State): void {
  const el = document.getElementById("stats-strip");
  if (!el) return;
  const s = summarize(state.coverage);
  const scope = state.peakFilter ?? "All";
  while (el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(statSpan(String(s.huntsCount), ` hunts in ${scope}`));
  el.appendChild(
    statSpan(`${s.coveredCount} / ${s.totalCount}`, " techniques covered"),
  );
  el.appendChild(statSpan(String(s.gapCount), " gaps"));
}

function statSpan(strongText: string, suffix: string): HTMLSpanElement {
  const span = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = strongText;
  span.appendChild(strong);
  span.appendChild(document.createTextNode(suffix));
  return span;
}

function paintGrid(state: State): void {
  const container = document.getElementById("matrix-container");
  if (!container) return;
  container.setAttribute("aria-busy", "false");
  if (state.view === "tactic") {
    const tactics = state.matrix.tactics
      .map((t) => state.tacticCoverage.get(t.shortname)!)
      .filter(Boolean);
    renderTacticGrid({
      container,
      tactics,
      onTacticClick: (shortname) => openTactic(state, shortname),
    });
  } else {
    renderMatrix({
      container,
      matrix: state.matrix,
      coverage: state.coverage,
      onCellClick: (techId) => openTechnique(state, techId),
    });
  }
}

function readPeakFromUrl(): PeakCategory | null {
  const p = new URLSearchParams(window.location.search).get("peak");
  if (p === "Flames" || p === "Embers" || p === "Alchemy") return p;
  return null;
}

function readViewFromUrl(): View {
  const v = new URLSearchParams(window.location.search).get("view");
  return v === "technique" ? "technique" : "tactic";
}

function readTechniqueFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("t");
}

function readTacticFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("tactic");
}

function writePeakToUrl(peak: PeakCategory | null): void {
  const url = new URL(window.location.href);
  if (peak) url.searchParams.set("peak", peak);
  else url.searchParams.delete("peak");
  history.pushState({}, "", url.toString());
}

function writeViewToUrl(view: View): void {
  const url = new URL(window.location.href);
  if (view === "technique") url.searchParams.set("view", "technique");
  else url.searchParams.delete("view");
  history.pushState({}, "", url.toString());
}

function writeTechniqueToUrl(techId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("t", techId);
  url.searchParams.delete("tactic");
  history.pushState({}, "", url.toString());
}

function writeTacticToUrl(shortname: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("tactic", shortname);
  url.searchParams.delete("t");
  history.pushState({}, "", url.toString());
}

function clearDrawerFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("t");
  url.searchParams.delete("tactic");
  history.pushState({}, "", url.toString());
}

async function fetchJson<T>(url: string): Promise<T> {
  // no-cache: data files live at fixed paths, so revalidate to avoid stale data after a deploy.
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function showError(msg: string): void {
  const container = document.getElementById("matrix-container");
  if (!container) return;
  container.setAttribute("aria-busy", "false");
  while (container.firstChild) container.removeChild(container.firstChild);
  const err = document.createElement("div");
  err.className = "matrix-error";
  err.textContent = msg;
  container.appendChild(err);
}

init();
