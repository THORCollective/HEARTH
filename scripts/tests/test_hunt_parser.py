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
