"""
HEARTH hunt frontmatter schema.

Canonical definition of the YAML frontmatter that every hunt markdown file
must carry. Used by the parser at runtime and by the validator in CI.
"""
from __future__ import annotations

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
            "items": {"type": "string", "pattern": r"^T\d{4}(\.\d{3})?$"},
        },
        "tags": {
            "type": "array",
            "items": {"type": "string", "pattern": r"^[a-z0-9_]+$"},
        },
        "submitter": {
            "type": "object",
            "additionalProperties": False,
            "required": ["name"],
            "properties": {
                "name": {"type": "string", "minLength": 1},
                "link": {"type": "string"},
            },
        },
        "severity": {"enum": list(SEVERITIES)},
        "status": {"enum": list(STATUSES)},
        "created": {"type": "string", "format": "date"},
        "last_reviewed": {"type": "string", "format": "date"},
        "related_hunt_ids": {
            "type": "array",
            "items": {"type": "string", "pattern": r"^[HBM]\d{3,}$"},
        },
        "required_data_sources": {
            "type": "array",
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


def validate_hunt(data: dict) -> list[str]:
    """Return a list of human-readable validation errors (empty if valid)."""
    from jsonschema import Draft202012Validator, FormatChecker

    validator = Draft202012Validator(HUNT_SCHEMA, format_checker=FormatChecker())
    errors = []
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        path = ".".join(str(p) for p in err.path) or "<root>"
        errors.append(f"{path}: {err.message}")
    return errors
