from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Literal, Optional
from ..value_objects import CourseId, UserId
from .concept import Concept
from .concept_connection import ConceptConnection

CourseStatus = Literal["draft", "processing", "active", "archived"]
CourseDifficulty = Literal["Beginner", "Intermediate", "Advanced"]


@dataclass
class CourseProgress:
    completed: int
    total: int
    current_concept_id: Optional[str] = None

    def __post_init__(self) -> None:
        if self.completed < 0 or self.total < 0:
            raise ValueError("Progress values cannot be negative")
        
        if self.completed > self.total:
            raise ValueError("Completed cannot exceed total")

    @property
    def percentage(self) -> float:
        if self.total == 0:
            return 0.0
        return (self.completed / self.total) * 100


@dataclass
class Course:
    id: CourseId
    title: str
    description: str
    difficulty: CourseDifficulty
    created_by: UserId
    status: CourseStatus = "draft"
    concepts: List[Concept] = field(default_factory=list)
    connections: List[ConceptConnection] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self) -> None:
        if not self.title or len(self.title.strip()) > 100:
            raise ValueError("Course title must be between 1 and 100 characters")
        
        if not self.description or len(self.description.strip()) > 1000:
            raise ValueError("Course description must be between 1 and 1000 characters")
        
        if self.difficulty not in ("Beginner", "Intermediate", "Advanced"):
            raise ValueError("Invalid difficulty level")
        
        if self.status not in ("draft", "processing", "active", "archived"):
            raise ValueError("Invalid course status")

    @classmethod
    def create(
        cls,
        title: str,
        description: str,
        difficulty: CourseDifficulty,
        created_by: UserId
    ) -> Course:
        return cls(
            id=CourseId.generate(),
            title=title.strip(),
            description=description.strip(),
            difficulty=difficulty,
            created_by=created_by
        )

    def add_concept(self, concept: Concept) -> None:
        if concept.course_id != self.id:
            raise ValueError("Concept does not belong to this course")
        
        # Check for duplicate concept IDs
        if any(c.id == concept.id for c in self.concepts):
            raise ValueError("Concept with this ID already exists in course")
        
        self.concepts.append(concept)
        self.updated_at = datetime.utcnow()

    def remove_concept(self, concept_id: str) -> None:
        self.concepts = [c for c in self.concepts if str(c.id) != concept_id]
        # Remove connections involving this concept
        self.connections = [
            conn for conn in self.connections 
            if str(conn.source_id) != concept_id and str(conn.target_id) != concept_id
        ]
        self.updated_at = datetime.utcnow()

    def add_connection(self, connection: ConceptConnection) -> None:
        # Verify both concepts exist in this course
        concept_ids = {str(c.id) for c in self.concepts}
        if str(connection.source_id) not in concept_ids:
            raise ValueError("Source concept not found in course")
        if str(connection.target_id) not in concept_ids:
            raise ValueError("Target concept not found in course")
        
        # Check for duplicate connections
        existing_connection = any(
            conn.source_id == connection.source_id and 
            conn.target_id == connection.target_id and
            conn.connection_type == connection.connection_type
            for conn in self.connections
        )
        
        if existing_connection:
            raise ValueError("Connection already exists")
        
        self.connections.append(connection)
        self.updated_at = datetime.utcnow()

    def get_progress(self) -> CourseProgress:
        total_concepts = len(self.concepts)
        completed_concepts = sum(1 for c in self.concepts if c.is_completed())
        
        # Find current concept (first incomplete concept)
        current_concept = next(
            (c for c in self.concepts if not c.is_completed()),
            None
        )
        
        return CourseProgress(
            completed=completed_concepts,
            total=total_concepts,
            current_concept_id=str(current_concept.id) if current_concept else None
        )

    def start_processing(self) -> None:
        if self.status != "draft":
            raise ValueError("Only draft courses can be set to processing")
        
        self.status = "processing"
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        if self.status != "processing":
            raise ValueError("Only processing courses can be activated")
        
        if not self.concepts:
            raise ValueError("Cannot activate course without concepts")
        
        self.status = "active"
        self.updated_at = datetime.utcnow()

    def archive(self) -> None:
        if self.status not in ("active", "draft"):
            raise ValueError("Only active or draft courses can be archived")
        
        self.status = "archived"
        self.updated_at = datetime.utcnow()

    def get_concept_by_id(self, concept_id: str) -> Optional[Concept]:
        return next((c for c in self.concepts if str(c.id) == concept_id), None)

    def get_connections_for_concept(self, concept_id: str) -> List[ConceptConnection]:
        return [
            conn for conn in self.connections
            if str(conn.source_id) == concept_id or str(conn.target_id) == concept_id
        ]

    def is_active(self) -> bool:
        return self.status == "active"

    def is_processing(self) -> bool:
        return self.status == "processing"