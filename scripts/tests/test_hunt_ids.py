from pathlib import Path

from scripts.hunt_ids import (
    find_id_problems,
    format_hunt_id,
    next_free_number,
    parse_hunt_number,
    rewrite_hunt_id,
)


def test_parse_hunt_number():
    assert parse_hunt_number("H-2026-007") == 7
    assert parse_hunt_number("H-2026-012") == 12
    assert parse_hunt_number("H001") is None  # old namespace ignored
    assert parse_hunt_number("B-2026-001") is None  # Embers prefix, not H
    assert parse_hunt_number("not-an-id") is None


def test_next_free_number():
    assert next_free_number(set()) == 1
    assert next_free_number({1, 2}) == 3
    assert next_free_number({1, 3}) == 4  # max+1, not gap-fill
    assert next_free_number({5}) == 6


def test_format_hunt_id():
    assert format_hunt_id(2026, 3) == "H-2026-003"
    assert format_hunt_id(2026, 42) == "H-2026-042"


def _write_hunt(path: Path, hunt_id: str, hunt_cell: str = "") -> None:
    path.write_text(
        f"# {hunt_id}\n\n"
        "Threat actors are doing a specific bad thing to a specific target.\n\n"
        "| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        f"| {hunt_cell} | A hypothesis | Collection | n | #collection | T3chn3 |\n\n"
        "## Why\n- reason\n\n## References\n- link\n",
        encoding="utf-8",
    )


def test_rewrite_hunt_id_renames_and_updates_heading(tmp_path):
    src = tmp_path / "H-2026-001.md"
    _write_hunt(src, "H-2026-001")  # empty Hunt# cell — the real generated format
    new_path = rewrite_hunt_id(src, "H-2026-003")
    assert new_path.name == "H-2026-003.md"
    assert not src.exists()
    text = new_path.read_text()
    assert text.splitlines()[0] == "# H-2026-003"
    assert "# H-2026-001" not in text
    assert "## Why" in text and "## References" in text  # body preserved


def test_rewrite_hunt_id_updates_populated_table_cell(tmp_path):
    src = tmp_path / "H-2026-002.md"
    _write_hunt(src, "H-2026-002", hunt_cell="H-2026-002")
    new_path = rewrite_hunt_id(src, "H-2026-004")
    text = new_path.read_text()
    assert "| H-2026-004 |" in text
    assert "H-2026-002" not in text


def test_find_id_problems_flags_main_collision():
    added = [("H-2026-002", "H-2026-002")]
    problems = find_id_problems(
        added, main_ids={"H-2026-001", "H-2026-002"}, all_stems=["H-2026-002"]
    )
    assert any("already exists on main" in p for p in problems)


def test_find_id_problems_clean_add():
    added = [("H-2026-003", "H-2026-003")]
    problems = find_id_problems(
        added,
        main_ids={"H-2026-001", "H-2026-002"},
        all_stems=["H-2026-001", "H-2026-002", "H-2026-003"],
    )
    assert problems == []


def test_find_id_problems_heading_mismatch():
    added = [("H-2026-003", "H-2026-002")]
    problems = find_id_problems(added, main_ids=set(), all_stems=["H-2026-003"])
    assert any("does not match filename" in p for p in problems)


def test_find_id_problems_duplicate_in_tree():
    problems = find_id_problems(
        [], main_ids=set(), all_stems=["H-2026-001", "H-2026-001"]
    )
    assert any("duplicate" in p.lower() for p in problems)
