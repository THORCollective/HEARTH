#!/usr/bin/env python3
"""Fail a PR if it introduces a hunt ID that collides with an existing one.

Run on a PR with the head checked out and ``origin/main`` fetched. Detects:
  1. a hunt file ADDED by the PR whose ID already exists on main,
  2. an added file whose ``# <id>`` heading disagrees with its filename,
  3. two files in the working tree sharing an ID.

Exits 1 (printing each problem) on any collision, else 0.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_ids import find_id_problems

DIRS = ("Flames", "Embers", "Alchemy")


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout


def _heading_id(path: Path) -> str | None:
    try:
        first = path.read_text(encoding="utf-8").split("\n", 1)[0].strip()
    except OSError:
        return None
    return first[2:].strip() if first.startswith("# ") else None


def main() -> int:
    added_out = _git(
        "diff", "--diff-filter=A", "--name-only", "origin/main...HEAD", "--", *DIRS
    )
    added_paths = [Path(p) for p in added_out.splitlines() if p.endswith(".md")]
    added = [(p.stem, _heading_id(p)) for p in added_paths]

    main_out = _git("ls-tree", "-r", "--name-only", "origin/main", "--", *DIRS)
    main_ids = {Path(p).stem for p in main_out.splitlines() if p.endswith(".md")}

    all_stems = [p.stem for d in DIRS for p in Path(d).glob("*.md")]

    problems = find_id_problems(added, main_ids, all_stems)
    if problems:
        print("Hunt ID collision check FAILED:")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("Hunt ID collision check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
