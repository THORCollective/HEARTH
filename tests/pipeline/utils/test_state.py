"""Tests for pipeline state management."""
import pytest
from scripts.pipeline.utils.state import read_state, update_state, format_state_comment, STATE_MARKER


def test_read_state_no_marker_returns_default():
    """When issue has no state comment, return default initial state."""
    issue_body = "This is a regular issue with no state marker."

    state = read_state(issue_body)

    assert state["stage"] == "extract"
    assert state["status"] == "pending"
    assert state["version"] == "1.0"
    assert "created_at" in state
    assert "updated_at" in state


def test_read_state_with_marker_returns_parsed_state():
    """When issue has state comment, parse and return it."""
    issue_body = """
Some issue content here.

<!-- HEARTH-PIPELINE-STATE
{
  "version": "1.0",
  "stage": "validate",
  "status": "completed",
  "extract": {
    "content": "test content",
    "source_url": "https://example.com"
  }
}
-->

More content after.
"""

    state = read_state(issue_body)

    assert state["version"] == "1.0"
    assert state["stage"] == "validate"
    assert state["status"] == "completed"
    assert state["extract"]["content"] == "test content"
    assert state["extract"]["source_url"] == "https://example.com"


def test_read_state_handles_malformed_json():
    """When state JSON is malformed, return default state."""
    issue_body = """
<!-- HEARTH-PIPELINE-STATE
{ this is not valid json }
-->
"""

    state = read_state(issue_body)

    assert state["stage"] == "extract"
    assert state["status"] == "pending"
    assert state["version"] == "1.0"
    assert "created_at" in state
    assert "updated_at" in state


def test_read_state_validates_required_fields():
    """When state JSON is valid but missing required fields, return default."""
    issue_body = """
<!-- HEARTH-PIPELINE-STATE
{
  "foo": "bar",
  "baz": 123
}
-->
"""

    state = read_state(issue_body)

    # Should return default because required fields missing
    assert state["stage"] == "extract"
    assert state["status"] == "pending"
    assert state["version"] == "1.0"
    assert "created_at" in state
    assert "updated_at" in state


def test_format_state_comment():
    """Format state dict as HTML comment."""
    state = {
        "version": "1.0",
        "stage": "validate",
        "status": "completed"
    }

    comment = format_state_comment(state)

    assert comment.startswith("<!-- HEARTH-PIPELINE-STATE\n")
    assert comment.endswith("\n-->")
    assert '"version": "1.0"' in comment
    assert '"stage": "validate"' in comment


def test_update_state_adds_marker_when_missing():
    """When issue has no state, append new state comment."""
    issue_body = "Original issue content."
    updates = {"stage": "validate", "status": "completed"}

    new_body = update_state(issue_body, updates)

    # Original content preserved
    assert "Original issue content." in new_body
    # New state added
    assert "<!-- HEARTH-PIPELINE-STATE" in new_body
    # Updated fields present
    assert '"stage": "validate"' in new_body
    assert '"status": "completed"' in new_body


def test_update_state_replaces_existing_marker():
    """When issue has state, replace it with updated state."""
    issue_body = """
Original content.

<!-- HEARTH-PIPELINE-STATE
{
  "version": "1.0",
  "stage": "extract",
  "status": "pending"
}
-->

More content.
"""

    updates = {"stage": "validate", "status": "completed"}

    new_body = update_state(issue_body, updates)

    # Only one state marker
    assert new_body.count("<!-- HEARTH-PIPELINE-STATE") == 1
    # Updated values
    assert '"stage": "validate"' in new_body
    assert '"status": "completed"' in new_body
    # Version preserved (not in updates)
    assert '"version": "1.0"' in new_body
    # Original content preserved
    assert "Original content." in new_body
    assert "More content." in new_body


def test_update_state_adds_timestamp():
    """Updated state includes updated_at timestamp."""
    issue_body = "Test"
    updates = {"stage": "validate"}

    new_body = update_state(issue_body, updates)

    # Timestamp added
    assert '"updated_at"' in new_body
    # ISO format timestamp
    assert "T" in new_body  # ISO format includes T separator


def test_update_state_with_empty_updates():
    """Updating with empty dict still adds timestamp."""
    issue_body = "Test content"
    updates = {}

    new_body = update_state(issue_body, updates)

    assert "Test content" in new_body
    assert '"updated_at"' in new_body


def test_update_state_validates_input():
    """Passing None raises ValueError."""
    with pytest.raises(ValueError, match="issue_body must be a string"):
        update_state(None, {"stage": "validate"})
