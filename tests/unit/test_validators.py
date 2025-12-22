#!/usr/bin/env python3
"""
Unit tests for validators module.
"""

import pytest
from pathlib import Path
import tempfile
import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))

from validators import HuntValidator
from exceptions import ValidationError


class TestValidateHuntId:
    """Tests for validate_hunt_id method."""

    def test_valid_hunt_ids(self):
        """Test valid hunt ID formats."""
        valid_ids = ["H001", "F042", "B123", "M001", "A999", "Z9999"]
        for hunt_id in valid_ids:
            assert HuntValidator.validate_hunt_id(hunt_id, "test") is True

    def test_empty_hunt_id(self):
        """Test empty hunt ID raises ValidationError with HE-2001."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_id("", "test")
        assert exc_info.value.error_code == "HE-2001"
        assert "Hunt ID must be a non-empty string" in str(exc_info.value)

    def test_none_hunt_id(self):
        """Test None hunt ID raises ValidationError with HE-2001."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_id(None, "test")
        assert exc_info.value.error_code == "HE-2001"

    def test_invalid_format_hunt_id(self):
        """Test invalid hunt ID format raises ValidationError with HE-2002."""
        invalid_ids = ["H01", "H12345", "12H", "h001", "HH001", "H-001"]
        for hunt_id in invalid_ids:
            with pytest.raises(ValidationError) as exc_info:
                HuntValidator.validate_hunt_id(hunt_id, "test")
            assert exc_info.value.error_code == "HE-2002"
            assert "must match pattern" in str(exc_info.value)

    def test_non_string_hunt_id(self):
        """Test non-string hunt ID raises ValidationError with HE-2001."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_id(123, "test")
        assert exc_info.value.error_code == "HE-2001"


class TestValidateTactics:
    """Tests for validate_tactics method."""

    def test_valid_tactics_as_string(self):
        """Test valid tactics as comma-separated string."""
        tactics = "Initial Access, Execution, Persistence"
        result = HuntValidator.validate_tactics(tactics)
        assert len(result) == 3
        assert "Initial Access" in result
        assert "Execution" in result
        assert "Persistence" in result

    def test_valid_tactics_as_list(self):
        """Test valid tactics as list."""
        tactics = ["Defense Evasion", "Credential Access"]
        result = HuntValidator.validate_tactics(tactics)
        assert len(result) == 2
        assert "Defense Evasion" in result
        assert "Credential Access" in result

    def test_invalid_tactics_filtered(self):
        """Test that invalid tactics are filtered out."""
        tactics = ["Valid Tactic", "Initial Access", "Invalid Tactic"]
        result = HuntValidator.validate_tactics(tactics)
        assert len(result) == 1
        assert "Initial Access" in result

    def test_empty_tactics_list(self):
        """Test empty tactics list."""
        result = HuntValidator.validate_tactics([])
        assert result == []

    def test_empty_tactics_string(self):
        """Test empty tactics string."""
        result = HuntValidator.validate_tactics("")
        assert result == []

    def test_invalid_tactics_type(self):
        """Test invalid tactics type raises ValidationError with HE-2003."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_tactics(123)
        assert exc_info.value.error_code == "HE-2003"
        assert "Tactics must be string or list" in str(exc_info.value)


