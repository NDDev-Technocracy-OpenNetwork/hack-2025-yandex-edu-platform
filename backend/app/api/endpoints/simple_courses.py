from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Course, Concept, Connection, CourseStatus
from app.schemas.course import (
    Course as CourseSchema, 
    CourseCreate, 
    CourseUpdate,
    ConceptUpdate,
    ConnectionUpdate,
    CourseWithFiles
)

router = APIRouter()

from app.core.config import settings

# Mock teacher ID for demo (can be made configurable)  
MOCK_TEACHER_ID = 1

@router.post("/", response_model=CourseSchema)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new course."""
    
    db_course = Course(
        title=course_data.title,
        description=course_data.description,
        difficulty=course_data.difficulty,
        complexity_level=course_data.complexity_level,
        creator_id=MOCK_TEACHER_ID
    )
    
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    
    return db_course

@router.get("/", response_model=List[CourseSchema])
async def get_courses(
    role: str = "student",  # student or teacher
    db: AsyncSession = Depends(get_db)
):
    """Get courses based on role."""
    
    query = select(Course).options(
        selectinload(Course.concepts),
        selectinload(Course.connections)
    )
    
    if role == "teacher":
        # Teachers see their courses
        query = query.where(Course.creator_id == MOCK_TEACHER_ID)
    else:
        # Students see only published courses
        query = query.where(Course.status == CourseStatus.PUBLISHED)
    
    result = await db.execute(query)
    courses = result.scalars().all()
    
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
async def get_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific course."""
    
    query = select(Course).options(
        selectinload(Course.concepts),
        selectinload(Course.connections)
    ).where(Course.id == course_id)
    
    result = await db.execute(query)
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course

@router.put("/{course_id}", response_model=CourseSchema)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update course details."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update fields
    if course_data.title is not None:
        course.title = course_data.title
    if course_data.description is not None:
        course.description = course_data.description
    if course_data.difficulty is not None:
        course.difficulty = course_data.difficulty
    if course_data.complexity_level is not None:
        course.complexity_level = course_data.complexity_level
    
    await db.commit()
    await db.refresh(course)
    
    return course

@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a course."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await db.delete(course)
    await db.commit()
    
    return {"message": "Course deleted successfully"}

@router.put("/{course_id}/concepts/{concept_id}")
async def update_concept(
    course_id: int,
    concept_id: int,
    concept_data: ConceptUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a concept in the course."""
    
    # Get concept
    concept_result = await db.execute(
        select(Concept).where(
            and_(Concept.id == concept_id, Concept.course_id == course_id)
        )
    )
    concept = concept_result.scalar_one_or_none()
    
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Update concept
    if concept_data.title is not None:
        concept.title = concept_data.title
    if concept_data.description is not None:
        concept.description = concept_data.description
    if concept_data.content is not None:
        concept.content = concept_data.content
    if concept_data.bloom_level is not None:
        concept.bloom_level = concept_data.bloom_level
    if concept_data.position_x is not None:
        concept.position_x = concept_data.position_x
    if concept_data.position_y is not None:
        concept.position_y = concept_data.position_y
    
    await db.commit()
    return {"message": "Concept updated successfully"}

@router.put("/{course_id}/connections/{connection_id}")
async def update_connection(
    course_id: int,
    connection_id: int,
    connection_data: ConnectionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a connection in the course."""
    
    # Get connection
    connection_result = await db.execute(
        select(Connection).where(
            and_(Connection.id == connection_id, Connection.course_id == course_id)
        )
    )
    connection = connection_result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Update connection
    if connection_data.connection_type is not None:
        connection.connection_type = connection_data.connection_type
    if connection_data.strength is not None:
        connection.strength = connection_data.strength
    
    await db.commit()
    return {"message": "Connection updated successfully"}

@router.post("/{course_id}/publish")
async def publish_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Publish a course to make it available to students."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.status = CourseStatus.PUBLISHED
    await db.commit()
    
    return {"message": "Course published successfully"}