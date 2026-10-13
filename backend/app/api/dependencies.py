from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import User
from app.services.auth import verify_token

# Historical authenticated router support; mounted demo routers use mock helpers.
bearer = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(bearer), db: AsyncSession = Depends(get_db)) -> User:
    payload = verify_token(token)
    result = await db.execute(select(User).where(User.email == payload['sub']))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user", headers={"WWW-Authenticate": "Bearer"})
    return user


async def get_current_teacher(user: User = Depends(get_current_user)) -> User:
    if user.role.value != 'teacher':
        raise HTTPException(status_code=403, detail="Teacher role required")
    return user

# For demo purposes, we'll create mock users
class MockUser:
    def __init__(self, id: int, name: str, role: str):
        self.id = id
        self.name = name
        self.role = role

def get_mock_teacher():
    """Get a mock teacher user."""
    return MockUser(id=1, name="Teacher User", role="teacher")

def get_mock_student():
    """Get a mock student user."""
    return MockUser(id=2, name="Student User", role="student")
