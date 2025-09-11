from typing import BinaryIO
from ...domain.repositories import FileRepository
from ...domain.value_objects import FileInfo
from ..dto import FileUploadRequest, FileUploadResponse
from ..exceptions import ValidationError


class UploadFileUseCase:
    def __init__(self, file_repository: FileRepository):
        self._file_repository = file_repository

    async def execute(
        self, 
        request: FileUploadRequest, 
        file_content: BinaryIO
    ) -> FileUploadResponse:
        try:
            # Create file info value object (validates file)
            file_info = FileInfo.from_upload(
                filename=request.filename,
                size=request.size,
                content_type=request.content_type
            )

            # Save file
            file_path = await self._file_repository.save_file(file_info, file_content)

            return FileUploadResponse(
                success=True,
                file_id=file_path,
                message="File uploaded successfully"
            )

        except ValueError as e:
            return FileUploadResponse(
                success=False,
                error=str(e)
            )
        except Exception as e:
            return FileUploadResponse(
                success=False,
                error=f"Upload failed: {str(e)}"
            )