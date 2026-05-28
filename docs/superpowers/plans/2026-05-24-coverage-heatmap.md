# Coverage Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/coverage.html` — a global, technique-level MITRE ATT&CK coverage view of HEARTH's hunt library with PEAK-category filtering and a deep-linkable per-technique side drawer.

**Architecture:** Static-built Vite multi-page app. Page entry `src/coverage.ts` fetches two JSON files at runtime: the existing `public/hunts-data.json` and a new `public/mitre-matrix.json` (slim MITRE Enterprise dataset committed to the repo). It builds an in-memory coverage map, renders a Navigator-style matrix with categorical (gap/thin/covered) coloring, and drives a side drawer for per-technique drill-down. URL query params (`?peak=`, `?t=`) are the source of truth for filter and drawer state.

**Tech Stack:** TypeScript, Vite 5, vanilla DOM (no framework), CSS custom properties (OKLCH tokens reused from `actors.html`). Python 3 for the MITRE matrix builder script.

**Spec:** [`docs/superpowers/specs/2026-05-24-coverage-heatmap-design.md`](../specs/2026-05-24-coverage-heatmap-design.md)

**Testing posture (per spec):** No new unit tests. Verification is manual via `npm run dev` against an explicit smoke checklist (Task 11). Apply TDD-style discipline by reading the smoke checklist *before* implementation and checking it off as you go.

**Security posture:** All DOM construction uses `document.createElement` + `textContent` rather than `innerHTML` with interpolated data. Components return `HTMLElement` or `DocumentFragment` nodes, not HTML strings. This is the convention this plan uses throughout — do not switch to template-string rendering even if it's terser.

---

## File map

**Create:**
- `scripts/build_mitre_matrix.py` — converts `data/enterprise-attack.json` → slim matrix JSON
- `public/mitre-matrix.json` — committed output of the builder (slim MITRE matrix)
- `src/lib/coverage.ts` — pure functions: coverage map builder, bucket classifier
- `src/types/Mitre.ts` — type definitions for the slim matrix shape
- `src/components/Drawer.ts` — right-side drawer primitive (slide-in panel)
- `src/styles/components/drawer.css` — drawer styling
- `src/components/Matrix.ts` — the technique grid
- `src/styles/components/matrix.css` — matrix styling
- `src/components/TechniquePanel.ts` — drawer content for a selected technique
- `coverage.html` — page markup
- `src/coverage.ts` — page entry / orchestrator

**Modify:**
- `vite.config.ts` — add `coverage` to `rollupOptions.input`
- `home.html` — add "Coverage" link in the top nav
- `actors.html` — add "Coverage" link in the top nav
- `README.md` — add Coverage to Key Features table

---

## Pre-flight (one-time, before Task 1)

- [ ] **Confirm working branch**

  The spec was committed on `feat/actor-coverage-page` (commit `bb7bfec`). If that branch hasn't merged, stay on it. If it has merged to `main`, create a new branch: `git checkout -b feat/coverage-heatmap`.

