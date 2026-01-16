"""Minimal markdown hunt file parser for repository fallback."""
from pathlib import Path
from typing import Optional
from hearth.models.hunt import HuntData
from hearth.utils.logging import get_logger

logger = get_logger()


class HuntFileReader:
    """
    Minimal hunt file parser for filesystem repository fallback.

    Note: This is a simplified version for the repository pattern.
    The full-featured parser is in scripts/hunt_parser.py.
    """

    def parse_hunt_file(self, file_path: Path, category: str) -> Optional[HuntData]:
        """
        Parse a hunt markdown file.

        Args:
            file_path: Path to the hunt file.
            category: Hunt category (Flames, Embers, Alchemy).

        Returns:
            HuntData object or None if parsing fails.
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            hunt_id = file_path.stem

            # Extract basic metadata from markdown
            # This is a simplified parser - full version is in scripts/
            hunt_data = HuntData(
                id=hunt_id,
                category=category,
                title=self._extract_title(content),
                tactic=self._extract_tactic(content),
                notes='',
                tags=[],
                submitter={},
                why='',
                references='',
                file_path=str(file_path.relative_to(Path.cwd()))
            )

            logger.debug(f"Parsed hunt: {hunt_id}")
            return hunt_data

        except Exception as error:
            logger.warning(f"Error parsing {file_path}: {error}")
            return None

    def _extract_title(self, content: str) -> str:
        """Extract hunt title from markdown content."""
        # Look for first heading or table data
        for line in content.split('\n'):
            if line.startswith('# '):
                return line[2:].strip()
            if '|' in line and not line.startswith('|--'):
                parts = [p.strip() for p in line.split('|')]
                if len(parts) > 2:
                    return parts[2]  # Usually the "Idea" column
        return "Unknown Hunt"

    def _extract_tactic(self, content: str) -> str:
        """Extract MITRE tactic from markdown content."""
        # Look for tactic in table or content
        for line in content.split('\n'):
            if '|' in line and ('tactic' in line.lower() or 'technique' in line.lower()):
                parts = [p.strip() for p in line.split('|')]
                if len(parts) > 3:
                    return parts[3]
        return ""
