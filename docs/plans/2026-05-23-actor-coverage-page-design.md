# HEARTH Actor Coverage Page Design

**Date**: 2026-05-23
**Author**: Lauren Proehl
**Status**: Draft

---

## Summary

Add a new top-level page, `/actors.html`, that answers a single question: *"Is this threat actor covered by any hunts in HEARTH?"*

For a hunter prepping an engagement, the page returns a curated list of HEARTH hunts relevant to the chosen actor. For a defender doing coverage analysis, the page also surfaces a coverage percentage, a tactic-level heatmap, and a gap list — techniques the actor uses for which HEARTH has no hunt yet, with a direct call-to-action to contribute one.

The substrate already exists: `public/context-graph-data.json` contains 159 MITRE-mapped threat actors (with aliases) and 1,670 `EMPLOYS` edges to MITRE techniques. This feature is a thin lookup, matching, and UI layer on top.

---

## Goals & Non-Goals

### Goals

- Let a user resolve a threat actor by name or any known alias and see, on one page:
  - All HEARTH hunts that share a MITRE technique with the actor.
  - All HEARTH hunts that mention the actor by name or alias in their prose.
  - A coverage percentage and tactic heatmap.
  - A gap list of techniques the actor employs but no HEARTH hunt covers.
- Make the page deep-linkable (`/actors.html?actor=G0016`) so it's easy to share.
- Reuse the existing visual language from `home.html` and `context-graph.html`.

### Non-Goals

- Multi-actor comparison (e.g. "show overlap between APT29 and Lazarus"). Future, not now.
- A backend or live API. All data is static JSON shipped with the site.
- Filtering or sorting the matched-hunts list. The library page (`index.html`) already handles exploratory search; this page is curated output, not exploration.
- Authoring or editing actor records. Source of truth stays MITRE ATT&CK via the existing context-graph pipeline.
- Saved watchlists, user accounts, or per-user state.
- Adding actors that don't exist in MITRE's group catalog.

---

## Coverage Definition

A hunt is considered to "cover" an actor if **either** of these is true:

1. **Technique match** — the hunt's `techniques` array intersects with the set of techniques the actor `EMPLOYS` in `context-graph-data.json`.
2. **Name mention** — the hunt's `title`, `why`, `notes`, or `references` text contains a case-insensitive, word-boundary match for the actor's display name or any of its aliases.

Both classes of match are shown to the user, with a small badge on each hunt row indicating the match reason (`TECH`, `MENTION`, or both). Technique-match hunts sort above mention-only hunts.

### Name-matching false positives

Some aliases are common English words ("Dragonfly", "Mustang") and would generate false-positive mentions. Mitigation:

- Word-boundary regex match (`\b<alias>\b`), case-insensitive.
- A denylist file `scripts/actor_alias_denylist.json` lists `(actor_id, alias)` pairs to exclude from name matching. Ships empty; entries added when false positives are observed.
- A minimum alias length of 4 characters; shorter aliases (e.g. "APT", three-letter codes) are ignored for mention matching but still resolve the actor in search.

---

## User Flow

### Empty state (no actor selected)

- Hero with page title and a large search input with autocomplete over all 159 actors and their aliases.
- A row of suggested actors as clickable chips. Initial set, hard-coded in the page markup: `Volt Typhoon`, `APT29`, `Lazarus Group`, `FIN7`, `LockBit`, `Scattered Spider`. Revisable later without code changes by editing the markup.
- A small stats line: "X actors mapped · Y covered by ≥1 HEARTH hunt".

### Result state (`/actors.html?actor=G0016` or a search selection)

Top to bottom:

