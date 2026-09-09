"""Tests for identity extraction used by the hunt-ID collision check."""

import json

import pytest

from scripts import check_hunt_id_collisions as collisions
from scripts.check_hunt_id_collisions import extract_identity

# The original H210 as it lived on main: legacy table format, submitter th3CyF0x.
LEGACY_H210 = """# H210

Threat actors are using PowerShell's `Add-Type` cmdlet ...

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|---|---|---|---|---|
|  | Threat actors are using PowerShell's `Add-Type` cmdlet ... | Execution | Based on ATT&CK technique T1059.001. | #execution #powershell | [th3CyF0x](https://x.com/th3cyf0x) |

## Why
- reasons
"""

# The overwrite from PR #320: frontmatter format, different submitter/hunt.
FRONTMATTER_H210_OVERWRITE = """---
id: H210
category: Flames
title: Windchill login JSP web shell followed by application-server command execution
hypothesis: An adversary exploits PTC Windchill ...
tactics:
  - Initial Access
tags:
  - windchill
submitter:
  name: Joshua Strickland
  link: https://novasky.io
---
# H210

CISA added CVE-2026-12569 ...

## Why
- reasons
"""


def test_extract_identity_legacy_table():
    declared, submitter = extract_identity(LEGACY_H210, "H210")
    assert declared == "H210"
    assert submitter == "th3CyF0x"


def test_extract_identity_frontmatter():
    declared, submitter = extract_identity(FRONTMATTER_H210_OVERWRITE, "H210")
    assert declared == "H210"
    assert submitter == "Joshua Strickland"


def test_extract_identity_detects_320_overwrite():
    # Same declared ID + filename, but the submitter differs across versions —
    # exactly the signal that caught nothing before this fix.
    _, pr_submitter = extract_identity(FRONTMATTER_H210_OVERWRITE, "H210")
    _, main_submitter = extract_identity(LEGACY_H210, "H210")
    assert pr_submitter != main_submitter


def test_extract_identity_handles_garbage():
    declared, submitter = extract_identity("not a hunt file", "H999")
    assert declared is None
    assert submitter is None


def test_main_fails_closed_when_origin_main_empty(monkeypatch, capsys):
    # When origin/main resolves to no hunts (e.g. the base ref wasn't fetched in
    # a fork-PR runner), the check must fail rather than pass every ID through.
    monkeypatch.setattr(collisions, "_git", lambda *args: "")
    assert collisions.main() == 1
    assert "no hunts on origin/main" in capsys.readouterr().out


# --- cross-PR claims -------------------------------------------------------
#
# Regression for PRs #404/#405, which both added Flames/H294.md. Each PR was
# only ever compared against main, so both passed and the duplicate surfaced
# as a merge conflict that had to be renumbered by hand.


class _GhResult:
    def __init__(self, stdout, returncode=0):
        self.stdout = stdout
        self.returncode = returncode


def _stub_gh(monkeypatch, payload, returncode=0):
    monkeypatch.setattr(
        collisions.subprocess,
        "run",
        lambda *a, **k: _GhResult(json.dumps(payload), returncode),
    )


def _pr(number, *paths, change_type="ADDED"):
    return {
        "number": number,
        "files": [{"path": p, "changeType": change_type} for p in paths],
    }


def test_open_pr_claims_reads_added_hunt_files(monkeypatch):
    _stub_gh(monkeypatch, [_pr(404, "Flames/H294.md"), _pr(400, "Embers/B040.md")])
    assert collisions.open_pr_claims(405) == {"H294": 404, "B040": 400}


def test_open_pr_claims_ignores_modified_files(monkeypatch):
    # Editing an existing hunt is not a claim on a new ID.
    _stub_gh(monkeypatch, [_pr(404, "Flames/H294.md", change_type="MODIFIED")])
    assert collisions.open_pr_claims(405) == {}


def test_open_pr_claims_ignores_non_hunt_paths_and_self(monkeypatch):
    _stub_gh(
        monkeypatch,
        [_pr(404, "scripts/hunt_ids.py", "docs/H999.md"), _pr(405, "Flames/H295.md")],
    )
    assert collisions.open_pr_claims(405) == {}


def test_open_pr_claims_empty_when_gh_unavailable(monkeypatch, capsys):
    _stub_gh(monkeypatch, [], returncode=1)
    assert collisions.open_pr_claims(405) == {}
    assert "skipping the cross-PR hunt ID check" in capsys.readouterr().out


def test_cross_pr_problem_reported_against_older_pr(monkeypatch):
    _stub_gh(monkeypatch, [_pr(404, "Flames/H294.md")])
    problems = collisions.cross_pr_problems(
        [("H294", "H294")], {"H292", "H293"}, current_pr=405
    )
    assert len(problems) == 1
    assert "claimed by the older PR #404" in problems[0]
    assert "H295" in problems[0]


def test_older_pr_is_not_failed_by_a_newer_claim(monkeypatch):
    # PR #404 keeps H294; only the newer PR #405 is asked to move.
    _stub_gh(monkeypatch, [_pr(405, "Flames/H294.md")])
    assert (
        collisions.cross_pr_problems([("H294", "H294")], {"H293"}, current_pr=404) == []
    )


def test_cross_pr_check_skipped_without_pr_number(monkeypatch):
    monkeypatch.setattr(
        collisions.subprocess,
        "run",
        lambda *a, **k: pytest.fail("must not call gh without a PR number"),
    )
    assert collisions.cross_pr_problems([("H294", "H294")], {"H293"}, current_pr=0) == []


def test_suggestion_skips_ids_claimed_by_other_open_prs():
    # H295 is taken by another PR, so the next free ID is H296.
    suggestion = collisions.suggest_free_id(
        "H294", {"H292", "H293"}, {"H294": 404, "H295": 406}
    )
    assert suggestion == "H296"
