from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from ...application.use_cases import UploadFileUseCase, ProcessDocumentUseCase
from ...application.dto import FileUploadRequest, FileUploadResponse, ProcessingStatusResponse
from ..schemas import FileUploadResponseSchema, ProcessingStatusSchema
from ..dependencies import get_upload_file_use_case, get_process_document_use_case

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponseSchema)
async def upload_file(
    file: UploadFile = File(...),
    use_case: UploadFileUseCase = Depends(get_upload_file_use_case)
):
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Get file size
        content = await file.read()
        file_size = len(content)
        
        # Reset file pointer
        await file.seek(0)
        
        # Create request
        request = FileUploadRequest(
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            size=file_size
        )
        
        # Upload file
        response = await use_case.execute(request, file.file)
        
        return FileUploadResponseSchema(
            success=response.success,
            file_id=response.file_id,
            message=response.message,
            error=response.error
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/process", response_model=ProcessingStatusSchema)
async def process_document(
    file_path: str = Form(...),
    course_title: str = Form(...),
    course_description: str = Form(...),
    difficulty: str = Form(...),
    created_by: str = Form(...),  # In real app, this would come from authentication
    use_case: ProcessDocumentUseCase = Depends(get_process_document_use_case)
):
    try:
        response = await use_case.execute(
            file_path=file_path,
            course_title=course_title,
            course_description=course_description,
            difficulty=difficulty,
            created_by=created_by
        )
        
        return ProcessingStatusSchema(
            file_id=response.file_id,
            status=response.status,
            progress=response.progress,
            message=response.message,
            course_id=response.course_id,
            error=response.error
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/status/{file_id}", response_model=ProcessingStatusSchema)
async def get_processing_status(
    file_id: str,
    use_case: ProcessDocumentUseCase = Depends(get_process_document_use_case)
):
    try:
        response = await use_case.get_processing_status(file_id)
        
        return ProcessingStatusSchema(
            file_id=response.file_id,
            status=response.status,
            progress=response.progress,
            message=response.message,
            course_id=response.course_id,
            error=response.error
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")