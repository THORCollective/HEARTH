#!/usr/bin/env python3
"""
Simplified hunt parser to test our enhanced system.
"""

from pathlib import Path
import sys

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from logger_config import get_logger
    from config_manager import get_config

    logger = get_logger()
    config = get_config().config

    logger.info("Enhanced HEARTH system is working!")
    logger.info(f"Base directory: {config.base_directory}")
    logger.info(f"Hunt directories: {config.hunt_directories}")

    print("✅ Enhanced HEARTH system components loaded successfully!")
    print(f"Configuration: {config.base_directory}")

except Exception as error:
    print(f"❌ Error loading enhanced system: {error}")
    import traceback
    traceback.print_exc()