class TestValidateTags:
    """Tests for validate_tags method."""

    def test_valid_tags_as_string(self):
        """Test valid tags as string."""
        tags = "#malware #detection #endpoint"
        result = HuntValidator.validate_tags(tags)
        assert len(result) == 3
        assert "malware" in result
        assert "detection" in result
        assert "endpoint" in result

    def test_valid_tags_as_list(self):
        """Test valid tags as list."""
        tags = ["malware", "detection", "endpoint"]
        result = HuntValidator.validate_tags(tags)
        assert len(result) == 3

    def test_tags_normalized_to_lowercase(self):
        """Test tags are normalized to lowercase."""
        tags = ["MALWARE", "Detection", "EndPoint"]
        result = HuntValidator.validate_tags(tags)
        assert "malware" in result
        assert "detection" in result
        assert "endpoint" in result

    def test_duplicate_tags_removed(self):
        """Test duplicate tags are removed."""
        tags = ["malware", "malware", "detection"]
        result = HuntValidator.validate_tags(tags)
        assert len(result) == 2
        assert result.count("malware") == 1

    def test_invalid_tag_characters(self):
        """Test tags with invalid characters are filtered."""
        tags = ["valid-tag", "invalid tag", "another_valid"]
        result = HuntValidator.validate_tags(tags)
        assert "valid-tag" in result
        assert "another_valid" in result
        # "invalid tag" should be filtered out due to space

    def test_empty_tags_list(self):
        """Test empty tags list."""
        result = HuntValidator.validate_tags([])
        assert result == []

    def test_invalid_tags_type(self):
        """Test invalid tags type raises ValidationError with HE-2004."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_tags(123)
        assert exc_info.value.error_code == "HE-2004"
        assert "Tags must be string or list" in str(exc_info.value)


class TestValidateUrl:
    """Tests for validate_url method."""

    def test_valid_http_url(self):
        """Test valid HTTP URL."""
        url = "http://example.com"
        assert HuntValidator.validate_url(url) is True

    def test_valid_https_url(self):
        """Test valid HTTPS URL."""
        url = "https://example.com/path/to/resource"
        assert HuntValidator.validate_url(url) is True

    def test_empty_url(self):
        """Test empty URL raises ValidationError with HE-2005."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url("")
        assert exc_info.value.error_code == "HE-2005"
        assert "URL must be a non-empty string" in str(exc_info.value)

    def test_none_url(self):
        """Test None URL raises ValidationError with HE-2005."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url(None)
        assert exc_info.value.error_code == "HE-2005"

    def test_url_without_scheme(self):
        """Test URL without scheme raises ValidationError with HE-2006."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url("example.com")
        assert exc_info.value.error_code == "HE-2006"
        assert "scheme and netloc" in str(exc_info.value)

    def test_url_with_invalid_scheme(self):
        """Test URL with invalid scheme raises ValidationError with HE-2007."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url("ftp://example.com")
        assert exc_info.value.error_code == "HE-2007"
        assert "http or https" in str(exc_info.value)

    def test_non_string_url(self):
        """Test non-string URL raises ValidationError with HE-2005."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url(123)
        assert exc_info.value.error_code == "HE-2005"

    def test_custom_field_name(self):
        """Test custom field name in error."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_url("", field_name="custom_url")
        assert "custom_url" in exc_info.value.context["field"]


class TestValidateFilePath:
    """Tests for validate_file_path method."""

    def test_valid_existing_file(self):
        """Test valid existing file path."""
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
        try:
            result = HuntValidator.validate_file_path(temp_path)
            assert isinstance(result, Path)
            assert result.exists()
        finally:
            os.unlink(temp_path)

    def test_valid_nonexisting_file_when_allowed(self):
        """Test valid non-existing file path when must_exist=False."""
        temp_path = "/tmp/nonexistent_file_12345.txt"
        result = HuntValidator.validate_file_path(temp_path, must_exist=False)
        assert isinstance(result, Path)

    def test_empty_file_path(self):
        """Test empty file path raises ValidationError with HE-2008."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_file_path("")
        assert exc_info.value.error_code == "HE-2008"
        assert "File path cannot be empty" in str(exc_info.value)

    def test_none_file_path(self):
        """Test None file path raises ValidationError with HE-2008."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_file_path(None)
        assert exc_info.value.error_code == "HE-2008"

    def test_nonexistent_file_path(self):
        """Test non-existent file path raises ValidationError with HE-2009."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_file_path("/nonexistent/path/file.txt", must_exist=True)
        assert exc_info.value.error_code == "HE-2009"
        assert "File does not exist" in str(exc_info.value)

    def test_path_with_parent_references(self):
        """Test path with parent directory references (should warn but not error)."""
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_path = temp_file.name
        try:
            # Create a path with .. in it
            parent_path = os.path.join(os.path.dirname(temp_path), "..", os.path.basename(temp_path))
            result = HuntValidator.validate_file_path(parent_path, must_exist=False)
            assert isinstance(result, Path)
        finally:
            os.unlink(temp_path)


