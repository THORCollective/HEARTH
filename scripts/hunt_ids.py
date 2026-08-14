"""Shared helpers for HEARTH hunt-ID parsing, allocation, and rewriting.

Each category owns an independent, monotonic sequence: Flames ``HNNN``
(e.g. ``H200``), Embers ``BNNN``, Alchemy ``MNNN``. The number spaces do not
interact — ``H200`` and ``B200`` are unrelated IDs — so every helper here takes
the category's prefix and reasons within that one namespace.

The prefix defaults to ``"H"`` so Flames-only callers read unchanged.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from pathlib import Path

#: Directory -> ID prefix. Mirrors the allocation map in
#: ``scripts/process_hunt_submission.py``; keep the two in sync.
CATEGORY_PREFIXES = {"Flames": "H", "Embers": "B", "Alchemy": "M"}

HUNT_STEM_RE = re.compile(r"^H(\d+)$")


def prefix_for_category(category: str) -> str:
    """ID prefix for a category directory name. Unknown categories -> ``"H"``."""
    return CATEGORY_PREFIXES.get(category, "H")


def parse_hunt_number(stem: str, prefix: str = "H") -> int | None:
    """Return the numeric part of a ``<prefix>NNN`` stem, or None if it isn't one.

    Only matches the given prefix: ``parse_hunt_number("B001")`` is None because
    the default prefix is ``H``. Pass ``prefix="B"`` to read Embers stems.
    """
    match = re.match(rf"^{re.escape(prefix)}(\d+)$", stem)
    return int(match.group(1)) if match else None


def existing_numbers(names: Iterable[str], prefix: str = "H") -> set[int]:
    """Collect the numeric IDs from an iterable of ``<prefix>NNN(.md)`` names."""
    nums: set[int] = set()
    for name in names:
        num = parse_hunt_number(Path(name).stem, prefix)
        if num is not None:
            nums.add(num)
    return nums


def next_free_number(existing: set[int]) -> int:
    """Next free hunt number: ``max(existing) + 1`` (1 when empty).

    Matches the generator's historical ``max+1`` semantics rather than filling
    gaps left by deletions, so IDs stay monotonic and predictable.
    """
    return max(existing) + 1 if existing else 1


def format_hunt_id(num: int, prefix: str = "H") -> str:
    return f"{prefix}{num:03d}"


def rewrite_hunt_id(path: Path, new_id: str) -> Path:
    """Rename a hunt file to ``new_id`` and rewrite the ID embedded inside it.

    Rewrites the frontmatter ``id:`` field, the ``# <old_id>`` heading (line 1 in
    legacy hunts, below the frontmatter in canonical ones), and any populated
    ``| <old_id> |`` Hunt# table cell. The ID does not appear elsewhere in the
    body. Removes the old file and returns the new path.
    """
    path = Path(path)
    old_id = path.stem
    text = path.read_text(encoding="utf-8")

    lines = text.split("\n")
    # Frontmatter `id:` — scoped to the block so prose that looks like a
    # metadata line is left alone. Absent in legacy (table-format) hunts.
    if lines and lines[0].strip() == "---":
        for i, line in enumerate(lines[1:], start=1):
            if line.strip() == "---":
                break
            if line.strip() == f"id: {old_id}":
                lines[i] = f"id: {new_id}"
                break

    for i, line in enumerate(lines):
        if line.strip() == f"# {old_id}":
            lines[i] = f"# {new_id}"
            break
    text = "\n".join(lines)

    # Replace a populated Hunt# cell (e.g. "| H200 |"); a no-op for the
    # common case where generated files leave that cell empty.
    text = re.sub(rf"\|\s*{re.escape(old_id)}\s*\|", f"| {new_id} |", text, count=1)

    new_path = path.with_name(f"{new_id}.md")
    new_path.write_text(text, encoding="utf-8")
    if new_path != path:
        path.unlink()
    return new_path


def _norm_submitter(name: str | None) -> str:
    """Case/space-insensitive submitter name for identity comparison."""
    return re.sub(r"\s+", " ", (name or "").strip()).casefold()


def find_id_problems(
    added: list[tuple[str, str | None]],
    main_ids: set[str],
    all_stems: list[str],
    modified: list[tuple[str, str | None, str | None, str | None]] | None = None,
) -> list[str]:
    """Return human-readable collision problems for a PR (empty list = clean).

    ``added`` is ``[(stem, declared_id), ...]`` for hunt files the PR adds, where
    ``declared_id`` is the file's frontmatter ``id`` (or line-1 heading for legacy
    hunts), or None if none is present.

    ``modified`` is ``[(stem, declared_id, pr_submitter, main_submitter), ...]``
    for hunt files the PR changes in place. A modified hunt whose submitter no
    longer matches the version on ``main`` is overwriting a different
    contributor's hunt under the same ID — it should get a new ID instead.

    ``main_ids`` is the set of hunt stems already on ``main``.
    ``all_stems`` is every hunt stem in the working tree (for duplicate detection).
    """
    problems: list[str] = []

    for stem, declared_id in added:
        if stem in main_ids:
            problems.append(f"{stem}.md: hunt ID '{stem}' already exists on main")
        if declared_id is not None and declared_id != stem:
            problems.append(
                f"{stem}.md: declared ID '{declared_id}' does not match filename '{stem}'"
            )

    for stem, declared_id, pr_submitter, main_submitter in modified or []:
        if declared_id is not None and declared_id != stem:
            problems.append(
                f"{stem}.md: declared ID '{declared_id}' does not match filename '{stem}'"
            )
        if (
            pr_submitter
            and main_submitter
            and _norm_submitter(pr_submitter) != _norm_submitter(main_submitter)
        ):
            problems.append(
                f"{stem}.md: modifies an existing hunt in place but changes its "
                f"submitter ('{main_submitter}' -> '{pr_submitter}'), which overwrites "
                f"a different contributor's hunt under the same ID; reassign a new ID instead"
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
