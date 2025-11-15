#!/usr/bin/env python3
"""
Centralized logging configuration for HEARTH scripts.
"""

import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional


class HearthLogger:
    """Centralized logger for HEARTH operations."""

    _instance: Optional['HearthLogger'] = None
    _logger: Optional[logging.Logger] = None

    def __new__(cls) -> 'HearthLogger':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._logger is None:
            self._setup_logger()

    def _setup_logger(self) -> None:
        """Setup the logger with appropriate handlers and formatters."""
        self._logger = logging.getLogger('hearth')
        self._logger.setLevel(logging.INFO)

        # Prevent duplicate handlers
        if self._logger.handlers:
            return

        # Create formatters
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        self._logger.addHandler(console_handler)

        # File handler
        log_dir = Path(__file__).parent.parent / 'logs'
        log_dir.mkdir(exist_ok=True)

        log_file = log_dir / f'hearth_{datetime.now().strftime("%Y%m%d")}.log'
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(file_formatter)
        self._logger.addHandler(file_handler)

    @property
    def logger(self) -> logging.Logger:
        """Get the configured logger instance."""
        return self._logger

    def info(self, message: str, **kwargs) -> None:
        """Log info message."""
        self._logger.info(message, **kwargs)

    def debug(self, message: str, **kwargs) -> None:
        """Log debug message."""
        self._logger.debug(message, **kwargs)

    def warning(self, message: str, **kwargs) -> None:
        """Log warning message."""
        self._logger.warning(message, **kwargs)

    def error(self, message: str, **kwargs) -> None:
        """Log error message."""
        self._logger.error(message, **kwargs)

    def critical(self, message: str, **kwargs) -> None:
        """Log critical message."""
        self._logger.critical(message, **kwargs)

    def exception(self, message: str, **kwargs) -> None:
        """Log exception with traceback."""
        self._logger.exception(message, **kwargs)


def get_logger() -> HearthLogger:
    """Get the singleton logger instance."""
    return HearthLogger()
