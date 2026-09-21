"""AI-powered duplicate detection for HEARTH hunt submissions.

Compares a new hunt against every existing hunt in Flames/, Embers/, and
Alchemy/ via a single Claude call and returns a markdown comment listing the
top 3 closest matches. Used by scripts/generate_from_cti.py to annotate the
GitHub issue comment posted after each draft is generated, and by the weekly
CTI pipeline via the --emit-prompt/--render CLI below.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

import frontmatter

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_parser import parse_hunt_file

load_dotenv()

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5")
HUNT_DIRECTORIES = ("Flames", "Embers", "Alchemy")
TOP_N = 3

# Color/severity thresholds (similarity score, 0-100)
HIGH_SIMILARITY = 80
MODERATE_SIMILARITY = 60

# Legacy hunts carry technique IDs inline as #T1234_001 tags rather than in a
# frontmatter field; accept the underscore, dot and slash separators all three
# formats have used.
_TECHNIQUE_RE = re.compile(r"T\d{4}(?:[._/]\d{3})?")


def _record(filename: str, filepath: str, hypothesis: str, tactic: str,
            tags: list[str], techniques: list[str]) -> Optional[dict]:
    """Normalize one hunt into the shape the prompt/report code consumes.

    The hypothesis is flattened to a single line because the candidate listing
    in the prompt is one hunt per line — an embedded newline would split a hunt
    across two rows and corrupt every candidate after it.
    """
    hypothesis = " ".join(hypothesis.split())
    if not hypothesis:
        return None
    return {
        "filename": filename,
        "filepath": filepath,
        "hypothesis": hypothesis,
        "tactic": tactic,
        "tags": tags,
        "techniques": techniques,
    }


def _frontmatter_metadata(content: str) -> Optional[dict]:
    """Return the YAML frontmatter mapping, or None if the file has none.

    Distinguishing "no frontmatter" from "frontmatter without a hypothesis"
    matters: only the former should fall through to the legacy table parser.
    A frontmatter hunt that falls through parses its own `---` opener as the
    hypothesis, which is the bug this module carried until Sept 2026.
    """
    try:
        post = frontmatter.loads(content)
    except Exception:
        return None
    return dict(post.metadata) if post.metadata else None


def _record_from_metadata(meta: dict, filename: str, filepath: str) -> Optional[dict]:
    """Build a record from a frontmatter mapping, the canonical hunt format."""
    # `title` is the fallback because a handful of hunts carry a descriptive
    # title and push the detail into the body instead of the hypothesis field.
    hypothesis = str(meta.get("hypothesis") or meta.get("title") or "")
    tactics = meta.get("tactics") or []
    if isinstance(tactics, str):
        tactics = [tactics]
    tags = [f"#{str(t).lstrip('#')}" for t in (meta.get("tags") or [])]
    techniques = [str(t) for t in (meta.get("techniques") or [])]

    return _record(
        filename,
        filepath,
        hypothesis,
        "/".join(str(t) for t in tactics),
        sorted(tags),
        techniques,
    )


def extract_hunt_info(content: str, filename: str, filepath: str) -> Optional[dict]:
    """Parse a hunt markdown file into a dict with hypothesis/tactic/tags.

    Prefers YAML frontmatter (canonical since the 2026 migration) and falls back
    to scanning for the legacy 6-cell table. Returns None if no hypothesis can
    be located either way.
    """
    meta = _frontmatter_metadata(content)
    if meta is not None:
        return _record_from_metadata(meta, filename, filepath)

    lines = content.splitlines()

    hypothesis = ""
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith("|") and not stripped.startswith("#"):
            hypothesis = stripped
            break

    if not hypothesis:
        return None

    tactic = ""
    for i, line in enumerate(lines):
        if "|" in line and "Tactic" in line and "Hypothesis" in line:
            for follow in lines[i + 1:i + 4]:
                if "|" in follow and "---" not in follow:
                    cells = [c.strip() for c in follow.split("|")]
                    cells = [c for c in cells if c]
                    if len(cells) >= 3:
                        tactic = cells[2]
                    break
            break

    tags = sorted(set(re.findall(r"#[\w\-_]+", content)))
    techniques = _TECHNIQUE_RE.findall(content)

    return _record(filename, filepath, hypothesis, tactic, tags,
                   sorted(set(techniques)))


def load_existing_hunts() -> list[dict]:
    """Walk Flames/Embers/Alchemy and return parsed hunt info for every file.

    Uses scripts.hunt_parser — the same parser rebuild_hunts_data.py runs — so
    the corpus this module compares against is exactly the corpus the site
    indexes, including its legacy-table fallback and schema validation. A file
    that fails to parse is skipped with a warning rather than aborting: one bad
    hunt must not cost the whole batch its duplicate check.
    """
    hunts: list[dict] = []
    for directory in HUNT_DIRECTORIES:
        dir_path = Path(directory)
        if not dir_path.exists():
            continue
        for hunt_file in sorted(dir_path.glob("*.md")):
            try:
                data = parse_hunt_file(hunt_file, directory)
                info = _record(
                    hunt_file.name,
                    f"{directory}/{hunt_file.name}",
                    str(data.get("hypothesis") or data.get("title") or ""),
                    "/".join(str(t) for t in (data.get("tactics") or [])),
                    sorted(f"#{str(t).lstrip('#')}" for t in (data.get("tags") or [])),
                    [str(t) for t in (data.get("techniques") or [])],
                )
            except Exception as exc:
                print(f"⚠️ Could not parse {hunt_file}: {exc}")
                continue
            if info:
                hunts.append(info)
    return hunts


def _build_prompt(new_hunt: dict, existing: list[dict]) -> str:
    summary_lines = []
    for h in existing:
        hypothesis = h["hypothesis"][:200].replace("\n", " ")
        tactic = h["tactic"] or "Unknown"
        techniques = ",".join(h.get("techniques") or []) or "-"
        summary_lines.append(f"{h['filename']} | {tactic} | {techniques} | {hypothesis}")
    existing_block = "\n".join(summary_lines)

    return f"""You are reviewing a new threat hunt submission for a curated hunt library. Find the {TOP_N} existing hunts most similar to the new submission and rate the similarity of each.

