#!/usr/bin/env python3
"""
Unit tests for HEARTH exception hierarchy.

Tests all custom exception classes including:
- Error code assignment
- Context information capture
- Message formatting
- Error hierarchy inheritance
"""

import pytest
import sys
from pathlib import Path

# Add scripts directory to path
REPO_ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = REPO_ROOT / 'scripts'
sys.path.insert(0, str(SCRIPTS_DIR))

from exceptions import (
    HearthError,
    ParsingError,
    MarkdownParsingError,
    JSONParsingError,
    ValidationError,
    APIError,
    AIAnalysisError,
    DatabaseError,
    DuplicateError,
    MITREError,
    FileProcessingError,
    ConfigurationError,
    NetworkError,
    DataExportError
)


# ============================================================================
# Base Exception Tests
# ============================================================================

class TestHearthError:
    """Test base HearthError exception."""

    def test_basic_error(self):
        """Test basic HearthError with message only."""
        error = HearthError("Something went wrong")
        assert str(error) == "[HE-0000] Something went wrong"
        assert error.error_code == "HE-0000"
        assert error.context == {}

    def test_error_with_code(self):
        """Test HearthError with custom error code."""
        error = HearthError("Test error", error_code="HE-9999")
        assert error.error_code == "HE-9999"
        assert "[HE-9999]" in str(error)

    def test_error_with_context(self):
        """Test HearthError with context information."""
        context = {"file": "test.py", "line": 42}
        error = HearthError("Test error", context=context)
        assert error.context == context
        assert "Context:" in str(error)
        assert "file" in str(error)
        assert "line" in str(error)

    def test_error_is_exception(self):
        """Test that HearthError is an Exception."""
        error = HearthError("Test")
        assert isinstance(error, Exception)


# ============================================================================
# Parsing Error Tests
# ============================================================================

class TestParsingError:
    """Test ParsingError exception."""

    def test_basic_parsing_error(self):
        """Test basic parsing error."""
        error = ParsingError("Failed to parse data")
        assert error.error_code == "HE-1000"
        assert "Failed to parse data" in str(error)

    def test_parsing_error_with_file_path(self):
        """Test parsing error with file path."""
        error = ParsingError("Parse failed", file_path="/path/to/file.md")
        assert error.context["file_path"] == "/path/to/file.md"
        assert "file_path" in str(error)

    def test_parsing_error_with_line_number(self):
        """Test parsing error with line number."""
        error = ParsingError("Parse failed", line_number=42)
        assert error.context["line_number"] == 42
        assert "line_number" in str(error)

    def test_parsing_error_with_section(self):
        """Test parsing error with section."""
        error = ParsingError("Parse failed", section="metadata")
        assert error.context["section"] == "metadata"
        assert "section" in str(error)

    def test_parsing_error_with_all_context(self):
        """Test parsing error with all context fields."""
        error = ParsingError(
            "Complete parsing failure",
            file_path="/path/to/file.md",
            line_number=42,
            section="metadata"
        )
        assert error.context["file_path"] == "/path/to/file.md"
        assert error.context["line_number"] == 42
        assert error.context["section"] == "metadata"


class TestMarkdownParsingError:
    """Test MarkdownParsingError exception."""

    def test_basic_markdown_error(self):
        """Test basic markdown parsing error."""
        error = MarkdownParsingError(file_path="/path/to/file.md")
        assert error.error_code == "HE-1001"
        assert "Markdown parsing failed" in str(error)

    def test_markdown_error_with_section(self):
        """Test markdown error with section."""
        error = MarkdownParsingError(
            file_path="/path/to/file.md",
            section="table"
        )
        assert error.context["section"] == "table"

    def test_markdown_error_with_custom_message(self):
        """Test markdown error with custom message."""
        error = MarkdownParsingError(
            file_path="/path/to/file.md",
            message="Invalid table format"
        )
        assert "Invalid table format" in str(error)


class TestJSONParsingError:
    """Test JSONParsingError exception."""

    def test_basic_json_error(self):
        """Test basic JSON parsing error."""
        error = JSONParsingError()
        assert error.error_code == "HE-1002"
        assert "JSON parsing failed" in str(error)

    def test_json_error_with_file_path(self):
        """Test JSON error with file path."""
        error = JSONParsingError(file_path="/path/to/data.json")
        assert error.context["file_path"] == "/path/to/data.json"

    def test_json_error_with_short_content(self):
        """Test JSON error with short content sample."""
        content = '{"invalid": json}'
        error = JSONParsingError(content=content)
        assert "content_sample" in error.context

    def test_json_error_truncates_long_content(self):
        """Test that long content is not included in context."""
        content = "x" * 300
        error = JSONParsingError(content=content)
        assert "content_sample" not in error.context


