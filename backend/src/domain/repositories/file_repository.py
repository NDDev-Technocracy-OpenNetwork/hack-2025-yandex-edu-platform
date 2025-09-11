from abc import ABC, abstractmethod
from typing import Optional, BinaryIO
from ..value_objects import FileInfo


class FileRepository(ABC):
    @abstractmethod
    async def save_file(self, file_info: FileInfo, file_content: BinaryIO) -> str:
        pass

    @abstractmethod
    async def get_file(self, file_path: str) -> Optional[bytes]:
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        pass

    @abstractmethod
    async def get_file_info(self, file_path: str) -> Optional[FileInfo]:
        pass