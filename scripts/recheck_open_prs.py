#!/usr/bin/env python3
"""Re-run the hunt-ID collision check against every open PR.

Runs on ``push`` to ``main``. When a hunt lands on main it can retroactively
collide with an open PR that was green when it was last checked (the per-PR
``validate`` check only re-runs when the PR head changes, not when main moves).
This sweep closes that staleness window: for each open PR it replays
``check_hunt_id_collisions.py`` with the PR head checked out against the current
main, and reports the result as a ``hunt-id-recheck`` commit status on the PR.

The status is advisory — it surfaces a now-stale collision as a red check on the
PR so it isn't merged blind; it does not hard-block the merge. Reassigning the
PR's hunt ID (and rebasing) clears it.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

REPO = os.environ["GITHUB_REPOSITORY"]  # "owner/repo"
CHECK = Path(__file__).resolve().parent / "check_hunt_id_collisions.py"
TMP = Path(os.environ.get("RUNNER_TEMP", "/tmp"))

STATUS_CONTEXT = "hunt-id-recheck"


def _run(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=check, capture_output=True, text=True)


def _open_prs() -> list[dict]:
    out = _run(
        "gh",
        "pr",
        "list",
        "--state",
        "open",
        "--limit",
        "200",
        "--json",
        "number,headRefOid",
    ).stdout
    return json.loads(out)


def _post_status(sha: str, state: str, description: str) -> None:
    _run(
        "gh",
        "api",
        "--method",
        "POST",
        f"repos/{REPO}/statuses/{sha}",
        "-f",
        f"state={state}",
        "-f",
        f"context={STATUS_CONTEXT}",
        "-f",
        f"description={description[:140]}",
    )


def _recheck(number: int, sha: str) -> bool:
    """Return True if PR #number now collides with main; post its status."""
    worktree = TMP / f"recheck-pr-{number}"
    _run("git", "fetch", "origin", f"pull/{number}/head", check=False)
    _run(
        "git",
        "worktree",
        "add",
        "--detach",
        "--force",
        str(worktree),
        "FETCH_HEAD",
        check=False,
    )
    try:
        result = subprocess.run(
            [sys.executable, str(CHECK)],
            cwd=worktree,
            capture_output=True,
            text=True,
        )
    finally:
        _run("git", "worktree", "remove", "--force", str(worktree), check=False)

    collided = result.returncode != 0
    if collided:
        _post_status(
            sha,
            "failure",
            "Hunt ID now collides with main since this PR was opened — "
            "reassign a free ID and rebase.",
        )
        print(f"PR #{number}: COLLISION\n{result.stdout}{result.stderr}")
    else:
        _post_status(sha, "success", "No hunt-ID collision with current main.")
        print(f"PR #{number}: ok")
    return collided


def main() -> int:
    prs = _open_prs()
    if not prs:
        print("No open PRs to recheck.")
        return 0

    collisions = 0
    for pr in prs:
        try:
            if _recheck(pr["number"], pr["headRefOid"]):
                collisions += 1
        except Exception as exc:  # never let one PR abort the sweep
            print(f"PR #{pr['number']}: recheck errored: {exc}", file=sys.stderr)

    print(f"Rechecked {len(prs)} open PR(s); {collisions} now colliding.")
    # The signal is carried by per-PR commit statuses, not the workflow result.
    return 0


if __name__ == "__main__":
    sys.exit(main())
