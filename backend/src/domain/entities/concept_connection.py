from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from ..value_objects import ConceptId

ConnectionType = Literal["prerequisite", "part", "similar", "related"]


@dataclass
class ConceptConnection:
    id: str
    source_id: ConceptId
    target_id: ConceptId
    connection_type: ConnectionType
    strength: float
    created_at: datetime

    def __post_init__(self) -> None:
        if self.source_id == self.target_id:
            raise ValueError("Source and target concepts cannot be the same")
        
        if self.connection_type not in ("prerequisite", "part", "similar", "related"):
            raise ValueError("Invalid connection type")
        
        if not 0.0 <= self.strength <= 1.0:
            raise ValueError("Connection strength must be between 0.0 and 1.0")

    @classmethod
    def create(
        cls,
        source_id: ConceptId,
        target_id: ConceptId,
        connection_type: ConnectionType,
        strength: float = 0.5
    ) -> ConceptConnection:
        return cls(
            id=f"conn_{source_id}_{target_id}_{connection_type}",
            source_id=source_id,
            target_id=target_id,
            connection_type=connection_type,
            strength=strength,
            created_at=datetime.utcnow()
        )

    def is_prerequisite(self) -> bool:
        return self.connection_type == "prerequisite"

    def is_part_of(self) -> bool:
        return self.connection_type == "part"

    def is_similar_to(self) -> bool:
        return self.connection_type == "similar"

    def is_related_to(self) -> bool:
        return self.connection_type == "related"

    def get_type_priority(self) -> int:
        priority_map = {
            "prerequisite": 1,  # Highest priority
            "part": 2,
            "related": 3,
            "similar": 4       # Lowest priority
        }
        return priority_map[self.connection_type]

    def reverse(self) -> ConceptConnection:
        reverse_type_map = {
            "prerequisite": "prerequisite",  # A prerequisite B -> B prerequisite A
            "part": "part",                  # A part B -> B part A (bidirectional)
            "similar": "similar",            # A similar B -> B similar A (bidirectional)
            "related": "related"             # A related B -> B related A (bidirectional)
        }
        
        return ConceptConnection.create(
            source_id=self.target_id,
            target_id=self.source_id,
            connection_type=reverse_type_map[self.connection_type],
            strength=self.strength
        )