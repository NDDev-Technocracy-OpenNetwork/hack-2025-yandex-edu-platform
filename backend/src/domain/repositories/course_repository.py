from abc import ABC, abstractmethod
from typing import Optional, List
from ..entities import Course
from ..value_objects import CourseId, UserId


class CourseRepository(ABC):
    @abstractmethod
    async def save(self, course: Course) -> Course:
        pass

    @abstractmethod
    async def get_by_id(self, course_id: CourseId) -> Optional[Course]:
        pass

    @abstractmethod
    async def get_by_user(self, user_id: UserId) -> List[Course]:
        pass

    @abstractmethod
    async def get_active_courses(self) -> List[Course]:
        pass

    @abstractmethod
    async def get_all(self) -> List[Course]:
        pass

    @abstractmethod
    async def delete(self, course_id: CourseId) -> bool:
        pass

    @abstractmethod
    async def update_status(self, course_id: CourseId, status: str) -> bool:
        pass