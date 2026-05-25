# Coverage Heatmap — Design

**Page:** `/coverage.html`
**Date:** 2026-05-24
**Status:** Design approved by Lauren; ready for implementation plan.
**Roadmap context:** This is the first ship from the [HEARTH Visual Surfaces roadmap](2026-05-24-visual-surfaces-roadmap.md). It's the technique-axis render of the shared hunts × techniques × actors data layer.

## Goal

A standalone global view of HEARTH's coverage of the MITRE ATT&CK Enterprise matrix, technique-level, with PEAK-category filtering and per-technique drill-down. Complements (does not replace) `actors.html`, which is the per-actor view at tactic granularity.

## Locked decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Layout | Faithful ATT&CK matrix (Navigator-style) | Instant recognition for hunters; pairs naturally with actors.html. |
| Scope | Global + lightweight filters | Standalone page; actor filter deep-links *out* to actors.html. |
| Coloring | Categorical: gap / thin / covered | Opinionated, readable at a glance, doubles as a contribution prompt. |
| Cell interaction | Side panel drawer | URL deep-linkable via `?t=Txxxx`; promotable to per-technique pages later. |
| Filters | PEAK category only (`All / Flames / Embers / Alchemy`) | Data Source dropped — no underlying field. |
| Refresh | Client-side from `hunts-data.js` | No build step; auto-fresh on hunt merge. |
| URL | `/coverage.html` | Reads as a counterpart to `/actors.html`. |

## Architecture

### Files
- `coverage.html` — root markup, design tokens, top nav (mirrors `actors.html` structure)
- `src/coverage.ts` — page entry (mirrors `src/actors.ts`)
- `src/data/mitre-matrix.json` — **new**, committed; slim MITRE matrix (see Data Layer)
- `scripts/build_mitre_matrix.py` — **new**; rebuilds `mitre-matrix.json` from `data/enterprise-attack.json`. Run on-demand when MITRE updates.
- Top nav additions: "Coverage" link added to `home.html`, `actors.html`, and `coverage.html` itself.

### Components (reused vs new)

| Component | Status | Notes |
| --- | --- | --- |
| `FilterPanel` | Reuse | Already styled; use for PEAK chips. |
| `Modal` | Adapt → `Drawer` | Either reuse Modal as a right-aligned variant, or extract a `Drawer` primitive. Decide during implementation based on Modal's API surface. |
| `MatchedHuntsList` / `HuntGrid` | Reuse or reference | Existing shape is actor-oriented; may need a small variant or partial reuse for technique-scoped hunt lists. |
| `Matrix` | New | The grid itself — tactics as columns, techniques (and subtechniques indented) as rows. |
| `StatsStrip` | New (small) | Three numbers above the matrix (filter-aware). |

### Data layer

Two inputs at runtime:

