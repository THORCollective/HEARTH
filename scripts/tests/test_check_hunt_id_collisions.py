"""Tests for identity extraction used by the hunt-ID collision check."""

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