- [ ] **Confirm MITRE source data is available**

  Run: `ls -lh data/enterprise-attack.json`

  Expected: a file, > 10 MB. If missing, download the latest from MITRE first:

  ```bash
  mkdir -p data
  curl -L -o data/enterprise-attack.json \
    https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json
  ```

  (The file is gitignored — that's expected; only the slim derived JSON gets committed.)

- [ ] **Read the existing pattern**

  Read `src/actors.ts` end-to-end (especially `init()`, `loadAll()`, `fetchJson()`, `parseUrlActor()`, `navigateToActor()` — lines 53–172). Your `src/coverage.ts` follows this exact shape.

  Read `src/components/Modal.ts`. Your `Drawer.ts` is its right-aligned cousin — same lifecycle (DOM created in constructor, attached to body, URL via `pushState`, popstate listener, Escape key handler), but you'll build DOM via `createElement` rather than the `innerHTML` template strings Modal currently uses.

---

## Task 1: Build the slim MITRE matrix

**Files:**
- Create: `scripts/build_mitre_matrix.py`
- Create: `public/mitre-matrix.json`

**Goal:** Produce a small, committable subset of MITRE Enterprise ATT&CK the browser can fetch. Strips out mitigations, groups, software, full descriptions; keeps only tactics + techniques + parent links + tactic links + short descriptions + URLs.

- [ ] **Step 1: Write the builder script**

  Create `scripts/build_mitre_matrix.py`:

  ```python
  #!/usr/bin/env python3
  """Build a slim MITRE ATT&CK matrix JSON for the Coverage Heatmap page.

  Reads data/enterprise-attack.json (downloaded from mitre/cti) and writes
  public/mitre-matrix.json with just the tactics + techniques the frontend needs.
  """
  import json
  import sys
  from pathlib import Path

  ROOT = Path(__file__).resolve().parent.parent
  SOURCE = ROOT / "data" / "enterprise-attack.json"
  TARGET = ROOT / "public" / "mitre-matrix.json"
  DESC_MAX_CHARS = 500


  def main() -> int:
      if not SOURCE.exists():
          print(f"ERROR: {SOURCE} not found. See plan pre-flight.", file=sys.stderr)
          return 1

      bundle = json.loads(SOURCE.read_text())
      objects = bundle.get("objects", [])

      tactics: list[dict] = []
      techniques: list[dict] = []

      for obj in objects:
          if obj.get("type") != "x-mitre-tactic" or obj.get("revoked") or obj.get("x_mitre_deprecated"):
              continue
          tactics.append({
              "id": _ext_id(obj),
              "shortname": obj.get("x_mitre_shortname", ""),
              "name": obj.get("name", ""),
          })

      for obj in objects:
          if obj.get("type") != "attack-pattern" or obj.get("revoked") or obj.get("x_mitre_deprecated"):
              continue
          ext_id = _ext_id(obj)
          if not ext_id:
              continue
          parent = ext_id.split(".")[0] if "." in ext_id else None
          tactic_shortnames = [
              p.get("phase_name", "")
              for p in obj.get("kill_chain_phases", [])
              if p.get("kill_chain_name") == "mitre-attack"
          ]
          desc = (obj.get("description") or "").strip()
          if len(desc) > DESC_MAX_CHARS:
              desc = desc[:DESC_MAX_CHARS].rsplit(" ", 1)[0] + "…"
          techniques.append({
              "id": ext_id,
              "name": obj.get("name", ""),
              "parent": parent,
              "tactic_shortnames": tactic_shortnames,
              "description": desc,
              "url": _ext_url(obj),
              "is_subtechnique": bool(obj.get("x_mitre_is_subtechnique")),
          })

      order = _tactic_order(objects)
      tactics.sort(key=lambda t: order.get(t["shortname"], 999))

      def tech_key(t: dict) -> tuple:
          first_tactic = t["tactic_shortnames"][0] if t["tactic_shortnames"] else ""
          return (order.get(first_tactic, 999), t["id"])

      techniques.sort(key=tech_key)

      payload = {"tactics": tactics, "techniques": techniques}
      TARGET.parent.mkdir(parents=True, exist_ok=True)
      TARGET.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

      size_kb = TARGET.stat().st_size / 1024
      print(f"Wrote {TARGET} — {len(tactics)} tactics, {len(techniques)} techniques, {size_kb:.1f} KB")
      return 0


  def _ext_id(obj: dict) -> str:
      for ref in obj.get("external_references", []):
          if ref.get("source_name") == "mitre-attack":
              return ref.get("external_id", "")
      return ""


  def _ext_url(obj: dict) -> str:
      for ref in obj.get("external_references", []):
          if ref.get("source_name") == "mitre-attack":
              return ref.get("url", "")
      return ""


  def _tactic_order(objects: list[dict]) -> dict[str, int]:
      """Pull the canonical tactic order from the x-mitre-matrix object."""
      for obj in objects:
          if obj.get("type") != "x-mitre-matrix":
              continue
          tactic_refs = obj.get("tactic_refs", [])
          id_to_shortname = {
              o["id"]: o.get("x_mitre_shortname", "")
              for o in objects
              if o.get("type") == "x-mitre-tactic"
          }
          return {id_to_shortname[ref]: i for i, ref in enumerate(tactic_refs) if ref in id_to_shortname}
      return {}


  if __name__ == "__main__":
      sys.exit(main())
  ```

- [ ] **Step 2: Run the builder and verify output**

  Run:
  ```bash
  python3 scripts/build_mitre_matrix.py
  ```

  Expected stdout: `Wrote .../public/mitre-matrix.json — 15 tactics, ~697 techniques, ~329 KB`.

  (Note: as of 2026-05 MITRE has 15 tactics — they split the old `defense-evasion` into `stealth` and `defense-impairment`. The original plan target of "< 200 KB" was incompatible with leaving descriptions readable, so `DESC_MAX_CHARS` is pinned to 200; ~329 KB is the accepted size. If MITRE adds significant new content and the file balloons past ~500 KB, consider trimming descriptions further or splitting per-tactic.)

- [ ] **Step 3: Sanity-check the JSON**

  Run:
  ```bash
  python3 -c "import json; d=json.load(open('public/mitre-matrix.json')); print('tactics:', [t['shortname'] for t in d['tactics']]); print('sample tech:', d['techniques'][0])"
  ```

  Expected: tactics list starts with `reconnaissance` and ends with `impact`. Sample technique has `id`, `name`, `parent` (null or "Txxxx"), `tactic_shortnames`, `description`, `url`, `is_subtechnique`.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/build_mitre_matrix.py public/mitre-matrix.json
  git commit -m "feat: add slim MITRE matrix builder and committed dataset"
  ```

---

## Task 2: Types + pure coverage library

**Files:**
- Create: `src/types/Mitre.ts`
- Create: `src/lib/coverage.ts`

**Goal:** Single source of truth for the matrix shape and a small pure module that computes coverage from `Hunt[]` + the matrix. No DOM, no globals.

- [ ] **Step 1: Write the type module**

  Create `src/types/Mitre.ts`:

  ```typescript
  export interface MitreTactic {
    id: string;
    shortname: string;
    name: string;
  }

  export interface MitreTechnique {
    id: string;
    name: string;
    parent: string | null;
    tactic_shortnames: string[];
    description: string;
    url: string;
    is_subtechnique: boolean;
  }

  export interface MitreMatrix {
    tactics: MitreTactic[];
    techniques: MitreTechnique[];
  }
  ```

- [ ] **Step 2: Write the coverage library**

  Create `src/lib/coverage.ts`:

  ```typescript
  import type { Hunt } from '../types/Hunt';
  import type { MitreMatrix } from '../types/Mitre';

  export type PeakCategory = 'Flames' | 'Embers' | 'Alchemy';
  export type CoverageBucket = 'gap' | 'thin' | 'covered';

  export interface CoverageCell {
    techniqueId: string;
    count: number;
    peakBreakdown: Record<PeakCategory, number>;
    hunts: Hunt[];
  }

  export type CoverageMap = Map<string, CoverageCell>;

  /**
   * Build a coverage map keyed by technique ID. Includes every technique from
   * the MITRE matrix (zero-count cells are present, so the matrix renders fully).
   * Optional peakFilter restricts which hunts contribute to counts.
   */
  export function buildCoverageMap(
    hunts: Hunt[],
    matrix: MitreMatrix,
    peakFilter?: PeakCategory,
  ): CoverageMap {
    const map: CoverageMap = new Map();

    for (const tech of matrix.techniques) {
      map.set(tech.id, {
        techniqueId: tech.id,
        count: 0,
        peakBreakdown: { Flames: 0, Embers: 0, Alchemy: 0 },
        hunts: [],
      });
    }

    for (const hunt of hunts) {
      const category = hunt.category as PeakCategory | undefined;
      if (!category) continue;
      if (peakFilter && category !== peakFilter) continue;

      for (const techId of hunt.techniques ?? []) {
        const cell = map.get(techId);
        if (!cell) {
          console.warn(`[coverage] Unknown technique ${techId} in hunt ${hunt.id}`);
          continue;
        }
        cell.count += 1;
        cell.peakBreakdown[category] += 1;
        cell.hunts.push(hunt);
      }
    }

    return map;
  }

  /** Map a hunt count to a coverage bucket. Thresholds: 0 = gap, 1-2 = thin, 3+ = covered. */
  export function bucketFor(count: number): CoverageBucket {
    if (count === 0) return 'gap';
    if (count <= 2) return 'thin';
    return 'covered';
  }

  /** Totals for the stats strip. */
  export function summarize(map: CoverageMap): {
    huntsCount: number;
    coveredCount: number;
    totalCount: number;
    gapCount: number;
  } {
    let covered = 0;
    let total = 0;
    const huntsSet = new Set<string>();
    for (const cell of map.values()) {
      total += 1;
      if (cell.count > 0) covered += 1;
      for (const h of cell.hunts) huntsSet.add(h.id);
    }
    return {
      huntsCount: huntsSet.size,
      coveredCount: covered,
      totalCount: total,
      gapCount: total - covered,
    };
  }
  ```

- [ ] **Step 3: Type-check**

  Run: `npm run type-check`

  Expected: no errors. If `Hunt` doesn't expose `techniques`, open `src/types/Hunt.ts` and add `techniques?: string[]` matching the shape of entries in `public/hunts-data.json`.

- [ ] **Step 4: Commit**

  ```bash
  git add src/types/Mitre.ts src/lib/coverage.ts src/types/Hunt.ts
  git commit -m "feat: add MITRE matrix types and pure coverage computation"
  ```

---

## Task 3: Drawer primitive

**Files:**
- Create: `src/components/Drawer.ts`
- Create: `src/styles/components/drawer.css`

**Goal:** A generic right-side slide-in drawer, content-agnostic. DOM built with `createElement` (no `innerHTML`). Accepts a `Node` for content via `setContent`, not an HTML string.

- [ ] **Step 1: Write the drawer component**

  Create `src/components/Drawer.ts`:

  ```typescript
  export interface DrawerOptions {
    onClose?: () => void;
  }

  /**
   * Right-side slide-in drawer. Owns its DOM and dismissal. Caller passes
   * content as a DOM node via setContent().
   */
  export class Drawer {
    private root: HTMLElement;
    private body: HTMLElement;
    private isOpenState = false;
    private onClose?: () => void;

    constructor(opts: DrawerOptions = {}) {
      this.onClose = opts.onClose;

      const root = document.createElement('div');
      root.className = 'drawer';
      root.setAttribute('aria-hidden', 'true');

      const overlay = document.createElement('div');
      overlay.className = 'drawer__overlay';
      overlay.addEventListener('click', () => this.close());

      const panel = document.createElement('aside');
      panel.className = 'drawer__panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');

      const closeBtn = document.createElement('button');
      closeBtn.className = 'drawer__close';
      closeBtn.setAttribute('aria-label', 'Close drawer');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => this.close());

      const body = document.createElement('div');
      body.className = 'drawer__body';

      panel.appendChild(closeBtn);
      panel.appendChild(body);
      root.appendChild(overlay);
      root.appendChild(panel);
      document.body.appendChild(root);

      this.root = root;
      this.body = body;

      document.addEventListener('keydown', (e) => {
        if (this.isOpenState && e.key === 'Escape') this.close();
      });
    }

    open(): void {
      this.root.setAttribute('aria-hidden', 'false');
      this.root.classList.add('drawer--open');
      this.isOpenState = true;
    }

    close(): void {
      if (!this.isOpenState) return;
      this.root.classList.remove('drawer--open');
      this.root.setAttribute('aria-hidden', 'true');
      this.isOpenState = false;
      this.onClose?.();
    }

    isOpen(): boolean {
      return this.isOpenState;
    }

    /** Replace the drawer body with a DOM node. */
    setContent(node: Node): void {
      while (this.body.firstChild) this.body.removeChild(this.body.firstChild);
      this.body.appendChild(node);
    }
  }
  ```

- [ ] **Step 2: Write the drawer styles**

  Create `src/styles/components/drawer.css`:

  ```css
  .drawer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 100;
  }

  .drawer__overlay {
    position: absolute;
    inset: 0;
    background: oklch(0.10 0.020 300 / 0.55);
    opacity: 0;
    transition: opacity 180ms ease;
    pointer-events: none;
  }

  .drawer__panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(480px, 92vw);
    background: var(--surface, oklch(0.23 0.024 300));
    border-left: 1px solid var(--line, oklch(0.34 0.030 300));
    box-shadow: -16px 0 40px oklch(0.10 0.020 300 / 0.4);
    transform: translateX(100%);
    transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .drawer--open .drawer__overlay { opacity: 1; pointer-events: auto; }
  .drawer--open .drawer__panel { transform: translateX(0); }

  .drawer__close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    color: var(--fg-mute, oklch(0.78 0.022 300));
    border: 1px solid var(--line-soft, oklch(0.29 0.026 300));
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .drawer__close:hover {
    color: var(--fg, oklch(0.965 0.012 300));
    border-color: var(--fg-mute, oklch(0.78 0.022 300));
  }

  .drawer__body {
    padding: 56px 28px 28px;
    overflow-y: auto;
    flex: 1;
  }

  @media (max-width: 720px) {
    .drawer__panel { width: 100vw; }
  }
  ```

- [ ] **Step 3: Type-check**

  Run: `npm run type-check`

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/Drawer.ts src/styles/components/drawer.css
  git commit -m "feat: add Drawer primitive component"
  ```

