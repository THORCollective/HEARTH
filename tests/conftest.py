#!/usr/bin/env python3
"""
Pytest configuration and shared fixtures for HEARTH test suite.

This module provides:
- Path setup for importing from scripts/
- Common test fixtures for hunt data
- Mock configurations for external dependencies
- Test utilities and helpers
"""

import sys
import pytest
import tempfile
from pathlib import Path
from unittest.mock import Mock, MagicMock

# Add scripts directory to Python path
REPO_ROOT = Path(__file__).parent.parent
SCRIPTS_DIR = REPO_ROOT / 'scripts'
sys.path.insert(0, str(SCRIPTS_DIR))


# ============================================================================
# Path Fixtures
# ============================================================================

@pytest.fixture
def repo_root():
    """Return the repository root directory."""
    return REPO_ROOT


@pytest.fixture
def scripts_dir():
    """Return the scripts directory."""
    return SCRIPTS_DIR


@pytest.fixture
def fixtures_dir():
    """Return the test fixtures directory."""
    return Path(__file__).parent / 'fixtures'


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


# ============================================================================
# Hunt Data Fixtures
# ============================================================================

@pytest.fixture
def sample_hunt_markdown():
    """Sample hunt in markdown format."""
    return """# Detect PowerShell downloads

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| F001 | Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection. | Defense Evasion | Based on ATT&CK technique T1071.001. | #defense-evasion #execution | Test User (https://example.com) |

## Why
- This technique is commonly used by threat actors to evade detection
- Discord CDN is often trusted and may bypass security controls

## References
- [MITRE ATT&CK T1071.001](https://attack.mitre.org/techniques/T1071/001/)
- [Source CTI Report](https://example.com)
"""


@pytest.fixture
def sample_hunt_data():
    """Sample hunt data dictionary."""
    return {
        'id': 'F001',
        'category': 'Flames',
        'title': 'Detect PowerShell downloads',
        'tactic': 'Execution',
        'notes': 'Monitor for suspicious PowerShell activity',
        'tags': ['execution', 'powershell'],
        'submitter': {'name': 'Test User', 'link': 'https://example.com'},
        'why': 'PowerShell is commonly abused by attackers',
        'references': 'https://attack.mitre.org',
        'file_path': 'Flames/F001.md'
    }


@pytest.fixture
def sample_hunt_content():
    """Sample hunt content for duplicate detection."""
    return """Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| | Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection. | Defense Evasion | Based on ATT&CK technique T1071.001. | #defense-evasion #execution | test-user |

## Why
- This technique is commonly used by threat actors to evade detection
- Discord CDN is often trusted and may bypass security controls

## References
- [MITRE ATT&CK T1071.001](https://attack.mitre.org/techniques/T1071/001/)
- [Source CTI Report](https://example.com)
"""


# ============================================================================
# Mock Fixtures
# ============================================================================

@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic API client."""
    mock_client = Mock()
    mock_response = Mock()
    mock_response.content = [Mock(text="Generated hunt content")]
    mock_client.messages.create.return_value = mock_response
    return mock_client


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI API client."""
    mock_client = Mock()
    mock_response = Mock()
    mock_response.choices = [Mock(message=Mock(content="Generated hunt content"))]
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


@pytest.fixture
def mock_database_connection():
    """Mock database connection."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    return mock_conn


# ============================================================================
# Test Configuration
# ============================================================================

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (deselect with '-m \"not integration\"')"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "requires_api: marks tests that require API keys"
    )
