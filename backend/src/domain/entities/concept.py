from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, List, Optional
from ..value_objects import ConceptId, CourseId

BloomLevel = Literal["remember", "understand", "apply", "analyze", "evaluate", "create"]


@dataclass
class Position:
    x: float
    y: float

    def __post_init__(self) -> None:
        if not isinstance(self.x, (int, float)) or not isinstance(self.y, (int, float)):
            raise ValueError("Position coordinates must be numeric")


@dataclass
class ConceptComment:
    id: str
    concept_id: ConceptId
    text: str
    author_id: str
    created_at: datetime

    def __post_init__(self) -> None:
        if not self.text or len(self.text.strip()) > 500:
            raise ValueError("Comment text must be between 1 and 500 characters")


@dataclass
class Concept:
    id: ConceptId
    course_id: CourseId
    title: str
    description: str
    bloom_level: BloomLevel
    position: Position
    progress: float = 0.0
    comments: List[ConceptComment] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self) -> None:
        if not self.title or len(self.title.strip()) > 100:
            raise ValueError("Concept title must be between 1 and 100 characters")
        
        if not self.description or len(self.description.strip()) > 1000:
            raise ValueError("Concept description must be between 1 and 1000 characters")
        
        if self.bloom_level not in ("remember", "understand", "apply", "analyze", "evaluate", "create"):
            raise ValueError("Invalid Bloom level")
        
        if not 0 <= self.progress <= 100:
            raise ValueError("Progress must be between 0 and 100")

    @classmethod
    def create(
        cls,
        course_id: CourseId,
        title: str,
        description: str,
        bloom_level: BloomLevel,
        position: Position
    ) -> Concept:
        return cls(
            id=ConceptId.generate(),
            course_id=course_id,
            title=title.strip(),
            description=description.strip(),
            bloom_level=bloom_level,
            position=position
        )

    def update_position(self, x: float, y: float) -> None:
        self.position = Position(x, y)
        self.updated_at = datetime.utcnow()

    def update_progress(self, progress: float) -> None:
        if not 0 <= progress <= 100:
            raise ValueError("Progress must be between 0 and 100")
        
        self.progress = progress
        self.updated_at = datetime.utcnow()

    def add_comment(self, text: str, author_id: str) -> ConceptComment:
        comment = ConceptComment(
            id=f"comment_{len(self.comments) + 1}",
            concept_id=self.id,
            text=text.strip(),
            author_id=author_id,
            created_at=datetime.utcnow()
        )
        self.comments.append(comment)
        self.updated_at = datetime.utcnow()
        return comment

    def get_bloom_level_order(self) -> int:
        bloom_order = {
            "remember": 1,
            "understand": 2,
            "apply": 3,
            "analyze": 4,
            "evaluate": 5,
            "create": 6
        }
        return bloom_order[self.bloom_level]

    def is_completed(self) -> bool:
        return self.progress >= 100.0