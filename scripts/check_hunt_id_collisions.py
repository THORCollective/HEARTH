#!/usr/bin/env python3
"""Fail a PR if it introduces a hunt ID that collides with an existing one.

Run on a PR with the head checked out and ``origin/main`` fetched. Detects:
  1. a hunt file ADDED by the PR whose ID already exists on main,
  2. an added or modified file whose declared ID disagrees with its filename,
  3. a hunt file MODIFIED in place whose submitter changed — i.e. one
     contributor's hunt overwritten by a different hunt under the same ID,
  4. two files in the working tree sharing an ID.

Exits 1 (printing each problem) on any collision, else 0.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

import frontmatter

from scripts.hunt_ids import find_id_problems
from scripts.hunt_parser import _parse_legacy_table

DIRS = ("Flames", "Embers", "Alchemy")


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout


def extract_identity(text: str, stem: str) -> tuple[str | None, str | None]:
    """Best-effort ``(declared_id, submitter_name)`` for a hunt file's text.

    Handles both the canonical frontmatter format and the legacy table format,
    so a frontmatter PR can be compared against a legacy version on ``main``.
    The declared ID is the frontmatter ``id`` (or the line-1 ``# <id>`` heading
    for legacy hunts). Never raises — unreadable fields come back as ``None``.
    """
    try:
        post = frontmatter.loads(text)
    except Exception:
        post = None

    if post is not None and post.metadata:
        declared = post.metadata.get("id")
        submitter = post.metadata.get("submitter")
        name = submitter.get("name") if isinstance(submitter, dict) else submitter
        return (
            str(declared).strip() if declared else None,
            str(name).strip() if name else None,
        )

    # Legacy table format (or no frontmatter): line-1 heading + table submitter.
    first = text.split("\n", 1)[0].strip()
    declared = first[2:].strip() if first.startswith("# ") else None
    name: str | None = None
    try:
        name = _parse_legacy_table(text, hunt_id=stem, category="")["submitter"][
            "name"
        ].strip()
    except Exception:
        name = None
    return (declared, name or None)


def _show_main(path: str) -> str:
    try:
        return _git("show", f"origin/main:{path}")
    except subprocess.CalledProcessError:
        return ""


def main() -> int:
    added_out = _git(
        "diff", "--diff-filter=A", "--name-only", "origin/main...HEAD", "--", *DIRS
    )
    added_paths = [Path(p) for p in added_out.splitlines() if p.endswith(".md")]
    added = [
        (p.stem, extract_identity(p.read_text(encoding="utf-8"), p.stem)[0])
        for p in added_paths
    ]

    modified_out = _git(
        "diff", "--diff-filter=M", "--name-only", "origin/main...HEAD", "--", *DIRS
    )
    modified_paths = [Path(p) for p in modified_out.splitlines() if p.endswith(".md")]
    modified: list[tuple[str, str | None, str | None, str | None]] = []
    for p in modified_paths:
        pr_id, pr_submitter = extract_identity(p.read_text(encoding="utf-8"), p.stem)
        _, main_submitter = extract_identity(_show_main(p.as_posix()), p.stem)
        modified.append((p.stem, pr_id, pr_submitter, main_submitter))

    main_out = _git("ls-tree", "-r", "--name-only", "origin/main", "--", *DIRS)
    main_ids = {Path(p).stem for p in main_out.splitlines() if p.endswith(".md")}

    all_stems = [p.stem for d in DIRS for p in Path(d).glob("*.md")]

    problems = find_id_problems(added, main_ids, all_stems, modified)
    if problems:
        print("Hunt ID collision check FAILED:")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("Hunt ID collision check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
