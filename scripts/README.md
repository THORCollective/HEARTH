# HEARTH Scripts

The automation behind HEARTH: the CTI-to-hunt pipeline, the site data builders, and the hunt-ID integrity checks. Almost everything here runs from a GitHub Actions workflow rather than by hand — the "Run by" column tells you which one.

Markdown files in `Flames/`, `Embers/`, and `Alchemy/` are the source of truth. Every artifact these scripts produce (`hunts-data.js`, `database/hunts.db`, everything in `public/`) is derived and safe to regenerate.

## Layout

| Path               | What lives there                                                   |
| :----------------- | :----------------------------------------------------------------- |
| `scripts/`         | The pipeline, builders, and shared library modules documented here |
| `scripts/tests/`   | Pytest suite — see [Testing](#testing)                             |
| `.github/scripts/` | Workflow-only helpers: `process_issue.py`, `notebook_generator.py` |

## Hunt generation pipeline

Turns a CTI link or a manual submission into a drafted hunt and a pull request.

| Script                       | Purpose                                                                                            | Run by                           |
| :--------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------- |
| `cti_extract.py`             | Extracts clean article text from raw HTML. Library module — no CLI.                                | imported                         |
| `generate_from_cti.py`       | The core drafting step. Sends extracted CTI to Claude (or OpenAI) and writes a complete hunt file. | `issue-generate-hunts.yml`       |
| `process_hunt_submission.py` | Parses a submission issue body and drafts a hunt from it.                                          | `process-hunt-submission.yml`    |
| `duplicate_detection.py`     | AI similarity check against the SQLite index; flags likely duplicates before merge.                | called by the drafting workflows |
| `reassign_hunt_id.py`        | Reassigns a draft's hunt ID when it collides with one already taken.                               | `pr-from-approval.yml`           |

**Environment:** `generate_from_cti.py` reads `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, and `CLAUDE_MODEL`, plus per-run inputs `CTI_SOURCE_URL`, `SUBMITTER_NAME`, `PROFILE_LINK`, `FEEDBACK`, and `EXISTING_HUNT_FILE` (set when regenerating). `process_hunt_submission.py` reads the same provider variables plus `ISSUE_BODY`. `duplicate_detection.py` reads `ANTHROPIC_API_KEY` and `CLAUDE_MODEL`.

See the Configuration section in the [root README](../README.md) for defaults.

## Hunt ID integrity

Hunt IDs get allocated across concurrent PRs, so collisions are caught rather than prevented.

| Script                        | Purpose                                                                              | Run by                     |
| :---------------------------- | :----------------------------------------------------------------------------------- | :------------------------- |
| `hunt_ids.py`                 | Shared parsing, allocation, and rewriting helpers. Library module.                   | imported                   |
| `check_hunt_id_collisions.py` | Fails a PR that introduces a colliding hunt ID.                                      | `validate-hunt-schema.yml` |
| `recheck_open_prs.py`         | Re-runs the collision check against every open PR after a merge shifts the ID space. | `recheck-open-prs.yml`     |

## Parsing and schema

| Script                      | Purpose                                                                           | Run by   |
| :-------------------------- | :-------------------------------------------------------------------------------- | :------- |
| `hunt_parser.py`            | Parses hunt markdown into structured records. Library module.                     | imported |
| `hunt_schema.py`            | Defines and validates the YAML frontmatter schema. Library module.                | imported |
| `migrate_to_frontmatter.py` | One-off migration from the legacy 6-cell table format to frontmatter. Idempotent. | manual   |

`migrate_to_frontmatter.py` takes flags:

```bash
python scripts/migrate_to_frontmatter.py --dry-run          # preview
python scripts/migrate_to_frontmatter.py --path Flames      # limit scope
```

Files still in the legacy format emit a `DeprecationWarning` when parsed. A handful remain; the parser handles both formats.

## Site data builders

These regenerate the JSON and JS the GitHub Pages site reads. All take no arguments except `build_hunt_database.py`, which accepts `--rebuild`, `--quiet`, and `--db-path`.

| Script                      | Writes                                                    | Run by                     |
| :-------------------------- | :-------------------------------------------------------- | :------------------------- |
| `rebuild_hunts_data.py`     | `hunts-data.js`                                           | `update-hunts.yml`         |
| `build_hunt_database.py`    | `database/hunts.db`                                       | `update-hunt-database.yml` |
| `generate_leaderboard.py`   | `Keepers/Contributors.md`                                 | `update_leaderboard.yml`   |
| `build_mitre_matrix.py`     | `public/mitre-matrix.json`                                | `refresh-actor-graph.yml`  |
| `build_actor_mentions.py`   | `public/actor-mentions.json`                              | manual                     |
| `build_datasource_map.py`   | data-source-to-technique mapping                          | manual                     |
| `enrich-context-graph.cjs`  | `public/context-graph-data.json`                          | manual                     |
| `enrich-phase2a.cjs`        | adds threat actor and campaign nodes to the context graph | `refresh-actor-graph.yml`  |
| `extract-intel-sources.cjs` | adds CVEs and advisory links to the context graph         | manual                     |
| `fetch_activity.cjs`        | `public/activity.json`                                    | `static.yml`               |

`build_mitre_matrix.py` and `enrich-phase2a.cjs` consume `data/enterprise-attack.json` (ATT&CK STIX). `fetch_activity.cjs` reads `GITHUB_TOKEN` and `HEARTH_REPO`, and runs at build time so visitors never hit the GitHub API directly.

`rebuild_hunts_data.py` and `generate_leaderboard.py` are pure stdlib — no dependency install needed.

## Testing

The suite lives in `scripts/tests/` and covers the parser, schema, hunt IDs, CTI extraction, collision detection, and the frontmatter migration.

```bash
pip install -r requirements.txt
python -m pytest scripts/tests -q
```

70 tests, roughly a second. `pythonpath = ["."]` in `pyproject.toml` makes `scripts.*` importable from the repo root, so run pytest from there. The `fixtures_dir` fixture in `conftest.py` points at `scripts/tests/fixtures/`.

CI runs this suite on every pull request. `validate-hunt-schema.yml` deliberately carries no path filter — so it can serve as a required status check — and runs the collision check, per-file schema validation, and then `pytest scripts/tests/ -v`.

`ci.yml` is a separate guard covering the Node side: build, type-check, and vitest, plus a flake8 pass over `scripts/` and `.github/scripts/` limited to syntax errors and undefined names (`--select=E9,F63,F7,F82`).

## Regenerating derived data

Safe to re-run at any time; all outputs are derived from the markdown.

```bash
python scripts/rebuild_hunts_data.py            # site hunt data
python scripts/build_hunt_database.py           # SQLite index for duplicate detection
python scripts/generate_leaderboard.py          # contributor leaderboard
```

If duplicate detection behaves oddly, rebuilding the database is the first thing to try. See [database/README.md](../database/README.md).
