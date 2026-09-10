"""Tests for post-merge hunt-ID assignment.

The sweep is pure filesystem work, so these build a fake repo tree in tmp_path
rather than exercising git.
"""

import json

from scripts.assign_hunt_ids import main, sweep

DRAFT = """---
category: {category}
title: {title}
hypothesis: An adversary does something worth hunting for at length.
tactics:
  - Initial Access
tags:
  - example
submitter:
  name: Test Submitter
---

# {title}

## Why
- Because.
"""


def _repo(tmp_path, existing=("Flames/H001.md",)):
    for rel in existing:
        path = tmp_path / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("existing hunt", encoding="utf-8")
    (tmp_path / "Incoming").mkdir(exist_ok=True)
    return tmp_path


def _draft(root, name, category="Flames", title="Some hunt"):
    path = root / "Incoming" / name
    path.write_text(DRAFT.format(category=category, title=title), encoding="utf-8")
    return path


def test_single_draft_gets_the_next_free_id(tmp_path):
    root = _repo(tmp_path)
    _draft(root, "artifactory-token.md")

    assigned, failures = sweep(root)

    assert failures == []
    assert [a["id"] for a in assigned] == ["H002"]
    assert (root / "Flames" / "H002.md").exists()
    assert not (root / "Incoming" / "artifactory-token.md").exists()


def test_two_drafts_in_one_sweep_get_distinct_ids(tmp_path):
    # The regression the whole design exists to prevent: without a running
    # claim set both drafts resolve to max+1 and collide.
    root = _repo(tmp_path)
    _draft(root, "alpha.md")
    _draft(root, "beta.md")

    assigned, failures = sweep(root)

    assert failures == []
    assert sorted(a["id"] for a in assigned) == ["H002", "H003"]
    assert (root / "Flames" / "H002.md").exists()
    assert (root / "Flames" / "H003.md").exists()


def test_categories_allocate_independently(tmp_path):
    root = _repo(tmp_path, existing=("Flames/H007.md", "Embers/B003.md"))
    _draft(root, "a-flame.md", category="Flames")
    _draft(root, "an-ember.md", category="Embers")
    _draft(root, "a-brew.md", category="Alchemy")

    assigned, failures = sweep(root)

    assert failures == []
    assert {a["id"] for a in assigned} == {"H008", "B004", "M001"}


def test_a_malformed_draft_does_not_block_the_others(tmp_path):
    root = _repo(tmp_path)
    _draft(root, "good.md")
    (root / "Incoming" / "bad.md").write_text("no frontmatter", encoding="utf-8")

    assigned, failures = sweep(root)

    assert [a["id"] for a in assigned] == ["H002"]
    assert len(failures) == 1 and "bad.md" in failures[0]
    # The bad draft stays put so the next sweep retries it.
    assert (root / "Incoming" / "bad.md").exists()


def test_sweep_is_idempotent(tmp_path):
    # Load-bearing for concurrency: a dropped run must be subsumed by the next.
    root = _repo(tmp_path)
    _draft(root, "artifactory-token.md")

    first, _ = sweep(root)
    second, failures = sweep(root)

    assert [a["id"] for a in first] == ["H002"]
    assert second == [] and failures == []
    assert (root / "Flames" / "H002.md").exists()


def test_dry_run_writes_nothing(tmp_path):
    root = _repo(tmp_path)
    _draft(root, "artifactory-token.md")

    assigned, failures = sweep(root, dry_run=True)

    assert [a["id"] for a in assigned] == ["H002"]
    assert failures == []
    assert (root / "Incoming" / "artifactory-token.md").exists()
    assert not (root / "Flames" / "H002.md").exists()


def test_readme_in_incoming_is_ignored(tmp_path):
    root = _repo(tmp_path)
    (root / "Incoming" / "README.md").write_text("How this works", encoding="utf-8")

    assigned, failures = sweep(root)

    assert assigned == [] and failures == []
    assert (root / "Incoming" / "README.md").exists()


def test_empty_incoming_is_a_clean_no_op(tmp_path):
    assert sweep(_repo(tmp_path)) == ([], [])


def test_missing_incoming_dir_is_not_an_error(tmp_path):
    (tmp_path / "Flames").mkdir()
    assert sweep(tmp_path) == ([], [])


def test_main_exit_codes_and_github_output(tmp_path, monkeypatch, capsys):
    root = _repo(tmp_path)
    _draft(root, "good.md")
    output = tmp_path / "gh-output"
    monkeypatch.setenv("GITHUB_OUTPUT", str(output))

    assert main(["--root", str(root)]) == 0

    line = next(
        line for line in output.read_text().splitlines() if line.startswith("assigned=")
    )
    assert json.loads(line.split("=", 1)[1])[0]["id"] == "H002"

    (root / "Incoming" / "bad.md").write_text("no frontmatter", encoding="utf-8")
    assert main(["--root", str(root)]) == 1
    assert "ERROR" in capsys.readouterr().err
