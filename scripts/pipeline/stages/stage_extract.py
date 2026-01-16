"""Stage 1: Extract content from CTI source"""
import re
from typing import Dict, Any


def extract_content(issue_body: str) -> Dict[str, Any]:
    """
    Extract content from issue body.

    Priority:
    1. Pasted content (cti-content field)
    2. URL extraction (future)

    Args:
        issue_body: GitHub issue body text

    Returns:
        Dictionary with extracted content and metadata
    """
    # Extract pasted content from cti-content field
    pattern = r'### CTI Content\n(.+?)(?=\n###|\Z)'
    match = re.search(pattern, issue_body, re.DOTALL)

    if match:
        content = match.group(1).strip()
        return {
            "content": content,
            "source_type": "pasted",
            "method": "direct",
            "char_count": len(content)
        }

    raise ValueError("No pasted content found in cti-content field")
