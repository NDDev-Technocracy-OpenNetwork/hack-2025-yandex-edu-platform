from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Literal


class CreateUserSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role: Literal["teacher", "student"]


class UserSchema(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True