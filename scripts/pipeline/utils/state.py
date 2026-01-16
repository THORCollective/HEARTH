"""Pipeline state management.

State is stored as HTML comment in GitHub issue body:

<!-- HEARTH-PIPELINE-STATE
{
  "version": "1.0",
  "stage": "extract",
  "status": "pending",
  ...
}
-->
"""
import json
import re
from typing import Dict, Any
from datetime import datetime


STATE_MARKER = "HEARTH-PIPELINE-STATE"


def read_state(issue_body: str) -> Dict[str, Any]:
    """
    Read pipeline state from issue body.

    Args:
        issue_body: Full GitHub issue body text

    Returns:
        Parsed state dict, or default initial state if not found
    """
    # Default initial state
    default_state = {
        "stage": "extract",
        "status": "pending",
        "version": "1.0",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    # Look for state comment
    pattern = rf'<!-- {STATE_MARKER}\n(.+?)\n-->'
    match = re.search(pattern, issue_body, re.DOTALL)

    if not match:
        return default_state

    try:
        state = json.loads(match.group(1))
        # Validate required fields exist
        if not all(key in state for key in ["stage", "status", "version"]):
            return default_state
        return state
    except json.JSONDecodeError:
        # Malformed JSON - return default
        return default_state


def format_state_comment(state: Dict[str, Any]) -> str:
    """
    Format state dict as HTML comment.

    Args:
        state: State dictionary to format

    Returns:
        Formatted HTML comment string
    """
    json_str = json.dumps(state, indent=2, ensure_ascii=False)
    return f"<!-- {STATE_MARKER}\n{json_str}\n-->"


def update_state(issue_body: str, updates: Dict[str, Any]) -> str:
    """
    Update pipeline state in issue body.

    Args:
        issue_body: Current GitHub issue body
        updates: Dictionary of fields to update

    Returns:
        Updated issue body with new state
    """
    if not isinstance(issue_body, str):
        raise ValueError("issue_body must be a string")

    # Read current state
    current_state = read_state(issue_body)

    # Merge updates
    current_state.update(updates)

    # Add timestamp
    current_state["updated_at"] = datetime.now().isoformat()

    # Format as comment
    new_comment = format_state_comment(current_state)

    # Check if state marker exists
    pattern = rf'<!-- {STATE_MARKER}\n.+?\n-->'

    if re.search(pattern, issue_body, re.DOTALL):
        # Replace existing state
        new_body = re.sub(pattern, new_comment, issue_body, count=1, flags=re.DOTALL)
    else:
        # Append new state
        new_body = issue_body.rstrip() + "\n\n" + new_comment

    return new_body
