from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update, and_, or_
import os
import uuid
from datetime import datetime
from pathlib import Path
from app.db.database import get_db
from app.db.models import Course, Concept, Connection, User, UploadedFile, ComplexityLevel
from app.schemas.course import CourseResponse, CourseCreate, AIGraphResponse
from app.services.file_parser import FileParserService
from app.services.openai_service import OpenAIService
from app.core.config import settings

router = APIRouter()

# Mock teacher user ID (since no auth)
MOCK_TEACHER_ID = "teacher-1"

@router.get("/courses", response_model=List[CourseResponse])
async def get_teacher_courses(db: AsyncSession = Depends(get_db)):
    """Get all courses created by the teacher"""
    try:
        # Fetch courses with their concepts and connections
        result = await db.execute(
            select(Course).where(Course.creator_id == 1)
        )
        courses = result.scalars().all()
        
        course_responses = []
        for course in courses:
            # Get ALL concepts for this course (needed for the course modal)
            concepts_result = await db.execute(
                select(Concept).where(Concept.course_id == course.id)
            )
            all_concepts = concepts_result.scalars().all()
            
            # Filter active concepts for the main list display
            concepts = [c for c in all_concepts if not c.is_deleted]
            
            # Get active connections for this course
            connections_result = await db.execute(
                select(Connection).where(
                    Connection.course_id == course.id,
                    Connection.is_deleted == False
                )
            )
            connections = connections_result.scalars().all()
            
            course_responses.append(CourseResponse(
                id=str(course.id),
                title=course.title,
                description=course.description or "",
                createdBy=str(course.creator_id),
                createdAt=course.created_at,
                updatedAt=course.updated_at,
                difficulty=course.difficulty.value,
                complexity=course.complexity_level.value,
                concepts=[{
                    "id": str(c.id),
                    "title": c.title,
                    "description": c.description or "",
                    "bloomLevel": c.bloom_level.value,
                    "position": {"x": c.position_x or 0, "y": c.position_y or 0},
                    "progress": 0,
                    "comments": [],
                    "isDeleted": c.is_deleted
                } for c in concepts],
                connections=[{
                    "id": str(conn.id),
                    "sourceId": str(conn.source_concept_id),
                    "targetId": str(conn.target_concept_id),
                    "type": conn.connection_type.value,
                    "strength": conn.strength or 0.5
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
            select(func.count(Course.id)).where(Course.creator_id == 1)
        )
        total_courses = courses_result.scalar() or 0
        
        # Count total concepts across all teacher courses
        concepts_result = await db.execute(
            select(func.count(Concept.id))
            .select_from(Concept.join(Course))
            .where(Course.creator_id == 1)
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
        # Ensure mock teacher user exists
        from app.db.models import DifficultyLevel, ComplexityLevel, UserRole
        
        # Check if teacher user exists, create if not
        teacher_result = await db.execute(
            select(User).where(User.id == 1)
        )
        teacher = teacher_result.scalar_one_or_none()
        
        if not teacher:
            mock_teacher = User(
                id=1,
                email="teacher@test.com",
                name="Mock Teacher",
                role=UserRole.TEACHER,
                hashed_password="dummy_hash"
            )
            db.add(mock_teacher)
            await db.commit()
        
        # Create new course with all required fields
        
        new_course = Course(
            title=course_data.title,
            description=course_data.description,
            creator_id=1,  # Mock teacher user ID (we'll create if needed)
            difficulty=DifficultyLevel.BEGINNER,
            complexity_level=ComplexityLevel.SIMPLE
        )
        
        db.add(new_course)
        await db.commit()
        await db.refresh(new_course)
        
        return CourseResponse(
            id=str(new_course.id),
            title=new_course.title,
            description=new_course.description or "",
            createdBy=str(new_course.creator_id),
            createdAt=new_course.created_at,
            updatedAt=new_course.updated_at,
            difficulty=new_course.difficulty.value,
            complexity=new_course.complexity_level.value,
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
    complexity: str = "simple",
    db: AsyncSession = Depends(get_db)
):
    """Upload files for a course and process them with AI"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Validate files
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Create upload directory if it doesn't exist
        upload_dir = Path("uploads") / str(course_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        extracted_texts = []
        uploaded_files_data = []
        
        # Process each file
        for file in files:
            if not file.filename:
                continue
            
            # Read file content first
            file_content = await file.read()
                
            # Debug: Print file info
            print(f"Processing file: {file.filename}")
            print(f"Content type: {file.content_type}")
            print(f"File size: {len(file_content)} bytes")
            
            # Validate file type
            if not FileParserService.is_supported_file_type(file.content_type or "", file.filename):
                print(f"Unsupported file type: {file.filename}, content_type: {file.content_type}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file.filename} (content_type: {file.content_type})"
                )
            
            # Validate file size
            if len(file_content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File too large: {file.filename}"
                )
            
            # Save file to disk with proper encoding for Russian filenames
            file_id = str(uuid.uuid4())
            file_extension = Path(file.filename).suffix.lower()
            # Keep original filename for display, use UUID for storage
            saved_filename = f"{file_id}{file_extension}"
            file_path = upload_dir / saved_filename
            
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            try:
                # Parse file content
                extracted_text = await FileParserService.parse_file(
                    str(file_path), 
                    file.content_type or ""
                )
                extracted_texts.append(extracted_text)
                
                # Save file info to database
                uploaded_file = UploadedFile(
                    filename=saved_filename,
                    original_filename=file.filename,
                    file_path=str(file_path),
                    file_size=len(file_content),
                    content_type=file.content_type or "",
                    extracted_text=extracted_text,
                    course_id=int(course_id)
                )
                db.add(uploaded_file)
                uploaded_files_data.append(uploaded_file)
                
            except Exception as parse_error:
                print(f"Error parsing file {file.filename}: {parse_error}")
                # Remove the file if parsing failed
                if file_path.exists():
                    file_path.unlink()
                continue
        
        # Commit uploaded files
        await db.commit()
        
        if not extracted_texts:
            raise HTTPException(status_code=400, detail="No valid text content extracted from files")
        
        # Combine all extracted text
        combined_text = "\n\n".join(extracted_texts)
        
        # Update course complexity level
        complexity_level = ComplexityLevel.COMPLEX if complexity == "complex" else ComplexityLevel.SIMPLE
        course.complexity_level = complexity_level
        await db.commit()
        
        # Note: Concepts will be generated when user clicks "Continue" in the UI
        # For now, just return success - concepts are generated in a separate step
        
        return {
            "courseId": course_id,
            "status": "success", 
            "message": f"Successfully processed {len(files)} files",
            "files_count": len(files),
            "extracted_text_length": len(combined_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading and processing files: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process files: {str(e)}")

@router.get("/courses/{course_id}")
async def get_course_by_id(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific course by ID"""
    try:
        # Get course
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get ALL concepts for this course (active and deleted)
        concepts_result = await db.execute(
            select(Concept).where(Concept.course_id == course.id)
        )
        concepts = concepts_result.scalars().all()
        
        # Debug: Check deletion status
        print(f"Loaded {len(concepts)} concepts for course {course_id}")
        for c in concepts[:3]:  # Check first 3 concepts
            print(f"Concept {c.id}: title='{c.title[:30]}...', is_deleted={c.is_deleted}")
        
        active_count = len([c for c in concepts if not c.is_deleted])
        deleted_count = len([c for c in concepts if c.is_deleted])
        print(f"Course {course_id}: {active_count} active, {deleted_count} deleted concepts")
        
        # Get active connections for this course
        connections_result = await db.execute(
            select(Connection).where(
                Connection.course_id == course.id,
                Connection.is_deleted == False
            )
        )
        connections = connections_result.scalars().all()
        
        return {
            "id": str(course.id),
            "title": course.title,
            "description": course.description or "",
            "createdBy": str(course.creator_id),
            "createdAt": course.created_at.isoformat() + "Z",
            "updatedAt": course.updated_at.isoformat() + "Z",
            "difficulty": course.difficulty.value,
            "complexity": course.complexity_level.value,
            "concepts": [{
                "id": str(c.id),
                "title": c.title,
                "description": c.description or "",
                "bloomLevel": c.bloom_level.value,
                "position": {"x": c.position_x or 0, "y": c.position_y or 0},
                "progress": 0,
                "comments": [],
                "isDeleted": c.is_deleted
            } for c in concepts],
            "connections": [{
                "id": str(conn.id),
                "sourceId": str(conn.source_concept_id),
                "targetId": str(conn.target_concept_id),
                "type": conn.connection_type.value,
                "strength": conn.strength or 0.5
            } for conn in connections]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching course: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch course")

@router.get("/courses/{course_id}/files")
async def get_course_files(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all uploaded files for a course"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get files for this course
        files_result = await db.execute(
            select(UploadedFile).where(UploadedFile.course_id == int(course_id))
        )
        files = files_result.scalars().all()
        
        return [
            {
                "id": str(file.id),
                "originalFilename": file.original_filename,
                "filename": file.filename,
                "fileSize": file.file_size,
                "contentType": file.content_type,
                "uploadedAt": file.created_at,
                "extractedTextLength": len(file.extracted_text or "")
            }
            for file in files
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching course files: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch files")

@router.get("/courses/{course_id}/files/{file_id}/text")
async def get_file_text(
    course_id: str,
    file_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get extracted text from a specific file"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the specific file
        file_result = await db.execute(
            select(UploadedFile).where(
                UploadedFile.id == int(file_id),
                UploadedFile.course_id == int(course_id)
            )
        )
        file = file_result.scalar_one_or_none()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {
            "id": str(file.id),
            "originalFilename": file.original_filename,
            "extractedText": file.extracted_text or "",
            "fileSize": file.file_size,
            "uploadedAt": file.created_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching file text: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch file text")

@router.delete("/courses/{course_id}/files/{file_id}")
async def delete_course_file(
    course_id: str,
    file_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific uploaded file"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the specific file
        file_result = await db.execute(
            select(UploadedFile).where(
                UploadedFile.id == int(file_id),
                UploadedFile.course_id == int(course_id)
            )
        )
        file = file_result.scalar_one_or_none()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete physical file
        file_path = Path(file.file_path)
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        await db.delete(file)
        await db.commit()
        
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

@router.post("/courses/{course_id}/generate-concepts")
async def generate_concepts(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Generate concepts from uploaded files using GPT-5-mini."""
    try:
        creator_id = 1  # Mock user ID
        
        # Get course and verify ownership
        course_query = select(Course).where(
            Course.id == int(course_id),
            Course.creator_id == creator_id
        )
        result = await db.execute(course_query)
        course = result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(
                status_code=404, 
                detail="Course not found or access denied"
            )
        
        # Get all files for this course
        files_query = select(UploadedFile).where(UploadedFile.course_id == int(course_id))
        files_result = await db.execute(files_query)
        files = files_result.scalars().all()
        
        if not files:
            raise HTTPException(
                status_code=400,
                detail="No files found for this course"
            )
        
        # Combine all extracted text
        combined_text = ""
        for file in files:
            if file.extracted_text:
                combined_text += f"{file.extracted_text}\n\n"
        
        if not combined_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No valid text content found in uploaded files"
            )
        
        print(f"Generating concepts for course {course_id}")
        print(f"Text length: {len(combined_text)} characters")
        print(f"Complexity: {course.complexity_level}")
        
        # Generate concepts using AI
        try:
            openai_service = OpenAIService()
            ai_response: AIGraphResponse = await openai_service.generate_concept_graph(
                extracted_text=combined_text,
                complexity_level=course.complexity_level,
                course_title=course.title,
                course_description=course.description or ""
            )
            
            print(f"AI generated {len(ai_response.concepts)} concepts and {len(ai_response.connections)} connections")
            
        except Exception as ai_error:
            print(f"AI service error: {ai_error}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing request: {str(ai_error)}"
            )
        
        # Clear existing concepts and connections for this course
        await db.execute(delete(Connection).where(Connection.course_id == int(course_id)))
        await db.execute(delete(Concept).where(Concept.course_id == int(course_id)))
        await db.commit()
        
        # Save concepts to database
        concepts = []
        for concept_data in ai_response.concepts:
            concept = Concept(
                title=concept_data.title,
                description=concept_data.description or "",
                bloom_level=concept_data.bloom_level,
                course_id=int(course_id)
            )
            db.add(concept)
            concepts.append(concept)
        
        await db.commit()
        
        # Refresh each concept to get the generated IDs
        for concept in concepts:
            await db.refresh(concept)
        
        # Save connections to database
        connections_saved = 0
        for connection_data in ai_response.connections:
            if (connection_data.source_concept_index < len(concepts) and 
                connection_data.target_concept_index < len(concepts)):
                
                connection = Connection(
                    source_concept_id=concepts[connection_data.source_concept_index].id,
                    target_concept_id=concepts[connection_data.target_concept_index].id,
                    connection_type=connection_data.connection_type,
                    strength=connection_data.strength,
                    course_id=int(course_id)
                )
                db.add(connection)
                connections_saved += 1
        
        await db.commit()
        
        return {
            "courseId": course_id,
            "status": "success",
            "message": f"Successfully generated {len(concepts)} concepts with {connections_saved} connections",
            "concepts_count": len(concepts),
            "connections_count": connections_saved,
            "extracted_text_length": len(combined_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_concepts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error occurred"
        )

@router.get("/courses/{course_id}/concepts")
async def get_course_concepts(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all concepts for a course."""
    try:
        creator_id = 1  # Mock user ID
        
        # Get course and verify ownership
        course_query = select(Course).where(
            Course.id == int(course_id),
            Course.creator_id == creator_id
        )
        result = await db.execute(course_query)
        course = result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(
                status_code=404, 
                detail="Course not found or access denied"
            )
        
        # Get concepts for this course
        concepts_query = select(Concept).where(Concept.course_id == int(course_id))
        concepts_result = await db.execute(concepts_query)
        concepts = concepts_result.scalars().all()
        
        # Format concepts for frontend
        formatted_concepts = []
        for concept in concepts:
            formatted_concepts.append({
                "id": concept.id,
                "title": concept.title,
                "description": concept.description or "",
                "bloomLevel": concept.bloom_level.value if concept.bloom_level else "understand"
            })
        
        return {
            "concepts": formatted_concepts,
            "count": len(formatted_concepts)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting concepts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error occurred"
        )
        print(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a course and all its related data"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Delete uploaded files from filesystem
        files_result = await db.execute(
            select(UploadedFile).where(UploadedFile.course_id == int(course_id))
        )
        files = files_result.scalars().all()
        
        for file in files:
            file_path = Path(file.file_path)
            if file_path.exists():
                file_path.unlink()
        
        # Delete connections first (foreign key constraint)
        await db.execute(
            select(Connection).where(Connection.course_id == int(course_id))
        )
        connections_result = await db.execute(
            select(Connection).where(Connection.course_id == int(course_id))
        )
        connections = connections_result.scalars().all()
        for connection in connections:
            await db.delete(connection)
        
        # Delete concepts
        concepts_result = await db.execute(
            select(Concept).where(Concept.course_id == int(course_id))
        )
        concepts = concepts_result.scalars().all()
        for concept in concepts:
            await db.delete(concept)
        
        # Delete uploaded files from database
        for file in files:
            await db.delete(file)
        
        # Finally delete the course
        await db.delete(course)
        await db.commit()
        
        return {"message": "Course deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting course: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to delete course")


@router.patch("/courses/{course_id}/complexity")
async def update_course_complexity(
    course_id: str,
    complexity_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update course complexity level"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Validate complexity level
        complexity = complexity_data.get("complexity")
        if complexity not in ["simple", "complex"]:
            raise HTTPException(status_code=400, detail="Invalid complexity level")
        
        # Map to enum value
        complexity_enum = ComplexityLevel.SIMPLE if complexity == "simple" else ComplexityLevel.COMPLEX
        
        # Update course complexity
        course.complexity_level = complexity_enum
        course.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "message": "Course complexity updated successfully",
            "complexity": complexity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating course complexity: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to update course complexity")

@router.patch("/courses/{course_id}/concepts/{concept_id}")
async def update_concept(
    course_id: str,
    concept_id: str,
    concept_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update concept title and description"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the concept
        concept_result = await db.execute(
            select(Concept).where(
                Concept.id == int(concept_id),
                Concept.course_id == int(course_id),
                Concept.is_deleted == False
            )
        )
        concept = concept_result.scalar_one_or_none()
        
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        
        # Update concept fields
        if "title" in concept_data:
            concept.title = concept_data["title"]
        if "description" in concept_data:
            concept.description = concept_data["description"]
        
        concept.updated_at = datetime.utcnow()
        await db.commit()
        
        return {
            "message": "Concept updated successfully",
            "concept": {
                "id": str(concept.id),
                "title": concept.title,
                "description": concept.description,
                "bloomLevel": concept.bloom_level.value
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating concept: {e}")
        raise HTTPException(status_code=500, detail="Failed to update concept")

@router.delete("/courses/{course_id}/concepts/{concept_id}")
async def delete_concept(
    course_id: str,
    concept_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Soft delete concept and remove related connections"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the concept (allow already deleted concepts for idempotent deletion)
        concept_result = await db.execute(
            select(Concept).where(
                Concept.id == int(concept_id),
                Concept.course_id == int(course_id)
            )
        )
        concept = concept_result.scalar_one_or_none()
        
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        
        # If already deleted, return success (idempotent operation)
        if concept.is_deleted:
            return {"message": "Concept already deleted"}
        
        # Soft delete the concept
        concept.is_deleted = True
        concept.deleted_at = datetime.utcnow()
        concept.updated_at = datetime.utcnow()
        
        # Soft delete all connections related to this concept
        
        # First, find the connections to delete
        connections_to_delete_result = await db.execute(
            select(Connection).where(
                and_(
                    or_(
                        Connection.source_concept_id == int(concept_id),
                        Connection.target_concept_id == int(concept_id)
                    ),
                    Connection.is_deleted == False
                )
            )
        )
        connections_to_delete = connections_to_delete_result.scalars().all()
        print(f"Found {len(connections_to_delete)} connections to soft delete for concept {concept_id}")
        
        # Now soft delete them
        await db.execute(
            update(Connection).where(
                or_(
                    Connection.source_concept_id == int(concept_id),
                    Connection.target_concept_id == int(concept_id)
                )
            ).values(
                is_deleted=True,
                deleted_at=datetime.utcnow()
            )
        )
        
        print(f"Soft deleted {len(connections_to_delete)} connections for concept {concept_id}")
        
        await db.commit()
        
        return {
            "message": "Concept deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting concept: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete concept")

@router.patch("/courses/{course_id}/concepts/{concept_id}/restore")
async def restore_concept(
    course_id: str,
    concept_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Restore a soft-deleted concept"""
    try:
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get the deleted concept
        concept_result = await db.execute(
            select(Concept).where(
                Concept.id == int(concept_id),
                Concept.course_id == int(course_id),
                Concept.is_deleted == True
            )
        )
        concept = concept_result.scalar_one_or_none()
        
        if not concept:
            raise HTTPException(status_code=404, detail="Deleted concept not found")
        
        # Restore the concept
        concept.is_deleted = False
        concept.deleted_at = None
        concept.updated_at = datetime.utcnow()
        
        # Restore connections related to this concept (only if both concepts are active)
        
        # Get all deleted connections for this concept
        deleted_connections_result = await db.execute(
            select(Connection).where(
                and_(
                    or_(
                        Connection.source_concept_id == int(concept_id),
                        Connection.target_concept_id == int(concept_id)
                    ),
                    Connection.is_deleted == True
                )
            )
        )
        deleted_connections = deleted_connections_result.scalars().all()
        
        print(f"Found {len(deleted_connections)} deleted connections for concept {concept_id}")
        
        # Restore connections where both source and target concepts are active
        restored_count = 0
        for conn in deleted_connections:
            source_concept_result = await db.execute(
                select(Concept).where(
                    and_(
                        Concept.id == conn.source_concept_id,
                        Concept.is_deleted == False
                    )
                )
            )
            target_concept_result = await db.execute(
                select(Concept).where(
                    and_(
                        Concept.id == conn.target_concept_id,
                        Concept.is_deleted == False
                    )
                )
            )
            
            source_concept = source_concept_result.scalar_one_or_none()
            target_concept = target_concept_result.scalar_one_or_none()
            
            # If both concepts are active, restore the connection
            if source_concept and target_concept:
                conn.is_deleted = False
                conn.deleted_at = None
                restored_count += 1
                print(f"Restored connection {conn.id} between concepts {source_concept.id} and {target_concept.id}")
        
        print(f"Restored {restored_count} connections")
        
        await db.commit()
        
        return {
            "message": "Concept restored successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error restoring concept: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore concept")

@router.post("/courses/{course_id}/generate-descriptions")
async def generate_concept_descriptions(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Generate detailed descriptions for all active concepts using uploaded materials."""
    try:
        print(f"Starting description generation for course {course_id}")
        
        # Verify course exists and belongs to teacher
        course_result = await db.execute(
            select(Course).where(
                Course.id == int(course_id),
                Course.creator_id == 1
            )
        )
        course = course_result.scalar_one_or_none()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get all active concepts
        concepts_result = await db.execute(
            select(Concept).where(
                Concept.course_id == int(course_id),
                Concept.is_deleted == False
            ).order_by(Concept.id)
        )
        concepts = concepts_result.scalars().all()
        
        if not concepts:
            raise HTTPException(status_code=400, detail="No active concepts found")
        
        print(f"Found {len(concepts)} active concepts")
        
        # Get all uploaded files for this course
        files_result = await db.execute(
            select(UploadedFile).where(UploadedFile.course_id == int(course_id))
        )
        uploaded_files = files_result.scalars().all()
        
        if not uploaded_files:
            raise HTTPException(status_code=400, detail="No uploaded files found")
        
        print(f"Found {len(uploaded_files)} uploaded files")
        
        # Combine all extracted text from uploaded files
        all_extracted_text = []
        for file in uploaded_files:
            if file.extracted_text:
                all_extracted_text.append(f"=== {file.original_filename} ===\n{file.extracted_text}")
        
        if not all_extracted_text:
            raise HTTPException(status_code=400, detail="No extracted text found in uploaded files")
        
        combined_text = "\n\n".join(all_extracted_text)
        print(f"Combined text length: {len(combined_text)} characters")
        
        # Prepare concepts data for OpenAI
        concepts_data = []
        for concept in concepts:
            concepts_data.append({
                'id': concept.id,
                'title': concept.title,
                'bloom_level': concept.bloom_level.value,
                'description': concept.description or ""
            })
        
        # Generate descriptions using OpenAI
        openai_service = OpenAIService()
        descriptions = await openai_service.generate_concept_descriptions(
            concepts=concepts_data,
            extracted_text=combined_text,
            course_title=course.title,
            course_description=course.description or ""
        )
        
        print(f"Generated descriptions for {len(descriptions)} concepts")
        
        # Update concepts with generated descriptions
        updated_count = 0
        for concept in concepts:
            concept_id = str(concept.id)
            if concept_id in descriptions:
                concept.description = descriptions[concept_id]
                concept.updated_at = datetime.utcnow()
                updated_count += 1
        
        await db.commit()
        
        print(f"Updated {updated_count} concepts with descriptions")
        
        return {
            "message": "Concept descriptions generated successfully",
            "updated_concepts": updated_count,
            "total_concepts": len(concepts),
            "files_analyzed": len(uploaded_files),
            "total_text_length": len(combined_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating concept descriptions: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate descriptions: {str(e)}")

