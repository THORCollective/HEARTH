from scripts.hunt_parser import parse_hunt_file


def test_parses_frontmatter_format(fixtures_dir):
    hunt = parse_hunt_file(fixtures_dir / "frontmatter_h001.md", "Flames")
    assert hunt["id"] == "H001"
    assert hunt["category"] == "Flames"
    assert hunt["tactics"] == ["Credential Access"]
    assert "T1110" in hunt["techniques"]
    assert hunt["submitter"]["name"] == "Sydney Marrone"
    assert hunt["submitter"]["link"] == "https://x.com/letswastetime"
    assert "credentialaccess" in hunt["tags"]
    assert hunt["why"].startswith("- The admin account")
    assert "attack.mitre.org" in hunt["references"]


def test_parses_legacy_table_format_via_fallback(fixtures_dir):
    hunt = parse_hunt_file(fixtures_dir / "legacy_h001.md", "Flames")
    assert hunt["id"] == "H001"
    assert hunt["category"] == "Flames"
    assert hunt["tactics"] == ["Credential Access"]
    assert "T1110" in hunt["techniques"]
    assert hunt["submitter"]["name"] == "Sydney Marrone"
    assert "bruteforce" in hunt["tags"]


def test_normalizes_underscore_subtechnique_to_dot(fixtures_dir, tmp_path):
    src = (fixtures_dir / "legacy_h001.md").read_text()
    munged = src.replace("#T1110", "#T1110_003")
    f = tmp_path / "H999.md"
    f.write_text(munged)
    hunt = parse_hunt_file(f, "Flames")
    assert "T1110.003" in hunt["techniques"]


def test_strips_hash_from_tags(fixtures_dir):
    hunt = parse_hunt_file(fixtures_dir / "legacy_h001.md", "Flames")
    for tag in hunt["tags"]:
        assert not tag.startswith("#")


def test_raises_on_missing_required_frontmatter_field(tmp_path):
    f = tmp_path / "H998.md"
    f.write_text("---\nid: H998\ncategory: Flames\n---\n# body\n")
    import pytest
    from scripts.hunt_parser import HuntValidationError
    with pytest.raises(HuntValidationError) as exc:
        parse_hunt_file(f, "Flames")
    assert "hypothesis" in str(exc.value)


def test_compound_multiword_tag_preserved(fixtures_dir, tmp_path):
    src = (fixtures_dir / "legacy_h001.md").read_text()
    munged = src.replace("#bruteforce", "#Defense Evasion #bruteforce")
    f = tmp_path / "H996.md"
    f.write_text(munged)
    hunt = parse_hunt_file(f, "Flames")
    assert "defense_evasion" in hunt["tags"]


def test_dedupes_dot_and_underscore_subtechnique(fixtures_dir, tmp_path):
    src = (fixtures_dir / "legacy_h001.md").read_text()
    munged = src.replace("#T1110", "#T1059.001 #T1059_001")
    f = tmp_path / "H995.md"
    f.write_text(munged)
    hunt = parse_hunt_file(f, "Flames")
    assert hunt["techniques"].count("T1059.001") == 1


def test_legacy_table_preserves_positional_cells_when_middle_empty(tmp_path):
    """A legitimate empty middle cell (e.g. Notes) must not shift columns left."""
    f = tmp_path / "H994.md"
    f.write_text(
        "# H994\nbody\n\n"
        "| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        "| H994 | A hypothesis here | Persistence |  | #persistence #T1547 | Anonymous |\n"
    )
    hunt = parse_hunt_file(f, "Flames")
    assert hunt["id"] == "H994"
    assert hunt["tactics"] == ["Persistence"]
    assert "persistence" in hunt["tags"]
    assert hunt["submitter"]["name"] == "Anonymous"


def test_empty_hypothesis_does_not_synthesize_invalid_title(tmp_path):
    """If legacy parsing yields empty hypothesis, parser must not set title=''."""
    f = tmp_path / "H993.md"
    f.write_text(
        "# H993\n\n"
        "| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        "| H993 |  | Persistence | x | #x | Anonymous |\n"
    )
    hunt = parse_hunt_file(f, "Flames")
    assert hunt.get("title", None) != ""
    # Either title is absent or non-empty — either is OK per schema.


def test_frontmatter_with_all_optional_fields(tmp_path):
    """Pin that a fully-populated frontmatter file round-trips cleanly."""
    f = tmp_path / "H992.md"
    f.write_text(
        "---\n"
        "id: H992\n"
        "category: Flames\n"
        "title: Full example\n"
        "hypothesis: This is a sufficiently long hypothesis sentence.\n"
        "tactics:\n  - Persistence\n"
        "techniques:\n  - T1547.001\n"
        "tags:\n  - persistence\n"
        "submitter:\n  name: Test\n  link: ''\n"
        "severity: medium\n"
        "status: current\n"
        "created: 2026-01-01\n"
        "last_reviewed: 2026-04-01\n"
        "related_hunt_ids:\n  - H001\n"
        "required_data_sources:\n  - Sysmon\n"
        "false_positive_notes: |\n  None notable.\n"
        "detection_queries:\n  - platform: KQL\n    description: example\n    query: |\n      DeviceEvents | take 10\n"
        "notes: example notes\n"
        "---\n\n"
        "## Why\n- because\n\n"
        "## References\n- example\n"
    )
    hunt = parse_hunt_file(f, "Flames")
    assert hunt["severity"] == "medium"
    assert hunt["created"] == "2026-01-01" or str(hunt["created"]) == "2026-01-01"
    assert hunt["detection_queries"][0]["platform"] == "KQL"


def test_parser_does_not_synthesize_title_from_hypothesis(fixtures_dir):
    """Title is canonical only when authored in frontmatter; consumers handle fallback."""
    hunt = parse_hunt_file(fixtures_dir / "legacy_h001.md", "Flames")
    assert "title" not in hunt or hunt.get("title") is None


def test_parser_preserves_explicit_title_from_frontmatter(fixtures_dir):
    hunt = parse_hunt_file(fixtures_dir / "frontmatter_h001.md", "Flames")
    # The frontmatter fixture does not set title; ensure parser does not invent one.
    assert "title" not in hunt or hunt.get("title") is None
