"""
HEARTH hunt frontmatter schema.

Canonical definition of the YAML frontmatter that every hunt markdown file
must carry. Used by the parser at runtime and by the validator in CI.
"""

from __future__ import annotations

from jsonschema import Draft202012Validator, FormatChecker

CATEGORIES = ("Flames", "Embers", "Alchemy")
SEVERITIES = ("critical", "high", "medium", "low", "informational")
STATUSES = ("current", "stale", "retired")

HUNT_SCHEMA: dict = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "HEARTH Hunt",
    "type": "object",
    "additionalProperties": False,
    "required": ["id", "category", "hypothesis", "tactics", "tags", "submitter"],
    "properties": {
        "id": {
            "type": "string",
            "pattern": r"^[HBM]\d{3,}$",
            "description": "Hunt ID, e.g. H001, B016, M015",
        },
        "category": {"enum": list(CATEGORIES)},
        "title": {"type": "string", "minLength": 1},
        "hypothesis": {"type": "string", "minLength": 10},
        "tactics": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "string", "minLength": 2},
        },
        "techniques": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "string", "pattern": r"^T\d{4}(\.\d{3})?$"},
        },
        "tags": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "string", "pattern": r"^[a-z0-9_]+$"},
        },
        "submitter": {
            "type": "object",
            "additionalProperties": False,
            "required": ["name"],
            "properties": {
                "name": {"type": "string", "minLength": 1},
                "link": {"type": "string"},
                # Set only when a submitter listed more than one profile. `link`
                # remains the primary so existing consumers are unaffected.
                "links": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 2,
                },
            },
        },
        "severity": {"enum": list(SEVERITIES)},
        "status": {"enum": list(STATUSES)},
        "created": {"type": "string", "format": "date"},
        "last_reviewed": {"type": "string", "format": "date"},
        "related_hunt_ids": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "string", "pattern": r"^[HBM]\d{3,}$"},
        },
        "required_data_sources": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "string"},
        },
        "false_positive_notes": {"type": "string"},
        "detection_queries": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["platform", "query"],
                "properties": {
                    "platform": {"type": "string"},
                    "description": {"type": "string"},
                    "query": {"type": "string"},
                },
            },
        },
        "notes": {"type": "string"},
    },
}

# A draft is a hunt submitted without an ID. The ID is assigned by
# scripts/assign_hunt_ids.py when the PR merges, so that two PRs can never name
# the same file and collide.
#
# `title` is optional, matching HUNT_SCHEMA. It was briefly required, on the
# reasoning that assignment rewrites the body H1 to `# <new_id>` and the
# readable name should survive. But generated hunts have no heading at all --
# both generator prompts say "DO NOT include a title or markdown heading", and
# the body opens with the hypothesis -- so there is nothing to preserve and the
# requirement only blocked them.
DRAFT_SCHEMA: dict = {
    **HUNT_SCHEMA,
    "title": "HEARTH Hunt Draft",
    "required": sorted(set(HUNT_SCHEMA["required"]) - {"id"}),
    # `id` stays in `properties` so a stray one still reports a pattern error
    # alongside this, rather than only an opaque "not allowed".
    "not": {"required": ["id"]},
}

_VALIDATOR = Draft202012Validator(HUNT_SCHEMA, format_checker=FormatChecker())
_DRAFT_VALIDATOR = Draft202012Validator(DRAFT_SCHEMA, format_checker=FormatChecker())


def _format_errors(validator: Draft202012Validator, data: dict) -> list[str]:
    errors = []
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        path = ".".join(str(p) for p in err.path) or "<root>"
        errors.append(f"{path}: {err.message}")
    return errors


def validate_hunt(data: dict) -> list[str]:
    """Return a list of human-readable validation errors (empty if valid)."""
    return _format_errors(_VALIDATOR, data)


def validate_draft(data: dict) -> list[str]:
    """Validate an ID-less draft. Errors are empty if valid."""
    errors = _format_errors(_DRAFT_VALIDATOR, data)
    if "id" in data:
        # The raw `not` failure dumps the whole document and reads as "should
        # not be valid under {'required': ['id']}", which tells a contributor
        # nothing actionable. Replace it with the reason.
        errors = [e for e in errors if "should not be valid under" not in e]
        errors.append(
            "<root>: drafts must not declare an 'id'; it is assigned "
            "automatically when your PR merges"
        )
    return errors
