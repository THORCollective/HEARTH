"""Lock in the contract of scripts.hunt_schema (especially FormatChecker)."""
from scripts.hunt_schema import (
    CATEGORIES,
    DRAFT_SCHEMA,
    SEVERITIES,
    STATUSES,
    HUNT_SCHEMA,
    validate_draft,
    validate_hunt,
)


def _valid_hunt() -> dict:
    return {
        "id": "H001",
        "category": "Flames",
        "hypothesis": "An adversary is brute forcing the VPN admin account.",
        "tactics": ["Credential Access"],
        "tags": ["bruteforce", "vpn"],
        "submitter": {"name": "Sydney Marrone", "link": "https://x.com/letswastetime"},
    }


def test_constants_are_immutable_tuples():
    assert isinstance(CATEGORIES, tuple)
    assert isinstance(SEVERITIES, tuple)
    assert isinstance(STATUSES, tuple)
    assert CATEGORIES == ("Flames", "Embers", "Alchemy")


def test_minimal_valid_hunt_has_no_errors():
    assert validate_hunt(_valid_hunt()) == []


def test_missing_required_fields_reported():
    errors = validate_hunt({})
    paths = {e.split(":", 1)[0] for e in errors}
    # Required-field errors all live at <root> in jsonschema's reporting.
    root_messages = [e.split(": ", 1)[1] for e in errors if e.startswith("<root>:")]
    for field in ("id", "category", "hypothesis", "tactics", "tags", "submitter"):
        assert any(f"'{field}' is a required property" in m for m in root_messages), (
            f"missing required-field error for {field}; got: {errors}"
        )
    assert paths == {"<root>"}, f"unexpected non-root errors: {errors}"


def test_bad_id_pattern_rejected():
    hunt = _valid_hunt()
    hunt["id"] = "X001"
    errors = validate_hunt(hunt)
    assert any("id" in e for e in errors)


def test_bad_technique_pattern_rejected():
    hunt = _valid_hunt()
    hunt["techniques"] = ["T1110_003"]  # underscore instead of dot
    errors = validate_hunt(hunt)
    assert any("techniques" in e for e in errors)


def test_uppercase_tag_rejected():
    hunt = _valid_hunt()
    hunt["tags"] = ["BadTag"]
    errors = validate_hunt(hunt)
    assert any("tags" in e for e in errors)


def test_empty_tags_rejected():
    hunt = _valid_hunt()
    hunt["tags"] = []
    errors = validate_hunt(hunt)
    assert any("tags" in e for e in errors)


def test_unknown_property_rejected():
    hunt = _valid_hunt()
    hunt["unexpected"] = "x"
    errors = validate_hunt(hunt)
    assert any("unexpected" in e or "Additional properties" in e for e in errors)


def test_format_date_actually_validated():
    """Locks in the FormatChecker plumbing — without it this test would silently pass."""
    hunt = _valid_hunt()
    hunt["created"] = "not-a-date"
    errors = validate_hunt(hunt)
    assert any("created" in e and "date" in e for e in errors), (
        "FormatChecker is not attached to the validator — date format was not enforced"
    )


def test_valid_iso_date_accepted():
    hunt = _valid_hunt()
    hunt["created"] = "2024-08-15"
    assert validate_hunt(hunt) == []


def test_anonymous_submitter_with_empty_link_allowed():
    """Regression: many existing hunts have submitter.link = '' for anonymous contributors."""
    hunt = _valid_hunt()
    hunt["submitter"] = {"name": "Anonymous", "link": ""}
    assert validate_hunt(hunt) == []


def test_frontmatter_fixture_is_schema_valid(fixtures_dir):
    """The canonical 'after' fixture must parse and validate cleanly — this is
    the contract every migrated hunt file is expected to satisfy."""
    import frontmatter

    post = frontmatter.load(fixtures_dir / "frontmatter_h001.md")
    errors = validate_hunt(dict(post.metadata))
    assert errors == [], errors


def test_invalid_severity_rejected():
    hunt = _valid_hunt()
    hunt["severity"] = "scary"
    errors = validate_hunt(hunt)
    assert any("severity" in e for e in errors)


def test_invalid_status_rejected():
    hunt = _valid_hunt()
    hunt["status"] = "deprecated"
    errors = validate_hunt(hunt)
    assert any("status" in e for e in errors)


def test_b_and_m_id_prefixes_accepted():
    for hunt_id in ("B016", "M015"):
        hunt = _valid_hunt()
        hunt["id"] = hunt_id
        assert validate_hunt(hunt) == [], f"{hunt_id} should be valid"


def test_short_hypothesis_rejected():
    hunt = _valid_hunt()
    hunt["hypothesis"] = "too short"  # under 10 chars
    errors = validate_hunt(hunt)
    assert any("hypothesis" in e for e in errors)


# --- drafts ----------------------------------------------------------------
#
# A draft is a hunt submitted without an ID; assign_hunt_ids.py mints one at
# merge so two PRs can never name the same file.


def _valid_draft() -> dict:
    draft = _valid_hunt()
    draft.pop("id")
    draft["title"] = "Some hunt title"
    return draft


def test_hunt_schema_is_not_mutated_by_draft_schema():
    # DRAFT_SCHEMA is built by unpacking HUNT_SCHEMA; a nested mutation here
    # would silently make `id` optional for real hunts everywhere.
    assert "id" in HUNT_SCHEMA["required"]
    assert "not" not in HUNT_SCHEMA
    assert "id" not in DRAFT_SCHEMA["required"]


def test_valid_draft_passes():
    assert validate_draft(_valid_draft()) == []


def test_draft_must_not_declare_an_id():
    errors = validate_draft({**_valid_draft(), "id": "H295"})
    assert any("must not declare an 'id'" in e for e in errors)
    # The raw jsonschema `not` failure dumps the whole document; suppress it.
    assert not any("should not be valid under" in e for e in errors)


def test_draft_requires_title():
    draft = _valid_draft()
    draft.pop("title")
    assert any("'title' is a required property" in e for e in validate_draft(draft))


def test_draft_requires_category_and_rejects_unknown_one():
    draft = _valid_draft()
    draft.pop("category")
    assert any("'category' is a required property" in e for e in validate_draft(draft))
    assert validate_draft({**_valid_draft(), "category": "Bonfire"}) != []


def test_draft_without_id_still_fails_full_hunt_validation():
    # The two validators must stay distinct: a draft is not a publishable hunt.
    assert any("'id' is a required property" in e for e in validate_hunt(_valid_draft()))