class TestValidateHuntData:
    """Tests for validate_hunt_data method."""

    def test_valid_hunt_data(self):
        """Test valid hunt data."""
        hunt_data = {
            "id": "H001",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Initial Access",
            "tags": ["malware", "detection"]
        }
        result = HuntValidator.validate_hunt_data(hunt_data)
        assert result["id"] == "H001"
        assert result["category"] == "test"
        assert "malware" in result["tags"]

    def test_valid_hunt_data_with_submitter(self):
        """Test valid hunt data with submitter."""
        hunt_data = {
            "id": "H001",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Execution",
            "submitter": {
                "name": "John Doe",
                "link": "https://example.com"
            }
        }
        result = HuntValidator.validate_hunt_data(hunt_data)
        assert result["submitter"]["name"] == "John Doe"

    def test_invalid_hunt_data_type(self):
        """Test invalid hunt data type raises ValidationError with HE-2010."""
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_data("not a dict")
        assert exc_info.value.error_code == "HE-2010"
        assert "Hunt data must be a dictionary" in str(exc_info.value)

    def test_missing_required_field(self):
        """Test missing required field raises ValidationError with HE-2011."""
        hunt_data = {
            "id": "H001",
            "category": "test",
            "title": "Test Hunt"
            # Missing 'tactic'
        }
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_data(hunt_data)
        assert exc_info.value.error_code == "HE-2011"
        assert "Required field" in str(exc_info.value)

    def test_empty_required_field(self):
        """Test empty required field raises ValidationError with HE-2011."""
        hunt_data = {
            "id": "",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Initial Access"
        }
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_data(hunt_data)
        assert exc_info.value.error_code == "HE-2011"

    def test_invalid_hunt_id_in_data(self):
        """Test invalid hunt ID in data raises appropriate ValidationError."""
        hunt_data = {
            "id": "invalid",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Initial Access"
        }
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_data(hunt_data)
        # Should raise HE-2002 from validate_hunt_id
        assert exc_info.value.error_code == "HE-2002"

    def test_invalid_submitter_url(self):
        """Test invalid submitter URL raises ValidationError."""
        hunt_data = {
            "id": "H001",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Execution",
            "submitter": {
                "name": "John Doe",
                "link": "not-a-valid-url"
            }
        }
        with pytest.raises(ValidationError) as exc_info:
            HuntValidator.validate_hunt_data(hunt_data)
        # Should raise HE-2006 from validate_url
        assert exc_info.value.error_code == "HE-2006"

    def test_tags_normalized_in_hunt_data(self):
        """Test tags are normalized in hunt data."""
        hunt_data = {
            "id": "H001",
            "category": "test",
            "title": "Test Hunt",
            "tactic": "Initial Access",
            "tags": ["MALWARE", "Detection", "#endpoint"]
        }
        result = HuntValidator.validate_hunt_data(hunt_data)
        assert "malware" in result["tags"]
        assert "detection" in result["tags"]
        assert "endpoint" in result["tags"]


class TestErrorCodes:
    """Tests for error code consistency."""

    def test_error_codes_are_unique(self):
        """Test that different validation errors have unique error codes."""
        error_codes = []

        # Hunt ID errors
        try:
            HuntValidator.validate_hunt_id("", "test")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_hunt_id("invalid", "test")
        except ValidationError as e:
            error_codes.append(e.error_code)

        # Tactics errors
        try:
            HuntValidator.validate_tactics(123)
        except ValidationError as e:
            error_codes.append(e.error_code)

        # Tags errors
        try:
            HuntValidator.validate_tags(123)
        except ValidationError as e:
            error_codes.append(e.error_code)

        # URL errors
        try:
            HuntValidator.validate_url("")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_url("example.com")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_url("ftp://example.com")
        except ValidationError as e:
            error_codes.append(e.error_code)

        # File path errors
        try:
            HuntValidator.validate_file_path("")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_file_path("/nonexistent/file.txt")
        except ValidationError as e:
            error_codes.append(e.error_code)

        # Hunt data errors
        try:
            HuntValidator.validate_hunt_data("not a dict")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_hunt_data({"id": "H001"})
        except ValidationError as e:
            error_codes.append(e.error_code)

        # All error codes should be unique
        assert len(error_codes) == len(set(error_codes)), f"Duplicate error codes found: {error_codes}"

    def test_all_error_codes_in_he2xxx_range(self):
        """Test that all validation error codes are in HE-2xxx range."""
        error_codes = []

        # Collect error codes from various validation failures
        try:
            HuntValidator.validate_hunt_id("", "test")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_tactics(123)
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_tags(123)
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_url("")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_file_path("")
        except ValidationError as e:
            error_codes.append(e.error_code)

        try:
            HuntValidator.validate_hunt_data("not a dict")
        except ValidationError as e:
            error_codes.append(e.error_code)

        # All error codes should be in HE-2xxx range
        for code in error_codes:
            assert code.startswith("HE-2"), f"Error code {code} not in HE-2xxx range"
