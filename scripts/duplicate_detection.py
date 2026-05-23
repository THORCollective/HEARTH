"""AI-powered duplicate detection for HEARTH hunt submissions.

Compares a new hunt against every existing hunt in Flames/, Embers/, and
Alchemy/ via a single Claude call and returns a markdown comment listing the
top 3 closest matches. Used by scripts/generate_from_cti.py to annotate the
GitHub issue comment posted after each draft is generated.
"""

import json
import os
import re
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5-20250929")
HUNT_DIRECTORIES = ("Flames", "Embers", "Alchemy")
TOP_N = 3

# Color/severity thresholds (similarity score, 0-100)
HIGH_SIMILARITY = 80
MODERATE_SIMILARITY = 60


def extract_hunt_info(content: str, filename: str, filepath: str) -> Optional[dict]:
    """Parse a hunt markdown file into a dict with hypothesis/tactic/tags.

    Returns None if no hypothesis can be located.
    """
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

    return {
        "filename": filename,
        "filepath": filepath,
        "hypothesis": hypothesis,
        "tactic": tactic,
        "tags": tags,
    }


def load_existing_hunts() -> list[dict]:
    """Walk Flames/Embers/Alchemy and return parsed hunt info for every file."""
    hunts: list[dict] = []
    for directory in HUNT_DIRECTORIES:
        dir_path = Path(directory)
        if not dir_path.exists():
            continue
        for hunt_file in sorted(dir_path.glob("*.md")):
            try:
                info = extract_hunt_info(
                    hunt_file.read_text(encoding="utf-8"),
                    hunt_file.name,
                    str(hunt_file),
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
        summary_lines.append(f"{h['filename']} | {tactic} | {hypothesis}")
    existing_block = "\n".join(summary_lines)

    return f"""You are reviewing a new threat hunt submission for a curated hunt library. Find the {TOP_N} existing hunts most similar to the new submission and rate the similarity of each.

NEW SUBMISSION:
- Hypothesis: {new_hunt.get('hypothesis', '')}
- Tactic: {new_hunt.get('tactic', '') or 'Unknown'}
- Tags: {', '.join(new_hunt.get('tags', []))}

EXISTING HUNTS (filename | tactic | hypothesis):
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
        max_tokens=600,
        temperature=0.0,
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


if __name__ == "__main__":
    test_content = """Threat actors are using the Snowflake GET command to exfiltrate compressed GZIP files from temporary internal stages to locally specified directories on attacker-controlled systems after staging stolen database records.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| TEST | Threat actors are using the Snowflake GET command to exfiltrate compressed GZIP files. | Exfiltration | Based on ATT&CK technique T1567.002. | #exfiltration #T1567_002 #snowflake | test-user |

## Why
- This is a smoke-test submission designed to match H142.
"""
    print(check_duplicates_for_new_submission(test_content, "TEST.md"))
