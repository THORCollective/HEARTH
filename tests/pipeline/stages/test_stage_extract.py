"""Tests for Stage 1: Extract"""
import pytest
from scripts.pipeline.stages.stage_extract import extract_content


def test_extract_pasted_content():
    """When cti-content field has text, use it directly."""
    issue_body = """
### CTI Content
This is pasted threat intelligence about APT29.
They use WMI for persistence.
"""

    result = extract_content(issue_body)

    assert result["content"] == "This is pasted threat intelligence about APT29.\nThey use WMI for persistence."
    assert result["source_type"] == "pasted"
    assert result["method"] == "direct"
    assert result["char_count"] > 0


def test_extract_pasted_content_with_trailing_spaces():
    """Handle trailing spaces in section header."""
    issue_body = """
### CTI Content
This is content with trailing spaces in header.
"""

    result = extract_content(issue_body)

    assert "trailing spaces" in result["content"]
    assert result["source_type"] == "pasted"


def test_extract_raises_on_missing_section():
    """Raise ValueError when CTI Content section missing."""
    issue_body = """
### Some Other Section
Content here
"""

    with pytest.raises(ValueError, match="No pasted content found"):
        extract_content(issue_body)


def test_extract_raises_on_empty_content():
    """Raise ValueError when CTI Content is empty."""
    issue_body = """
### CTI Content

### Next Section
"""

    with pytest.raises(ValueError, match="CTI Content section is empty"):
        extract_content(issue_body)
