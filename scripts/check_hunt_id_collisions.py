#!/usr/bin/env python3
"""Fail a PR if it introduces a hunt ID that collides with an existing one.

Run on a PR with the head checked out and ``origin/main`` fetched. Detects:
  1. a hunt file ADDED by the PR whose ID already exists on main,
  2. an added or modified file whose declared ID disagrees with its filename,
  3. a hunt file MODIFIED in place whose submitter changed — i.e. one
     contributor's hunt overwritten by a different hunt under the same ID,
  4. two files in the working tree sharing an ID,
  5. a hunt file ADDED by the PR whose ID is also claimed by an older open PR
     (lower PR number == earlier claim == priority).

Fails closed if ``origin/main`` yields no hunts, since an empty baseline (an
unresolved base ref) would otherwise let every colliding ID pass.

Exits 1 (printing each problem) on any collision, else 0.
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

import frontmatter

from scripts.hunt_ids import (
    existing_numbers,
    find_id_problems,
    format_hunt_id,
    next_free_number,
    parse_hunt_number,
)
from scripts.hunt_parser import _parse_legacy_table

DIRS = ("Flames", "Embers", "Alchemy")
_HUNT_PATH_RE = re.compile(r"^(?:Flames|Embers|Alchemy)/([HBM]\d+)\.md$")


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


def open_pr_claims(current_pr: int) -> dict[str, int]:
    """Map each hunt ID ADDED by another open PR to the lowest PR number
    claiming it.

    Read from the GitHub API rather than git refs: a PR from a fork has no
    branch under ``origin``, and merged draft branches are deleted, so a branch
    scan sees almost nothing. Only ADDED files count — modifying an existing
    hunt is not a claim on a new ID.

    Returns ``{}`` when ``gh`` is unavailable or returns nothing usable. This
    check then degrades to its main-only behaviour rather than blocking: a real
    duplicate still collides on filename when the second PR merges.
    """
    listed = subprocess.run(
        ["gh", "pr", "list", "--state", "open", "--json", "number,files"],
        check=False,
        capture_output=True,
        text=True,
    )
    if listed.returncode != 0:
        print(
            "note: `gh` unavailable; skipping the cross-PR hunt ID check "
            "(main-only checks still apply)."
        )
        return {}

    try:
        prs = json.loads(listed.stdout or "[]")
    except json.JSONDecodeError:
        return {}

    claims: dict[str, int] = {}
    for pr in prs:
        number = pr.get("number")
        if number is None or number == current_pr:
            continue
        for entry in pr.get("files") or []:
            if entry.get("changeType") != "ADDED":
                continue
            match = _HUNT_PATH_RE.match(entry.get("path", ""))
            if not match:
                continue
            stem = match.group(1)
            if stem not in claims or number < claims[stem]:
                claims[stem] = number
    return claims


def suggest_free_id(stem: str, main_ids: set[str], claims: dict[str, int]) -> str:
    """Next unclaimed ID sharing ``stem``'s prefix, given main and open PRs."""
    prefix = stem[0]
    taken = existing_numbers(main_ids, prefix) | existing_numbers(claims, prefix)
    num = parse_hunt_number(stem, prefix)
    if num is not None:
        taken.add(num)
    return format_hunt_id(next_free_number(taken), prefix)


def cross_pr_problems(
    added: list[tuple[str, str | None]], main_ids: set[str], current_pr: int
) -> list[str]:
    """Problems for IDs this PR adds that an OLDER open PR already claims.

    Only the newer PR is failed, so a contested ID has exactly one side to fix
    and an untouched PR never starts failing because a later one appeared.
    """
    if not current_pr:
        return []
    claims = open_pr_claims(current_pr)
    problems = []
    for stem, _declared in added:
        other = claims.get(stem)
        if other is not None and other < current_pr:
            suggestion = suggest_free_id(stem, main_ids, claims)
            problems.append(
                f"{stem} is already claimed by the older PR #{other}. "
                f"Renumber this hunt to {suggestion} "
                f"(scripts/reassign_hunt_id.py rewrites the ID in place)."
            )
    return problems


def main() -> int:
    # Establish the baseline first, and fail closed if it looks empty. ``main``
    # always has hunts, so an empty result means ``origin/main`` didn't resolve
    # (e.g. the remote-tracking ref wasn't populated in a fork-PR runner) rather
    # than a genuinely clean base. Trusting it would let every colliding ID pass.
    main_out = _git("ls-tree", "-r", "--name-only", "origin/main", "--", *DIRS)
    main_ids = {Path(p).stem for p in main_out.splitlines() if p.endswith(".md")}
    if not main_ids:
        print(
            "Hunt ID collision check FAILED: found no hunts on origin/main. "
            "The base didn't resolve (is origin/main fetched?); refusing to pass "
            "against an empty baseline."
        )
        return 1

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

    all_stems = [p.stem for d in DIRS for p in Path(d).glob("*.md")]

    problems = find_id_problems(added, main_ids, all_stems, modified)
    problems += cross_pr_problems(
        added, main_ids, int(os.environ.get("PR_NUMBER", "0") or "0")
    )
    if problems:
        print("Hunt ID collision check FAILED:")
        for problem in problems:
            print(f"  - {problem}")
        return 1

    print("Hunt ID collision check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
