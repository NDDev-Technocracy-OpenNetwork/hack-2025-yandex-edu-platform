from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from ...domain.entities import User


@dataclass
class CreateUserRequest:
    name: str
    email: str
    role: Literal["teacher", "student"]


@dataclass
class UserResponse:
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, user: User) -> "UserResponse":
        return cls(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            updated_at=user.updated_at
        )