from pydantic import BaseModel, Field
from typing import Optional, Literal


class FileUploadSchema(BaseModel):
    filename: str = Field(..., min_length=1)
    content_type: str
    size: int = Field(..., gt=0)


class ProcessingStatusSchema(BaseModel):
    file_id: str
    status: Literal["uploading", "processing", "extracting", "linking", "success", "error"]
    progress: float = Field(..., ge=0, le=100)
    message: Optional[str] = None
    course_id: Optional[str] = None
    error: Optional[str] = None


class FileUploadResponseSchema(BaseModel):
    success: bool
    file_id: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None