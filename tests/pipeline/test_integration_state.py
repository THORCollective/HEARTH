"""Integration test for pipeline state management.

Tests state progression through multiple stages:
extract → validate → generate

Verifies:
- State transitions work correctly
- Previous stage data is preserved
- Original content is maintained
- State marker is updated correctly
"""

import sys
from pathlib import Path

import pytest

# Add scripts directory to path for imports
scripts_dir = Path(__file__).parent.parent.parent / "scripts"
sys.path.insert(0, str(scripts_dir))

from pipeline.utils.state import read_state, update_state


def test_state_management_integration():
    """Test complete state progression through pipeline stages."""

    # Initial issue body (no state)
    issue_body = """# Intelligence Report

Detected credential dumping using LSASS memory access.

## Indicators
- Process: mimikatz.exe
- Action: Memory read from lsass.exe
"""

    # ===== STAGE 1: EXTRACT =====

    # Start extract stage - read initial state
    state = read_state(issue_body)
    assert state["stage"] == "extract", "Should start in extract stage"
    assert state["status"] == "pending", "Should start as pending"

    # Mark extract in progress
    body_v1 = update_state(issue_body, {"status": "in_progress"})
    state = read_state(body_v1)
    assert state["stage"] == "extract"
    assert state["status"] == "in_progress"

    # Extract completes - add data
    extract_data = {
        "techniques": ["T1003.001"],
        "platforms": ["Windows"],
    }
    body_v2 = update_state(body_v1, {"extract": extract_data})
    state = read_state(body_v2)
    assert state["extract"]["techniques"] == ["T1003.001"]
    assert state["extract"]["platforms"] == ["Windows"]

    # Mark extract complete and transition to validate
    body_v3 = update_state(body_v2, {
        "status": "completed",
        "stage": "validate"
    })
    state = read_state(body_v3)
    assert state["stage"] == "validate"
    assert state["status"] == "completed"

    # ===== STAGE 2: VALIDATE =====

    # Start validate stage
    body_v4 = update_state(body_v3, {"status": "in_progress"})
    state = read_state(body_v4)
    assert state["stage"] == "validate"
    assert state["status"] == "in_progress"

    # Validate stage adds data
    validate_data = {
        "technique_valid": True,
        "platform_match": True,
    }
    body_v5 = update_state(body_v4, {"validation": validate_data})
    state = read_state(body_v5)
    assert state["validation"]["technique_valid"] is True
    assert state["validation"]["platform_match"] is True

    # Mark validate complete and transition to generate
    body_v6 = update_state(body_v5, {
        "status": "completed",
        "stage": "generate"
    })
    state = read_state(body_v6)
    assert state["stage"] == "generate"

    # Start generate stage
    body_v7 = update_state(body_v6, {"status": "in_progress"})
    final_state = read_state(body_v7)

    # ===== VERIFICATION =====

    # Verify current stage is generate
    assert final_state["stage"] == "generate"
    assert final_state["status"] == "in_progress"

    # Verify both extract and validate data preserved
    assert final_state["extract"]["techniques"] == ["T1003.001"]
    assert final_state["extract"]["platforms"] == ["Windows"]
    assert final_state["validation"]["technique_valid"] is True
    assert final_state["validation"]["platform_match"] is True

    # Verify original issue content still present
    assert "credential dumping" in body_v7
    assert "mimikatz.exe" in body_v7

    # Verify only one state marker exists
    state_marker_count = body_v7.count("<!-- HEARTH-PIPELINE-STATE")
    assert state_marker_count == 1, f"Should have exactly 1 state marker, found {state_marker_count}"
