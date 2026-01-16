"""Abstract base repository for hunt data access."""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class HuntRepository(ABC):
    """Abstract base class for hunt data access."""

    @abstractmethod
    def get_all_hunts(self) -> List[Dict[str, Any]]:
        """
        Retrieve all hunts.

        Returns:
            List of hunt dictionaries.
        """
        pass

    @abstractmethod
    def get_hunt_by_id(self, hunt_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific hunt by ID.

        Args:
            hunt_id: Hunt identifier (e.g., "H001", "F042").

        Returns:
            Hunt dictionary or None if not found.
        """
        pass

    @abstractmethod
    def get_hunts_by_category(self, category: str) -> List[Dict[str, Any]]:
        """
        Retrieve hunts by category.

        Args:
            category: Category name ("Flames", "Embers", or "Alchemy").

        Returns:
            List of hunt dictionaries in the category.
        """
        pass

    @abstractmethod
    def get_hunts_by_tactic(self, tactic: str) -> List[Dict[str, Any]]:
        """
        Retrieve hunts by MITRE ATT&CK tactic.

        Args:
            tactic: Tactic name (e.g., "Discovery", "Lateral Movement").

        Returns:
            List of hunt dictionaries for the tactic.
        """
        pass
