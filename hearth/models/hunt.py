"""Hunt data model."""
from dataclasses import dataclass, asdict
from typing import List, Dict, Any


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