---

## Task 4: TechniquePanel content

**Files:**
- Create: `src/components/TechniquePanel.ts`

**Goal:** Build a `DocumentFragment` showing the contents of the drawer for a given technique — header, meta chips, MITRE description + link, hunts list (or empty-state CTA). All DOM construction via `createElement` + `textContent`.

- [ ] **Step 1: Write the component**

  Create `src/components/TechniquePanel.ts`:

  ```typescript
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
  ```

- [ ] **Step 2: Type-check**

  Run: `npm run type-check`

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/TechniquePanel.ts
  git commit -m "feat: add TechniquePanel renderer for drawer content"
  ```

---

## Task 5: Matrix component

**Files:**
- Create: `src/components/Matrix.ts`
- Create: `src/styles/components/matrix.css`

**Goal:** Render the tactics × techniques grid given a `MitreMatrix` and a `CoverageMap`. Build via `createElement`. Attach click listeners that emit the technique ID.

- [ ] **Step 1: Write the component**

  Create `src/components/Matrix.ts`:

  ```typescript
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
  ```

- [ ] **Step 2: Write the matrix styles**

  Create `src/styles/components/matrix.css`:

  ```css
  .matrix {
    display: grid;
    grid-template-columns: repeat(14, minmax(72px, 1fr));
    gap: 4px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .matrix__col {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .matrix__colhead {
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 10px;
    color: var(--fg-dim, oklch(0.60 0.030 300));
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: left;
    padding: 4px 6px;
    border-bottom: 1px solid var(--line-soft, oklch(0.29 0.026 300));
    margin-bottom: 4px;
    min-height: 32px;
  }

  .matrix__cell {
    appearance: none;
    border: 1px solid transparent;
    border-radius: 3px;
    padding: 6px;
    text-align: left;
    cursor: pointer;
    font-family: var(--mono, ui-monospace, monospace);
    transition: outline-color 100ms ease, transform 100ms ease;
    color: var(--fg-mute, oklch(0.78 0.022 300));
  }

  .matrix__cell-id {
    font-size: 9px;
    letter-spacing: 0.04em;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .matrix__cell:hover {
    outline: 1px solid var(--fg-mute, oklch(0.78 0.022 300));
    transform: translateY(-1px);
  }

  .matrix__cell--sub { margin-left: 10px; }

  .matrix__cell--gap {
    background: oklch(0.20 0.022 300);
    color: var(--fg-dim, oklch(0.60 0.030 300));
  }
  .matrix__cell--thin {
    background: oklch(0.34 0.080 295);
    color: var(--fg, oklch(0.965 0.012 300));
  }
  .matrix__cell--covered {
    background: var(--ember, oklch(0.66 0.220 300));
    color: oklch(0.15 0.020 300);
  }
  ```

- [ ] **Step 3: Type-check**

  Run: `npm run type-check`

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/Matrix.ts src/styles/components/matrix.css
  git commit -m "feat: add Matrix grid component for technique coverage"
  ```

---

## Task 6: Page shell — `coverage.html`

**Files:**
- Create: `coverage.html`

**Goal:** The HTML scaffold for the page. Reuses the topbar/header/typography conventions of `actors.html`. Body contains empty containers that `src/coverage.ts` populates.

- [ ] **Step 1: Write the HTML**

  Create `coverage.html`. Copy the structure from `actors.html`: same `<head>` (fonts, analytics, OG meta — but with coverage-specific copy in title/description), same OKLCH-token `<style>` block, same top-bar markup. Replace the body content with:

  ```html
  <main class="wrap">
    <section class="hero">
      <span class="eyebrow">Coverage</span>
      <h1 class="title serif">Where the community hunts.</h1>
      <p class="lede">Every MITRE ATT&amp;CK technique, colored by how many HEARTH hunts cover it. Filter by PEAK category. Click any cell to see the hunts — or the gap.</p>
    </section>

    <section class="controls">
      <div class="filter-row" id="peak-filter" role="tablist" aria-label="Filter by PEAK category">
        <button class="filter-chip filter-chip--active" data-peak="all" role="tab" aria-selected="true">All</button>
        <button class="filter-chip" data-peak="Flames" role="tab" aria-selected="false">Flames</button>
        <button class="filter-chip" data-peak="Embers" role="tab" aria-selected="false">Embers</button>
        <button class="filter-chip" data-peak="Alchemy" role="tab" aria-selected="false">Alchemy</button>
      </div>
      <div class="stats-strip" id="stats-strip" aria-live="polite"></div>
    </section>

    <section class="matrix-section">
      <div id="matrix-container" aria-busy="true">
        <div class="matrix-skeleton">Loading coverage…</div>
      </div>
    </section>
  </main>

  <script type="module" src="/src/coverage.ts"></script>
  ```

  In the top-bar nav, mark the Coverage link as active (use the same `class="on"` convention as actors.html does for its active link).

  In the inline `<style>` block, add page-specific layout pieces (hero typography, `.filter-row` chip styling, `.stats-strip` layout, `.matrix-skeleton` placeholder). Reuse OKLCH tokens — do not invent new color values.

- [ ] **Step 2: Confirm CSS importing**

  Component CSS (`drawer.css`, `matrix.css`) is imported from `src/coverage.ts` (already wired in Task 7). No `<link>` in HTML is needed — Vite handles it.

- [ ] **Step 3: Visual smoke**

  Run: `npm run dev`

  Open: `http://localhost:3000/coverage.html`

  Expected: page renders header, filter chips, "Loading coverage…" placeholder. No console errors. Top-bar matches actors.html visual style.

- [ ] **Step 4: Commit**

  ```bash
  git add coverage.html
  git commit -m "feat: add coverage.html page scaffold"
  ```

---

## Task 7: Orchestrator — `src/coverage.ts`

**Files:**
- Create: `src/coverage.ts`

**Goal:** Wire everything together. Load data, build initial coverage, render matrix + stats, handle filter clicks, handle cell clicks, handle URL state on load and popstate. All DOM construction via `createElement`/`textContent`.

- [ ] **Step 1: Write the orchestrator**

  Create `src/coverage.ts`:

  ```typescript
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
      if (techId) openTechnique(state, techId);
      else state.drawer.close();
    });

    const initialTech = readTechniqueFromUrl();
    if (initialTech) openTechnique(state, initialTech);
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

  function openTechnique(state: State, techId: string): void {
    const technique = state.matrix.techniques.find((t) => t.id === techId);
    const cell = state.coverage.get(techId);
    if (!technique || !cell) return;
    const tactic = state.matrix.tactics.find((t) => t.shortname === technique.tactic_shortnames[0]);
    state.drawer.setContent(renderTechniquePanel({
      technique,
      cell,
      tacticName: tactic?.name ?? technique.tactic_shortnames[0] ?? '',
    }));
    state.drawer.open();
    writeTechniqueToUrl(techId);
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
  ```

- [ ] **Step 2: Type-check + lint**

  Run:
  ```bash
  npm run type-check
  npm run lint
  ```

  Expected: both clean. Fix small reports inline.

- [ ] **Step 3: Commit**

  ```bash
  git add src/coverage.ts
  git commit -m "feat: add coverage.ts orchestrator wiring data, matrix, drawer, URL state"
  ```

---

## Task 8: Vite multi-page registration

**Files:**
- Modify: `vite.config.ts`

**Goal:** Tell Vite that `coverage.html` is a real entry so `npm run build` ships it.

- [ ] **Step 1: Add the entry**

  In `vite.config.ts`, edit the `rollupOptions.input` object (currently has `home`, `main`, `submit`, `actors`):

  ```typescript
  input: {
    home: resolve(__dirname, 'home.html'),
    main: resolve(__dirname, 'index.html'),
    submit: resolve(__dirname, 'submit.html'),
    actors: resolve(__dirname, 'actors.html'),
    coverage: resolve(__dirname, 'coverage.html'),
  },
  ```

- [ ] **Step 2: Verify build works**

  Run: `npm run build`

  Expected: build succeeds, output includes `dist/coverage.html` and a `coverage-*.js` asset.

- [ ] **Step 3: Commit**

  ```bash
  git add vite.config.ts
  git commit -m "build: register coverage.html as a Vite entry"
  ```

---

## Task 9: Top-nav integration

**Files:**
- Modify: `home.html`
- Modify: `actors.html`
- Modify: `coverage.html`

**Goal:** Make the new page discoverable from existing pages, and mark the active link on the page itself.

- [ ] **Step 1: Add the link to `home.html`**

  Find the `.nav` block (it has the existing Actors / Submit links). Add a new `<a href="/coverage.html">Coverage</a>` following the same markup pattern, positioned next to Actors.

- [ ] **Step 2: Add the link to `actors.html`**

  Same edit in `actors.html`'s `.nav` block.

- [ ] **Step 3: Verify reciprocal nav in `coverage.html`**

  Confirm `coverage.html`'s nav (added in Task 6) marks Coverage as active (`class="on"`) and includes back-links to Home and Actors.

- [ ] **Step 4: Visual smoke**

  Run: `npm run dev`

  Open home, actors, coverage. Click Coverage from each — should navigate cleanly. Active state correct on each page.

- [ ] **Step 5: Commit**

  ```bash
  git add home.html actors.html coverage.html
  git commit -m "feat: add Coverage link to top nav across pages"
  ```

---

## Task 10: README update

**Files:**
- Modify: `README.md`

**Goal:** Surface the new page in the documented feature list.

- [ ] **Step 1: Add to the Key Features table**

  In the Key Features table, add a new row after "Interactive Database":

  ```markdown
  | **Coverage Heatmap** | [/coverage.html](https://hearth.thorcollective.com/coverage.html) — the full MITRE ATT&CK matrix, colored by how many community hunts cover each technique. Click a cell to see the hunts (or the gap). |
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add README.md
  git commit -m "docs: add Coverage Heatmap to Key Features"
  ```

---

## Task 11: Manual smoke verification

**Files:** none (verification only).

**Goal:** Walk through the acceptance criteria from the spec against the running dev server. Any failure is a bug to fix before declaring the feature done.

- [ ] **Step 1: Boot the dev server**

  Run: `npm run dev`

  Open: `http://localhost:3000/coverage.html`

- [ ] **Step 2: Walk the smoke checklist**

  Verify each item. If a step fails, stop and fix before continuing.

  - [ ] **Cold load** — matrix renders all 14 tactic columns with technique cells; no flash of empty state; no console errors.
  - [ ] **Coloring** — at least one cell of each bucket (gap, thin, covered) is visible.
  - [ ] **Stats strip** — populated with three nonzero numbers in the "All" filter.
  - [ ] **PEAK filter** — clicking each of Flames / Embers / Alchemy recolors the matrix and updates the stats strip; clicking "All" restores defaults.
  - [ ] **URL on filter** — `?peak=Flames` appears on filter change; clearing to "All" removes it.
  - [ ] **Cell click (covered)** — drawer slides in from the right; shows technique header, meta chips, MITRE description, MITRE link, hunts list with category badges; URL gets `?t=Txxxx`.
  - [ ] **Cell click (gap)** — drawer shows the "No hunts yet. Contribute one →" CTA; CTA links to the submission flow.
  - [ ] **Drawer dismiss** — X button, Escape key, and overlay click all close the drawer; URL `?t=` is removed.
  - [ ] **Browser back/forward** — after filter + cell click sequence, hitting back restores the previous state.
  - [ ] **Deep link** — pasting `http://localhost:3000/coverage.html?t=T1059&peak=Flames` into a fresh tab opens with Flames active and the T1059 drawer open.
  - [ ] **Narrow viewport** — resize to ~600px wide; matrix becomes horizontally scrollable; drawer becomes full-width.
  - [ ] **Nav** — top-bar links to Home, Actors, and Coverage all work; Coverage shows as the active link on the coverage page.

- [ ] **Step 3: Build check**

  Run:
  ```bash
  npm run build
  npm run preview
  ```

  Open the preview URL printed in the terminal at `/coverage.html`. Re-run a quick subset of the checklist (cold load, one filter click, one cell click, deep link).

- [ ] **Step 4: Final commit if any fixes were needed**

  If steps in this task required fixes, commit them now:

  ```bash
  git add -A
  git commit -m "fix: smoke-test fixes for coverage page"
  ```

---

## Implementer notes

- **Type drift to watch:** `Hunt` is defined in `src/types/Hunt.ts`. If its `techniques` field is missing or differently named than `public/hunts-data.json` actually contains, Task 2 will fail type-check. Align the type to the data, not the other way around.
- **Drawer focus management** is intentionally minimal — no focus trap, no `inert` on background. The spec doesn't require accessibility-grade focus management for this iteration; promote if needed.
- **MITRE schema drift:** Task 1 currently produces 15 tactics (not the 14 the original plan expected). MITRE evolves; if the `x-mitre-tactic` shape changes more dramatically and `_tactic_order` falls through to alphabetical, the "tactics list starts with reconnaissance" sanity check in Task 1 step 3 catches it.
- **Token sharing:** `coverage.html` re-declares the OKLCH token block as `actors.html` does today. If you find yourself wanting to extract these to a shared CSS file mid-task, do it as a small refactor commit *separate* from coverage work — don't bundle.
- **No innerHTML:** every component in this plan uses `createElement` + `textContent`. If a step in your implementation tempts you toward template-string HTML, resist — keep the security posture consistent.
- **Deviation from spec's "Components reused vs new" table:**
  - Spec said *adapt Modal → Drawer*. Plan instead builds a fresh `Drawer` (Task 3) because the existing `Modal` is built around `innerHTML` template strings and adapting it would either spread that pattern or require a deep rewrite. Fresh primitive is cleaner.
  - Spec said *reuse FilterPanel for PEAK chips*. Plan instead inlines the chip markup in `coverage.html` (Task 6) and wires clicks in `coverage.ts` (Task 7). If you inspect `src/components/FilterPanel.ts` and find it's shape-compatible with just 3 static categories, prefer reuse and replace the inline chips. Either way works.
  - Spec said *reuse MatchedHuntsList for the drawer hunts list*. Plan inlines hunt-row rendering in `TechniquePanel.ts` (Task 4) because `MatchedHuntsList` is shaped around actor-matched-hunts. If a small refactor extracts a generic hunt-row renderer, do it as a separate commit before/after this work — not bundled.
