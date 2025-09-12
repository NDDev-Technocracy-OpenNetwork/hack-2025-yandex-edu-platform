from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum
from datetime import datetime

class UserRole(enum.Enum):
    TEACHER = "teacher"
    STUDENT = "student"

class CourseStatus(enum.Enum):
    DRAFT = "draft"
    PROCESSING = "processing" 
    READY_FOR_EDIT = "ready_for_edit"
    PUBLISHED = "published"

class BloomLevel(enum.Enum):
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"

class ConnectionType(enum.Enum):
    PREREQUISITE = "prerequisite"
    PART = "part"
    SIMILAR = "similar"
    RELATED = "related"

class DifficultyLevel(enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate" 
    ADVANCED = "Advanced"

class ComplexityLevel(enum.Enum):
    SIMPLE = "simple"  # меньше нод
    COMPLEX = "complex"  # больше нод

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    courses = relationship("Course", back_populates="creator")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    complexity_level = Column(Enum(ComplexityLevel), nullable=False)
    status = Column(Enum(CourseStatus), default=CourseStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign Keys
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    creator = relationship("User", back_populates="courses")
    concepts = relationship("Concept", back_populates="course", cascade="all, delete-orphan")
    connections = relationship("Connection", back_populates="course", cascade="all, delete-orphan")
    files = relationship("UploadedFile", back_populates="course", cascade="all, delete-orphan")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)  # Parsed text content
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="files")

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    content = Column(Text)  # Generated content from AI (5-10 sentences)
    bloom_level = Column(Enum(BloomLevel), nullable=False)
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Foreign Keys
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="concepts")
    source_connections = relationship("Connection", foreign_keys="Connection.source_concept_id", back_populates="source_concept")
    target_connections = relationship("Connection", foreign_keys="Connection.target_concept_id", back_populates="target_concept")

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    connection_type = Column(Enum(ConnectionType), nullable=False)
    strength = Column(Float, default=0.5)  # 0.0 to 1.0
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Keys
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    source_concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    target_concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="connections")
    source_concept = relationship("Concept", foreign_keys=[source_concept_id], back_populates="source_connections")
    target_concept = relationship("Concept", foreign_keys=[target_concept_id], back_populates="target_connections")

class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    progress_percentage = Column(Float, default=0.0)  # 0.0 to 100.0
    completed_concepts = Column(JSON, default=list)  # List of concept IDs
    current_concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Foreign Keys
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Relationships
    student = relationship("User")
    course = relationship("Course")
    current_concept = relationship("Concept")