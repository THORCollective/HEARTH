#!/usr/bin/env python3
"""
Input validation utilities for HEARTH operations.
"""

import re
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
from urllib.parse import urlparse
from logger_config import get_logger
from exceptions import ValidationError

logger = get_logger()


class HuntValidator:
    """Validates hunt data and inputs."""

    # Valid MITRE ATT&CK tactics
    VALID_TACTICS = {
        'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
        'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
        'Collection', 'Command and Control', 'Exfiltration', 'Impact'
    }

    # Valid hunt categories
    VALID_CATEGORIES = {'Flames', 'Embers', 'Alchemy'}

    # Valid hunt ID patterns
    HUNT_ID_PATTERNS = {
        'Flames': re.compile(r'^H\d{3}$'),
        'Embers': re.compile(r'^B\d{3}$'),
        'Alchemy': re.compile(r'^M\d{3}$')
    }

    @staticmethod
    def validate_hunt_id(hunt_id: str, category: str) -> bool:
        """Validate hunt ID format for given category.

        Args:
            hunt_id: The hunt identifier to validate.
            category: The hunt category.

        Returns:
            True if valid, False otherwise.

        Raises:
            ValidationError: If validation fails with details.
        """
        try:
            if not hunt_id or not isinstance(hunt_id, str):
                raise ValidationError("hunt_id", str(hunt_id), "Hunt ID must be a non-empty string")

            if category not in HuntValidator.VALID_CATEGORIES:
                raise ValidationError("category", category, f"Category must be one of {HuntValidator.VALID_CATEGORIES}")

            pattern = HuntValidator.HUNT_ID_PATTERNS.get(category)
            if not pattern:
                raise ValidationError("category", category, f"No pattern defined for category {category}")

            if not pattern.match(hunt_id):
                expected_format = {
                    'Flames': 'H001-H999',
                    'Embers': 'B001-B999',
                    'Alchemy': 'M001-M999'
                }.get(category, 'Unknown')

                raise ValidationError(
                    "hunt_id",
                    hunt_id,
                    f"Hunt ID format invalid for {category}. Expected: {expected_format}"
                )

            logger.debug(f"Hunt ID {hunt_id} validated for category {category}")
            return True

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Unexpected error validating hunt ID: {error}")
            raise ValidationError("hunt_id", hunt_id, f"Validation failed: {error}")

    @staticmethod
    def validate_tactics(tactics: Union[str, List[str]]) -> List[str]: \n        \"\"\"Validate and normalize tactics.\n        \n        Args:\n            tactics: Tactic string or list of tactics.\n            \n        Returns:\n            List of validated tactics.\n            \n        Raises:\n            ValidationError: If tactics are invalid.\n        \"\"\"\n        try:\n            if isinstance(tactics, str):\n                tactic_list = [t.strip() for t in tactics.split(',') if t.strip()]\n            elif isinstance(tactics, list):\n                tactic_list = [str(t).strip() for t in tactics if str(t).strip()]\n            else:\n                raise ValidationError(\"tactics\", str(tactics), \"Tactics must be string or list\")\n            \n            invalid_tactics = []\n            valid_tactics = []\n            \n            for tactic in tactic_list:\n                if tactic in HuntValidator.VALID_TACTICS:\n                    valid_tactics.append(tactic)\n                else:\n                    invalid_tactics.append(tactic)\n            \n            if invalid_tactics:\n                logger.warning(f\"Invalid tactics found: {invalid_tactics}\")\n                # Don't raise error, just log warning for flexibility\n            \n            logger.debug(f\"Validated {len(valid_tactics)} tactics\")\n            return valid_tactics\n            \n        except ValidationError:\n            raise\n        except Exception as error:\n            logger.error(f\"Error validating tactics: {error}\")\n            raise ValidationError(\"tactics\", str(tactics), f\"Validation failed: {error}\")\n    \n    @staticmethod\n    def validate_tags(tags: Union[str, List[str]]) -> List[str]:\n        \"\"\"Validate and normalize tags.\n        \n        Args:\n            tags: Tag string or list of tags.\n            \n        Returns:\n            List of validated tags.\n            \n        Raises:\n            ValidationError: If tag format is invalid.\n        \"\"\"\n        try:\n            if isinstance(tags, str):\n                # Handle both space-separated and comma-separated tags\n                tag_list = re.findall(r'#?\\w+', tags)\n            elif isinstance(tags, list):\n                tag_list = [str(tag) for tag in tags]\n            else:\n                raise ValidationError(\"tags\", str(tags), \"Tags must be string or list\")\n            \n            # Normalize tags (remove # prefix, lowercase, alphanumeric only)\n            normalized_tags = []\n            for tag in tag_list:\n                clean_tag = re.sub(r'^#', '', tag.strip().lower())\n                if re.match(r'^[a-z0-9_.-]+$', clean_tag) and len(clean_tag) > 0:\n                    normalized_tags.append(clean_tag)\n                else:\n                    logger.warning(f\"Invalid tag format: {tag}\")\n            \n            # Remove duplicates while preserving order\n            unique_tags = list(dict.fromkeys(normalized_tags))\n            \n            logger.debug(f\"Validated {len(unique_tags)} tags\")\n            return unique_tags\n            \n        except ValidationError:\n            raise\n        except Exception as error:\n            logger.error(f\"Error validating tags: {error}\")\n            raise ValidationError(\"tags\", str(tags), f\"Validation failed: {error}\")\n    \n    @staticmethod\n    def validate_url(url: str, field_name: str = \"url\") -> bool:\n        \"\"\"Validate URL format.\n        \n        Args:\n            url: URL to validate.\n            field_name: Name of the field for error reporting.\n            \n        Returns:\n            True if valid.\n            \n        Raises:\n            ValidationError: If URL is invalid.\n        \"\"\"\n        try:\n            if not url or not isinstance(url, str):\n                raise ValidationError(field_name, str(url), \"URL must be a non-empty string\")\n            \n            parsed = urlparse(url)\n            \n            if not parsed.scheme or not parsed.netloc:\n                raise ValidationError(field_name, url, \"URL must have scheme and netloc\")\n            \n            if parsed.scheme not in ['http', 'https']:\n                raise ValidationError(field_name, url, \"URL scheme must be http or https\")\n            \n            logger.debug(f\"URL {url} validated\")\n            return True\n            \n        except ValidationError:\n            raise\n        except Exception as error:\n            logger.error(f\"Error validating URL: {error}\")\n            raise ValidationError(field_name, url, f\"URL validation failed: {error}\")\n    \n    @staticmethod\n    def validate_file_path(file_path: Union[str, Path], must_exist: bool = True) -> Path:\n        \"\"\"Validate file path.\n        \n        Args:\n            file_path: Path to validate.\n            must_exist: Whether file must exist.\n            \n        Returns:\n            Validated Path object.\n            \n        Raises:\n            ValidationError: If path is invalid.\n        \"\"\"\n        try:\n            if not file_path:\n                raise ValidationError(\"file_path\", str(file_path), \"File path cannot be empty\")\n            \n            path_obj = Path(file_path)\n            \n            if must_exist and not path_obj.exists():\n                raise ValidationError(\"file_path\", str(file_path), \"File does not exist\")\n            \n            # Check for potential security issues\n            resolved_path = path_obj.resolve()\n            if '..' in str(resolved_path):\n                logger.warning(f\"Path contains parent directory references: {file_path}\")\n            \n            logger.debug(f\"File path {file_path} validated\")\n            return path_obj\n            \n        except ValidationError:\n            raise\n        except Exception as error:\n            logger.error(f\"Error validating file path: {error}\")\n            raise ValidationError(\"file_path\", str(file_path), f\"Path validation failed: {error}\")\n    \n    @staticmethod\n    def validate_hunt_data(hunt_data: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Validate complete hunt data structure.\n        \n        Args:\n            hunt_data: Hunt data dictionary.\n            \n        Returns:\n            Validated and normalized hunt data.\n            \n        Raises:\n            ValidationError: If hunt data is invalid.\n        \"\"\"\n        try:\n            if not isinstance(hunt_data, dict):\n                raise ValidationError(\"hunt_data\", str(type(hunt_data)), \"Hunt data must be a dictionary\")\n            \n            required_fields = ['id', 'category', 'title', 'tactic']\n            for field in required_fields:\n                if field not in hunt_data or not hunt_data[field]:\n                    raise ValidationError(field, str(hunt_data.get(field)), f\"Required field {field} is missing or empty\")\n            \n            validated_data = hunt_data.copy()\n            \n            # Validate hunt ID and category\n            HuntValidator.validate_hunt_id(validated_data['id'], validated_data['category'])\n            \n            # Validate tactics\n            if 'tactic' in validated_data:\n                validated_data['tactics'] = HuntValidator.validate_tactics(validated_data['tactic'])\n            \n            # Validate tags\n            if 'tags' in validated_data:\n                validated_data['tags'] = HuntValidator.validate_tags(validated_data['tags'])\n            \n            # Validate submitter URL if present\n            if 'submitter' in validated_data and isinstance(validated_data['submitter'], dict):\n                submitter = validated_data['submitter']\n                if 'link' in submitter and submitter['link']:\n                    HuntValidator.validate_url(submitter['link'], 'submitter_link')\n            \n            logger.info(f\"Hunt data validated for {validated_data['id']}\")\n            return validated_data\n            \n        except ValidationError:\n            raise\n        except Exception as error:\n            logger.error(f\"Error validating hunt data: {error}\")\n            raise ValidationError(\"hunt_data\", str(hunt_data), f\"Hunt data validation failed: {error}\")
