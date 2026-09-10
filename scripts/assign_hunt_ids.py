#!/usr/bin/env python3
"""Assign hunt IDs to drafts that have landed on ``main``.

A PR adds an ID-less draft under ``Incoming/`` (see hunt_parser.parse_draft_file).
This sweeps that directory, allocates the next free ID per category, and moves
each draft into its category directory. Because no PR names a final hunt ID,
two PRs can never claim the same filename and collide — which is the whole
point of the design.

Sweeps **everything** in ``Incoming/`` rather than only the files from one
push. That idempotence is load-bearing: GitHub keeps at most one pending run
per concurrency group and cancels the older one, so a run can be dropped. A
full sweep means the next run subsumes anything a dropped one would have done.

Each draft is isolated: a malformed one is left in ``Incoming/`` and reported,
and the rest are still assigned. Exits non-zero if any draft failed, so the
partial success is committed while the job still goes red.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from scripts.hunt_ids import (
    assign_draft_id,
    existing_numbers,
    format_hunt_id,
    next_free_number,
    prefix_for_category,
)
from scripts.hunt_parser import parse_draft_file

INCOMING = "Incoming"


def _claimed_numbers(category_dir: Path, prefix: str) -> set[int]:
    if not category_dir.is_dir():
        return set()
    return existing_numbers((p.name for p in category_dir.glob("*.md")), prefix)


def sweep(root: Path, dry_run: bool = False) -> tuple[list[dict], list[str]]:
    """Assign an ID to every draft in ``root/Incoming``.

    Returns ``(assigned, failures)``. Drafts are processed in sorted order so
    the draft-to-ID mapping is reproducible if the run has to be restarted.
    """
    incoming = root / INCOMING
    assigned: list[dict] = []
    failures: list[str] = []
    if not incoming.is_dir():
        return assigned, failures

    # Per-category running claim set, so several drafts in one sweep get
    # distinct IDs rather than all resolving to the same max+1.
    claimed: dict[str, set[int]] = {}

    for path in sorted(incoming.glob("*.md")):
        if path.name.lower() == "readme.md":
            continue
        try:
            draft = parse_draft_file(path)
            category = draft["category"]
            prefix = prefix_for_category(category)
            dest_dir = root / category
            if prefix not in claimed:
                claimed[prefix] = _claimed_numbers(dest_dir, prefix)

            number = next_free_number(claimed[prefix])
            new_id = format_hunt_id(number, prefix)
            if not dry_run:
                assign_draft_id(path, new_id, dest_dir)
            claimed[prefix].add(number)
            assigned.append(
                {
                    "draft": path.name,
                    "id": new_id,
                    "category": category,
                    "path": f"{category}/{new_id}.md",
                }
            )
        except Exception as exc:  # noqa: BLE001 - one bad draft must not block the rest
            failures.append(f"{path.name}: {exc}")

    return assigned, failures


def _set_output(assigned: list[dict]) -> None:
    github_output = os.environ.get("GITHUB_OUTPUT")
    if not github_output:
        return
    with open(github_output, "a", encoding="utf-8") as fh:
        print(f"assigned={json.dumps(assigned)}", file=fh)
        print(f"count={len(assigned)}", file=fh)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="print what would be assigned without touching any file",
    )
    parser.add_argument(
        "--root",
        default=_REPO_ROOT,
        help="repository root (default: the repo this script lives in)",
    )
    args = parser.parse_args(argv)

    assigned, failures = sweep(Path(args.root), dry_run=args.dry_run)

    for item in assigned:
        verb = "would assign" if args.dry_run else "assigned"
        print(f"{verb} {item['id']} to {item['draft']} -> {item['path']}")
    for failure in failures:
        print(f"ERROR {failure}", file=sys.stderr)

    if not assigned and not failures:
        print("No drafts in Incoming/.")

    if not args.dry_run:
        _set_output(assigned)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
