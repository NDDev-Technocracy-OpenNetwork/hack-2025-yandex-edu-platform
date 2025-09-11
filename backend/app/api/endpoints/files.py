import os
import uuid
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Course, UploadedFile, User, CourseStatus, Concept, Connection
# No auth - simplified
from app.services.file_parser import FileParserService
from app.services.openai_service import OpenAIService
from app.core.config import settings
import aiofiles

router = APIRouter()

# Use upload directory from settings
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/{course_id}/upload")
async def upload_files(
    course_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload files for a course and extract text content."""
    
    # Check course exists
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    uploaded_files = []
    
    for file in files:
        # Validate file
        if not FileParserService.is_supported_file_type(file.content_type, file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.filename}"
            )
        
        # Check file size
        content = await file.read()
        file_size = len(content)
        
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File {file.filename} is too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Parse file content
        try:
            extracted_text = await FileParserService.parse_file(file_path, file.content_type)
        except Exception as e:
            # Clean up file if parsing fails
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=f"Error parsing {file.filename}: {str(e)}")
        
        # Save file record to database
        db_file = UploadedFile(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            content_type=file.content_type,
            extracted_text=extracted_text,
            course_id=course_id
        )
        
        db.add(db_file)
        uploaded_files.append(db_file)
    
    # Update course status to processing
    course.status = CourseStatus.PROCESSING
    
    await db.commit()
    
    # Refresh uploaded files to get IDs
    for file in uploaded_files:
        await db.refresh(file)
    
    return {
        "message": f"Successfully uploaded {len(files)} files",
        "files": [
            {
                "id": f.id,
                "filename": f.original_filename,
                "size": f.file_size,
                "extracted_text_length": len(f.extracted_text) if f.extracted_text else 0
            }
            for f in uploaded_files
        ]
    }

@router.post("/{course_id}/generate-graph")
async def generate_concept_graph(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Generate concept graph using AI from uploaded files."""
    
    # Get course with files
    course_result = await db.execute(
        select(Course).options(selectinload(Course.files)).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.files:
        raise HTTPException(status_code=400, detail="No files uploaded for this course")
    
    # Combine all extracted text
    combined_text = ""
    for file in course.files:
        if file.extracted_text:
            combined_text += f"\n--- {file.original_filename} ---\n{file.extracted_text}\n"
    
    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="No text content found in uploaded files")
    
    try:
        # Generate concept graph using AI
        openai_service = OpenAIService()
        ai_response = await openai_service.generate_concept_graph(
            extracted_text=combined_text,
            complexity_level=course.complexity_level,
            course_title=course.title,
            course_description=course.description or ""
        )
        
        # Save concepts to database
        concept_objects = []
        for i, ai_concept in enumerate(ai_response.concepts):
            db_concept = Concept(
                title=ai_concept.title,
                description=ai_concept.description,
                bloom_level=ai_concept.bloom_level,
                position_x=0.0,  # Will be set by frontend layout
                position_y=0.0,
                course_id=course_id
            )
            db.add(db_concept)
            concept_objects.append(db_concept)
        
        # Commit to get concept IDs
        await db.commit()
        
        # Refresh concepts to get IDs
        for concept in concept_objects:
            await db.refresh(concept)
        
        # Save connections to database
        for ai_connection in ai_response.connections:
            source_concept = concept_objects[ai_connection.source_concept_index]
            target_concept = concept_objects[ai_connection.target_concept_index]
            
            db_connection = Connection(
                source_concept_id=source_concept.id,
                target_concept_id=target_concept.id,
                connection_type=ai_connection.connection_type,
                strength=ai_connection.strength,
                course_id=course_id
            )
            db.add(db_connection)
        
        # Update course status
        course.status = CourseStatus.READY_FOR_EDIT
        
        await db.commit()
        
        return {
            "message": "Concept graph generated successfully",
            "concepts_count": len(ai_response.concepts),
            "connections_count": len(ai_response.connections)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating concept graph: {str(e)}")

@router.post("/{course_id}/generate-content")
async def generate_concept_content(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Generate detailed content for concepts using AI."""
    
    # Get course with concepts and files
    course_result = await db.execute(
        select(Course).options(
            selectinload(Course.concepts),
            selectinload(Course.files)
        ).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.concepts:
        raise HTTPException(status_code=400, detail="No concepts found. Generate concepts first.")
    
    # Combine all extracted text
    combined_text = ""
    for file in course.files:
        if file.extracted_text:
            combined_text += f"\n--- {file.original_filename} ---\n{file.extracted_text}\n"
    
    try:
        # Prepare concepts data for AI
        concepts_data = [
            {
                "title": concept.title,
                "description": concept.description or "",
                "bloom_level": concept.bloom_level.value
            }
            for concept in course.concepts
        ]
        
        # Generate content using AI
        openai_service = OpenAIService()
        ai_response = await openai_service.generate_concept_content(
            extracted_text=combined_text,
            concepts=concepts_data,
            connections=[],  # We don't need connections for content generation
            course_title=course.title
        )
        
        # Update concepts with generated content
        for i, concept in enumerate(course.concepts):
            if i < len(ai_response.concept_contents):
                concept.content = ai_response.concept_contents[i]
        
        await db.commit()
        
        return {
            "message": "Content generated successfully for all concepts",
            "concepts_updated": len(course.concepts)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")

@router.get("/{course_id}/files")
async def get_course_files(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get list of files uploaded for a course."""
    
    # Check course exists
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get files
    files_result = await db.execute(
        select(UploadedFile).where(UploadedFile.course_id == course_id)
    )
    files = files_result.scalars().all()
    
    return [
        {
            "id": f.id,
            "filename": f.original_filename,
            "size": f.file_size,
            "content_type": f.content_type,
            "uploaded_at": f.created_at,
            "text_length": len(f.extracted_text) if f.extracted_text else 0
        }
        for f in files
    ]