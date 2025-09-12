from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.db.models import CourseStatus, DifficultyLevel, ComplexityLevel, BloomLevel, ConnectionType

class ConceptBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    bloom_level: BloomLevel
    position_x: float = 0.0
    position_y: float = 0.0

class ConceptCreate(ConceptBase):
    pass

class ConceptUpdate(ConceptBase):
    title: Optional[str] = None
    bloom_level: Optional[BloomLevel] = None

class Concept(ConceptBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConnectionBase(BaseModel):
    source_concept_id: int
    target_concept_id: int
    connection_type: ConnectionType
    strength: float = 0.5

class ConnectionCreate(ConnectionBase):
    pass

class ConnectionUpdate(BaseModel):
    connection_type: Optional[ConnectionType] = None
    strength: Optional[float] = None

class Connection(ConnectionBase):
    id: int
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: DifficultyLevel
    complexity_level: ComplexityLevel

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    complexity_level: Optional[ComplexityLevel] = None

class Course(CourseBase):
    id: int
    status: CourseStatus
    creator_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    concepts: List[Concept] = []
    connections: List[Connection] = []

    class Config:
        from_attributes = True

class CourseWithFiles(Course):
    files: List["UploadedFile"] = []

# Frontend-compatible schemas
class FrontendConcept(BaseModel):
    id: str
    title: str
    description: str
    bloomLevel: str
    position: dict  # {x: float, y: float}
    progress: float
    comments: List = []

class FrontendConnection(BaseModel):
    id: str
    sourceId: str
    targetId: str
    type: str
    strength: float

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    createdBy: str
    createdAt: datetime
    updatedAt: datetime
    difficulty: str
    complexity: str
    concepts: List[FrontendConcept] = []
    connections: List[FrontendConnection] = []

    class Config:
        from_attributes = True

# AI Response schemas
class AIConceptResponse(BaseModel):
    title: str
    description: str
    bloom_level: BloomLevel

class AIConnectionResponse(BaseModel):
    source_concept_index: int  # Index in concepts array
    target_concept_index: int
    connection_type: ConnectionType
    strength: float

class AIGraphResponse(BaseModel):
    concepts: List[AIConceptResponse]
    connections: List[AIConnectionResponse]

class AIContentResponse(BaseModel):
    concept_contents: List[str]  # Content for each concept (5-10 sentences)

# File upload schemas
class UploadedFileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    content_type: str

class UploadedFile(UploadedFileBase):
    id: int
    course_id: int
    file_path: str
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Student view schemas
class StudentConcept(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    bloom_level: BloomLevel
    position_x: float
    position_y: float
    is_completed: bool = False

class StudentConnection(BaseModel):
    id: int
    source_concept_id: int
    target_concept_id: int
    connection_type: ConnectionType
    strength: float

class StudentCourse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    difficulty: DifficultyLevel
    created_at: datetime
    published_at: Optional[datetime] = None
    concepts: List[StudentConcept] = []
    connections: List[StudentConnection] = []
    progress_percentage: float = 0.0
    total_concepts: int = 0
    completed_concepts: int = 0

    class Config:
        from_attributes = True