#!/usr/bin/env python3
"""
Object-oriented hunt parser for HEARTH markdown files.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Iterator
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod

from logger_config import get_logger
from config_manager import get_config
from validators import HuntValidator
from exceptions import FileProcessingError, MarkdownParsingError, DataExportError, ValidationError
from hunt_parser_utils import (
    find_hunt_files, find_table_header_line, extract_table_cells,
    clean_markdown_formatting, extract_submitter_info, extract_content_section,
    parse_tag_list
)

logger = get_logger()
config = get_config().config


@dataclass
class HuntData:
    """Data class representing a parsed hunt."""

    id: str
    category: str
    title: str
    tactic: str
    notes: str
    tags: List[str]
    submitter: Dict[str, str]
    why: str
    references: str
    file_path: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format."""
        return asdict(self)

    def validate(self) -> 'HuntData':
        """Validate hunt data and return self."""
        validated_data = HuntValidator.validate_hunt_data(self.to_dict())
        return HuntData(**validated_data)


class HuntFileReader:
    """Handles reading and parsing individual hunt files."""

    def __init__(self, validator: Optional[HuntValidator] = None):
        self.validator = validator or HuntValidator()

    def read_file(self, file_path: Path) -> str:
        """Read file content safely.
        Args:
            file_path: Path to the file.

        Returns:
            File content as string.

        Raises:
            FileProcessingError: If file cannot be read.
        """
        try:
            self.validator.validate_file_path(file_path, must_exist=True)
            
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if not content.strip():
                logger.warning(f"File is empty: {file_path}")
            
            logger.debug(f"Successfully read file: {file_path}")
            return content
            
        except Exception as error:
            logger.error(f"Error reading file {file_path}: {error}")
            raise FileProcessingError(str(file_path), f"Failed to read file: {error}")
    
    def parse_hunt_file(self, file_path: Path, category: str) -> Optional[HuntData]:
        """Parse a single hunt file.
        Args:
            file_path: Path to the hunt file.
            category: Hunt category.

        Returns:
            Parsed HuntData object or None if parsing fails.

        Raises:
            MarkdownParsingError: If parsing fails critically.
        """
        try:
            content = self.read_file(file_path)
            hunt_id = file_path.stem

            # Skip excluded files
            if hunt_id.lower() in [f.lower().replace('.md', '') for f in config.excluded_files]:
                logger.debug(f"Skipping excluded file: {file_path}")
                return None

            table_data = self._extract_table_data(content, file_path)
            sections = self._extract_content_sections(content)
            submitter_info = extract_submitter_info(table_data.get('submitter', ''))

            # Calculate relative path from base directory
            base_dir = Path(config.base_directory).resolve()
            abs_file_path = file_path.resolve()
            try:
                rel_path = abs_file_path.relative_to(base_dir)
            except ValueError:
                # If file is not under base_dir, use absolute path
                rel_path = abs_file_path

            hunt_data = HuntData(
                id=table_data.get('hunt_id', hunt_id),
                category=category,
                title=table_data.get('idea', ''),
                tactic=table_data.get('tactic', ''),
                notes=table_data.get('notes', ''),
                tags=parse_tag_list(table_data.get('tags', '')),
                submitter=submitter_info,
                why=sections.get('why', ''),
                references=sections.get('references', ''),
                file_path=str(rel_path)
            )

            # Validate the parsed data
            validated_hunt = hunt_data.validate()

            logger.debug(f"Successfully parsed hunt: {validated_hunt.id}")
            return validated_hunt

        except (FileProcessingError, MarkdownParsingError, ValidationError):
            # Re-raise custom exceptions without wrapping
            logger.error(f"Error parsing hunt file {file_path}")
            raise
        except Exception as error:
            logger.error(f"Unexpected error parsing hunt file {file_path}: {error}")
            raise MarkdownParsingError(
                str(file_path),
                "hunt_file",
                f"Unexpected parsing error: {error}"
            )
    
    def _extract_table_data(self, content: str, file_path: Path) -> Dict[str, str]:
        """Extract data from markdown table.

        Args:
            content: Markdown content.
            file_path: Path to file being parsed.

        Returns:
            Dictionary with table data.

        Raises:
            MarkdownParsingError: If table extraction fails.
        """
        try:
            lines = content.split('\n')
            table_start_index = find_table_header_line(lines)

            if table_start_index is None:
                raise MarkdownParsingError(
                    str(file_path),
                    "table_header",
                    "No table header found in file"
                )

            cells = extract_table_cells(lines, table_start_index)

            if len(cells) < 6:
                raise MarkdownParsingError(
                    str(file_path),
                    "table_cells",
                    f"Insufficient table cells: expected 6, found {len(cells)}"
                )

            return {
                'hunt_id': clean_markdown_formatting(cells[0]),
                'idea': clean_markdown_formatting(cells[1]),
                'tactic': clean_markdown_formatting(cells[2]),
                'notes': clean_markdown_formatting(cells[3]),
                'tags': clean_markdown_formatting(cells[4]),
                'submitter': clean_markdown_formatting(cells[5])
            }

        except (ValidationError, MarkdownParsingError):
            # Re-raise custom exceptions
            raise
        except Exception as error:
            logger.error(f"Error extracting table data from {file_path}: {error}")
            raise MarkdownParsingError(
                str(file_path),
                "table_extraction",
                f"Failed to extract table data: {error}"
            )
    
    def _extract_content_sections(self, content: str) -> Dict[str, str]:
        """Extract Why and References sections.

        Args:
            content: Markdown content.

        Returns:
            Dictionary with 'why' and 'references' sections.

        Raises:
            MarkdownParsingError: If section extraction fails.
        """
        try:
            return {
                'why': extract_content_section(content, 'Why'),
                'references': extract_content_section(content, 'References')
            }
        except (MarkdownParsingError, ValidationError):
            # Re-raise custom exceptions
            raise
        except Exception as error:
            logger.error(f"Error extracting content sections: {error}")
            raise MarkdownParsingError(
                "",
                "content_sections",
                f"Failed to extract content sections: {error}"
            )


