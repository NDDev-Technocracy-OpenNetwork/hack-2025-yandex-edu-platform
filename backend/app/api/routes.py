from fastapi import APIRouter
from app.api.endpoints import simple_courses, files, student

api_router = APIRouter()

api_router.include_router(simple_courses.router, prefix="/courses", tags=["courses"]) 
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(student.router, prefix="/student", tags=["student"])