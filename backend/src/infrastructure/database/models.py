from sqlalchemy import Column, String, DateTime, Text, Float, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base
import uuid
import enum


class UserRole(enum.Enum):
    TEACHER = "teacher"
    STUDENT = "student"


class CourseStatus(enum.Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    ACTIVE = "active"
    ARCHIVED = "archived"


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


class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    courses = relationship("CourseModel", back_populates="creator")


class CourseModel(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)
    status = Column(Enum(CourseStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=CourseStatus.DRAFT)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("UserModel", back_populates="courses")
    concepts = relationship("ConceptModel", back_populates="course", cascade="all, delete-orphan")
    connections = relationship("ConnectionModel", back_populates="course", cascade="all, delete-orphan")


class ConceptModel(Base):
    __tablename__ = "concepts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    bloom_level = Column(Enum(BloomLevel, values_callable=lambda x: [e.value for e in x]), nullable=False)
    position_x = Column(Float, nullable=False, default=0.0)
    position_y = Column(Float, nullable=False, default=0.0)
    progress = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("CourseModel", back_populates="concepts")
    comments = relationship("ConceptCommentModel", back_populates="concept", cascade="all, delete-orphan")


class ConceptCommentModel(Base):
    __tablename__ = "concept_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id"), nullable=False)
    text = Column(Text, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    concept = relationship("ConceptModel", back_populates="comments")
    author = relationship("UserModel")


class ConnectionModel(Base):
    __tablename__ = "concept_connections"

    id = Column(String(255), primary_key=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey("concepts.id"), nullable=False)
    connection_type = Column(Enum(ConnectionType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    strength = Column(Float, nullable=False, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("CourseModel", back_populates="connections")
    source = relationship("ConceptModel", foreign_keys=[source_id])
    target = relationship("ConceptModel", foreign_keys=[target_id])