from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.db.models import Course, Concept, Connection, User
from app.schemas.course import CourseResponse, CourseCreate

router = APIRouter()

# Mock teacher user ID (since no auth)
MOCK_TEACHER_ID = "teacher-1"

@router.get("/courses", response_model=List[CourseResponse])
async def get_teacher_courses(db: AsyncSession = Depends(get_db)):
    """Get all courses created by the teacher"""
    try:
        # Fetch courses with their concepts and connections
        result = await db.execute(
            select(Course).where(Course.created_by == MOCK_TEACHER_ID)
        )
        courses = result.scalars().all()
        
        course_responses = []
        for course in courses:
            # Get concepts for this course
            concepts_result = await db.execute(
                select(Concept).where(Concept.course_id == course.id)
            )
            concepts = concepts_result.scalars().all()
            
            # Get connections for this course
            connections_result = await db.execute(
                select(Connection).where(Connection.course_id == course.id)
            )
            connections = connections_result.scalars().all()
            
            course_responses.append(CourseResponse(
                id=course.id,
                title=course.title,
                description=course.description,
                createdBy=course.created_by,
                createdAt=course.created_at,
                updatedAt=course.updated_at,
                difficulty=course.difficulty,
                concepts=[{
                    "id": c.id,
                    "title": c.title,
                    "description": c.description,
                    "bloomLevel": c.bloom_level,
                    "position": {"x": c.position_x, "y": c.position_y},
                    "progress": 0,
                    "comments": []
                } for c in concepts],
                connections=[{
                    "id": conn.id,
                    "sourceId": conn.source_id,
                    "targetId": conn.target_id,
                    "type": conn.type,
                    "strength": conn.strength
                } for conn in connections]
            ))
        
        return course_responses
        
    except Exception as e:
        print(f"Error fetching teacher courses: {e}")
        return []

@router.get("/analytics")
async def get_teacher_analytics(db: AsyncSession = Depends(get_db)):
    """Get analytics for the teacher dashboard"""
    try:
        # Count total courses
        courses_result = await db.execute(
            select(func.count(Course.id)).where(Course.created_by == MOCK_TEACHER_ID)
        )
        total_courses = courses_result.scalar() or 0
        
        # Count total concepts across all teacher courses
        concepts_result = await db.execute(
            select(func.count(Concept.id))
            .select_from(Concept.join(Course))
            .where(Course.created_by == MOCK_TEACHER_ID)
        )
        total_concepts = concepts_result.scalar() or 0
        
        return {
            "totalStudents": 0,  # No student tracking yet
            "activeCourses": total_courses,
            "avgCompletion": 0,  # No completion tracking yet
            "totalInteractions": total_concepts  # Use concepts as interaction proxy
        }
        
    except Exception as e:
        print(f"Error fetching teacher analytics: {e}")
        return {
            "totalStudents": 0,
            "activeCourses": 0,
            "avgCompletion": 0,
            "totalInteractions": 0
        }

@router.get("/activity")
async def get_teacher_activity(db: AsyncSession = Depends(get_db)):
    """Get recent activity for the teacher dashboard"""
    # Return empty activity for now since we don't have student tracking
    return []

@router.post("/courses", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new course"""
    try:
        # Create new course
        new_course = Course(
            title=course_data.title,
            description=course_data.description,
            created_by=MOCK_TEACHER_ID,
            difficulty="Beginner"  # Default difficulty
        )
        
        db.add(new_course)
        await db.commit()
        await db.refresh(new_course)
        
        return CourseResponse(
            id=new_course.id,
            title=new_course.title,
            description=new_course.description,
            createdBy=new_course.created_by,
            createdAt=new_course.created_at,
            updatedAt=new_course.updated_at,
            difficulty=new_course.difficulty,
            concepts=[],
            connections=[]
        )
        
    except Exception as e:
        print(f"Error creating course: {e}")
        raise HTTPException(status_code=500, detail="Failed to create course")

@router.post("/courses/{course_id}/upload")
async def upload_course_files(
    course_id: str,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload files for a course and process them"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == course_id,
                Course.created_by == MOCK_TEACHER_ID
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # For now, just return success without processing
        # In a real implementation, this would:
        # 1. Save files to storage
        # 2. Parse files with file_parser service
        # 3. Generate concepts with OpenAI service
        # 4. Create concept connections
        # 5. Save everything to database
        
        return {
            "courseId": course_id,
            "status": "success",
            "message": f"Successfully uploaded {len(files)} files"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading files: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload files")

@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course_by_id(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific course by ID"""
    try:
        # Get course
        course_result = await db.execute(
            select(Course).where(
                Course.id == course_id,
                Course.created_by == MOCK_TEACHER_ID
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get concepts for this course
        concepts_result = await db.execute(
            select(Concept).where(Concept.course_id == course.id)
        )
        concepts = concepts_result.scalars().all()
        
        # Get connections for this course
        connections_result = await db.execute(
            select(Connection).where(Connection.course_id == course.id)
        )
        connections = connections_result.scalars().all()
        
        return CourseResponse(
            id=course.id,
            title=course.title,
            description=course.description,
            createdBy=course.created_by,
            createdAt=course.created_at,
            updatedAt=course.updated_at,
            difficulty=course.difficulty,
            concepts=[{
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "bloomLevel": c.bloom_level,
                "position": {"x": c.position_x, "y": c.position_y},
                "progress": 0,
                "comments": []
            } for c in concepts],
            connections=[{
                "id": conn.id,
                "sourceId": conn.source_id,
                "targetId": conn.target_id,
                "type": conn.type,
                "strength": conn.strength
            } for conn in connections]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching course: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch course")