from __future__ import annotations
from dataclasses import dataclass
from typing import Any
import uuid


@dataclass(frozen=True)
class UserId:
    value: str

    def __post_init__(self) -> None:
        if not self.value:
            raise ValueError("UserId cannot be empty")
        
        # Validate UUID format
        try:
            uuid.UUID(self.value)
        except ValueError:
            raise ValueError(f"Invalid UserId format: {self.value}")

    @classmethod
    def generate(cls) -> UserId:
        return cls(str(uuid.uuid4()))

    @classmethod
    def from_string(cls, value: str) -> UserId:
        return cls(value)

    def __str__(self) -> str:
        return self.value

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, UserId):
            return False
        return self.value == other.value

    def __hash__(self) -> int:
        return hash(self.value)