from dataclasses import dataclass
from typing import Literal, Optional


@dataclass
class FileUploadRequest:
    filename: str
    content_type: str
    size: int


@dataclass
class FileUploadResponse:
    success: bool
    file_id: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


@dataclass
class ProcessingStatusResponse:
    file_id: str
    status: Literal["uploading", "processing", "extracting", "linking", "success", "error"]
    progress: float
    message: Optional[str] = None
    course_id: Optional[str] = None
    error: Optional[str] = None