#!/usr/bin/env python3
"""
Input validation utilities for HEARTH scripts.
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Union
from urllib.parse import urlparse

from logger_config import get_logger
from exceptions import ValidationError

logger = get_logger()


class HuntValidator:
    """Validates hunt data and related inputs."""

    # Valid MITRE ATT&CK tactics
    VALID_TACTICS = {
        "Initial Access", "Execution", "Persistence", "Privilege Escalation",
        "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
        "Collection", "Command and Control", "Exfiltration", "Impact"
    }

    @staticmethod
    def validate_hunt_id(hunt_id: str, category: str) -> bool:
        """Validate hunt ID format."""
        try:
            if not hunt_id or not isinstance(hunt_id, str):
                raise ValidationError("hunt_id", str(hunt_id), "Hunt ID must be a non-empty string")

            # Check format: Category prefix + number (e.g., "F001", "E042", "A123")
            expected_prefix = category[0].upper() if category else "H"
            pattern = f"^{expected_prefix}\\d{{3,4}}$"

            if not re.match(pattern, hunt_id):
                raise ValidationError(
                    "hunt_id", hunt_id,
                    f"Hunt ID must match pattern {pattern} (e.g., {expected_prefix}001)"
                )

            logger.debug(f"Hunt ID {hunt_id} validated")
            return True

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Unexpected error validating hunt ID: {error}")
            raise ValidationError("hunt_id", hunt_id, f"Validation failed: {error}")

    @staticmethod
    def validate_tactics(tactics: Union[str, List[str]]) -> List[str]:
        """Validate and normalize tactics."""
        try:
            if isinstance(tactics, str):
                tactic_list = [t.strip() for t in tactics.split(',') if t.strip()]
            elif isinstance(tactics, list):
                tactic_list = [str(t).strip() for t in tactics if str(t).strip()]
            else:
                raise ValidationError("tactics", str(tactics), "Tactics must be string or list")

            invalid_tactics = []
            valid_tactics = []

            for tactic in tactic_list:
                if tactic in HuntValidator.VALID_TACTICS:
                    valid_tactics.append(tactic)
                else:
                    invalid_tactics.append(tactic)

            if invalid_tactics:
                logger.warning(f"Invalid tactics found: {invalid_tactics}")

            logger.debug(f"Validated {len(valid_tactics)} tactics")
            return valid_tactics

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Error validating tactics: {error}")
            raise ValidationError("tactics", str(tactics), f"Validation failed: {error}")

    @staticmethod
    def validate_tags(tags: Union[str, List[str]]) -> List[str]:
        """Validate and normalize tags."""
        try:
            if isinstance(tags, str):
                tag_list = re.findall(r'#?\\w+', tags)
            elif isinstance(tags, list):
                tag_list = [str(tag) for tag in tags]
            else:
                raise ValidationError("tags", str(tags), "Tags must be string or list")

            normalized_tags = []
            for tag in tag_list:
                clean_tag = re.sub(r'^#', '', tag.strip().lower())
                if re.match(r'^[a-z0-9_.-]+$', clean_tag) and len(clean_tag) > 0:
                    normalized_tags.append(clean_tag)
                else:
                    logger.warning(f"Invalid tag format: {tag}")

            unique_tags = list(dict.fromkeys(normalized_tags))

            logger.debug(f"Validated {len(unique_tags)} tags")
            return unique_tags

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Error validating tags: {error}")
            raise ValidationError("tags", str(tags), f"Validation failed: {error}")

    @staticmethod
    def validate_url(url: str, field_name: str = "url") -> bool:
        """Validate URL format."""
        try:
            if not url or not isinstance(url, str):
                raise ValidationError(field_name, str(url), "URL must be a non-empty string")

            parsed = urlparse(url)

            if not parsed.scheme or not parsed.netloc:
                raise ValidationError(field_name, url, "URL must have scheme and netloc")

            if parsed.scheme not in ['http', 'https']:
                raise ValidationError(field_name, url, "URL scheme must be http or https")

            logger.debug(f"URL {url} validated")
            return True

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Error validating URL: {error}")
            raise ValidationError(field_name, url, f"URL validation failed: {error}")

    @staticmethod
    def validate_file_path(file_path: Union[str, Path], must_exist: bool = True) -> Path:
        """Validate file path."""
        try:
            if not file_path:
                raise ValidationError("file_path", str(file_path), "File path cannot be empty")

            path_obj = Path(file_path)

            if must_exist and not path_obj.exists():
                raise ValidationError("file_path", str(file_path), "File does not exist")

            resolved_path = path_obj.resolve()
            if '..' in str(resolved_path):
                logger.warning(f"Path contains parent directory references: {file_path}")

            logger.debug(f"File path {file_path} validated")
            return path_obj

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Error validating file path: {error}")
            raise ValidationError("file_path", str(file_path), f"Path validation failed: {error}")

    @staticmethod
    def validate_hunt_data(hunt_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate complete hunt data structure."""
        try:
            if not isinstance(hunt_data, dict):
                raise ValidationError("hunt_data", str(type(hunt_data)), "Hunt data must be a dictionary")

            required_fields = ['id', 'category', 'title', 'tactic']
            for field in required_fields:
                if field not in hunt_data or not hunt_data[field]:
                    raise ValidationError(field, str(hunt_data.get(field)), f"Required field {field} is missing or empty")

            validated_data = hunt_data.copy()

            HuntValidator.validate_hunt_id(validated_data['id'], validated_data['category'])

            if 'tactic' in validated_data:
                validated_data['tactics'] = HuntValidator.validate_tactics(validated_data['tactic'])

            if 'tags' in validated_data:
                validated_data['tags'] = HuntValidator.validate_tags(validated_data['tags'])

            if 'submitter' in validated_data and isinstance(validated_data['submitter'], dict):
                submitter = validated_data['submitter']
                if 'link' in submitter and submitter['link']:
                    HuntValidator.validate_url(submitter['link'], 'submitter_link')

            logger.info(f"Hunt data validated for {validated_data['id']}")
            return validated_data

        except ValidationError:
            raise
        except Exception as error:
            logger.error(f"Error validating hunt data: {error}")
            raise ValidationError("hunt_data", str(hunt_data), f"Hunt data validation failed: {error}")
