from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...application.use_cases import CreateCourseUseCase, GetCoursesUseCase
from ...application.dto import CreateCourseRequest, CourseResponse
from ...application.exceptions import UserNotFoundError, ValidationError, CourseNotFoundError
from ..schemas import CreateCourseSchema, CourseSchema, ErrorResponse
from ..dependencies import get_create_course_use_case, get_get_courses_use_case

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/", response_model=CourseSchema)
async def create_course(
    course_data: CreateCourseSchema,
    created_by: str,  # In real app, this would come from authentication
    use_case: CreateCourseUseCase = Depends(get_create_course_use_case)
):
    try:
        request = CreateCourseRequest(
            title=course_data.title,
            description=course_data.description,
            difficulty=course_data.difficulty,
            created_by=created_by
        )
        
        course = await use_case.execute(request)
        return CourseSchema(**course.__dict__)
    
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[CourseSchema])
async def get_all_courses(
    use_case: GetCoursesUseCase = Depends(get_get_courses_use_case)
):
    try:
        courses = await use_case.get_all_courses()
        return [CourseSchema(**course.__dict__) for course in courses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/active", response_model=List[CourseSchema])
async def get_active_courses(
    use_case: GetCoursesUseCase = Depends(get_get_courses_use_case)
):
    try:
        courses = await use_case.get_active_courses()
        return [CourseSchema(**course.__dict__) for course in courses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/user/{user_id}", response_model=List[CourseSchema])
async def get_courses_by_user(
    user_id: str,
    use_case: GetCoursesUseCase = Depends(get_get_courses_use_case)
):
    try:
        courses = await use_case.get_courses_by_user(user_id)
        return [CourseSchema(**course.__dict__) for course in courses]
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{course_id}", response_model=CourseSchema)
async def get_course_by_id(
    course_id: str,
    use_case: GetCoursesUseCase = Depends(get_get_courses_use_case)
):
    try:
        course = await use_case.get_course_by_id(course_id)
        return CourseSchema(**course.__dict__)
    except CourseNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")