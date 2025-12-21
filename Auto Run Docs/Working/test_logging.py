#!/usr/bin/env python3
"""Test script to verify Python logging is working correctly."""

import sys
import os

# Add scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))

from logger_config import get_logger

logger = get_logger()

def test_python_logging():
    """Test all log levels to verify they work correctly."""
    print("=== Testing Python Logger ===\n")

    # Test all log levels
    logger.debug("This is a DEBUG message - should only show when LOG_LEVEL=DEBUG")
    logger.info("This is an INFO message - should show in INFO and DEBUG modes")
    logger.warning("This is a WARNING message - should always show")
    logger.error("This is an ERROR message - should always show")
    logger.critical("This is a CRITICAL message - should always show")

    print("\n=== Log Level Tests ===")
    print(f"Current log level: {logger.logger.level}")
    print(f"INFO level value: {20}")  # logging.INFO = 20
    print(f"DEBUG level value: {10}")  # logging.DEBUG = 10

    # Test exception logging
    try:
        raise ValueError("Test exception for logging")
    except Exception as e:
        logger.exception("Caught an exception during testing")

    print("\n=== Python Logger Test Complete ===")

if __name__ == "__main__":
    test_python_logging()