NEW SUBMISSION:
- Hypothesis: {new_hunt.get('hypothesis', '')}
- Tactic: {new_hunt.get('tactic', '') or 'Unknown'}
- Techniques: {', '.join(new_hunt.get('techniques') or []) or 'Unknown'}
- Tags: {', '.join(new_hunt.get('tags', []))}

Shared technique IDs are a strong duplicate signal, but not decisive on their own:
a hunt that splits an existing one by platform is a legitimate separate hunt, while
two hunts describing the same behaviour under different sub-technique IDs are not.
Judge the behaviour being hunted and the telemetry it relies on, not the IDs alone.

EXISTING HUNTS (filename | tactic | techniques | hypothesis):
{existing_block}

Rank the {TOP_N} most similar existing hunts. For each, score 0-100 where:
  90-100 = Same technique, same target, near-duplicate
  70-89  = Same technique, different angle/target
  50-69  = Related technique or shared component
  <50    = Loose conceptual overlap only

Return JSON only, no prose or code fences:
{{"top_matches": [
  {{"filename": "H042.md", "score": 87, "explanation": "Both hunt for ..."}},
  {{"filename": "H118.md", "score": 64, "explanation": "..."}},
  {{"filename": "H007.md", "score": 41, "explanation": "..."}}
]}}"""


def _parse_response(raw: str) -> list[dict]:
    """Extract the top_matches list from Claude's response. Tolerates code fences."""
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```\s*$", "", text)
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return []
        try:
            payload = json.loads(match.group(0))
        except json.JSONDecodeError:
            return []
    matches = payload.get("top_matches") if isinstance(payload, dict) else None
    if not isinstance(matches, list):
        return []
    return matches


def rank_with_claude(new_hunt: dict, existing: list[dict]) -> list[dict]:
    """Single Claude call → list of top match dicts {filename, score, explanation}."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    prompt = _build_prompt(new_hunt, existing)

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=2048,
        thinking={"type": "disabled"},
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text if response.content else ""
    return _parse_response(raw)


def _emoji_for_score(score: int) -> str:
    if score >= HIGH_SIMILARITY:
        return "🔴"
    if score >= MODERATE_SIMILARITY:
        return "🟡"
    return "🟢"


def _resolve_filepath(filename: str, existing: list[dict]) -> str:
    for h in existing:
        if h["filename"] == filename:
            return h["filepath"]
    return filename


def format_comment(matches: list[dict], existing: list[dict]) -> str:
    """Format the markdown block that goes under '🔍 Duplicate Detection Results:'."""
    if not matches:
        return "⚠️ Duplicate detection ran but produced no usable result — manual review recommended."

    valid = []
    for m in matches[:TOP_N]:
        if not isinstance(m, dict):
            continue
        try:
            score = int(m.get("score", 0))
        except (TypeError, ValueError):
            score = 0
        filename = str(m.get("filename", "")).strip()
        explanation = str(m.get("explanation", "")).strip() or "No explanation provided."
        if not filename:
            continue
        valid.append({"filename": filename, "score": score, "explanation": explanation})

    if not valid:
        return "⚠️ Duplicate detection ran but produced no usable result — manual review recommended."

    lines = ["**Top 3 closest existing hunts:**", ""]
    for m in valid:
        emoji = _emoji_for_score(m["score"])
        filepath = _resolve_filepath(m["filename"], existing)
        lines.append(f"{emoji} [{m['filename']}]({filepath}) — **{m['score']}% similar**")
        lines.append(f"    {m['explanation']}")
        lines.append("")

    top = valid[0]
    top_path = _resolve_filepath(top["filename"], existing)
    if top["score"] >= HIGH_SIMILARITY:
        footer = f"> Highest similarity: {top['score']}% — please review [{top['filename']}]({top_path}) before approving."
    elif top["score"] >= MODERATE_SIMILARITY:
        footer = f"> Highest similarity: {top['score']}% — likely distinct, but worth a glance at [{top['filename']}]({top_path})."
    else:
        footer = f"> Highest similarity: {top['score']}% — submission appears unique."
    lines.append(footer)

    return "\n".join(lines)


def check_duplicates_for_new_submission(new_hunt_content: str, new_hunt_filename: str) -> str:
    """Public entry point. Returns the markdown comment body."""
    print("🔍 Starting duplicate detection...")

    new_info = extract_hunt_info(new_hunt_content, new_hunt_filename, new_hunt_filename)
    if not new_info:
        return "⚠️ Could not extract hypothesis from submission — manual review recommended."

    existing = load_existing_hunts()
    existing = [h for h in existing if h["filename"] != new_hunt_filename]
    print(f"📚 Comparing against {len(existing)} existing hunts.")

    if not existing:
        return "✅ No existing hunts to compare against — this is the first submission."

    try:
        matches = rank_with_claude(new_info, existing)
    except Exception as exc:
        print(f"❌ Claude call failed: {exc}")
        return "⚠️ Duplicate detection ran but produced no usable result — manual review recommended."

    return format_comment(matches, existing)


def novelty_axis_score(top_score: int) -> int:
    """Map a top similarity score onto the 0-3 novelty axis of the CTI pipeline
    quality scorecard.

    The 2 -> 1 boundary is deliberately aligned with HIGH_SIMILARITY: the
    scorecard's per-axis floor is 2, so anything the report renders red is also
    the thing that forces a regeneration.
    """
    if top_score >= 90:
        return 0
    if top_score >= HIGH_SIMILARITY:
        return 1
    if top_score >= MODERATE_SIMILARITY:
        return 2
    return 3


# --- CLI ---------------------------------------------------------------------
#
# The weekly CTI pipeline runs inside Claude Code with no ANTHROPIC_API_KEY on
# the box (the key exists only as a GitHub Actions secret), so rank_with_claude()
# is unavailable there. `emit` prints the ranking prompt for the agent already in
# the loop to answer, and `render` turns its JSON back into the same report the
# API path produces. `check` is the original single-hunt API path.


def _load_batch(paths: list[str]) -> list[dict]:
    batch = []
    for p in paths:
        path = Path(p)
        info = extract_hunt_info(path.read_text(encoding="utf-8"), path.name, str(path))
        if not info:
            raise SystemExit(f"Could not extract a hypothesis from {path}")
        batch.append(info)
    return batch


def _corpus_excluding(batch: list[dict]) -> list[dict]:
    """Corpus minus the batch's own files.

    On the pipeline path the hunts are already written to disk before this runs,
    so without the filter every hunt would match itself at 100%.
    """
    names = {h["filename"] for h in batch}
    return [h for h in load_existing_hunts() if h["filename"] not in names]


def _cmd_emit(args) -> int:
    batch = _load_batch(args.hunt)
    existing = _corpus_excluding(batch)
    if not existing:
        print("No existing hunts to compare against.", file=sys.stderr)
        return 1

    # One shared corpus block for the whole batch — the candidate listing is
    # identical across submissions and is by far the largest part of the prompt.
    base = _build_prompt(batch[0], existing)
    corpus_block = base.split("EXISTING HUNTS", 1)[1]

    print(f"Rank each of the {len(batch)} new submissions below against the existing "
          f"hunt library. For EACH submission return the {TOP_N} most similar existing "
          "hunts.\n")
    print("Scoring: 90-100 = same technique, same target, near-duplicate; "
          "70-89 = same technique, different angle/target; "
          "50-69 = related technique or shared component; <50 = loose overlap only.\n")
    print("Shared technique IDs are a strong signal but not decisive: a platform split "
          "of an existing hunt is legitimate, while the same behaviour under a different "
          "sub-technique ID is not. Judge behaviour and telemetry, not IDs alone.\n")
    print("Return JSON only, no prose or code fences, keyed by submission filename:")
    print('{"H999.md": [{"filename": "H042.md", "score": 87, "explanation": "..."}]}\n')

    print("NEW SUBMISSIONS:")
    for h in batch:
        print(f"\n### {h['filename']}")
        print(f"- Tactic: {h['tactic'] or 'Unknown'}")
        print(f"- Techniques: {', '.join(h['techniques']) or 'Unknown'}")
        print(f"- Hypothesis: {h['hypothesis'][:700]}")

    print(f"\nEXISTING HUNTS{corpus_block}")
    return 0


def _cmd_render(args) -> int:
    batch = _load_batch(args.hunt)
    existing = _corpus_excluding(batch)
    rankings = json.loads(Path(args.ranking).read_text(encoding="utf-8"))

    sections, summary = [], []
    for h in batch:
        name = h["filename"]
        matches = rankings.get(name) or []
        sections.append(f"## {name}\n\n{format_comment(matches, existing)}")
        scores = [int(m.get("score", 0)) for m in matches if isinstance(m, dict)]
        top = max(scores) if scores else 0
        summary.append((name, top, novelty_axis_score(top)))

    print("\n\n---\n\n".join(sections))
    print("\n\n## Novelty axis (0-3), derived from top similarity\n")
    print("| Hunt | Top match | Novelty |")
    print("|---|---|---|")
    for name, top, axis in summary:
        print(f"| {name} | {top}% | {axis}/3 |")

    failing = [n for n, _, a in summary if a < 2]
    if failing:
        print(f"\n**{len(failing)} hunt(s) below the per-axis floor of 2 — "
              f"regenerate: {', '.join(failing)}**")
        return 2
    return 0


def _cmd_check(args) -> int:
    path = Path(args.hunt[0])
    print(check_duplicates_for_new_submission(path.read_text(encoding="utf-8"), path.name))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    emit = sub.add_parser("emit", help="print the ranking prompt for a batch of hunts")
    emit.add_argument("--hunt", action="append", required=True, help="path to a hunt file (repeatable)")
    emit.set_defaults(func=_cmd_emit)

    render = sub.add_parser("render", help="render a ranking JSON into the duplicate report")
    render.add_argument("--hunt", action="append", required=True)
    render.add_argument("--ranking", required=True, help="path to the ranking JSON")
    render.set_defaults(func=_cmd_render)

    check = sub.add_parser("check", help="score one hunt via the Anthropic API (needs ANTHROPIC_API_KEY)")
    check.add_argument("--hunt", action="append", required=True)
    check.set_defaults(func=_cmd_check)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