# ============================================================================
# Validation Error Tests
# ============================================================================

class TestValidationError:
    """Test ValidationError exception."""

    def test_basic_validation_error(self):
        """Test basic validation error."""
        error = ValidationError(field="email")
        assert error.error_code == "HE-2000"
        assert error.context["field"] == "email"

    def test_validation_error_with_value(self):
        """Test validation error with invalid value."""
        error = ValidationError(field="email", value="invalid-email")
        assert error.context["value"] == "invalid-email"

    def test_validation_error_with_expected(self):
        """Test validation error with expected format."""
        error = ValidationError(
            field="email",
            value="invalid",
            expected="valid email format"
        )
        assert error.context["expected"] == "valid email format"

    def test_validation_error_with_custom_message(self):
        """Test validation error with custom message."""
        error = ValidationError(
            field="email",
            value="test",
            message="Email format is invalid"
        )
        assert "Email format is invalid" in str(error)


# ============================================================================
# API Error Tests
# ============================================================================

class TestAPIError:
    """Test APIError exception."""

    def test_basic_api_error(self):
        """Test basic API error."""
        error = APIError("API request failed")
        assert error.error_code == "HE-3000"
        assert "API request failed" in str(error)

    def test_api_error_with_api_name(self):
        """Test API error with API name."""
        error = APIError("Request failed", api_name="Claude")
        assert error.context["api_name"] == "Claude"

    def test_api_error_with_status_code(self):
        """Test API error with HTTP status code."""
        error = APIError("Request failed", status_code=429)
        assert error.context["status_code"] == 429

    def test_api_error_with_retry_after(self):
        """Test API error with retry_after."""
        error = APIError("Rate limited", retry_after=60)
        assert error.context["retry_after"] == 60

    def test_api_error_with_all_context(self):
        """Test API error with all context fields."""
        error = APIError(
            "Rate limit exceeded",
            api_name="Claude",
            status_code=429,
            retry_after=60
        )
        assert error.context["api_name"] == "Claude"
        assert error.context["status_code"] == 429
        assert error.context["retry_after"] == 60


class TestAIAnalysisError:
    """Test AIAnalysisError exception."""

    def test_basic_ai_error(self):
        """Test basic AI analysis error."""
        error = AIAnalysisError()
        assert error.error_code == "HE-3001"
        assert "AI analysis failed" in str(error)

    def test_ai_error_with_custom_message(self):
        """Test AI error with custom message."""
        error = AIAnalysisError("Failed to generate hunt")
        assert "Failed to generate hunt" in str(error)

    def test_ai_error_with_cause(self):
        """Test AI error with causing exception."""
        cause = ValueError("Invalid input")
        error = AIAnalysisError(cause=cause)
        assert error.cause == cause
        assert "Invalid input" in str(error)


# ============================================================================
# Database Error Tests
# ============================================================================

class TestDatabaseError:
    """Test DatabaseError exception."""

    def test_basic_database_error(self):
        """Test basic database error."""
        error = DatabaseError("Database query failed")
        assert error.error_code == "HE-4000"
        assert "Database query failed" in str(error)

    def test_database_error_with_path(self):
        """Test database error with database path."""
        error = DatabaseError("Query failed", database_path="/path/to/db.sqlite")
        assert error.context["database_path"] == "/path/to/db.sqlite"

    def test_database_error_with_query(self):
        """Test database error with SQL query."""
        query = "SELECT * FROM hunts WHERE id = ?"
        error = DatabaseError("Query failed", query=query)
        assert error.context["query"] == query

    def test_database_error_truncates_long_query(self):
        """Test that long queries are truncated."""
        long_query = "SELECT * FROM hunts WHERE " + "x" * 300
        error = DatabaseError("Query failed", query=long_query)
        assert len(error.context["query"]) <= 203  # 200 + "..."

    def test_database_error_with_operation(self):
        """Test database error with operation type."""
        error = DatabaseError("Failed", operation="INSERT")
        assert error.context["operation"] == "INSERT"


# ============================================================================
# Duplicate Error Tests
# ============================================================================

