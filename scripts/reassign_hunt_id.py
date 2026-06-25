#!/usr/bin/env python3
"""Reassign a draft hunt's ID if it collides with an ID already on ``main``.

Run on a checked-out draft branch with ``origin/main`` fetched. For each hunt
file the branch ADDS under ``Flames/`` whose ``HNNN`` number already
exists on main, rename it to the next free number (rewriting the heading and
any populated Hunt# cell), and stage the rename.

Emits ``changed`` and ``hunt_id`` to ``$GITHUB_OUTPUT``. Always exits 0 — no
collision is a no-op.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_ids import (
    existing_numbers,
    format_hunt_id,
    next_free_number,
    parse_hunt_number,
    rewrite_hunt_id,
)

FLAMES = "Flames"


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout


def _main_numbers() -> set[int]:
    out = _git("ls-tree", "-r", "--name-only", "origin/main", "--", f"{FLAMES}/")
    return existing_numbers(out.splitlines())


def _added_files() -> list[Path]:
    out = _git(
        "diff",
        "--diff-filter=A",
        "--name-only",
        "origin/main...HEAD",
        "--",
        f"{FLAMES}/",
    )
    return [Path(p) for p in out.splitlines() if p.endswith(".md")]


def _set_output(changed: bool, hunt_id: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if not github_output:
        return
    with open(github_output, "a", encoding="utf-8") as fh:
        print(f"changed={'true' if changed else 'false'}", file=fh)
        print(f"hunt_id={hunt_id}", file=fh)


def main() -> int:
    main_nums = _main_numbers()
    claimed = set(main_nums)
    changed = False
    final_id = ""

    for path in _added_files():
        num = parse_hunt_number(path.stem)
        if num is None:
            continue
        final_id = path.stem
        if num in main_nums:
            new_num = next_free_number(claimed)
            new_id = format_hunt_id(new_num)
            new_path = rewrite_hunt_id(path, new_id)
            _git("add", "-A", "--", FLAMES)
            claimed.add(new_num)
            final_id = new_id
            changed = True
            print(f"Reassigned {path.name} -> {new_path.name} (collided with main)")
        else:
            claimed.add(num)
            print(f"{path.name}: ID free, no change")

    if not changed:
        print("No hunt-ID collisions to fix.")
    _set_output(changed, final_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
