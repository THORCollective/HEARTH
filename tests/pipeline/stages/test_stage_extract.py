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