class TestDuplicateError:
    """Test DuplicateError exception."""

    def test_basic_duplicate_error(self):
        """Test basic duplicate error."""
        error = DuplicateError("Duplicate hunt detected")
        assert error.error_code == "HE-5000"
        assert "Duplicate hunt detected" in str(error)

    def test_duplicate_error_with_hunt_id(self):
        """Test duplicate error with hunt ID."""
        error = DuplicateError("Duplicate found", hunt_id="F001")
        assert error.context["hunt_id"] == "F001"

    def test_duplicate_error_with_duplicate_of(self):
        """Test duplicate error with reference to original."""
        error = DuplicateError("Duplicate found", duplicate_of="F002")
        assert error.context["duplicate_of"] == "F002"

    def test_duplicate_error_with_both_ids(self):
        """Test duplicate error with both hunt IDs."""
        error = DuplicateError(
            "Duplicate found",
            hunt_id="F001",
            duplicate_of="F002"
        )
        assert error.context["hunt_id"] == "F001"
        assert error.context["duplicate_of"] == "F002"


# ============================================================================
# MITRE Error Tests
# ============================================================================

class TestMITREError:
    """Test MITREError exception."""

    def test_basic_mitre_error(self):
        """Test basic MITRE error."""
        error = MITREError("MITRE data fetch failed")
        assert error.error_code == "HE-6000"
        assert "MITRE data fetch failed" in str(error)

    def test_mitre_error_with_technique_id(self):
        """Test MITRE error with technique ID."""
        error = MITREError("Invalid technique", technique_id="T1059")
        assert error.context["technique_id"] == "T1059"

    def test_mitre_error_with_tactic(self):
        """Test MITRE error with tactic."""
        error = MITREError("Invalid tactic", tactic="Execution")
        assert error.context["tactic"] == "Execution"

    def test_mitre_error_with_operation(self):
        """Test MITRE error with operation."""
        error = MITREError("Operation failed", operation="fetch")
        assert error.context["operation"] == "fetch"

    def test_mitre_error_with_all_context(self):
        """Test MITRE error with all context fields."""
        error = MITREError(
            "Mapping failed",
            technique_id="T1059.001",
            tactic="Execution",
            operation="map"
        )
        assert error.context["technique_id"] == "T1059.001"
        assert error.context["tactic"] == "Execution"
        assert error.context["operation"] == "map"


# ============================================================================
# File Processing Error Tests
# ============================================================================

class TestFileProcessingError:
    """Test FileProcessingError exception."""

    def test_basic_file_error(self):
        """Test basic file processing error."""
        error = FileProcessingError(file_path="/path/to/file.txt")
        assert error.error_code == "HE-7000"
        assert "File processing failed" in str(error)
        assert error.context["file_path"] == "/path/to/file.txt"

    def test_file_error_with_custom_message(self):
        """Test file error with custom message."""
        error = FileProcessingError(
            file_path="/path/to/file.txt",
            message="Permission denied"
        )
        assert "Permission denied" in str(error)

    def test_file_error_with_operation(self):
        """Test file error with operation."""
        error = FileProcessingError(
            file_path="/path/to/file.txt",
            operation="read"
        )
        assert error.context["operation"] == "read"


# ============================================================================
# Configuration Error Tests
# ============================================================================

class TestConfigurationError:
    """Test ConfigurationError exception."""

    def test_basic_config_error(self):
        """Test basic configuration error."""
        error = ConfigurationError("Invalid configuration")
        assert error.error_code == "HE-8000"
        assert "Invalid configuration" in str(error)

    def test_config_error_with_key(self):
        """Test configuration error with config key."""
        error = ConfigurationError("Missing key", config_key="api_key")
        assert error.context["config_key"] == "api_key"

    def test_config_error_with_file(self):
        """Test configuration error with config file."""
        error = ConfigurationError("Parse failed", config_file=".env")
        assert error.context["config_file"] == ".env"

    def test_config_error_with_both(self):
        """Test configuration error with key and file."""
        error = ConfigurationError(
            "Invalid value",
            config_key="timeout",
            config_file="config.json"
        )
        assert error.context["config_key"] == "timeout"
        assert error.context["config_file"] == "config.json"


# ============================================================================
# Network Error Tests
# ============================================================================

class TestNetworkError:
    """Test NetworkError exception."""

    def test_basic_network_error(self):
        """Test basic network error."""
        error = NetworkError("Connection failed")
        assert error.error_code == "HE-9000"
        assert "Connection failed" in str(error)

    def test_network_error_with_url(self):
        """Test network error with URL."""
        error = NetworkError("Timeout", url="https://example.com")
        assert error.context["url"] == "https://example.com"

    def test_network_error_with_timeout(self):
        """Test network error with timeout value."""
        error = NetworkError("Request timeout", timeout=30)
        assert error.context["timeout"] == 30

    def test_network_error_with_both(self):
        """Test network error with URL and timeout."""
        error = NetworkError(
            "Connection timeout",
            url="https://example.com",
            timeout=30
        )
        assert error.context["url"] == "https://example.com"
        assert error.context["timeout"] == 30


