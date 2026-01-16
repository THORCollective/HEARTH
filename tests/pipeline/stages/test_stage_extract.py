"""Tests for Stage 1: Extract"""
import pytest
from unittest.mock import patch, Mock
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

    with pytest.raises(ValueError, match="No content or URL found in issue"):
        extract_content(issue_body)


def test_extract_raises_on_empty_content():
    """Raise ValueError when CTI Content is empty."""
    issue_body = """
### CTI Content

### Next Section
"""

    with pytest.raises(ValueError, match="CTI Content section is empty"):
        extract_content(issue_body)


@patch('scripts.pipeline.stages.stage_extract.requests.get')
def test_extract_from_url_basic_html(mock_get):
    """Extract content from basic HTML page."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.text = """
    <html>
    <body>
        <article>
            <h1>APT29 Threat Report</h1>
            <p>APT29 uses WMI for persistence and lateral movement.</p>
            <p>Detection methods include monitoring WMI event subscriptions.</p>
        </article>
    </body>
    </html>
    """
    mock_get.return_value = mock_response

    issue_body = """
### CTI Source
https://example.com/threat-report
"""

    result = extract_content(issue_body)

    assert "APT29" in result["content"]
    assert "WMI" in result["content"]
    assert result["source_url"] == "https://example.com/threat-report"
    assert result["source_type"] == "url"
    assert result["method"] == "beautifulsoup"