class HuntExporter(ABC):
    """Abstract base class for hunt data exporters."""
    @abstractmethod
    def export(self, hunts: List[HuntData], output_path: Path) -> None:
        """Export hunt data to specified format."""
        pass


class JSONExporter(HuntExporter):
    """Exports hunt data to JSON format."""
    def export(self, hunts: List[HuntData], output_path: Path) -> None:
        """Export hunts to JSON file.
        Args:
            hunts: List of hunt data objects.
            output_path: Output file path.

        Raises:
            DataExportError: If export fails.
        """
        try:
            # Convert to dictionaries and sort by ID
            hunt_dicts = [hunt.to_dict() for hunt in hunts]
            hunt_dicts.sort(key=lambda x: x['id'])
            
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(hunt_dicts, file, indent=2, ensure_ascii=False)
            
            logger.info(f"Exported {len(hunts)} hunts to JSON: {output_path}")
            
        except Exception as error:
            logger.error(f"Error exporting to JSON: {error}")
            raise DataExportError(str(output_path), f"JSON export failed: {error}")


class JavaScriptExporter(HuntExporter):
    """Exports hunt data to JavaScript format."""
    def export(self, hunts: List[HuntData], output_path: Path) -> None:
        """Export hunts to JavaScript file.
        Args:
            hunts: List of hunt data objects.
            output_path: Output file path.

        Raises:
            DataExportError: If export fails.
        """
        try:
            # Convert to dictionaries and sort by ID
            hunt_dicts = [hunt.to_dict() for hunt in hunts]
            hunt_dicts.sort(key=lambda x: x['id'])
            
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write('// Auto-generated hunt data from markdown files\n')
                file.write('const HUNTS_DATA = ')
                json.dump(hunt_dicts, file, indent=2, ensure_ascii=False)
                file.write(';\n')
            
            logger.info(f"Exported {len(hunts)} hunts to JavaScript: {output_path}")
            
        except Exception as error:
            logger.error(f"Error exporting to JavaScript: {error}")
            raise DataExportError(str(output_path), f"JavaScript export failed: {error}")


