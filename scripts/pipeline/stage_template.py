#!/usr/bin/env python3
"""
Stage Template - Reference for creating pipeline stages.

This is a template showing the standard structure for pipeline stage scripts.
Copy this file and modify for each stage (extract, validate, generate, review, commit).
"""
import argparse
import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.pipeline.utils.state import read_state, update_state
from scripts.pipeline.utils.github import get_issue, update_issue_body, post_comment
from scripts.pipeline.utils.retry import retry_with_backoff
from hearth.utils.logging import get_logger

logger = get_logger()


def run_stage(repo_name: str, issue_number: int) -> None:
    """
    Run stage processing.

    Args:
        repo_name: Repository name in format "owner/repo"
        issue_number: GitHub issue number
    """
    logger.info(f"Starting stage_template for issue #{issue_number}")

    # 1. Get issue and read current state
    issue = get_issue(repo_name, issue_number)
    issue_body = issue.body
    state = read_state(issue_body)

    # 2. Validate we're in correct stage
    if state.get("stage") != "template_stage":
        logger.info(f"Not in template_stage (current: {state.get('stage')}), skipping")
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
        # 4. Do the work (with retries if applicable)
        result = retry_with_backoff(
            lambda: do_stage_work(state),
            max_attempts=3
        )

        # 5. Mark complete and transition to next stage
        state["stage"] = "next_stage"
        state["status"] = "pending"
        state["template_result"] = result
        state["completed_at"] = datetime.now().isoformat()

        new_body = update_state(issue.body, state)
        update_issue_body(repo_name, issue_number, new_body)

        logger.info("Stage completed successfully")

    except Exception as e:
        logger.error(f"Stage failed: {e}", exc_info=True)

        # Save error state
        state["status"] = "failed"
        state["error"] = str(e)
        state["failed_at"] = datetime.now().isoformat()

        new_body = update_state(issue.body, state)
        update_issue_body(repo_name, issue_number, new_body)

        # Post error comment
        post_error_comment(repo_name, issue_number, e, state)

        raise


def do_stage_work(state: dict) -> dict:
    """
    Actual stage processing logic.

    Args:
        state: Current pipeline state

    Returns:
        Stage result data
    """
    # TODO: Implement stage-specific logic
    logger.info("Doing stage work...")

    return {
        "example_result": "success"
    }


def post_error_comment(repo_name: str, issue_number: int, error: Exception, state: dict) -> None:
    """Post helpful error comment to issue."""
    comment = f"""## ❌ Pipeline Failed: Stage Template

**Error:** {error}

### What Happened:
The stage processing encountered an error.

### How to Fix:
- **Option 1:** Check the error message above
- **Option 2:** Review the logs for more details

### Recovery:
Re-trigger by removing and re-adding the `intel-submission` label.

---
🤖 Error from stage_template.py
"""
    post_comment(repo_name, issue_number, comment)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Run Stage Template")
    parser.add_argument("--repo", type=str, required=True, help="Repository (owner/repo)")
    parser.add_argument("--issue", type=int, required=True, help="Issue number")
    args = parser.parse_args()

    run_stage(args.repo, args.issue)


if __name__ == "__main__":
    main()
