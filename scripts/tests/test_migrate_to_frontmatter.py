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
