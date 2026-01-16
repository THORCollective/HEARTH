"""Stage 1: Extract content from CTI source"""
import re
from typing import Dict, Any
import requests
from bs4 import BeautifulSoup


def extract_from_url(url: str) -> Dict[str, Any]:
    """Extract content from URL using BeautifulSoup."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'lxml')

    # Try common content containers
    content_tags = soup.find('article') or soup.find('main') or soup.find('body')

    if not content_tags:
        raise ValueError("No content found on page")

    # Extract text, clean whitespace
    text = content_tags.get_text(separator='\n', strip=True)

    return {
        "content": text,
        "source_url": url,
        "source_type": "url",
        "method": "beautifulsoup",
        "char_count": len(text)
    }


def extract_content(issue_body: str) -> Dict[str, Any]:
    """
    Extract content from issue body.

    Priority:
    1. Pasted content (cti-content field)
    2. URL (cti-source field)

    Args:
        issue_body: GitHub issue body text

    Returns:
        Dictionary with extracted content and metadata
    """
    # Try pasted content first
    pattern = r'### CTI Content\s*\n(.+?)(?=\n###|\Z)'
    match = re.search(pattern, issue_body, re.DOTALL)

    if match:
        content = match.group(1).strip()

        # Validate content is not empty and not a section header
        if not content or content.startswith('###'):
            raise ValueError("CTI Content section is empty")

        return {
            "content": content,
            "source_type": "pasted",
            "method": "direct",
            "char_count": len(content)
        }

    # Try URL extraction
    url_pattern = r'### CTI Source\s*\n(.+?)(?=\n###|\Z)'
    url_match = re.search(url_pattern, issue_body, re.DOTALL)

    if url_match:
        url = url_match.group(1).strip()
        return extract_from_url(url)

    raise ValueError("No content or URL found in issue")