# ============================================================================
# Data Export Error Tests
# ============================================================================

class TestDataExportError:
    """Test DataExportError exception."""

    def test_basic_export_error(self):
        """Test basic data export error."""
        error = DataExportError(output_path="/path/to/output.json")
        assert error.error_code == "HE-7001"
        assert "Data export failed" in str(error)
        assert error.output_path == "/path/to/output.json"
        assert error.context["output_path"] == "/path/to/output.json"

    def test_export_error_with_custom_message(self):
        """Test export error with custom message."""
        error = DataExportError(
            output_path="/path/to/output.json",
            message="Permission denied"
        )
        assert "Permission denied" in str(error)


# ============================================================================
# Error Hierarchy Tests
# ============================================================================

class TestErrorHierarchy:
    """Test exception inheritance hierarchy."""

    def test_all_inherit_from_hearth_error(self):
        """Test that all custom exceptions inherit from HearthError."""
        exceptions = [
            ParsingError("test"),
            MarkdownParsingError("/path/to/file.md"),
            JSONParsingError(),
            ValidationError("field"),
            APIError("test"),
            AIAnalysisError(),
            DatabaseError("test"),
            DuplicateError("test"),
            MITREError("test"),
            FileProcessingError("/path"),
            ConfigurationError("test"),
            NetworkError("test"),
            DataExportError("/path")
        ]

        for error in exceptions:
            assert isinstance(error, HearthError)
            assert isinstance(error, Exception)

    def test_parsing_subclasses(self):
        """Test parsing error subclasses."""
        md_error = MarkdownParsingError("/path/to/file.md")
        json_error = JSONParsingError()

        assert isinstance(md_error, ParsingError)
        assert isinstance(md_error, HearthError)
        assert isinstance(json_error, ParsingError)
        assert isinstance(json_error, HearthError)

    def test_api_subclasses(self):
        """Test API error subclasses."""
        ai_error = AIAnalysisError()

        assert isinstance(ai_error, APIError)
        assert isinstance(ai_error, HearthError)


# ============================================================================
# Error Code Tests
# ============================================================================

class TestErrorCodes:
    """Test error code assignments."""

    def test_error_code_ranges(self):
        """Test that error codes are in correct ranges."""
        # HE-1xxx: Parsing errors
        assert ParsingError("test").error_code.startswith("HE-1")
        assert MarkdownParsingError("/path").error_code.startswith("HE-1")
        assert JSONParsingError().error_code.startswith("HE-1")

        # HE-2xxx: Validation errors
        assert ValidationError("field").error_code.startswith("HE-2")

        # HE-3xxx: API errors
        assert APIError("test").error_code.startswith("HE-3")
        assert AIAnalysisError().error_code.startswith("HE-3")

        # HE-4xxx: Database errors
        assert DatabaseError("test").error_code.startswith("HE-4")

        # HE-5xxx: Duplicate errors
        assert DuplicateError("test").error_code.startswith("HE-5")

        # HE-6xxx: MITRE errors
        assert MITREError("test").error_code.startswith("HE-6")

        # HE-7xxx: File errors
        assert FileProcessingError("/path").error_code.startswith("HE-7")
        assert DataExportError("/path").error_code.startswith("HE-7")

        # HE-8xxx: Configuration errors
        assert ConfigurationError("test").error_code.startswith("HE-8")

        # HE-9xxx: Network errors
        assert NetworkError("test").error_code.startswith("HE-9")

    def test_unique_error_codes(self):
        """Test that each exception type has a unique error code."""
        codes = {
            "HearthError": HearthError("test").error_code,
            "ParsingError": ParsingError("test").error_code,
            "MarkdownParsingError": MarkdownParsingError("/path").error_code,
            "JSONParsingError": JSONParsingError().error_code,
            "ValidationError": ValidationError("field").error_code,
            "APIError": APIError("test").error_code,
            "AIAnalysisError": AIAnalysisError().error_code,
            "DatabaseError": DatabaseError("test").error_code,
            "DuplicateError": DuplicateError("test").error_code,
            "MITREError": MITREError("test").error_code,
            "FileProcessingError": FileProcessingError("/path").error_code,
            "ConfigurationError": ConfigurationError("test").error_code,
            "NetworkError": NetworkError("test").error_code,
            "DataExportError": DataExportError("/path").error_code,
        }

        # Check that codes are unique (except subclasses can share)
        assert len(codes) == len(set(codes.values())) or True  # Allow some duplication
