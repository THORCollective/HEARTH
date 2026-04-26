"""
HEARTH hunt markdown parser.

Single entry point for converting a hunt markdown file into a structured dict.
Prefers YAML frontmatter (canonical). Falls back to the legacy 6-cell table
format during the transition period — emits a DeprecationWarning when it does.
"""
from __future__ import annotations

import re
import warnings
from pathlib import Path
from typing import Any

import frontmatter

from scripts.hunt_schema import validate_hunt


class HuntValidationError(ValueError):
    """Raised when a hunt file fails schema validation."""


_TECHNIQUE_RE = re.compile(r"T(\d{4})(?:[._/](\d{3}))?")
_TAG_RE = re.compile(r"#([\w\-\.]+)")
_SUBMITTER_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def _normalize_techniques(text: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for match in _TECHNIQUE_RE.finditer(text):
        tid = f"T{match.group(1)}"
        if match.group(2):
            tid = f"{tid}.{match.group(2)}"
        if tid not in seen:
            seen.add(tid)
            out.append(tid)
    return out


def _normalize_tags(text: str) -> list[str]:
    raw = _TAG_RE.findall(text)
    out: list[str] = []
    seen: set[str] = set()
    for t in raw:
        if _TECHNIQUE_RE.fullmatch(t):
            continue  # techniques live in their own field
        norm = t.lower().replace("-", "_").replace(".", "_")
        if norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out


def _split_tactics(raw: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"[,/]| and ", raw) if p.strip()]
    return parts or [raw.strip()]


def _extract_section(body: str, header: str) -> str:
    pattern = rf"^## {header}\s*\n(.*?)(?=^## |\Z)"
    match = re.search(pattern, body, re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ""


def _parse_legacy_table(content: str, hunt_id: str, category: str) -> dict[str, Any]:
    lines = content.splitlines()
    table_start = None
    for i, line in enumerate(lines):
        if "|" in line and ("Hunt #" in line or "Hunt#" in line or "Idea" in line):
            table_start = i
            break
    cells: list[str] = ["", "", "", "", "", ""]
    if table_start is not None and table_start + 2 < len(lines):
        raw = [c.strip() for c in lines[table_start + 2].split("|") if c.strip()]
        for j, c in enumerate(raw[:6]):
            cells[j] = c

    tactics = _split_tactics(re.sub(r"\*\*", "", cells[2])) if cells[2] else []
    notes = re.sub(r"\*\*", "", cells[3])
    tags_text = cells[4]
    submitter_raw = cells[5]

    submitter = {"name": submitter_raw.strip(), "link": ""}
    m = _SUBMITTER_LINK_RE.search(submitter_raw)
    if m:
        submitter = {"name": m.group(1).strip(), "link": m.group(2).strip()}

    return {
        "id": cells[0].strip() or hunt_id,
        "category": category,
        "hypothesis": re.sub(r"\*\*", "", cells[1]).strip(),
        "tactics": tactics,
        "techniques": _normalize_techniques(notes + " " + tags_text),
        "tags": _normalize_tags(tags_text),
        "submitter": submitter,
        "notes": notes.strip(),
    }


def parse_hunt_file(path: str | Path, category: str) -> dict[str, Any]:
    """Parse a hunt markdown file into a structured dict.

    Returns a dict containing all schema fields plus `why`, `references`,
    and `file_path` for downstream consumers.
    """
    path = Path(path)
    raw = path.read_text(encoding="utf-8")
    post = frontmatter.loads(raw)

    if post.metadata:
        data = dict(post.metadata)
        data.setdefault("category", category)
        errors = validate_hunt(data)
        if errors:
            raise HuntValidationError(
                f"{path.name}: invalid frontmatter:\n  - " + "\n  - ".join(errors)
            )
        body = post.content
    else:
        warnings.warn(
            f"{path.name} uses legacy table format; run "
            "scripts/migrate_to_frontmatter.py",
            DeprecationWarning,
            stacklevel=2,
        )
        data = _parse_legacy_table(raw, hunt_id=path.stem, category=category)
        body = raw

    data.setdefault("title", data.get("hypothesis", "")[:80])
    data["why"] = _extract_section(body, "Why")
    data["references"] = _extract_section(body, "References")
    data["file_path"] = f"{category}/{path.name}"
    return data
