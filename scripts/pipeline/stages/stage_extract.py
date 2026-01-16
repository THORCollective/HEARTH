#!/usr/bin/env python3
"""Stage 1: Extract content from CTI source"""
import argparse
import sys
from pathlib import Path
from datetime import datetime
import re
from typing import Dict, Any
import requests
from bs4 import BeautifulSoup

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from scripts.pipeline.utils.state import read_state, update_state
from scripts.pipeline.utils.github import get_issue, update_issue_body, post_comment
from scripts.pipeline.utils.retry import retry_with_backoff
from hearth.utils.logging import get_logger

logger = get_logger()


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


def run_stage(repo_name: str, issue_number: int) -> None:
    """
    Run Stage 1 (Extract) processing.

    Args:
        repo_name: Repository name in format "owner/repo"
        issue_number: GitHub issue number
    """
    logger.info(f"Starting Stage 1 (Extract) for issue #{issue_number}")

    # 1. Get issue and read current state
    issue = get_issue(repo_name, issue_number)
    issue_body = issue.body
    state = read_state(issue_body)

    # 2. Validate we're in correct stage
    if state.get("stage") != "extract":
        logger.info(f"Not in extract stage (current: {state.get('stage')}), skipping")
        return

    if state.get("status") == "completed":
        logger.info("Stage already completed, skipping")
        return

    # 3. Mark as in-progress
    state["status"] = "in_progress"
    state["started_at"] = datetime.now().isoformat()
    new_body = update_state(issue_body, state)
    update_issue_body(repo_name, issue_number, new_body)

    try:
        # 4. Do extraction with retries
        result = retry_with_backoff(
            lambda: extract_content(issue.body),
            max_attempts=3
        )

        # 5. Mark complete and transition to validate
        state["stage"] = "validate"
        state["status"] = "pending"
        state["extract"] = result
        state["extract"]["completed_at"] = datetime.now().isoformat()

        new_body = update_state(issue.body, state)
        update_issue_body(repo_name, issue_number, new_body)

        logger.info(f"Stage 1 completed: {result['char_count']} chars extracted via {result['method']}")

    except Exception as e:
        logger.error(f"Stage 1 failed: {e}", exc_info=True)

        # Save error state
        state["status"] = "failed"
        state["error"] = str(e)
        state["failed_at"] = datetime.now().isoformat()

        new_body = update_state(issue.body, state)
        update_issue_body(repo_name, issue_number, new_body)

        # Post error comment
        post_error_comment(repo_name, issue_number, e, state)

        raise


def post_error_comment(repo_name: str, issue_number: int, error: Exception, state: dict) -> None:
    """Post helpful error comment to issue."""
    comment = f"""## ❌ Pipeline Failed: Stage 1 (Extract)

**Error:** {error}

### What Happened:
The content extraction step encountered an error.

### How to Fix:
- **Option 1:** Paste the content directly in the `CTI Content` field
- **Option 2:** Check if the URL is accessible and not behind a paywall
- **Option 3:** Try a different source URL

### Recovery:
Re-trigger by removing and re-adding the `intel-submission` label.

---
🤖 Error from stage_extract.py
"""
    post_comment(repo_name, issue_number, comment)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Run Stage 1: Extract")
    parser.add_argument("--repo", type=str, required=True, help="Repository (owner/repo)")
    parser.add_argument("--issue", type=int, required=True, help="Issue number")
    args = parser.parse_args()

    run_stage(args.repo, args.issue)


if __name__ == "__main__":
    main()
