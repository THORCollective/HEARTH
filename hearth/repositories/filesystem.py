"""File-based hunt repository (fallback implementation)."""
from pathlib import Path
from typing import List, Optional
from hearth.repositories.base import HuntRepository
from hearth.models.hunt import HuntData
from hearth.parsers.markdown import HuntFileReader
from hearth.utils.logging import get_logger

logger = get_logger()


class FilesystemHuntRepository(HuntRepository):
    """File-based hunt repository that reads markdown files directly."""

    def __init__(self, base_dirs: List[str] = None):
        """
        Initialize filesystem repository.

        Args:
            base_dirs: List of directory names to search. Defaults to ["Flames", "Embers", "Alchemy"].
        """
        self.base_dirs = base_dirs or ["Flames", "Embers", "Alchemy"]
        self.reader = HuntFileReader()
        self._cache: Optional[List[HuntData]] = None

    def get_all_hunts(self) -> List[HuntData]:
        """
        Retrieve all hunts by parsing markdown files.

        Returns:
            List of HuntData objects.
        """
        if self._cache is not None:
            return self._cache

        hunts = []
        for directory_name in self.base_dirs:
            directory_path = Path(directory_name)
            if not directory_path.exists():
                logger.warning(f"Directory not found: {directory_path}")
                continue

            for hunt_file in directory_path.glob("*.md"):
                try:
                    category = directory_path.name
                    hunt_data = self.reader.parse_hunt_file(hunt_file, category)
                    if hunt_data:
                        hunts.append(hunt_data)
                except Exception as error:
                    logger.warning(f"Error reading {hunt_file}: {error}")

        self._cache = hunts
        logger.info(f"Retrieved {len(hunts)} hunts from filesystem")
        return hunts

    def get_hunt_by_id(self, hunt_id: str) -> Optional[HuntData]:
        """
        Retrieve a specific hunt by ID.

        Args:
            hunt_id: Hunt identifier.

        Returns:
            HuntData object or None if not found.
        """
        all_hunts = self.get_all_hunts()
        for hunt in all_hunts:
            if hunt.id == hunt_id:
                return hunt
        return None

    def get_hunts_by_category(self, category: str) -> List[HuntData]:
        """
        Retrieve hunts by category.

        Args:
            category: Category name.

        Returns:
            List of HuntData objects in the category.
        """
        all_hunts = self.get_all_hunts()
        return [hunt for hunt in all_hunts if hunt.category == category]

    def get_hunts_by_tactic(self, tactic: str) -> List[HuntData]:
        """
        Retrieve hunts by MITRE ATT&CK tactic.

        Args:
            tactic: Tactic name.

        Returns:
            List of HuntData objects for the tactic.
        """
        all_hunts = self.get_all_hunts()
        return [
            hunt for hunt in all_hunts
            if tactic.lower() in hunt.tactic.lower()
        ]

    def clear_cache(self):
        """Clear the cached hunt data."""
        self._cache = None
