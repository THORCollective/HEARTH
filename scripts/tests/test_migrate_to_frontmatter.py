import shutil
from pathlib import Path

import frontmatter

from scripts.migrate_to_frontmatter import migrate_file


def test_migrates_legacy_to_frontmatter(fixtures_dir, tmp_path):
    src = fixtures_dir / "legacy_h001.md"
    dst = tmp_path / "H001.md"
    shutil.copy(src, dst)

    changed = migrate_file(dst, category="Flames", dry_run=False)
    assert changed is True

    post = frontmatter.load(dst)
    assert post["id"] == "H001"
    assert post["category"] == "Flames"
    assert post["tactics"] == ["Credential Access"]
    assert "T1110" in post["techniques"]
    assert post["submitter"]["name"] == "Sydney Marrone"
    assert post["submitter"]["link"] == "https://x.com/letswastetime"
    assert "bruteforce" in post["tags"]

    body = post.content
    assert "## Why" in body
    assert "## References" in body
    assert "| Hunt #" not in body  # legacy table is dropped


def test_migration_is_idempotent(fixtures_dir, tmp_path):
    src = fixtures_dir / "frontmatter_h001.md"
    dst = tmp_path / "H001.md"
    shutil.copy(src, dst)
    before = dst.read_text()
    changed = migrate_file(dst, category="Flames", dry_run=False)
    assert changed is False
    assert dst.read_text() == before


def test_dry_run_does_not_write(fixtures_dir, tmp_path):
    src = fixtures_dir / "legacy_h001.md"
    dst = tmp_path / "H001.md"
    shutil.copy(src, dst)
    before = dst.read_text()
    changed = migrate_file(dst, category="Flames", dry_run=True)
    assert changed is True  # would have changed
    assert dst.read_text() == before  # but didn't


def test_skips_secret_marker_file(tmp_path):
    """Flames/secret.md is an easter egg, not a hunt — must be skipped without raising."""
    f = tmp_path / "secret.md"
    f.write_text("# Welcome, challenge coin holder.\n\nNo hunt here.\n")
    changed = migrate_file(f, category="Flames", dry_run=False)
    assert changed is False
    assert f.read_text().startswith("# Welcome")  # untouched


def test_tag_fallback_to_tactics_when_only_techniques_present(tmp_path):
    """If contributor used only #T1234-style tags, derive tags from tactics."""
    import frontmatter

    f = tmp_path / "M999.md"
    f.write_text(
        "# M999\n\n"
        "| Hunt # | Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        "| M999 | A long enough hypothesis line | Command and Control, Execution | "
        "x | #T1071.001 #T1203 | [X](https://example.com/x) |\n"
    )
    changed = migrate_file(f, category="Alchemy", dry_run=False)
    assert changed is True
    post = frontmatter.load(f)
    assert "command_and_control" in post["tags"]
    assert "execution" in post["tags"]
    assert "T1071.001" in post["techniques"]


def test_intro_paragraph_is_preserved_as_summary(tmp_path):
    """The paragraph between the H1 and the table must survive — see #386.

    On 13 of 66 production hunts it was the only place certain CVEs, registry
    paths and IOC filenames appeared, and migration dropped it silently.
    """
    f = tmp_path / "H995.md"
    f.write_text(
        "# H995\n\n"
        "Actors exploit CVE-2026-35273 and persist via "
        "`HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\IFEO\\vds.exe`, "
        "dropping `G11.sys`.\n\n"
        "| Hunt # | Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        "| H995 | A hypothesis long enough to pass validation | Persistence | n | "
        "#persistence | [X](https://example.com/x) |\n\n"
        "## Why\n- a reason\n\n## References\n- a link\n"
    )
    assert migrate_file(f, category="Flames", dry_run=False) is True

    post = frontmatter.load(f)
    body = post.content
    assert "## Summary" in body
    # Every distinctive token survives.
    assert "CVE-2026-35273" in body
    assert "IFEO\\vds.exe" in body
    assert "G11.sys" in body
    # Pre-existing sections are untouched and still follow the summary.
    assert body.index("## Summary") < body.index("## Why") < body.index("## References")


def test_no_intro_paragraph_adds_no_summary_section(tmp_path):
    """A legacy file whose table follows the H1 directly gains no empty section."""
    f = tmp_path / "H996.md"
    f.write_text(
        "# H996\n\n"
        "| Hunt # | Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        "| H996 | A hypothesis long enough to pass validation | Persistence | n | "
        "#persistence | [X](https://example.com/x) |\n\n"
        "## Why\n- a reason\n"
    )
    assert migrate_file(f, category="Flames", dry_run=False) is True
    assert "## Summary" not in frontmatter.load(f).content
