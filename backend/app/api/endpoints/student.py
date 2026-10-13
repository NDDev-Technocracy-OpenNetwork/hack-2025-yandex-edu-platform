from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Course, CourseStatus, StudentProgress
from app.schemas.course import StudentCourse, StudentConcept, StudentConnection
# No auth - simplified


router = APIRouter()

# Mock student ID for demo (can be made configurable)
MOCK_STUDENT_ID = 2

@router.get("/courses", response_model=List[StudentCourse])
async def get_published_courses(
    db: AsyncSession = Depends(get_db)
):
    """Get all published courses for students."""
    
    # Get all published courses with concepts and connections
    courses_result = await db.execute(
        select(Course).options(
            selectinload(Course.concepts),
            selectinload(Course.connections)
        ).where(Course.status == CourseStatus.PUBLISHED)
    )
    courses = courses_result.scalars().all()
    
    # Get student progress for each course
    progress_result = await db.execute(
        select(StudentProgress).where(StudentProgress.student_id == MOCK_STUDENT_ID)
    )
    progress_dict = {p.course_id: p for p in progress_result.scalars().all()}
    
    # Convert to StudentCourse format
    student_courses = []
    for course in courses:
        progress = progress_dict.get(course.id)
        
        # Convert concepts
        student_concepts = [
            StudentConcept(
                id=concept.id,
                title=concept.title,
                description=concept.description,
                content=concept.content,
                bloom_level=concept.bloom_level,
                position_x=concept.position_x,
                position_y=concept.position_y,
                is_completed=(
                    concept.id in (progress.completed_concepts if progress else [])
                )
            )
            for concept in course.concepts
        ]
        
        # Convert connections
        student_connections = [
            StudentConnection(
                id=conn.id,
                source_concept_id=conn.source_concept_id,
                target_concept_id=conn.target_concept_id,
                connection_type=conn.connection_type,
                strength=conn.strength
            )
            for conn in course.connections
        ]
        
        student_course = StudentCourse(
            id=course.id,
            title=course.title,
            description=course.description,
            difficulty=course.difficulty,
            created_at=course.created_at,
            published_at=course.published_at,
            concepts=student_concepts,
            connections=student_connections,
            progress_percentage=progress.progress_percentage if progress else 0.0,
            total_concepts=len(course.concepts),
            completed_concepts=len(progress.completed_concepts) if progress else 0
        )
        
        student_courses.append(student_course)
    
    return student_courses

@router.get("/courses/{course_id}", response_model=StudentCourse)
async def get_course_details(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a specific published course."""
    
    # Get course
    course_result = await db.execute(
        select(Course).options(
            selectinload(Course.concepts),
            selectinload(Course.connections)
        ).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.status != CourseStatus.PUBLISHED:
        raise HTTPException(status_code=403, detail="Course not available")
    
    # Get student progress
    progress_result = await db.execute(
        select(StudentProgress).where(
            StudentProgress.student_id == MOCK_STUDENT_ID,
            StudentProgress.course_id == course_id
        )
    )
    progress = progress_result.scalar_one_or_none()
    
    # Convert concepts
    student_concepts = [
        StudentConcept(
            id=concept.id,
            title=concept.title,
            description=concept.description,
            content=concept.content,
            bloom_level=concept.bloom_level,
            position_x=concept.position_x,
            position_y=concept.position_y,
            is_completed=(
                concept.id in (progress.completed_concepts if progress else [])
            )
        )
        for concept in course.concepts
    ]
    
    # Convert connections
    student_connections = [
        StudentConnection(
            id=conn.id,
            source_concept_id=conn.source_concept_id,
            target_concept_id=conn.target_concept_id,
            connection_type=conn.connection_type,
            strength=conn.strength
        )
        for conn in course.connections
    ]
    
    return StudentCourse(
        id=course.id,
        title=course.title,
        description=course.description,
        difficulty=course.difficulty,
        created_at=course.created_at,
        published_at=course.published_at,
        concepts=student_concepts,
        connections=student_connections,
        progress_percentage=progress.progress_percentage if progress else 0.0,
        total_concepts=len(course.concepts),
        completed_concepts=len(progress.completed_concepts) if progress else 0
    )

@router.post("/courses/{course_id}/progress/concept/{concept_id}")
async def mark_concept_completed(
    course_id: int,
    concept_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Mark a concept as completed for the student."""
    
    # Verify course exists and is published
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    
    if not course or course.status != CourseStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Course not found or not available")
    
    # Get or create student progress
    progress_result = await db.execute(
        select(StudentProgress).where(
            StudentProgress.student_id == MOCK_STUDENT_ID,
            StudentProgress.course_id == course_id
        )
    )
    progress = progress_result.scalar_one_or_none()
    
    if not progress:
        progress = StudentProgress(
            student_id=MOCK_STUDENT_ID,
            course_id=course_id,
            completed_concepts=[],
            progress_percentage=0.0
        )
        db.add(progress)
    
    # Add concept to completed list if not already there
    completed_concepts = progress.completed_concepts or []
    if concept_id not in completed_concepts:
        completed_concepts.append(concept_id)
        progress.completed_concepts = completed_concepts
        progress.current_concept_id = concept_id
        
        # Calculate new progress percentage
        total_concepts_result = await db.execute(
            select(func.count(Course.id)).where(Course.id == course_id)
        )
        total_concepts = total_concepts_result.scalar() or 1
        
        progress.progress_percentage = (len(completed_concepts) / total_concepts) * 100.0
    
    await db.commit()
    
    return {
        "message": "Concept marked as completed",
        "progress_percentage": progress.progress_percentage,
        "completed_concepts": len(completed_concepts)
    }

@router.get("/stats")
async def get_student_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get student learning statistics."""
    
    # Get all student progress
    progress_result = await db.execute(
        select(StudentProgress).where(StudentProgress.student_id == MOCK_STUDENT_ID)
    )
    all_progress = progress_result.scalars().all()
    
    # Calculate stats
    completed_courses = len([p for p in all_progress if p.progress_percentage >= 100.0])
    total_completed_concepts = sum(len(p.completed_concepts or []) for p in all_progress)
    
    # Estimate learning hours (rough calculation)
    learning_hours = total_completed_concepts * 0.5  # Assume 30 minutes per concept
    
    # Count total connections built (concepts completed)
    # This is a simplified calculation
    built_connections = total_completed_concepts * 2  # Assume each concept has ~2 connections
    
    return {
        "completed_courses": completed_courses,
        "learning_hours": int(learning_hours),
        "studied_concepts": total_completed_concepts,
        "built_connections": built_connections,
        "active_courses": len(all_progress),
        "average_progress": (
            sum(p.progress_percentage for p in all_progress) / len(all_progress)
            if all_progress else 0.0
        )
    }