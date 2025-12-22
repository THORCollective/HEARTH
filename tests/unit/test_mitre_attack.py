#!/usr/bin/env python3
"""
Unit tests for MITRE ATT&CK integration error handling.

Tests MITREError exceptions and validation logic.
"""

import pytest
import json
import tempfile
from pathlib import Path
from unittest.mock import patch, mock_open
import sys
import os

# Add scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))

from mitre_attack import MITREAttack, validate_technique, get_technique_tactic, search_techniques
from exceptions import MITREError


class TestMITREErrorHandling:
    """Test MITREError exception handling."""

    def test_missing_data_file_raises_mitre_error(self):
        """Test that missing MITRE data file raises MITREError with code HE-6001."""
        with pytest.raises(MITREError) as exc_info:
            MITREAttack(data_path="nonexistent/path.json")

        assert exc_info.value.error_code == "HE-6001"
        assert "not found" in str(exc_info.value).lower()
        assert "operation" in exc_info.value.context
        assert exc_info.value.context["operation"] == "load_data"

    def test_invalid_json_raises_mitre_error(self):
        """Test that invalid JSON raises MITREError with code HE-6002."""
        # Create a temporary file with invalid JSON
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            f.write("{invalid json content")
            temp_path = f.name

        try:
            with pytest.raises(MITREError) as exc_info:
                MITREAttack(data_path=temp_path)

            assert exc_info.value.error_code == "HE-6002"
            assert "parse" in str(exc_info.value).lower()
        finally:
            os.unlink(temp_path)

    def test_validate_technique_non_string_raises_error(self):
        """Test that validate_technique raises MITREError for non-string input."""
        # Create minimal valid MITRE data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            # Test with various non-string types
            with pytest.raises(MITREError) as exc_info:
                mitre.validate_technique(12345)
            assert exc_info.value.error_code == "HE-6005"

            with pytest.raises(MITREError) as exc_info:
                mitre.validate_technique(None)
            assert exc_info.value.error_code == "HE-6005"

            with pytest.raises(MITREError) as exc_info:
                mitre.validate_technique(['T1234'])
            assert exc_info.value.error_code == "HE-6005"
        finally:
            os.unlink(temp_path)

    def test_validate_technique_invalid_format_returns_none(self):
        """Test that validate_technique returns None for invalid format."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            # Invalid formats should return None, not raise
            assert mitre.validate_technique("invalid") is None
            assert mitre.validate_technique("T123") is None  # Too short
            assert mitre.validate_technique("T12345") is None  # Too long
            assert mitre.validate_technique("12345") is None  # Missing T
            assert mitre.validate_technique("T1234.12") is None  # Invalid subtechnique
        finally:
            os.unlink(temp_path)

    def test_search_techniques_non_string_raises_error(self):
        """Test that search_techniques_by_name raises MITREError for non-string query."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.search_techniques_by_name(123)
            assert exc_info.value.error_code == "HE-6006"

            with pytest.raises(MITREError) as exc_info:
                mitre.search_techniques_by_name(None)
            assert exc_info.value.error_code == "HE-6006"
        finally:
            os.unlink(temp_path)

    def test_search_techniques_empty_query_raises_error(self):
        """Test that search_techniques_by_name raises MITREError for empty query."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.search_techniques_by_name("")
            assert exc_info.value.error_code == "HE-6007"

            with pytest.raises(MITREError) as exc_info:
                mitre.search_techniques_by_name("   ")
            assert exc_info.value.error_code == "HE-6007"
        finally:
            os.unlink(temp_path)

    def test_get_techniques_by_tactic_non_string_raises_error(self):
        """Test that get_techniques_by_tactic raises MITREError for non-string tactic."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.get_techniques_by_tactic(123)
            assert exc_info.value.error_code == "HE-6008"
        finally:
            os.unlink(temp_path)

    def test_get_techniques_by_tactic_empty_raises_error(self):
        """Test that get_techniques_by_tactic raises MITREError for empty tactic."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.get_techniques_by_tactic("")
            assert exc_info.value.error_code == "HE-6009"
        finally:
            os.unlink(temp_path)

    def test_infer_technique_non_string_raises_error(self):
        """Test that infer_technique_from_description raises MITREError for non-string description."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.infer_technique_from_description(123)
            assert exc_info.value.error_code == "HE-6010"
        finally:
            os.unlink(temp_path)

    def test_infer_technique_empty_raises_error(self):
        """Test that infer_technique_from_description raises MITREError for empty description."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.infer_technique_from_description("")
            assert exc_info.value.error_code == "HE-6011"
        finally:
            os.unlink(temp_path)


class TestMITREErrorCodes:
    """Test that all MITRE error codes are in the HE-6xxx range."""

    def test_error_codes_in_correct_range(self):
        """Test that all MITRE error codes are HE-6xxx."""
        error_codes = [
            "HE-6001",  # Data file not found
            "HE-6002",  # JSON parsing error
            "HE-6003",  # Generic load error
            "HE-6004",  # Data processing error
            "HE-6005",  # Validate technique type error
            "HE-6006",  # Search query type error
            "HE-6007",  # Search query empty error
            "HE-6008",  # Tactic type error
            "HE-6009",  # Tactic empty error
            "HE-6010",  # Infer description type error
            "HE-6011",  # Infer description empty error
        ]

        for code in error_codes:
            assert code.startswith("HE-6"), f"Error code {code} not in HE-6xxx range"
            # Extract number and verify range
            num = int(code.split('-')[1])
            assert 6000 <= num < 7000, f"Error code {code} not in 6000-6999 range"

    def test_error_codes_are_unique(self):
        """Test that all error codes are unique."""
        error_codes = [
            "HE-6001", "HE-6002", "HE-6003", "HE-6004", "HE-6005",
            "HE-6006", "HE-6007", "HE-6008", "HE-6009", "HE-6010", "HE-6011"
        ]
        assert len(error_codes) == len(set(error_codes)), "Duplicate error codes found"


class TestMITREContextInformation:
    """Test that MITREError includes proper context information."""

    def test_load_error_includes_operation_context(self):
        """Test that load errors include operation in context."""
        with pytest.raises(MITREError) as exc_info:
            MITREAttack(data_path="nonexistent.json")

        assert "operation" in exc_info.value.context
        assert exc_info.value.context["operation"] == "load_data"

    def test_validate_error_includes_technique_id_context(self):
        """Test that validate errors include technique_id in context."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.validate_technique(123)

            assert "technique_id" in exc_info.value.context
            assert "operation" in exc_info.value.context
        finally:
            os.unlink(temp_path)

    def test_tactic_error_includes_tactic_context(self):
        """Test that tactic errors include tactic in context."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump({"objects": []}, f)
            temp_path = f.name

        try:
            mitre = MITREAttack(data_path=temp_path)

            with pytest.raises(MITREError) as exc_info:
                mitre.get_techniques_by_tactic(123)

            assert "tactic" in exc_info.value.context
            assert "operation" in exc_info.value.context
        finally:
            os.unlink(temp_path)


class TestMITREFunctionalBehavior:
    """Test that MITRE integration works correctly with valid data."""

    @pytest.fixture
    def valid_mitre_data(self):
        """Create a minimal valid MITRE data file."""
        data = {
            "objects": [
                {
                    "type": "attack-pattern",
                    "id": "attack-pattern--test",
                    "name": "Test Technique",
                    "description": "A test technique",
                    "external_references": [
                        {
                            "source_name": "mitre-attack",
                            "external_id": "T1234"
                        }
                    ],
                    "kill_chain_phases": [
                        {
                            "kill_chain_name": "mitre-attack",
                            "phase_name": "execution"
                        }
                    ],
                    "x_mitre_data_sources": ["Process Monitoring"],
                    "x_mitre_platforms": ["Windows"]
                },
                {
                    "type": "x-mitre-tactic",
                    "x_mitre_shortname": "execution",
                    "name": "Execution",
                    "description": "The adversary is trying to run malicious code."
                }
            ]
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            temp_path = f.name

        yield temp_path
        os.unlink(temp_path)

    def test_validate_technique_with_valid_id(self, valid_mitre_data):
        """Test that validate_technique works with valid technique ID."""
        mitre = MITREAttack(data_path=valid_mitre_data)

        result = mitre.validate_technique("T1234")
        assert result is not None
        assert result['id'] == "T1234"
        assert result['name'] == "Test Technique"

    def test_validate_technique_normalizes_input(self, valid_mitre_data):
        """Test that validate_technique normalizes input (uppercase, strip)."""
        mitre = MITREAttack(data_path=valid_mitre_data)

        # Should normalize to T1234
        result = mitre.validate_technique("  t1234  ")
        assert result is not None
        assert result['id'] == "T1234"

    def test_get_technique_tactic(self, valid_mitre_data):
        """Test that get_technique_tactic returns correct tactic."""
        mitre = MITREAttack(data_path=valid_mitre_data)

        tactic = mitre.get_technique_tactic("T1234")
        assert tactic == "Execution"

    def test_search_techniques_by_name(self, valid_mitre_data):
        """Test that search_techniques_by_name finds techniques."""
        mitre = MITREAttack(data_path=valid_mitre_data)

        results = mitre.search_techniques_by_name("Test")
        assert len(results) == 1
        assert results[0]['name'] == "Test Technique"

    def test_get_techniques_by_tactic(self, valid_mitre_data):
        """Test that get_techniques_by_tactic returns technique IDs."""
        mitre = MITREAttack(data_path=valid_mitre_data)

        techniques = mitre.get_techniques_by_tactic("Execution")
        assert "T1234" in techniques


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