class HuntProcessor:
    """Main processor for hunt files."""
    def __init__(self, reader: Optional[HuntFileReader] = None, 
                 exporter: Optional[HuntExporter] = None):
        self.reader = reader or HuntFileReader()
        self.exporter = exporter or JavaScriptExporter()
    
    def process_all_hunts(self, base_directory: Optional[str] = None) -> List[HuntData]:
        """Process all hunt files and return parsed data.
        Args:
            base_directory: Base directory to search. Defaults to config value.

        Returns:
            List of successfully parsed hunt data.

        Raises:
            FileProcessingError: If hunt processing fails critically.
        """
        try:
            hunt_files = find_hunt_files(base_directory)
            all_hunts = []
            parse_errors = []

            for hunt_file in hunt_files:
                try:
                    # Determine category from parent directory
                    category = hunt_file.parent.name

                    if category not in config.hunt_directories:
                        logger.warning(f"Unknown category {category} for file {hunt_file}")
                        continue

                    hunt_data = self.reader.parse_hunt_file(hunt_file, category)
                    if hunt_data:
                        all_hunts.append(hunt_data)
                        logger.debug(f"Processed hunt: {hunt_data.id}")

                except (FileProcessingError, MarkdownParsingError, ValidationError) as error:
                    # Track parsing errors but continue processing
                    logger.warning(f"Skipping {hunt_file} due to parsing error: {error}")
                    parse_errors.append((str(hunt_file), str(error)))
                    continue
                except Exception as error:
                    logger.error(f"Unexpected error processing {hunt_file}: {error}")
                    parse_errors.append((str(hunt_file), f"Unexpected error: {error}"))
                    continue

            if parse_errors:
                logger.warning(f"Encountered {len(parse_errors)} parsing errors")
                for file_path, error_msg in parse_errors[:5]:  # Show first 5
                    logger.warning(f"  - {file_path}: {error_msg}")

            logger.info(f"Successfully processed {len(all_hunts)} hunts")
            return all_hunts

        except FileProcessingError:
            # Re-raise custom exceptions
            raise
        except Exception as error:
            logger.error(f"Error processing hunts: {error}")
            raise FileProcessingError(
                str(base_directory),
                f"Hunt processing failed: {error}",
                operation="process_all"
            )
    
    def export_hunts(self, hunts: List[HuntData], output_path: Optional[Path] = None) -> None:
        """Export hunt data using configured exporter.
        Args:
            hunts: List of hunt data to export.
            output_path: Output file path. Defaults to config value.
        """
        try:
            if not output_path:
                base_dir = Path(config.base_directory)
                output_path = base_dir / config.hunts_data_filename
            
            self.exporter.export(hunts, output_path)
            
        except Exception as error:
            logger.error(f"Error exporting hunts: {error}")
            raise DataExportError(str(output_path), f"Export failed: {error}")
    
    def generate_statistics(self, hunts: List[HuntData]) -> Dict[str, Any]:
        """Generate statistics about hunts.
        Args:
            hunts: List of hunt data.

        Returns:
            Dictionary with statistics.
        """
        try:
            category_counts = {}
            all_tactics = set()
            all_tags = set()
            
            for hunt in hunts:
                # Category counts
                category_counts[hunt.category] = category_counts.get(hunt.category, 0) + 1
                
                # Collect tactics
                if hunt.tactic:
                    tactics = [t.strip() for t in hunt.tactic.split(',') if t.strip()]
                    all_tactics.update(tactics)
                
                # Collect tags
                all_tags.update(hunt.tags)
            
            stats = {
                'total_hunts': len(hunts),
                'category_counts': category_counts,
                'unique_tactics': sorted(list(all_tactics)),
                'unique_tags': sorted(list(all_tags)),
                'tactics_count': len(all_tactics),
                'tags_count': len(all_tags)
            }
            
            logger.info(f"Generated statistics for {len(hunts)} hunts")
            return stats
            
        except Exception as error:
            logger.error(f"Error generating statistics: {error}")
            return {}
    
    def print_statistics(self, stats: Dict[str, Any]) -> None:
        """Print statistics to console."""
        try:
            logger.info(f"Generated hunts-data.js with {stats['total_hunts']} hunts")

            logger.info("Statistics:")
            for category, count in stats['category_counts'].items():
                logger.info(f"{category}: {count} hunts")

            logger.info(f"Unique tactics: {stats['tactics_count']}")
            for tactic in stats['unique_tactics']:
                logger.info(f"- {tactic}")

            logger.info(f"Unique tags: {stats['tags_count']}")
            for tag in stats['unique_tags']:
                logger.info(f"- #{tag}")

        except Exception as error:
            logger.error(f"Error printing statistics: {error}")


def main():
    """Main function to process all hunts."""
    try:
        processor = HuntProcessor()
        
        # Process all hunts
        hunts = processor.process_all_hunts()
        
        if not hunts:
            logger.warning("No hunts were successfully processed")
            return
        
        # Export hunts
        processor.export_hunts(hunts)
        
        # Generate and print statistics
        stats = processor.generate_statistics(hunts)
        processor.print_statistics(stats)
        
        logger.info("Hunt processing completed successfully")
        
    except Exception as error:
        logger.error(f"Hunt processing failed: {error}")
        raise


if __name__ == "__main__":
    main()