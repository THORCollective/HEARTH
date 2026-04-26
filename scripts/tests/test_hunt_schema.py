"""Lock in the contract of scripts.hunt_schema (especially FormatChecker)."""
from scripts.hunt_schema import (
    CATEGORIES,
    SEVERITIES,
    STATUSES,
    HUNT_SCHEMA,
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
    joined = "\n".join(errors)
    for field in ("id", "category", "hypothesis", "tactics", "tags", "submitter"):
        assert field in joined


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
