#!/usr/bin/env python3
"""
Custom exceptions for HEARTH operations.

Error Code Conventions:
- HE-1xxx: Parsing errors
- HE-2xxx: Validation errors
- HE-3xxx: API errors
- HE-4xxx: Database errors
- HE-5xxx: Duplicate detection errors
- HE-6xxx: MITRE ATT&CK errors
- HE-7xxx: File processing errors
- HE-8xxx: Configuration errors
- HE-9xxx: Network errors
"""


class HearthError(Exception):
    """Base exception for HEARTH operations.

    All custom HEARTH exceptions inherit from this base class.
    Provides error code, message, and contextual information.
    """

    def __init__(self, message: str, error_code: str = "HE-0000", context: dict = None):
        """Initialize HearthError.

        Args:
            message: Human-readable error description
            error_code: Standardized error code for programmatic handling
            context: Additional contextual information (file paths, line numbers, etc.)
        """
        self.error_code = error_code
        self.context = context or {}
        error_msg = f"[{error_code}] {message}"
        if context:
            error_msg += f" | Context: {context}"
        super().__init__(error_msg)


class ParsingError(HearthError):
    """Raised when parsing operations fail.

    Use for markdown parsing, JSON parsing, or any structured data parsing failures.
    """

    def __init__(
        self,
        message: str,
        file_path: str = None,
        line_number: int = None,
        section: str = None,
        error_code: str = "HE-1000"
    ):
        """Initialize ParsingError.

        Args:
            message: Description of parsing failure
            file_path: Path to file being parsed
            line_number: Line number where parsing failed
            section: Section or field being parsed
            error_code: Specific parsing error code (HE-1xxx)
        """
        context = {}
        if file_path:
            context["file_path"] = file_path
        if line_number:
            context["line_number"] = line_number
        if section:
            context["section"] = section
        super().__init__(message, error_code, context)


class MarkdownParsingError(ParsingError):
    """Raised when markdown parsing fails."""

    def __init__(
        self,
        file_path: str,
        section: str = "",
        message: str = "Markdown parsing failed",
        line_number: int = None
    ):
        super().__init__(
            message=message,
            file_path=file_path,
            line_number=line_number,
            section=section,
            error_code="HE-1001"
        )


class JSONParsingError(ParsingError):
    """Raised when JSON parsing fails."""

    def __init__(
        self,
        message: str = "JSON parsing failed",
        file_path: str = None,
        content: str = None
    ):
        # Build context manually to include content_sample if applicable
        context_dict = {}
        if file_path:
            context_dict["file_path"] = file_path
        if content and len(content) < 200:
            context_dict["content_sample"] = content

        # Call HearthError.__init__ directly to set context properly
        HearthError.__init__(self, message=message, error_code="HE-1002", context=context_dict)


class ValidationError(HearthError):
    """Raised when input validation fails.

    Use for field validation, format validation, or constraint validation failures.
    """

    def __init__(
        self,
        field: str,
        value: str = None,
        message: str = "Validation failed",
        expected: str = None,
        error_code: str = "HE-2000"
    ):
        """Initialize ValidationError.

        Args:
            field: Name of field that failed validation
            value: Invalid value provided
            message: Description of validation failure
            expected: Expected format or value
            error_code: Specific validation error code (HE-2xxx)
        """
        context = {"field": field}
        if value is not None:
            context["value"] = str(value)
        if expected:
            context["expected"] = expected
        super().__init__(message, error_code, context)


class APIError(HearthError):
    """Raised when AI API operations fail.

    Use for API authentication, rate limiting, timeouts, or response errors.
    """

    def __init__(
        self,
        message: str,
        api_name: str = None,
        status_code: int = None,
        retry_after: int = None,
        error_code: str = "HE-3000"
    ):
        """Initialize APIError.

        Args:
            message: Description of API failure
            api_name: Name of API service (e.g., "Claude", "OpenAI")
            status_code: HTTP status code if applicable
            retry_after: Seconds to wait before retry (for rate limits)
            error_code: Specific API error code (HE-3xxx)
        """
        context = {}
        if api_name:
            context["api_name"] = api_name
        if status_code:
            context["status_code"] = status_code
        if retry_after:
            context["retry_after"] = retry_after
        super().__init__(message, error_code, context)


class AIAnalysisError(APIError):
    """Raised when AI analysis fails."""

    def __init__(self, message: str = "AI analysis failed", cause: Exception = None):
        self.cause = cause
        context = {}
        if cause:
            context["cause"] = str(cause)
        # Call HearthError.__init__ directly to pass context
        HearthError.__init__(self, message=message, error_code="HE-3001", context=context)


