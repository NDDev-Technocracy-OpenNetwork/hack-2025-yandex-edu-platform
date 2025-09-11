from .base_exceptions import ApplicationError


class UserNotFoundError(ApplicationError):
    def __init__(self, message: str):
        super().__init__(message, "USER_NOT_FOUND")


class CourseNotFoundError(ApplicationError):
    def __init__(self, message: str):
        super().__init__(message, "COURSE_NOT_FOUND")


class FileNotFoundError(ApplicationError):
    def __init__(self, message: str):
        super().__init__(message, "FILE_NOT_FOUND")


class ProcessingError(ApplicationError):
    def __init__(self, message: str):
        super().__init__(message, "PROCESSING_ERROR")