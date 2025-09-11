from typing import List
from ...domain.repositories import CourseRepository
from ...domain.value_objects import UserId
from ..dto import CourseResponse
from ..exceptions import UserNotFoundError


class GetCoursesUseCase:
    def __init__(self, course_repository: CourseRepository):
        self._course_repository = course_repository

    async def get_all_courses(self) -> List[CourseResponse]:
        courses = await self._course_repository.get_all()
        return [CourseResponse.from_entity(course) for course in courses]

    async def get_active_courses(self) -> List[CourseResponse]:
        courses = await self._course_repository.get_active_courses()
        return [CourseResponse.from_entity(course) for course in courses]

    async def get_courses_by_user(self, user_id: str) -> List[CourseResponse]:
        try:
            user_id_obj = UserId.from_string(user_id)
            courses = await self._course_repository.get_by_user(user_id_obj)
            return [CourseResponse.from_entity(course) for course in courses]
        except ValueError:
            raise UserNotFoundError(f"Invalid user ID: {user_id}")

    async def get_course_by_id(self, course_id: str) -> CourseResponse:
        from ...domain.value_objects import CourseId
        from ..exceptions import CourseNotFoundError
        
        try:
            course_id_obj = CourseId.from_string(course_id)
            course = await self._course_repository.get_by_id(course_id_obj)
            if not course:
                raise CourseNotFoundError(f"Course with ID {course_id} not found")
            
            return CourseResponse.from_entity(course)
        except ValueError:
            raise CourseNotFoundError(f"Invalid course ID: {course_id}")