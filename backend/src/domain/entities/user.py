from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from ..value_objects import UserId

UserRole = Literal["teacher", "student"]


@dataclass
class User:
    id: UserId
    name: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    def __post_init__(self) -> None:
        if not self.name or len(self.name.strip()) < 2:
            raise ValueError("User name must be at least 2 characters")
        
        if not self.email or "@" not in self.email:
            raise ValueError("Invalid email format")
        
        if self.role not in ("teacher", "student"):
            raise ValueError("Role must be 'teacher' or 'student'")

    @classmethod
    def create_teacher(cls, name: str, email: str) -> User:
        now = datetime.utcnow()
        return cls(
            id=UserId.generate(),
            name=name.strip(),
            email=email.lower().strip(),
            role="teacher",
            created_at=now,
            updated_at=now
        )

    @classmethod
    def create_student(cls, name: str, email: str) -> User:
        now = datetime.utcnow()
        return cls(
            id=UserId.generate(),
            name=name.strip(),
            email=email.lower().strip(),
            role="student",
            created_at=now,
            updated_at=now
        )

    def update_name(self, new_name: str) -> None:
        if not new_name or len(new_name.strip()) < 2:
            raise ValueError("User name must be at least 2 characters")
        
        self.name = new_name.strip()
        self.updated_at = datetime.utcnow()

    def is_teacher(self) -> bool:
        return self.role == "teacher"

    def is_student(self) -> bool:
        return self.role == "student"