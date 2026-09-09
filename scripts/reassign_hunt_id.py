#!/usr/bin/env python3
"""Reassign a draft hunt's ID if it collides with one already taken.

Run on a checked-out draft branch with ``origin/main`` fetched. A draft's ID
collides if the same number is already on ``main`` OR is claimed by another
open pull request. Colliding files are renamed to the next free number —
considering main and every other open PR — and the rename is staged.

Other open PRs are enumerated via ``refs/pull/<n>/head``, not via branch refs:
a PR from a fork has no branch under ``origin``, and merged draft branches are
deleted, so a branch glob sees almost nothing. Claims are ranked two ways:

* Another ``draft/issue-*`` PR yields to the lower-numbered issue (lower issue
  == earlier submission == priority), as before.
* A PR outside the draft scheme always wins. This script only ever runs on a
  draft branch, so the draft is the only party that *can* renumber itself.

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

import json
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


def _open_pull_refs() -> list[tuple[str, int | None]]:
    """Mirror every OPEN pull request head locally.

    Returns ``(local_ref, issue_number_or_None)`` per PR — the issue number is
    parsed from a ``draft/issue-<n>`` head branch, and is ``None`` for any PR
    outside that scheme. Fork PRs have no branch under ``origin``, so heads are
    fetched from ``refs/pull/<n>/head``, which GitHub exposes for every PR.

    Degrades to the old ``draft/*`` branch scan when the ``gh`` CLI is
    unavailable: without it we cannot tell open PRs from the hundreds of closed
    ones, and treating every closed PR as a live claim would drift IDs upward.
    """
    listed = subprocess.run(
        ["gh", "pr", "list", "--state", "open", "--json", "number,headRefName"],
        check=False,
        capture_output=True,
        text=True,
    )
    if listed.returncode != 0:
        print("warning: `gh` unavailable; falling back to draft/* branch refs")
        return _draft_branch_refs()

    refs: list[tuple[str, int | None]] = []
    specs: list[str] = []
    for pr in json.loads(listed.stdout or "[]"):
        number = pr["number"]
        local = f"refs/remotes/origin/pr/{number}"
        specs.append(f"+refs/pull/{number}/head:{local}")
        match = _DRAFT_RE.search(pr.get("headRefName") or "")
        refs.append((local, int(match.group(1)) if match else None))

    if specs:
        subprocess.run(
            ["git", "fetch", "origin", *specs],
            check=False,
            capture_output=True,
            text=True,
        )
    return refs


def _draft_branch_refs() -> list[tuple[str, int | None]]:
    """Old behaviour: mirror ``draft/*`` branches and read issue numbers off
    them. Offline/empty is a safe no-op."""
    subprocess.run(
        ["git", "fetch", "origin", "refs/heads/draft/*:refs/remotes/origin/draft/*"],
        check=False,
        capture_output=True,
        text=True,
    )
    out = subprocess.run(
        ["git", "for-each-ref", "--format=%(refname)", "refs/remotes/origin/draft/"],
        check=False,
        capture_output=True,
        text=True,
    ).stdout
    refs: list[tuple[str, int | None]] = []
    for ref in out.splitlines():
        match = _DRAFT_RE.search(ref)
        if match:
            refs.append((ref, int(match.group(1))))
    return refs


def _ref_exists(ref: str) -> bool:
    return (
        subprocess.run(
            ["git", "rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}"],
            check=False,
            capture_output=True,
            text=True,
        ).returncode
        == 0
    )


def _other_pr_claims(
    pull_refs: list[tuple[str, int | None]],
    current_issue: int,
    category: str,
    prefix: str,
) -> tuple[dict[int, int], set[int]]:
    """Numbers claimed by other open PRs, scoped to one category.

    Returns ``(draft_claims, hard_claims)``: ``draft_claims`` maps a number to
    the lowest issue number claiming it (this draft yields only to a lower
    one), while ``hard_claims`` holds numbers taken by PRs outside the draft
    scheme, which this draft must always yield to.
    """
    draft_claims: dict[int, int] = {}
    hard_claims: set[int] = set()
    for ref, issue in pull_refs:
        if issue is not None and issue == current_issue:
            continue
        if not _ref_exists(ref):
            # A head that failed to fetch is skipped rather than fatal: a
            # missing claim can cost a later rename, a crash costs the run.
            print(f"warning: {ref} unavailable; not counting its claims")
            continue
        for num in _added_numbers(ref, category, prefix):
            if issue is None:
                hard_claims.add(num)
            elif num not in draft_claims or issue < draft_claims[num]:
                draft_claims[num] = issue
    return draft_claims, hard_claims


def _set_output(changed: bool, hunt_id: str) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if not github_output:
        return
    with open(github_output, "a", encoding="utf-8") as fh:
        print(f"changed={'true' if changed else 'false'}", file=fh)
        print(f"hunt_id={hunt_id}", file=fh)


def main() -> int:
    current_issue = int(os.environ.get("ISSUE_NUMBER", "0") or "0")
    pull_refs = _open_pull_refs()

    changed = False
    final_id = ""

    # Each category is an independent number space, so state is per-category.
    for category, prefix in CATEGORY_PREFIXES.items():
        added = _added_files(category)
        if not added:
            continue

        main_nums = _main_numbers(category, prefix)
        draft_claims, hard_claims = _other_pr_claims(
            pull_refs, current_issue, category, prefix
        )

        # Must not KEEP a number on main, held by a lower-numbered issue, or
        # held by a PR outside the draft scheme (which cannot renumber itself).
        blocked = (
            set(main_nums)
            | hard_claims
            | {num for num, issue in draft_claims.items() if issue < current_issue}
        )
        # When allocating a fresh number, avoid everything known to be claimed.
        claimed = set(main_nums) | hard_claims | set(draft_claims)

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
