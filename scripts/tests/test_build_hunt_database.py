"""Tests for git-derived hunt dates.

get_git_dates shells out to git, so these drive a real throwaway repository —
the bug being guarded against is in the git invocation itself, not in logic
around it.
"""

import subprocess

from scripts.build_hunt_database import get_git_dates


def _git(repo, *args):
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True, text=True)


def _repo(tmp_path):
    _git(tmp_path, "init", "-q", ".")
    _git(tmp_path, "config", "user.email", "t@example.com")
    _git(tmp_path, "config", "user.name", "Test")
    return tmp_path


def _commit(repo, path, text, message, when):
    target = repo / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    _git(repo, "add", "-A")
    subprocess.run(
        ["git", "commit", "-q", "-m", message],
        cwd=repo,
        check=True,
        capture_output=True,
        text=True,
        env={
            "GIT_AUTHOR_DATE": when,
            "GIT_COMMITTER_DATE": when,
            "PATH": "/usr/bin:/bin:/usr/local/bin",
            "HOME": str(repo),
        },
    )


# Realistic size matters: git detects a rename by content similarity, so a
# two-byte file plus an inserted line falls under the threshold and --follow
# would not track it regardless of the flags.
BODY = "\n".join(
    [
        "category: Flames",
        "title: Artifactory admin token minting",
        "hypothesis: An adversary mints administrator-scoped tokens.",
        "",
        "## Why",
    ]
    + [f"- Reason number {n} that this is worth hunting for." for n in range(20)]
)


def test_created_date_survives_a_rename(tmp_path, monkeypatch):
    # Regression: `git log --follow --reverse` silently returns only the newest
    # commit, so created_date became the rename date rather than the date the
    # hunt was first added. Hunts are renamed whenever an ID is assigned or
    # reassigned, so this affected real rows.
    repo = _repo(tmp_path)
    _commit(repo, "Incoming/draft.md", BODY, "add draft", "2024-01-01T00:00:00+00:00")
    (repo / "Flames").mkdir()
    _git(repo, "mv", "Incoming/draft.md", "Flames/H001.md")
    _commit(
        repo,
        "Flames/H001.md",
        "id: H001\n" + BODY,
        "assign",
        "2026-06-01T00:00:00+00:00",
    )

    monkeypatch.chdir(repo)
    created, modified = get_git_dates("Flames/H001.md")

    assert created.startswith("2024-01-01")
    assert modified.startswith("2026-06-01")


def test_created_date_for_a_file_never_renamed(tmp_path, monkeypatch):
    repo = _repo(tmp_path)
    _commit(repo, "Flames/H001.md", BODY, "add", "2024-01-01T00:00:00+00:00")
    _commit(repo, "Flames/H001.md", BODY + "\n- one more", "edit", "2025-01-01T00:00:00+00:00")

    monkeypatch.chdir(repo)
    created, modified = get_git_dates("Flames/H001.md")

    assert created.startswith("2024-01-01")
    assert modified.startswith("2025-01-01")