1. **Actor header** — display name, aliases as chips, 1–2 sentence MITRE description (truncated from `context-graph-data.json`), link to MITRE Group page.
2. **Coverage strip** — four stats in the home-page `.stats` style:
   - `Coverage %` = (actor's techniques with ≥1 matched hunt) / (total actor techniques)
   - `Matched hunts` (union of TECH and MENTION matches, deduplicated)
   - `Techniques actor uses` (from `EMPLOYS` edges)
   - `Gap techniques` (techniques actor uses with 0 matched hunts)
3. **Tactic heatmap** — twelve cells, one per ATT&CK tactic, in kill-chain order. Each cell shows tactic name + "X / Y covered" + a fill color based on coverage ratio. Empty tactics (actor doesn't use any techniques in that tactic) render as muted.
4. **Matched hunts list** — rendered with the existing `lib-row` style. Each row shows: hunt title, PEAK badge, technique chips (with shared techniques visually highlighted), contributor, and a match-reason badge. Sort order: `TECH` matches first (by number of shared techniques desc), then `MENTION`-only matches (alphabetical).
5. **Gap list** — techniques the actor employs that have zero matched hunts. Each row: technique ID, technique name, tactic, "Submit a hunt for this →" link that deep-links to `submit.html?technique=Txxxx` (this query param is new; spec'd below).

### Not-found state

If the user types a term that doesn't resolve to any actor:

- Show "We don't have `<query>` mapped in HEARTH yet."
- Brief explanation: "Actors are sourced from MITRE ATT&CK's group catalog. If this is a new or unmapped actor, you can still contribute hunts based on their TTPs."
- CTA buttons: `Submit a hunt →` and `Browse all actors`.

---

## Data Flow

### Existing inputs (no schema changes)

- **`public/context-graph-data.json`** — already contains:
  - `threat_actor` nodes with `id` (e.g. `actor:G0016`), `label`, `aliases`, `description`, `technique_count`, `external_references`.
  - `EMPLOYS` edges from each actor to its MITRE techniques.
- **`public/hunts-data.json`** — already contains `id`, `title`, `techniques`, `tactic`, `why`, `notes`, `references`, `category`, `submitter` per hunt.

### New build-time artifact: `public/actor-mentions.json`

A precomputed index keyed by actor ID, listing the hunt IDs that mention that actor by name or alias.

```json
{
  "generated_at": "2026-05-23T12:00:00Z",
  "mentions": {
    "actor:G0016": ["H012", "H034"],
    "actor:G0032": ["B007"]
  }
}
```

Built by a new Python script (see below). Regenerated whenever hunts or the context graph regenerate. Stored in `public/` so the static site can fetch it.

### New script: `scripts/build_actor_mentions.py`

Inputs: `public/context-graph-data.json`, `public/hunts-data.json`, `scripts/actor_alias_denylist.json`.

Output: `public/actor-mentions.json`.

Logic:

1. Load all `threat_actor` nodes. For each actor, build a list of search terms = `[label] + aliases`, filtered by:
   - Length ≥ 4 chars.
   - Not in the denylist for that actor ID.
2. For each hunt, concatenate `title + why + notes + references` (raw markdown is fine) into one searchable string, lowercased.
3. For each (actor, term) pair, regex `\b<term>\b` (case-insensitive). If any match, record `actor_id → hunt_id`.
4. Dedupe and write `actor-mentions.json`.

The script must be idempotent and runnable standalone. It will be added to whichever existing pipeline regenerates the JSON artifacts (likely invoked from `rebuild_hunts_data.py` or a Make target — pick during implementation by checking the current build entrypoint).

### Client-side matching

All three JSON files are fetched on page load. No additional server calls. Matching happens in TypeScript:

- Build a `Map<actorId, Set<techniqueId>>` from `EMPLOYS` edges.
- Build a `Map<techniqueId, Hunt[]>` from `hunts-data.json`.
- For a selected actor: union the technique-match hunts and the name-mention hunts, attach match-reason metadata, dedupe by hunt ID.

For 159 actors and ~120 hunts, this is trivially fast and fits well within the static-data model the rest of the site uses.

---

## URL & Routing

- `/actors.html` — empty state.
- `/actors.html?actor=<id>` — result state. `<id>` is the MITRE group ID with the `actor:` prefix stripped (e.g. `G0016`). Anything else falls back to the empty state with the query echoed into the search input.
- Optional alias-friendly form `/actors.html?q=apt29` — resolves the query against actor names/aliases. If it matches exactly one actor, replace URL with the canonical `?actor=Gxxxx` form. If it matches zero or multiple, render not-found / disambiguation.

### Outbound deep-link to submit

The gap list's "Submit a hunt for this →" link points to `submit.html?technique=<Txxxx>`. The submit page may not currently read this parameter; if not, we add a small change to prefill the technique field. This is a one-line addition and stays in scope.

---

## Components & File Layout

New files:

- `actors.html` — page markup, mirroring the structure of `home.html`.
- `src/actors.ts` — page entry, mirroring `src/home.ts`. Wires up search, URL parsing, state transitions, and component rendering.
- `src/components/ActorSearch.ts` — autocomplete input. Indexes actor name + aliases. Renders a dropdown of matches as the user types. Emits a selection event.
- `src/components/ActorHeader.ts` — name, alias chips, description, MITRE link.
- `src/components/ActorCoverage.ts` — coverage strip (four stats) + tactic heatmap (12 cells).
- `src/components/GapList.ts` — uncovered-techniques list with submit CTAs.
- `src/lib/actor-matching.ts` — pure functions for matching logic, importable by `actors.ts` and unit-testable.
- `src/types/Actor.ts` — `Actor`, `ActorMatch`, `MatchReason` types.
- `scripts/build_actor_mentions.py` — generator described above.
- `scripts/actor_alias_denylist.json` — initially `{}`.

Reused / lightly modified:

- The existing `lib-row` styles from `home.html` are reused for the matched-hunts list. Either lift the relevant CSS into a shared stylesheet (preferred) or duplicate the rules into `actors.html`. Decision made during implementation based on how much CSS is currently shared.
- Topbar nav added to: `home.html`, `index.html`, `submit.html`, `graph.html`, `context-graph.html`, `actors.html`. A nav link `Actors` goes between `Coverage` and `Context`. This is a five-line change per file.
- `vite.config.ts` — add `actors: resolve(__dirname, 'actors.html')` to `build.rollupOptions.input`. Without this, the production build will omit the new page.
- `submit.html` / `src/submit.ts` — if not already supported, read `?technique=Txxxx` from the URL and prefill the technique field.

---

## Visual Design Notes

The page reuses the home-page palette and component patterns:

- Hero with serif title and ember accent (`em` italics in ember-2 color).
- Coverage strip uses the `.stats` four-column layout from `home.html`.
- Tactic heatmap cells use ember intensity for coverage ratio: deeper ember = better coverage. Empty cells are muted gray.
- Matched hunts list reuses the `.lib-head` / `.lib-row` grid from the home page library section.
- Gap list uses a simpler row layout with the technique ID in mono, technique name in sans, and the submit CTA right-aligned.

No new fonts, no new color tokens. All existing CSS variables in `home.html` (`--ember`, `--surface`, `--line-soft`, etc.) carry over.

---

## Edge Cases & Error Handling

- **Actor not in MITRE.** Not-found state with a CTA to submit a hunt. No attempt to invent records for unmapped actors.
- **Actor with zero techniques in `EMPLOYS`.** Render coverage strip with `0 / 0 covered (n/a)`, skip the heatmap, show only the mentions list (if any) and an explanatory note.
- **Actor with zero matched hunts.** Coverage strip shows 0%, matched-hunts list shows an empty state ("No HEARTH hunts cover this actor yet — be the first."), gap list shows all of the actor's techniques.
- **Hunt missing the `techniques` field.** Treated as a non-match for technique matching. Still eligible for name-mention matching from its text.
- **Same hunt matches by both technique and name.** Single row, badge shows both reasons.
- **Failed fetch of any of the three JSON files.** Render a plain error banner ("Could not load actor data — try refreshing.") and stop. Match the error treatment already used in `src/home.ts`.

---

## Testing

- **Unit tests** for `src/lib/actor-matching.ts`: feed in fixture actors and hunts, assert match lists and coverage math. This is the only logic worth testing in isolation; everything else is wiring and rendering.
- **Unit tests** for `scripts/build_actor_mentions.py`: word-boundary correctness, denylist application, length filter, alias deduplication. Fixture hunts with known mentions; assert exact output.
- **Manual smoke tests** (run locally with `npm run dev`):
  - Empty state renders and search resolves common actors.
  - APT29 lookup shows aliases, coverage %, matched hunts, gap list.
  - Deep link `/actors.html?actor=G0016` lands on result state directly.
  - Garbage query (`?q=zzznotreal`) lands on not-found state.
  - Submit deep link from a gap row prefills the technique on `submit.html`.

No new e2e framework. The repo does not currently have one; introducing Playwright here is out of scope.

---

## Implementation Sequencing

A rough order, to be detailed in the implementation plan:

1. Add `actors.html` entry to `vite.config.ts` so the page can be built and previewed end-to-end as soon as it exists.
2. Write `scripts/build_actor_mentions.py` + denylist + tests; generate `public/actor-mentions.json` once.
3. Build `src/lib/actor-matching.ts` + unit tests.
4. Build `actors.html` markup + `src/actors.ts` page entry, wired to all three JSON files. Empty state and not-found state first.
5. Build the result-state components (`ActorHeader`, `ActorCoverage`, `GapList`) one at a time.
6. Add nav link to all topbars.
7. Add `?technique=` prefill to `submit.html` / `src/submit.ts`.
8. Wire the mention-builder into whatever existing build/regeneration command produces the other JSON artifacts.
