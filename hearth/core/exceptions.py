#!/usr/bin/env python3
"""
Custom exceptions for HEARTH operations.
"""


class HearthError(Exception):
    """Base exception for HEARTH operations."""
    pass


class FileProcessingError(HearthError):
    """Raised when file processing fails."""

    def __init__(self, file_path: str, message: str = "File processing failed"):
        self.file_path = file_path
        super().__init__(f"{message}: {file_path}")


class MarkdownParsingError(HearthError):
    """Raised when markdown parsing fails."""

    def __init__(self, file_path: str, section: str = "", message: str = "Markdown parsing failed"):
        self.file_path = file_path
        self.section = section
        error_msg = f"{message}: {file_path}"
        if section:
            error_msg += f" (section: {section})"
        super().__init__(error_msg)


class ConfigurationError(HearthError):
    """Raised when configuration is invalid."""
    pass


class ValidationError(HearthError):
    """Raised when input validation fails."""

    def __init__(self, field: str, value: str, message: str = "Validation failed"):
        self.field = field
        self.value = value
        super().__init__(f"{message}: {field} = '{value}'")


class AIAnalysisError(HearthError):
    """Raised when AI analysis fails."""

    def __init__(self, message: str = "AI analysis failed", cause: Exception = None):
        self.cause = cause
        super().__init__(message)


class DataExportError(HearthError):
    """Raised when data export fails."""

    def __init__(self, output_path: str, message: str = "Data export failed"):
        self.output_path = output_path
        super().__init__(f"{message}: {output_path}")


class NetworkError(HearthError):
    """Raised when network operations fail."""
    pass
