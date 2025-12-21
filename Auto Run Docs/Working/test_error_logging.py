#!/usr/bin/env python3
"""Test script to verify error logging works correctly."""

import sys
import os

# Add scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))

from logger_config import get_logger

logger = get_logger()

def test_error_logging():
    """Test error logging scenarios."""
    print("=== Testing Error Logging ===\n")

    # Test 1: Simple error message
    logger.error("This is a test error message")

    # Test 2: Error with context
    filename = "test_file.md"
    logger.error(f"Error processing {filename}: File not found")

    # Test 3: Exception logging
    try:
        # Simulate a realistic error
        result = 1 / 0
    except ZeroDivisionError as e:
        logger.error(f"Math error occurred: {e}")

    # Test 4: Exception with full traceback
    try:
        import json
        json.loads("{invalid json")
    except json.JSONDecodeError as e:
        logger.exception("Failed to parse JSON configuration")

    # Test 5: Warning that should still show
    logger.warning("This is a warning message")

    print("\n=== Error Logging Test Complete ===")

if __name__ == "__main__":
    test_error_logging()
