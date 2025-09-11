from abc import ABC, abstractmethod
from typing import Literal

FileType = Literal["pdf", "docx", "txt", "md"]


class DocumentProcessingService(ABC):
    @abstractmethod
    async def extract_text(self, file_content: bytes, file_type: FileType) -> str:
        pass

    @abstractmethod
    async def validate_document(self, text_content: str) -> bool:
        pass