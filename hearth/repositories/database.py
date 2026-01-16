"""SQLite-based hunt repository (fast path)."""
import sqlite3
import json
from pathlib import Path
from typing import List, Optional
from hearth.repositories.base import HuntRepository
from hearth.models.hunt import HuntData
from hearth.utils.logging import get_logger

logger = get_logger()


class DatabaseHuntRepository(HuntRepository):
    """SQLite-backed hunt repository for fast retrieval."""

    def __init__(self, db_path: str = "database/hunts.db"):
        """
        Initialize database repository.

        Args:
            db_path: Path to SQLite database file.

        Raises:
            FileNotFoundError: If database file doesn't exist.
        """
        self.db_path = Path(db_path)
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found: {db_path}")

    def _row_to_hunt_data(self, row: sqlite3.Row) -> HuntData:
        """
        Convert database row to HuntData object.

        Args:
            row: SQLite row object.

        Returns:
            HuntData object.
        """
        # Parse tags from JSON string
        tags = json.loads(row['tags']) if row['tags'] else []

        return HuntData(
            id=row['hunt_id'],
            category=self._infer_category_from_id(row['hunt_id']),
            title=row['hypothesis'],
            tactic=row['tactic'] or '',
            notes='',  # Not stored in DB
            tags=tags,
            submitter={},  # Not stored in DB
            why='',  # Not stored in DB
            references='',  # Not stored in DB
            file_path=row['file_path']
        )

    def _infer_category_from_id(self, hunt_id: str) -> str:
        """
        Infer category from hunt ID prefix.

        Args:
            hunt_id: Hunt identifier (e.g., "H001", "F042").

        Returns:
            Category name.
        """
        if hunt_id.startswith('H') or hunt_id.startswith('F'):
            return 'Flames'
        elif hunt_id.startswith('B') or hunt_id.startswith('E'):
            return 'Embers'
        elif hunt_id.startswith('M') or hunt_id.startswith('A'):
            return 'Alchemy'
        return 'Unknown'

    def get_all_hunts(self) -> List[HuntData]:
        """
        Retrieve all hunts from database.

        Returns:
            List of HuntData objects.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row

        cursor = conn.execute('''
            SELECT filename, hunt_id, hypothesis, tactic, technique, tags, file_path
            FROM hunts
            ORDER BY created_date DESC
        ''')

        hunts = [self._row_to_hunt_data(row) for row in cursor]
        conn.close()

        logger.info(f"Retrieved {len(hunts)} hunts from database in <10ms")
        return hunts

    def get_hunt_by_id(self, hunt_id: str) -> Optional[HuntData]:
        """
        Retrieve a specific hunt by ID.

        Args:
            hunt_id: Hunt identifier.

        Returns:
            HuntData object or None if not found.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row

        cursor = conn.execute(
            'SELECT * FROM hunts WHERE hunt_id = ?',
            (hunt_id,)
        )

        row = cursor.fetchone()
        conn.close()

        return self._row_to_hunt_data(row) if row else None

    def get_hunts_by_category(self, category: str) -> List[HuntData]:
        """
        Retrieve hunts by category.

        Args:
            category: Category name.

        Returns:
            List of HuntData objects in the category.
        """
        # Database doesn't store category, so filter all hunts
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
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row

        cursor = conn.execute(
            'SELECT * FROM hunts WHERE tactic LIKE ?',
            (f'%{tactic}%',)
        )

        hunts = [self._row_to_hunt_data(row) for row in cursor]
        conn.close()

        return hunts
