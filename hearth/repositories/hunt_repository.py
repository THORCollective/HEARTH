"""Composite hunt repository with automatic DB → filesystem fallback."""
from typing import List, Optional
from hearth.repositories.base import HuntRepository
from hearth.repositories.database import DatabaseHuntRepository
from hearth.repositories.filesystem import FilesystemHuntRepository
from hearth.models.hunt import HuntData
from hearth.utils.logging import get_logger

logger = get_logger()


class HuntRepositoryWithFallback(HuntRepository):
    """
    Composite repository with automatic database → filesystem fallback.

    Attempts to use fast database queries first. If database is unavailable
    or queries fail, automatically falls back to filesystem-based retrieval.
    """

    def __init__(self, db_path: str = "database/hunts.db", base_dirs: List[str] = None):
        """
        Initialize composite repository.

        Args:
            db_path: Path to SQLite database file.
            base_dirs: List of hunt directories for filesystem fallback.
        """
        self.db_repo = None
        self.fs_repo = FilesystemHuntRepository(base_dirs)

        # Try to initialize database repository
        try:
            self.db_repo = DatabaseHuntRepository(db_path)
            logger.info("Using database repository (fast path)")
        except Exception as error:
            logger.warning(f"Database unavailable, using filesystem fallback: {error}")

    def get_all_hunts(self) -> List[HuntData]:
        """
        Retrieve all hunts with automatic fallback.

        Returns:
            List of HuntData objects.
        """
        if self.db_repo:
            try:
                return self.db_repo.get_all_hunts()
            except Exception as error:
                logger.warning(f"Database query failed, falling back to filesystem: {error}")

        return self.fs_repo.get_all_hunts()

    def get_hunt_by_id(self, hunt_id: str) -> Optional[HuntData]:
        """
        Retrieve a specific hunt by ID with automatic fallback.

        Args:
            hunt_id: Hunt identifier.

        Returns:
            HuntData object or None if not found.
        """
        if self.db_repo:
            try:
                return self.db_repo.get_hunt_by_id(hunt_id)
            except Exception as error:
                logger.warning(f"Database query failed, falling back to filesystem: {error}")

        return self.fs_repo.get_hunt_by_id(hunt_id)

    def get_hunts_by_category(self, category: str) -> List[HuntData]:
        """
        Retrieve hunts by category with automatic fallback.

        Args:
            category: Category name.

        Returns:
            List of HuntData objects in the category.
        """
        if self.db_repo:
            try:
                return self.db_repo.get_hunts_by_category(category)
            except Exception as error:
                logger.warning(f"Database query failed, falling back to filesystem: {error}")

        return self.fs_repo.get_hunts_by_category(category)

    def get_hunts_by_tactic(self, tactic: str) -> List[HuntData]:
        """
        Retrieve hunts by MITRE ATT&CK tactic with automatic fallback.

        Args:
            tactic: Tactic name.

        Returns:
            List of HuntData objects for the tactic.
        """
        if self.db_repo:
            try:
                return self.db_repo.get_hunts_by_tactic(tactic)
            except Exception as error:
                logger.warning(f"Database query failed, falling back to filesystem: {error}")

        return self.fs_repo.get_hunts_by_tactic(tactic)