1. **`HUNTS_DATA`** from existing `hunts-data.js`. Each hunt provides `category` (PEAK), `techniques[]` (clean IDs like `T1071.001`), `id`, `title`, `file_path`.
2. **`mitre-matrix.json`** (new, committed). Shape:
   ```json
   {
     "tactics": [
       { "id": "TA0002", "shortname": "execution", "name": "Execution" },
       ...
     ],
     "techniques": [
       { "id": "T1059", "name": "Command and Scripting Interpreter", "tactic_ids": ["TA0002"], "description": "...", "url": "https://attack.mitre.org/techniques/T1059/" },
       { "id": "T1059.001", "name": "PowerShell", "parent": "T1059", "tactic_ids": ["TA0002"], "description": "...", "url": "..." },
       ...
     ]
   }
   ```
   - Description is trimmed to first paragraph (~500 chars) to keep file size reasonable.
   - File size target: < 200 KB.
   - Refreshed via `scripts/build_mitre_matrix.py`; not auto-updated by workflows (manual refresh is fine — MITRE doesn't change often).

Page logic at load:

```
1. Fetch mitre-matrix.json
2. Build coverage = Map<technique_id, { count, peakBreakdown: {Flames, Embers, Alchemy}, hunts: [...] }>
   by iterating HUNTS_DATA[*].techniques
3. Read URL: ?peak=, ?t=
4. Render filter chips with active state
5. Render matrix: for each tactic, list its techniques; lookup coverage; assign gap/thin/covered class
6. If ?t= present, open side panel for that technique
```

Filter change (`peak=foo`) recomputes the coverage map from the filtered subset and re-renders cell classes + stats strip. Cell click opens the drawer and updates URL.

### Coloring thresholds

- **Gap** — 0 hunts
- **Thin** — 1–2 hunts
- **Covered** — 3+ hunts

Use the *same CSS custom properties* as actors.html (`--ember`, `--surface`, `--line-soft`, etc.) — share the tokens, don't visually match them. Extract the token block into a shared CSS file if it isn't already.

## UI sections

### Header
Mirrors actors.html: eyebrow + serif H1 + lede paragraph. Title: "Coverage." Lede: one sentence on what the page is and how to use it.

### Filter row
A row of chips below the header: `All · Flames · Embers · Alchemy`. Active chip highlighted. Reuses FilterPanel styling.

### Stats strip
Three numbers, right-aligned with the filter row or just below it:
- **N** hunts (in active filter)
- **N / total** techniques covered (total comes from `mitre-matrix.json`, not hardcoded)
- **N** gaps

Numbers re-derive on filter change.

### Matrix
- 14 tactic columns (Reconnaissance → Impact), ordered per MITRE.
- Each column shows its techniques in MITRE order.
- Subtechniques indented under their parent.
- Each cell shows the technique ID at small size; coverage count appears on hover or in the drawer.
- Cells colored per the categorical scheme.
- Click target: the whole cell.

### Side panel (drawer)
Slides in from the right; max-width ~480px on desktop, full-width below 720px.
Contents:
- Header: technique ID (mono) + technique name (serif) + close X
- Meta chips: tactic, hunt count, PEAK breakdown (`5 Flames · 2 Embers`)
- Trimmed MITRE description + link to attack.mitre.org
- Section: "Hunts (N)" — list of hunt cards using `MatchedHuntsList`, each linking to its hunt page
- Empty state (if 0 hunts): "No hunts yet. [Contribute one →]" CTA → submission flow
- Dismiss: X button, Esc, click outside

## URL contract

| State | URL |
| --- | --- |
| Default | `/coverage.html` |
| Filter active | `/coverage.html?peak=flames` |
| Panel open | `/coverage.html?t=T1059` |
| Both | `/coverage.html?t=T1059.001&peak=embers` |

URL is the source of truth: any state change updates the URL via `history.replaceState`; page load reads the URL and restores. Browser back/forward should re-restore state.

## Edge cases

- **Initial load** — skeleton matrix (dim cells) until both data sources resolve; no flash of empty state.
- **Filter with zero matches** — matrix renders all-gap; stats strip says e.g. "0 hunts in Alchemy" honestly. No error message.
- **Technique referenced by a hunt but missing from `mitre-matrix.json`** — log to console; do not throw; skip rendering that hunt's coverage on that technique. A follow-up task can add a build-time linter to flag this.
- **Empty hunts list in panel** — "No hunts yet" + contribute CTA. Reinforces the gap-as-prompt framing.
- **Mobile / narrow viewports** — matrix becomes horizontally scrollable; drawer becomes full-width sheet. No bespoke mobile layout — degrade gracefully.

## Testing approach

- **Manual via Playwright**:
  - Load `/coverage.html` cold; verify matrix renders, stats strip populated
  - Click each PEAK filter; verify cells recolor and stats update
  - Click a gap cell; verify drawer opens with empty-state CTA; verify `?t=` in URL
  - Click a covered cell; verify drawer shows hunts list; click a hunt link
  - Hit browser back; verify state restores
  - Open `/coverage.html?t=T1059&peak=flames` directly; verify state restored
- **Visual diff** — screenshot default, each filter state, and a drawer-open state
- **No new unit tests** — data-layer logic is ~50 lines and exercised by manual flows. Revisit if logic grows.

## Out of scope (intentional)

- **Data Source filter** — no underlying field in `hunts-data.js`; needs schema change + backfill. Separate task.
- **Per-technique pages** (`/technique/Txxxx.html`) — side panel + deep-link is enough for V1. Promote later for SEO surface area.
- **Bespoke mobile layout** — page degrades to horizontal scroll, no custom mobile design.
- **Refactoring actors.html's tactic heatmap** — leave it alone.
- **Auto-refresh of MITRE matrix** — `build_mitre_matrix.py` is run manually; MITRE evolves slowly.
- **Recency filter** — deferred; can add later as a third chip group.

## Open questions / risks

| Question | Owner | When to resolve |
| --- | --- | --- |
| Drawer: extend Modal or build a separate Drawer primitive? | Implementer | During implementation, after reading Modal's API |
| Where does `build_mitre_matrix.py` source MITRE data — refetch from CTI-Taxii, or read existing `data/enterprise-attack.json`? | Implementer | First run of the script |
| How do subtechniques render visually when their parent is fully gap vs partially covered? | Designer | Implementation; may need a small mockup iteration |

## Acceptance criteria

The build is done when:

1. `/coverage.html` is reachable from the top nav on home and actors pages.
2. The matrix renders all 14 tactics × their techniques with correct categorical coloring derived from `HUNTS_DATA`.
3. Filter chips work; cells recolor and stats strip updates on filter change.
4. Cell click opens the drawer with correct content, including the empty-state CTA for gap cells.
5. URL state is preserved on filter change, cell click, and panel close; deep-links restore state.
6. Page degrades to scrollable matrix + full-width drawer on narrow viewports.
7. `scripts/build_mitre_matrix.py` produces a valid `src/data/mitre-matrix.json` from MITRE source data.
8. README updated to reference the new page under "Key Features."
