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
        "version": "1.0"
    }

    # Look for state comment
    pattern = rf'<!-- {STATE_MARKER}\n(.+?)\n-->'
    match = re.search(pattern, issue_body, re.DOTALL)

    if not match:
        return default_state

    try:
        state = json.loads(match.group(1))
        return state
    except json.JSONDecodeError:
        # Malformed JSON - return default
        return default_state
