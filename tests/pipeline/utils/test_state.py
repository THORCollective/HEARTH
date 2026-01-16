"""Tests for pipeline state management."""
import pytest
from scripts.pipeline.utils.state import read_state, STATE_MARKER


def test_read_state_no_marker_returns_default():
    """When issue has no state comment, return default initial state."""
    issue_body = "This is a regular issue with no state marker."

    state = read_state(issue_body)

    assert state == {
        "stage": "extract",
        "status": "pending",
        "version": "1.0"
    }


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

    assert state == {
        "stage": "extract",
        "status": "pending",
        "version": "1.0"
    }
