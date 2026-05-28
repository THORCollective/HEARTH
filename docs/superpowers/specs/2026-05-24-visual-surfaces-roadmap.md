# HEARTH Visual Surfaces — Roadmap

**Date:** 2026-05-24
**Status:** Brainstorm captured. Heatmap selected for first ship; full design TBD.
**Context:** Lauren had builder-energy itch for a new visual surface on HEARTH, building on the actors.html momentum and the social images that are already in flight.

## The core insight

The four candidates below aren't four ideas — they are **four renders of the same underlying data layer**: hunts × MITRE techniques × actor mappings × pipeline-source articles × publish dates. Build that data layer once, and each surface becomes a different projection of it:

| Surface | Slice |
| --- | --- |
| Heatmap | by **technique** |
| Actor Fold | by **actor** |
| Dispatch | by **week** |
| State of the HEARTH | by **year** |

This frame shapes the build order: ship the surface that exercises the most reusable data first.

## The four candidates

### 1. MITRE Coverage Heatmap *(first ship — recommended)*
The whole ATT&CK matrix, colored by how many community hunts cover each technique. Hover/click to drill in. Gaps become visible at a glance.

- **Why first:** lowest editorial cost (pure data render), highest visual return, auto-updates as hunts merge, social tease already exists (`social-5-heatmap.png`), and it's the kind of artifact that gets shared on security Twitter.
- **What it unlocks:** the technique-axis data layer that every later surface reuses.

### 2. Threat Actor Fold
A magazine-style deep-dive page per actor — narrative, timeline of campaigns, every HEARTH hunt mapped to that actor, woven into the story. The fold from `social-4-apt29-fold.png` made real.

- **Why second:** deepest editorial value, most distinctive in the industry, each page is a permanent SEO asset, builds directly on `actors.html`.
- **Cost note:** needs writing per actor — start with one or two flagship folds (APT29, Volt Typhoon) rather than auto-generating all of them.

### 3. Weekly Dispatch
Each weekly pipeline run becomes a curated "issue" — editorial framing, the new hunts, what they mean. Content-publication surface designed for sharing.

- **Why third:** maximum value once Heatmap + Folds exist, because each dispatch issue can link into both.
- **Distribution angle:** newsletter / RSS / Slack-friendly format opens a recurring loop with the audience.

### 4. State of the HEARTH
Scroll-driven annual or quarterly report — the numbers, the trends, the top contributors, the threats that defined the period. A landmark moment people screenshot.

- **Why last:** natural year-end capstone once the other three surfaces exist and there's enough longitudinal data to tell a story. Premature without them.

## Open questions for the Heatmap design

These get answered when we move from this roadmap into a real design doc for the Heatmap:

- **Layout:** classic ATT&CK matrix (tactics as columns, techniques as rows) vs. an editorial reinterpretation?
- **Coloring:** raw hunt count, normalized intensity, or a categorical "covered / thin / gap" scheme?
- **Interaction:** click-to-drill-into-hunts-list, hover-tooltip-with-counts, or full filter panel (by actor, by PEAK category)?
- **Cross-links:** does each technique cell link out to the hunts? Out to the actors that use it?
- **Refresh model:** baked at build time, or computed client-side from the hunts data?
- **Empty-state framing:** how do we present gaps without making the library look weak? (Gaps are a feature — they're contribution prompts.)

## Not in scope for this brainstorm

- Non-visual surfaces (MCP server, newsletter automation, hunt-pack generator, etc.) — separate brainstorm.
- Changes to the underlying hunt schema or PEAK categorization.
- Pipeline-side changes — the CTI pipeline was just hardened (see `feedback_cti_pipeline_*` memory notes) and is intentionally out of scope here.

## Next step

Design the Heatmap properly — clarifying questions on the open questions above, then 2–3 concrete approaches, then a full design doc that flows into an implementation plan.
