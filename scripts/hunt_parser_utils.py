#!/usr/bin/env python3
"""
Shared utilities for parsing HEARTH hunt markdown files.
"""

import re
from pathlib import Path
from typing import List, Optional
from logger_config import get_logger
from exceptions import FileProcessingError, MarkdownParsingError, ValidationError
from config_manager import get_config

logger = get_logger()
config = get_config().config


def find_hunt_files(base_directory: Optional[str] = None) -> List[Path]:
    """Find all hunt markdown files in the standard directories.
    
    Args:
        base_directory: Base directory to search in. Defaults to config value.
        
    Returns:
        List of Path objects for hunt files.
        
    Raises:
        FileProcessingError: If base directory doesn't exist.
    """
    try:
        base_path = Path(base_directory or config.base_directory)

        if not base_path.exists():
            raise FileProcessingError(str(base_path), "Base directory does not exist")

        hunt_files = []

        for directory_name in config.hunt_directories:
            directory_path = base_path / directory_name

            if not directory_path.exists():
                logger.warning(f"Hunt directory does not exist: {directory_path}")
                continue

            try:
                directory_files = list(directory_path.glob(config.hunt_file_pattern))
                # Filter out excluded files
                filtered_files = [
                    file_path for file_path in directory_files
                    if file_path.name not in config.excluded_files
                ]
                hunt_files.extend(filtered_files)
                logger.debug(f"Found {len(filtered_files)} hunt files in {directory_path}")

            except Exception as error:
                logger.error(f"Error scanning directory {directory_path}: {error}")
                continue

        logger.info(f"Found total of {len(hunt_files)} hunt files")
        return hunt_files

    except Exception as error:
        logger.error(f"Error finding hunt files: {error}")
        raise FileProcessingError(str(base_directory or config.base_directory), str(error))


def find_table_header_line(content_lines: List[str]) -> Optional[int]:
    """Find the line index containing the table header.
    
    Args:
        content_lines: List of content lines from markdown file.
        
    Returns:
        Line index of table header, or None if not found.
        
    Raises:
        ValidationError: If content_lines is empty or invalid.
    """
    if not content_lines:
        raise ValidationError("content_lines", "empty", "Content lines cannot be empty")

    required_headers = ['Hunt', 'Tactic', 'Notes', 'Tags', 'Submitter']

    for line_index, line in enumerate(content_lines):
        if not isinstance(line, str):
            continue

        # Check for all required headers and either 'Idea' or 'Hypothesis'
        has_required_headers = all(header in line for header in required_headers)
        has_idea_or_hypothesis = ('Idea' in line or 'Hypothesis' in line)

        if has_required_headers and has_idea_or_hypothesis:
            logger.debug(f"Found table header at line {line_index}")
            return line_index

    logger.warning("Table header not found in content")
    return None


def extract_table_cells(content_lines: List[str], header_line_index: int) -> List[str]:
    """Extract table cells from the data row.
    
    Args:
        content_lines: List of content lines.
        header_line_index: Index of the header line.
        
    Returns:
        List of cell contents from data row.
        
    Raises:
        ValidationError: If parameters are invalid.
        MarkdownParsingError: If table structure is invalid.
    """
    if header_line_index < 0 or header_line_index >= len(content_lines):
        raise ValidationError("header_line_index", str(header_line_index), "Invalid header line index")

    data_row_index = header_line_index + 2  # Skip separator line

    if data_row_index >= len(content_lines):
        logger.warning(f"Data row index {data_row_index} exceeds content length")
        return []

    data_row = content_lines[data_row_index]

    if not data_row.strip():
        logger.warning("Data row is empty")
        return []

    if '|' not in data_row:
        raise MarkdownParsingError("", "table", "Data row does not contain table separators")

    cells = [cell.strip() for cell in data_row.split('|') if cell.strip()]
    logger.debug(f"Extracted {len(cells)} table cells")

    return cells


def clean_markdown_formatting(text):
    """Remove common markdown formatting from text."""
    if not text:
        return ""
    return text.replace('**', '').replace('*', '').strip()


def extract_submitter_info(submitter_text):
    """Extract submitter name and link from markdown text."""
    if not submitter_text:
        return {'name': '', 'link': ''}

    # Look for markdown link format [name](url)
    link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    link_match = re.search(link_pattern, submitter_text)

    if link_match:
        return {
            'name': link_match.group(1).strip(),
            'link': link_match.group(2).strip()
        }

    return {'name': submitter_text.strip(), 'link': ''}


def extract_content_section(content, section_name):
    """Extract a specific section (like 'Why' or 'References') from markdown content."""
    pattern = rf'## {section_name}\s*\n(.*?)(?=\n##|\n$)'
    match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ''


def parse_tag_list(tags_text):
    """Parse a space-separated list of hashtags into a clean list."""
    if not tags_text:
        return []

    return [tag.lstrip('#') for tag in tags_text.split() if tag.startswith('#')]


def find_submitter_column_index(header_line):
    """Find the index of the submitter column in the table header."""
    if not header_line or '|' not in header_line:
        return -1

    columns = [clean_markdown_formatting(col) for col in header_line.split('|') if col.strip()]

    for column_index, column_text in enumerate(columns):
        if "Submitter" in column_text:
            return column_index

    return -1
