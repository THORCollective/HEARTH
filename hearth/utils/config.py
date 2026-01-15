#!/usr/bin/env python3
"""
Configuration management for HEARTH scripts.
"""

import os
import json
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict
from logger_config import get_logger

logger = get_logger()


@dataclass
class HearthConfig:
    """Configuration class for HEARTH operations."""

    # Directories
    base_directory: str = "."
    hunt_directories: tuple = ("Flames", "Embers", "Alchemy")
    output_directory: str = "."
    log_directory: str = "logs"

    # File patterns
    hunt_file_pattern: str = "*.md"
    excluded_files: tuple = ("secret.md", "README.md")

    # Processing settings
    max_hunts_for_comparison: int = 10
    similarity_threshold: float = 0.7
    auto_exclude_bot_submitters: tuple = ("hearth-auto-intel",)

    # Output settings
    hunts_data_filename: str = "hunts-data.js"
    contributors_filename: str = "Keepers/Contributors.md"

    # AI settings
    openai_model: str = "gpt-4"
    ai_temperature: float = 0.2
    ai_max_tokens: int = 2000

    # Similarity detection settings
    hypothesis_similarity_threshold: float = 0.75
    enable_similarity_checking: bool = True
    max_generation_attempts: int = 5
    similarity_cache_ttl: int = 3600

    # GitHub settings
    github_repo_url: str = "https://github.com/THORCollective/HEARTH"
    github_branch: str = "main"


class ConfigManager:
    """Manages configuration for HEARTH scripts."""

    _instance: Optional['ConfigManager'] = None
    _config: Optional[HearthConfig] = None

    def __new__(cls) -> 'ConfigManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._config is None:
            self._load_config()

    def _load_config(self) -> None:
        """Load configuration from file or environment variables."""
        try:
            config_file = Path(__file__).parent / "hearth_config.json"

            if config_file.exists():
                logger.info(f"Loading configuration from {config_file}")
                with open(config_file, 'r') as file:
                    config_data = json.load(file)
                self._config = HearthConfig(**config_data)
            else:
                logger.info("Using default configuration")
                self._config = HearthConfig()

            # Override with environment variables
            self._apply_env_overrides()

            logger.info("Configuration loaded successfully")

        except Exception as error:
            logger.error(f"Error loading configuration: {error}")
            logger.info("Falling back to default configuration")
            self._config = HearthConfig()

    def _apply_env_overrides(self) -> None:
        """Apply environment variable overrides to configuration."""
        env_mappings = {
            'HEARTH_BASE_DIR': 'base_directory',
            'HEARTH_OUTPUT_DIR': 'output_directory',
            'HEARTH_MAX_COMPARISON_HUNTS': 'max_hunts_for_comparison',
            'HEARTH_SIMILARITY_THRESHOLD': 'similarity_threshold',
            'OPENAI_MODEL': 'openai_model',
            'GITHUB_REPO_URL': 'github_repo_url',
            'GITHUB_BRANCH': 'github_branch'
        }

        for env_var, config_attr in env_mappings.items():
            if env_var in os.environ:
                value = os.environ[env_var]

                # Type conversion
                if config_attr in ['max_hunts_for_comparison']:
                    value = int(value)
                elif config_attr in ['similarity_threshold', 'ai_temperature']:
                    value = float(value)

                setattr(self._config, config_attr, value)
                logger.debug(f"Applied environment override: {config_attr} = {value}")

    @property
    def config(self) -> HearthConfig:
        """Get the current configuration."""
        return self._config

    def save_config(self, filename: Optional[str] = None) -> None:
        """Save current configuration to file."""
        try:
            config_file = Path(__file__).parent / (filename or "hearth_config.json")

            with open(config_file, 'w') as file:
                json.dump(asdict(self._config), file, indent=2)

            logger.info(f"Configuration saved to {config_file}")

        except Exception as error:
            logger.error(f"Error saving configuration: {error}")

    def update_config(self, **kwargs) -> None:
        """Update configuration values."""
        for key, value in kwargs.items():
            if hasattr(self._config, key):
                setattr(self._config, key, value)
                logger.debug(f"Updated configuration: {key} = {value}")
            else:
                logger.warning(f"Unknown configuration key: {key}")


def get_config() -> ConfigManager:
    """Get the singleton configuration manager."""
    return ConfigManager()
