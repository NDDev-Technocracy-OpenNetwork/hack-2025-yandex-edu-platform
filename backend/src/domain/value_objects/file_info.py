from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

FileType = Literal["pdf", "docx", "txt", "md"]


@dataclass(frozen=True)
class FileInfo:
    name: str
    size_bytes: int
    content_type: str
    file_type: FileType

    def __post_init__(self) -> None:
        if not self.name:
            raise ValueError("File name cannot be empty")
        
        if self.size_bytes < 0:
            raise ValueError("File size cannot be negative")
        
        if self.size_bytes > 20 * 1024 * 1024:  # 20MB
            raise ValueError("File size exceeds 20MB limit")
        
        if not self.content_type:
            raise ValueError("Content type cannot be empty")
        
        # Validate file extension matches type
        file_extension = Path(self.name).suffix.lower()
        expected_extensions = {
            "pdf": ".pdf",
            "docx": ".docx", 
            "txt": ".txt",
            "md": ".md"
        }
        
        if file_extension != expected_extensions.get(self.file_type):
            raise ValueError(f"File extension {file_extension} does not match type {self.file_type}")

    @classmethod
    def from_upload(cls, filename: str, size: int, content_type: str) -> FileInfo:
        file_extension = Path(filename).suffix.lower()
        
        type_mapping = {
            ".pdf": "pdf",
            ".docx": "docx",
            ".txt": "txt",
            ".md": "md"
        }
        
        if file_extension not in type_mapping:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        return cls(
            name=filename,
            size_bytes=size,
            content_type=content_type,
            file_type=type_mapping[file_extension]
        )

    @property
    def size_mb(self) -> float:
        return self.size_bytes / (1024 * 1024)

    @property
    def is_text_file(self) -> bool:
        return self.file_type in ("txt", "md")

    @property
    def requires_processing(self) -> bool:
        return self.file_type in ("pdf", "docx")