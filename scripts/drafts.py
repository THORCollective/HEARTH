"""Render an ID-less hunt draft for ``Incoming/``.

Both generators produce legacy table-format markdown from an AI prompt. Rather
than rewriting those prompts — and changing what the model returns — this
parses their existing output with the same `_parse_legacy_table` the rest of
the codebase trusts, and re-emits it as frontmatter with no ``id``.

The ID is assigned when the PR merges (see scripts/assign_hunt_ids.py), so no
generator has to guess a number that may be taken by the time it lands.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_parser import _parse_legacy_table

# Frontmatter key order, matching canonical hunts. `id` is deliberately absent.
_FIELD_ORDER = (
    "category",
    "title",
    "hypothesis",
    "tactics",
    "techniques",
    "tags",
    "submitter",
    "notes",
    "references",
)

_STOPWORDS = {"a", "an", "the", "are", "is", "to", "of", "for", "and", "with", "in"}


def slugify(text: str, max_words: int = 8) -> str:
    """A short, filesystem-safe, ID-free filename stem.

    Never returns something matching ``[HBM]\\d+``: parse_draft_file rejects a
    draft named like a hunt ID, and find_stray_hunts exits 1 on one.
    """
    words = re.findall(r"[a-z0-9]+", text.lower())
    words = [w for w in words if w not in _STOPWORDS] or words
    slug = "-".join(words[:max_words]).strip("-")
    if not slug:
        slug = "hunt"
    if re.fullmatch(r"[hbm]\d+", slug):
        slug = f"{slug}-draft"
    return slug


def draft_from_legacy_markdown(markdown: str, category: str) -> tuple[str, str]:
    """Convert generator output into ``(filename, draft_text)``.

    ``markdown`` is the legacy shape both generators emit: hypothesis text, a
    six-column table, then ``## Why`` / ``## References`` sections.
    """
    data = _parse_legacy_table(markdown, hunt_id="draft", category=category)

    front: dict = {"category": category}
    for key in _FIELD_ORDER:
        if key == "category":
            continue
        value = data.get(key)
        if value in (None, "", [], {}):
            continue
        front[key] = value
    front.pop("id", None)

    # Keep the prose sections; drop the hypothesis line and the table, which
    # frontmatter now carries.
    body = _strip_table_and_lead(markdown)

    text = (
        "---\n"
        + yaml.safe_dump(front, sort_keys=False, allow_unicode=True, width=100).strip()
        + "\n---\n\n"
        + body.strip()
        + "\n"
    )
    stem = slugify(str(data.get("title") or data.get("hypothesis") or "hunt"))
    return f"{stem}.md", text


def _strip_table_and_lead(markdown: str) -> str:
    """Drop everything before the first ``##`` section."""
    lines = markdown.splitlines()
    for i, line in enumerate(lines):
        if line.startswith("## "):
            return "\n".join(lines[i:])
    # No sections at all: drop just the table rows.
    return "\n".join(ln for ln in lines if not ln.lstrip().startswith("|"))
