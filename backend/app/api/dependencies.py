# No authentication - simplified for demo
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db

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