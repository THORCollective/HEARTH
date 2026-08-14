#!/usr/bin/env python3
"""Reassign a draft hunt's ID if it collides with one already taken.

Run on a checked-out draft branch with ``origin/main`` fetched. A draft's ID
collides if the same number is already on ``main`` OR is claimed by another
open ``draft/issue-*`` branch belonging to a lower-numbered issue (lower issue
== earlier submission == priority). Colliding files are renamed to the next
free number — considering main and every other draft branch — and the rename is
staged.

Covers all three categories (Flames ``HNNN``, Embers ``BNNN``, Alchemy
``MNNN``). Each is an independent number space, so a draft's ``B035`` is only
blocked by other Embers IDs; ``H035`` on main is irrelevant to it.

Tiebreak by issue number makes a batch of approvals collision-free regardless
of the order they run in: the earliest issue keeps the contested number and
each later one yields. The workflow also serialises these jobs (a concurrency
group) so two reassignments can't read each other's branch mid-flight.

Reads ``ISSUE_NUMBER`` from the environment. Emits ``changed`` and ``hunt_id``
to ``$GITHUB_OUTPUT``. Always exits 0 — no collision is a no-op.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_ids import (
    CATEGORY_PREFIXES,
    existing_numbers,
    format_hunt_id,
    next_free_number,
    parse_hunt_number,
    rewrite_hunt_id,
)

_DRAFT_RE = re.compile(r"draft/issue-(\d+)$")


def _git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout


def _added_numbers(ref: str, category: str, prefix: str) -> set[int]:
    """Hunt numbers a ref ADDS under ``category/`` relative to main."""
    out = _git(
        "diff",
        "--diff-filter=A",
        "--name-only",
        f"origin/main...{ref}",
        "--",
        f"{category}/",
    )
    return existing_numbers((p for p in out.splitlines() if p.endswith(".md")), prefix)


def _main_numbers(category: str, prefix: str) -> set[int]:
    out = _git("ls-tree", "-r", "--name-only", "origin/main", "--", f"{category}/")
    return existing_numbers(out.splitlines(), prefix)


def _added_files(category: str) -> list[Path]:
    out = _git(
        "diff",
        "--diff-filter=A",
        "--name-only",
        "origin/main...HEAD",
        "--",
        f"{category}/",
    )
    return [Path(p) for p in out.splitlines() if p.endswith(".md")]


def _fetch_draft_refs() -> None:
    """Mirror every draft branch locally. Offline/empty is a safe no-op."""
    subprocess.run(
        ["git", "fetch", "origin", "refs/heads/draft/*:refs/remotes/origin/draft/*"],
        check=False,
        capture_output=True,
        text=True,
    )


def _other_draft_claims(
    current_issue: int, category: str, prefix: str
) -> dict[int, int]:
    """Map each hunt number claimed by another open draft branch to the lowest
    issue number claiming it. Scoped to one category. Assumes draft refs are
    already fetched."""
    claims: dict[int, int] = {}
    out = subprocess.run(
        ["git", "for-each-ref", "--format=%(refname)", "refs/remotes/origin/draft/"],
        check=False,
        capture_output=True,
        text=True,
    ).stdout
    for ref in out.splitlines():
        match = _DRAFT_RE.search(ref)
        if not match:
            continue
        issue = int(match.group(1))
        if issue == current_issue:
            continue
        for num in _added_numbers(ref, category, prefix):
            if num not in claims or issue < claims[num]:
                claims[num] = issue
    return claims


def _set_output(changed: bool, hunt_id: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if not github_output:
        return
    with open(github_output, "a", encoding="utf-8") as fh:
        print(f"changed={'true' if changed else 'false'}", file=fh)
        print(f"hunt_id={hunt_id}", file=fh)


def main() -> int:
    current_issue = int(os.environ.get("ISSUE_NUMBER", "0") or "0")
    _fetch_draft_refs()

    changed = False
    final_id = ""

    # Each category is an independent number space, so state is per-category.
    for category, prefix in CATEGORY_PREFIXES.items():
        added = _added_files(category)
        if not added:
            continue

        main_nums = _main_numbers(category, prefix)
        other_claims = _other_draft_claims(current_issue, category, prefix)

        # Must not KEEP a number on main or held by a lower-numbered issue.
        blocked = set(main_nums) | {
            num for num, issue in other_claims.items() if issue < current_issue
        }
        # When allocating a fresh number, avoid everything known to be claimed.
        claimed = set(main_nums) | set(other_claims)

        for path in added:
            num = parse_hunt_number(path.stem, prefix)
            if num is None:
                continue
            final_id = path.stem
            if num in blocked:
                new_num = next_free_number(claimed)
                new_id = format_hunt_id(new_num, prefix)
                new_path = rewrite_hunt_id(path, new_id)
                _git("add", "-A", "--", category)
                claimed.add(new_num)
                blocked.add(new_num)
                final_id = new_id
                changed = True
                print(f"Reassigned {path.name} -> {new_path.name} (id already claimed)")
            else:
                claimed.add(num)
                blocked.add(num)
                print(f"{path.name}: ID free, no change")

    if not changed:
        print("No hunt-ID collisions to fix.")
    _set_output(changed, final_id)
    return 0


if __name__ == "__main__":
    sys.exit(main())
