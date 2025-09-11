from typing import List
from ...domain.entities import Course
from ...domain.repositories import CourseRepository, UserRepository
from ...domain.value_objects import UserId
from ..dto import CreateCourseRequest, CourseResponse
from ..exceptions import UserNotFoundError, ValidationError


class CreateCourseUseCase:
    def __init__(
        self,
        course_repository: CourseRepository,
        user_repository: UserRepository
    ):
        self._course_repository = course_repository
        self._user_repository = user_repository

    async def execute(self, request: CreateCourseRequest) -> CourseResponse:
        # Validate user exists
        user_id = UserId.from_string(request.created_by)
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User with ID {request.created_by} not found")

        # Validate user is a teacher
        if not user.is_teacher():
            raise ValidationError("Only teachers can create courses")

        # Create course entity
        course = Course.create(
            title=request.title,
            description=request.description,
            difficulty=request.difficulty,
            created_by=user_id
        )

        # Save course
        saved_course = await self._course_repository.save(course)

        return CourseResponse.from_entity(saved_course)