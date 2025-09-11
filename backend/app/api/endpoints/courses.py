from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Course, User, Concept, Connection, CourseStatus
from app.schemas.course import (
    Course as CourseSchema, 
    CourseCreate, 
    CourseUpdate,
    ConceptUpdate,
    ConnectionUpdate,
    CourseWithFiles
)
from app.api.dependencies import get_mock_teacher

router = APIRouter()

@router.post("/", response_model=CourseSchema)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new course."""
    current_user = get_mock_teacher()
    
    db_course = Course(
        title=course_data.title,
        description=course_data.description,
        difficulty=course_data.difficulty,
        complexity_level=course_data.complexity_level,
        creator_id=current_user.id
    )
    
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)
    
    return db_course

@router.get("/", response_model=List[CourseSchema])
async def get_courses(
    status_filter: Optional[CourseStatus] = None,
    role: str = "student",  # Default to student view
    db: AsyncSession = Depends(get_db)
):
    """Get courses."""
    
    query = select(Course).options(
        selectinload(Course.concepts),
        selectinload(Course.connections)
    )
    
    if role == "teacher":
        # Teachers see all their courses
        current_user = get_mock_teacher()
        query = query.where(Course.creator_id == current_user.id)
        if status_filter:
            query = query.where(Course.status == status_filter)
    else:
        # Students see only published courses
        query = query.where(Course.status == CourseStatus.PUBLISHED)
    
    result = await db.execute(query)
    courses = result.scalars().all()
    
    return courses

@router.get("/my", response_model=List[CourseWithFiles])
async def get_my_courses(
    db: AsyncSession = Depends(get_db)
):
    """Get teacher's courses with files."""
    current_user = get_mock_teacher()
    
    query = select(Course).options(
        selectinload(Course.concepts),
        selectinload(Course.connections),
        selectinload(Course.files)
    ).where(Course.creator_id == current_user.id)
    
    result = await db.execute(query)
    courses = result.scalars().all()
    
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
async def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
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
    
    # Check permissions
    if current_user.role.value == "teacher":
        if course.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this course")
    else:
        # Students can only see published courses
        if course.status != CourseStatus.PUBLISHED:
            raise HTTPException(status_code=403, detail="Course not available")
    
    return course

@router.put("/{course_id}", response_model=CourseSchema)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Update course details (Teacher only)."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this course")
    
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
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Delete a course (Teacher only)."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    
    await db.delete(course)
    await db.commit()
    
    return {"message": "Course deleted successfully"}

@router.put("/{course_id}/concepts/{concept_id}")
async def update_concept(
    course_id: int,
    concept_id: int,
    concept_data: ConceptUpdate,
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Update a concept in the course."""
    
    # Check course ownership
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    
    if not course or course.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
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
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Update a connection in the course."""
    
    # Check course ownership
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    
    if not course or course.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
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
    current_user: User = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Publish a course to make it available to students."""
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course or course.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course.status = CourseStatus.PUBLISHED
    await db.commit()
    
    return {"message": "Course published successfully"}