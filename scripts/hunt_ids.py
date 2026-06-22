"""Shared helpers for HEARTH hunt-ID parsing, allocation, and rewriting.

Hunt IDs use the format ``H-YYYY-NNN`` (files under ``Flames/``). Older hunts
use ``HNNN`` (and ``B``/``A`` prefixes for Embers/Alchemy); those are a separate
namespace and are intentionally ignored by the ``H-YYYY-NNN`` allocator here.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable

HUNT_STEM_RE = re.compile(r"^H-(\d{4})-(\d{3,})$")


def parse_hunt_number(stem: str) -> int | None:
    """Return the numeric part of an ``H-YYYY-NNN`` stem, or None if it isn't one."""
    match = HUNT_STEM_RE.match(stem)
    return int(match.group(2)) if match else None


def existing_numbers(names: Iterable[str]) -> set[int]:
    """Collect the numeric IDs from an iterable of ``H-YYYY-NNN(.md)`` names/paths."""
    nums: set[int] = set()
    for name in names:
        num = parse_hunt_number(Path(name).stem)
        if num is not None:
            nums.add(num)
    return nums


def next_free_number(existing: set[int]) -> int:
    """Next free hunt number: ``max(existing) + 1`` (1 when empty).

    Matches the generator's historical ``max+1`` semantics rather than filling
    gaps left by deletions, so IDs stay monotonic and predictable.
    """
    return max(existing) + 1 if existing else 1


def format_hunt_id(year: int, num: int) -> str:
    return f"H-{year}-{num:03d}"


def rewrite_hunt_id(path: Path, new_id: str) -> Path:
    """Rename a hunt file to ``new_id`` and rewrite the ID embedded inside it.

    Rewrites the line-1 ``# <old_id>`` heading and any populated ``| <old_id> |``
    Hunt# table cell. The ID does not appear elsewhere in the body. Removes the
    old file and returns the new path.
    """
    path = Path(path)
    old_id = path.stem
    text = path.read_text(encoding="utf-8")

    lines = text.split("\n")
    if lines and lines[0].strip() == f"# {old_id}":
        lines[0] = f"# {new_id}"
    text = "\n".join(lines)

    # Replace a populated Hunt# cell (e.g. "| H-2026-001 |"); a no-op for the
    # common case where generated files leave that cell empty.
    text = re.sub(rf"\|\s*{re.escape(old_id)}\s*\|", f"| {new_id} |", text, count=1)

    new_path = path.with_name(f"{new_id}.md")
    new_path.write_text(text, encoding="utf-8")
    if new_path != path:
        path.unlink()
    return new_path


def find_id_problems(
    added: list[tuple[str, str | None]],
    main_ids: set[str],
    all_stems: list[str],
) -> list[str]:
    """Return human-readable collision problems for a PR (empty list = clean).

    ``added`` is ``[(stem, heading_id), ...]`` for hunt files the PR adds.
    ``main_ids`` is the set of hunt stems already on ``main``.
    ``all_stems`` is every hunt stem in the working tree (for duplicate detection).
    """
    problems: list[str] = []

    for stem, heading_id in added:
        if stem in main_ids:
            problems.append(f"{stem}.md: hunt ID '{stem}' already exists on main")
        if heading_id is not None and heading_id != stem:
            problems.append(
                f"{stem}.md: heading ID '{heading_id}' does not match filename '{stem}'"
            )

    seen: set[str] = set()
    dups: set[str] = set()
    for stem in all_stems:
        if stem in seen:
            dups.add(stem)
        seen.add(stem)
    for dup in sorted(dups):
        problems.append(f"duplicate hunt ID '{dup}' appears on more than one file")

    return problems