class DatabaseError(HearthError):
    """Raised when SQLite database operations fail.

    Use for connection errors, query errors, lock errors, or integrity violations.
    """

    def __init__(
        self,
        message: str,
        database_path: str = None,
        query: str = None,
        operation: str = None,
        error_code: str = "HE-4000"
    ):
        """Initialize DatabaseError.

        Args:
            message: Description of database failure
            database_path: Path to database file
            query: SQL query that failed (truncated if long)
            operation: Database operation (INSERT, UPDATE, DELETE, SELECT)
            error_code: Specific database error code (HE-4xxx)
        """
        context = {}
        if database_path:
            context["database_path"] = database_path
        if query:
            # Truncate long queries
            context["query"] = query[:200] + "..." if len(query) > 200 else query
        if operation:
            context["operation"] = operation
        super().__init__(message, error_code, context)


class DuplicateError(HearthError):
    """Raised when duplicate detection operations fail.

    Use for duplicate hunt detection errors or hash comparison failures.
    """

    def __init__(
        self,
        message: str,
        hunt_id: str = None,
        duplicate_of: str = None,
        error_code: str = "HE-5000"
    ):
        """Initialize DuplicateError.

        Args:
            message: Description of duplicate detection failure
            hunt_id: ID of hunt being checked
            duplicate_of: ID of hunt that is a duplicate
            error_code: Specific duplicate error code (HE-5xxx)
        """
        context = {}
        if hunt_id:
            context["hunt_id"] = hunt_id
        if duplicate_of:
            context["duplicate_of"] = duplicate_of
        super().__init__(message, error_code, context)


class MITREError(HearthError):
    """Raised when MITRE ATT&CK operations fail.

    Use for MITRE data fetching, mapping, or validation errors.
    """

    def __init__(
        self,
        message: str,
        technique_id: str = None,
        tactic: str = None,
        operation: str = None,
        error_code: str = "HE-6000"
    ):
        """Initialize MITREError.

        Args:
            message: Description of MITRE operation failure
            technique_id: MITRE ATT&CK technique ID (e.g., "T1059")
            tactic: MITRE ATT&CK tactic
            operation: Operation being performed (fetch, map, validate)
            error_code: Specific MITRE error code (HE-6xxx)
        """
        context = {}
        if technique_id:
            context["technique_id"] = technique_id
        if tactic:
            context["tactic"] = tactic
        if operation:
            context["operation"] = operation
        super().__init__(message, error_code, context)


class FileProcessingError(HearthError):
    """Raised when file processing fails.

    Use for file I/O errors, permission errors, or encoding errors.
    """

    def __init__(
        self,
        file_path: str,
        message: str = "File processing failed",
        operation: str = None,
        error_code: str = "HE-7000"
    ):
        """Initialize FileProcessingError.

        Args:
            file_path: Path to file that failed processing
            message: Description of failure
            operation: File operation (read, write, delete)
            error_code: Specific file error code (HE-7xxx)
        """
        context = {"file_path": file_path}
        if operation:
            context["operation"] = operation
        super().__init__(message, error_code, context)


class ConfigurationError(HearthError):
    """Raised when configuration is invalid.

    Use for missing config, invalid config values, or config parsing errors.
    """

    def __init__(
        self,
        message: str,
        config_key: str = None,
        config_file: str = None,
        error_code: str = "HE-8000"
    ):
        """Initialize ConfigurationError.

        Args:
            message: Description of configuration error
            config_key: Configuration key that is invalid
            config_file: Path to configuration file
            error_code: Specific configuration error code (HE-8xxx)
        """
        context = {}
        if config_key:
            context["config_key"] = config_key
        if config_file:
            context["config_file"] = config_file
        super().__init__(message, error_code, context)


class NetworkError(HearthError):
    """Raised when network operations fail.

    Use for connection timeouts, DNS failures, or network unavailability.
    """

    def __init__(
        self,
        message: str,
        url: str = None,
        timeout: int = None,
        error_code: str = "HE-9000"
    ):
        """Initialize NetworkError.

        Args:
            message: Description of network failure
            url: URL that failed to connect
            timeout: Timeout value in seconds
            error_code: Specific network error code (HE-9xxx)
        """
        context = {}
        if url:
            context["url"] = url
        if timeout:
            context["timeout"] = timeout
        super().__init__(message, error_code, context)


class DataExportError(HearthError):
    """Raised when data export fails."""

    def __init__(self, output_path: str, message: str = "Data export failed"):
        super().__init__(
            message=message,
            error_code="HE-7001",
            context={"output_path": output_path}
        )
        self.output_path = output_path
