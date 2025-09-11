from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Literal
from ...domain.entities import Course, Concept, ConceptConnection


@dataclass
class CreateCourseRequest:
    title: str
    description: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    created_by: str


@dataclass
class ConceptResponse:
    id: str
    title: str
    description: str
    bloom_level: str
    position: dict
    progress: float
    comments: List[dict]


@dataclass
class ConnectionResponse:
    id: str
    source_id: str
    target_id: str
    type: str
    strength: float


@dataclass
class CourseResponse:
    id: str
    title: str
    description: str
    difficulty: str
    status: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    concepts: List[ConceptResponse]
    connections: List[ConnectionResponse]
    progress: Optional[dict] = None

    @classmethod
    def from_entity(cls, course: Course) -> "CourseResponse":
        concepts = [
            ConceptResponse(
                id=str(concept.id),
                title=concept.title,
                description=concept.description,
                bloom_level=concept.bloom_level,
                position={"x": concept.position.x, "y": concept.position.y},
                progress=concept.progress,
                comments=[
                    {
                        "id": comment.id,
                        "text": comment.text,
                        "author_id": comment.author_id,
                        "created_at": comment.created_at.isoformat()
                    }
                    for comment in concept.comments
                ]
            )
            for concept in course.concepts
        ]

        connections = [
            ConnectionResponse(
                id=connection.id,
                source_id=str(connection.source_id),
                target_id=str(connection.target_id),
                type=connection.connection_type,
                strength=connection.strength
            )
            for connection in course.connections
        ]

        progress_data = course.get_progress()
        progress = {
            "completed": progress_data.completed,
            "total": progress_data.total,
            "percentage": progress_data.percentage,
            "current_concept_id": progress_data.current_concept_id
        }

        return cls(
            id=str(course.id),
            title=course.title,
            description=course.description,
            difficulty=course.difficulty,
            status=course.status,
            created_by=str(course.created_by),
            created_at=course.created_at,
            updated_at=course.updated_at,
            concepts=concepts,
            connections=connections,
            progress=progress
        )