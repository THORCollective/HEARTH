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


@pytest.fixture
def sample_flame_file(fixtures_dir):
    """Path to sample Flame hunt fixture."""
    return fixtures_dir / 'sample_flame.md'


@pytest.fixture
def sample_ember_file(fixtures_dir):
    """Path to sample Ember hunt fixture."""
    return fixtures_dir / 'sample_ember.md'


@pytest.fixture
def sample_alchemy_file(fixtures_dir):
    """Path to sample Alchemy hunt fixture."""
    return fixtures_dir / 'sample_alchemy.md'


@pytest.fixture
def sample_cti_article(fixtures_dir):
    """Path to sample CTI article fixture."""
    return fixtures_dir / 'sample_cti_article.txt'


@pytest.fixture
def sample_cti_short(fixtures_dir):
    """Path to short CTI sample fixture."""
    return fixtures_dir / 'sample_cti_short.txt'


@pytest.fixture
def mock_mitre_data(fixtures_dir):
    """Path to mock MITRE ATT&CK data fixture."""
    return fixtures_dir / 'mock_mitre_attack.json'


@pytest.fixture
def load_fixture_content(fixtures_dir):
    """Helper function to load fixture file content."""
    def _load(filename):
        filepath = fixtures_dir / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Fixture not found: {filename}")
        return filepath.read_text()
    return _load


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
# Test Utilities
# ============================================================================

@pytest.fixture
def create_temp_hunt_file(temp_dir):
    """Helper to create temporary hunt files for testing."""
    def _create(filename, content):
        filepath = temp_dir / filename
        filepath.write_text(content)
        return filepath
    return _create


@pytest.fixture
def create_temp_mitre_data(temp_dir, mock_mitre_data):
    """Create a temporary MITRE ATT&CK data file."""
    import shutil
    data_dir = temp_dir / 'data'
    data_dir.mkdir(exist_ok=True)
    temp_mitre = data_dir / 'enterprise-attack.json'
    shutil.copy(mock_mitre_data, temp_mitre)
    return temp_mitre


@pytest.fixture
def sample_hunt_files(temp_dir, sample_flame_file, sample_ember_file, sample_alchemy_file):
    """Create temporary directory with sample hunt files."""
    import shutil

    # Create category directories
    flames_dir = temp_dir / 'Flames'
    embers_dir = temp_dir / 'Embers'
    alchemy_dir = temp_dir / 'Alchemy'

    flames_dir.mkdir()
    embers_dir.mkdir()
    alchemy_dir.mkdir()

    # Copy fixture files
    shutil.copy(sample_flame_file, flames_dir / 'F999.md')
    shutil.copy(sample_ember_file, embers_dir / 'B999.md')
    shutil.copy(sample_alchemy_file, alchemy_dir / 'M999.md')

    return {
        'flames': flames_dir / 'F999.md',
        'embers': embers_dir / 'B999.md',
        'alchemy': alchemy_dir / 'M999.md',
        'root': temp_dir
    }


def assert_valid_hunt_structure(hunt_data):
    """Assert that hunt data has valid structure."""
    required_fields = ['id', 'category', 'title', 'tactic', 'tags', 'submitter', 'why', 'references']
    for field in required_fields:
        assert field in hunt_data, f"Missing required field: {field}"

    assert isinstance(hunt_data['tags'], list), "Tags must be a list"
    assert isinstance(hunt_data['submitter'], dict), "Submitter must be a dict"
    assert 'name' in hunt_data['submitter'], "Submitter must have a name"


def assert_valid_mitre_technique(technique_id):
    """Assert that a string looks like a valid MITRE ATT&CK technique ID."""
    import re
    pattern = r'^T\d{4}(\.\d{3})?$'
    assert re.match(pattern, technique_id), f"Invalid technique ID format: {technique_id}"


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
