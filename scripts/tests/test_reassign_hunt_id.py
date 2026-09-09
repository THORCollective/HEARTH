"""Tests for hunt-ID collision reassignment.

The claim-ranking logic is pure once PR heads are resolved, so these drive
``_other_pr_claims`` with a stubbed ``_added_numbers`` rather than building
throwaway git repos.
"""

import pytest

from scripts import reassign_hunt_id as r


@pytest.fixture
def claims(monkeypatch):
    """Drive _other_pr_claims with a {ref: {numbers}} map, all refs present."""

    def run(ref_numbers, current_issue, pull_refs):
        monkeypatch.setattr(r, "_ref_exists", lambda ref: ref in ref_numbers)
        monkeypatch.setattr(
            r, "_added_numbers", lambda ref, category, prefix: ref_numbers[ref]
        )
        return r._other_pr_claims(pull_refs, current_issue, "Flames", "H")

    return run


def test_non_draft_pr_claim_is_hard(claims):
    # Regression for #404/#405: a PR outside the draft scheme (here a fork
    # branch) claimed H294 and was invisible, so both PRs landed on H294.
    draft_claims, hard_claims = claims(
        {"refs/remotes/origin/pr/404": {294}},
        current_issue=395,
        pull_refs=[("refs/remotes/origin/pr/404", None)],
    )
    assert hard_claims == {294}
    assert draft_claims == {}


def test_draft_claim_keyed_by_issue(claims):
    draft_claims, hard_claims = claims(
        {"refs/remotes/origin/pr/400": {294}},
        current_issue=395,
        pull_refs=[("refs/remotes/origin/pr/400", 380)],
    )
    assert draft_claims == {294: 380}
    assert hard_claims == set()


def test_lowest_issue_wins_a_contested_number(claims):
    draft_claims, _ = claims(
        {"a": {294}, "b": {294}},
        current_issue=395,
        pull_refs=[("a", 390), ("b", 370)],
    )
    assert draft_claims == {294: 370}


def test_own_issue_is_not_a_claim_against_itself(claims):
    draft_claims, hard_claims = claims(
        {"refs/remotes/origin/pr/405": {294}},
        current_issue=395,
        pull_refs=[("refs/remotes/origin/pr/405", 395)],
    )
    assert draft_claims == {}
    assert hard_claims == set()


def test_unfetchable_ref_is_skipped_not_fatal(claims):
    draft_claims, hard_claims = claims(
        {"present": {294}},
        current_issue=395,
        pull_refs=[("missing", None), ("present", None)],
    )
    assert hard_claims == {294}
    assert draft_claims == {}


def test_gh_failure_falls_back_to_draft_branches(monkeypatch):
    monkeypatch.setattr(
        r.subprocess, "run", lambda *a, **k: pytest.fail("gh probe not guarded")
    )
    monkeypatch.setattr(r, "_draft_branch_refs", lambda: [("draft-ref", 1)])

    class Failed:
        returncode = 1
        stdout = ""

    monkeypatch.setattr(r.subprocess, "run", lambda *a, **k: Failed())
    assert r._open_pull_refs() == [("draft-ref", 1)]
