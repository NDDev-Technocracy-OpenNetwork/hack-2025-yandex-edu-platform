from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Literal


class CreateCourseSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]


class PositionSchema(BaseModel):
    x: float
    y: float


class ConceptCommentSchema(BaseModel):
    id: str
    text: str
    author_id: str
    created_at: datetime


class ConceptSchema(BaseModel):
    id: str
    title: str
    description: str
    bloom_level: Literal["remember", "understand", "apply", "analyze", "evaluate", "create"]
    position: PositionSchema
    progress: float = Field(..., ge=0, le=100)
    comments: List[ConceptCommentSchema] = []


class ConnectionSchema(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: Literal["prerequisite", "part", "similar", "related"]
    strength: float = Field(..., ge=0, le=1)


class CourseProgressSchema(BaseModel):
    completed: int
    total: int
    percentage: float
    current_concept_id: Optional[str] = None


class CourseSchema(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    status: Literal["draft", "processing", "active", "archived"]
    created_by: str
    created_at: datetime
    updated_at: datetime
    concepts: List[ConceptSchema] = []
    connections: List[ConnectionSchema] = []
    progress: Optional[CourseProgressSchema] = None

    class Config:
        from_attributes = True