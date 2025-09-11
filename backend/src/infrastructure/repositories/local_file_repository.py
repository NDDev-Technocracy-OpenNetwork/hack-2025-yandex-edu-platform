import aiofiles
import os
from pathlib import Path
from typing import Optional, BinaryIO
from ...domain.repositories import FileRepository
from ...domain.value_objects import FileInfo
import uuid


class LocalFileRepository(FileRepository):
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

    async def save_file(self, file_info: FileInfo, file_content: BinaryIO) -> str:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file_info.name).suffix
        filename = f"{file_id}{file_extension}"
        file_path = self.upload_dir / filename

        # Save file content
        async with aiofiles.open(file_path, 'wb') as f:
            content = file_content.read()
            await f.write(content)

        # Save file metadata
        metadata_path = self.upload_dir / f"{file_id}.meta"
        metadata = {
            "original_name": file_info.name,
            "size_bytes": file_info.size_bytes,
            "content_type": file_info.content_type,
            "file_type": file_info.file_type
        }
        
        async with aiofiles.open(metadata_path, 'w') as f:
            import json
            await f.write(json.dumps(metadata))

        return filename

    async def get_file(self, file_path: str) -> Optional[bytes]:
        full_path = self.upload_dir / file_path
        if not full_path.exists():
            return None

        try:
            async with aiofiles.open(full_path, 'rb') as f:
                return await f.read()
        except Exception:
            return None

    async def delete_file(self, file_path: str) -> bool:
        full_path = self.upload_dir / file_path
        metadata_path = self.upload_dir / f"{Path(file_path).stem}.meta"

        try:
            if full_path.exists():
                full_path.unlink()
            if metadata_path.exists():
                metadata_path.unlink()
            return True
        except Exception:
            return False

    async def get_file_info(self, file_path: str) -> Optional[FileInfo]:
        file_id = Path(file_path).stem
        metadata_path = self.upload_dir / f"{file_id}.meta"
        
        if not metadata_path.exists():
            return None

        try:
            async with aiofiles.open(metadata_path, 'r') as f:
                import json
                metadata = json.loads(await f.read())
                
                return FileInfo(
                    name=metadata["original_name"],
                    size_bytes=metadata["size_bytes"],
                    content_type=metadata["content_type"],
                    file_type=metadata["file_type"]
                )
        except Exception:
            return None