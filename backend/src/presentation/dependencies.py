from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from ..infrastructure.config import get_settings
from ..infrastructure.database import DatabaseConnection
from ..infrastructure.repositories import (
    SqlAlchemyUserRepository,
    SqlAlchemyCourseRepository,
    LocalFileRepository
)
from ..infrastructure.services import DocumentProcessor, GraphGenerator
from ..domain.repositories import UserRepository, CourseRepository, FileRepository
from ..domain.services import DocumentProcessingService, GraphGenerationService
from ..application.use_cases import (
    CreateCourseUseCase,
    UploadFileUseCase,
    ProcessDocumentUseCase,
    GetCoursesUseCase
)

# Global database connection
_db_connection = None


async def get_database_connection() -> DatabaseConnection:
    global _db_connection
    if _db_connection is None:
        settings = get_settings()
        _db_connection = DatabaseConnection(settings.database_url)
    return _db_connection


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    db_connection = await get_database_connection()
    async for session in db_connection.get_session():
        yield session


# Repository dependencies
def get_user_repository(db: AsyncSession = Depends(get_db_session)) -> UserRepository:
    return SqlAlchemyUserRepository(db)


def get_course_repository(db: AsyncSession = Depends(get_db_session)) -> CourseRepository:
    return SqlAlchemyCourseRepository(db)


def get_file_repository() -> FileRepository:
    settings = get_settings()
    return LocalFileRepository(settings.upload_dir)


# Service dependencies
def get_document_processing_service() -> DocumentProcessingService:
    return DocumentProcessor()


def get_graph_generation_service() -> GraphGenerationService:
    return GraphGenerator()


# Use case dependencies
def get_create_course_use_case(
    course_repo: CourseRepository = Depends(get_course_repository),
    user_repo: UserRepository = Depends(get_user_repository)
) -> CreateCourseUseCase:
    return CreateCourseUseCase(course_repo, user_repo)


def get_upload_file_use_case(
    file_repo: FileRepository = Depends(get_file_repository)
) -> UploadFileUseCase:
    return UploadFileUseCase(file_repo)


def get_process_document_use_case(
    course_repo: CourseRepository = Depends(get_course_repository),
    file_repo: FileRepository = Depends(get_file_repository),
    document_service: DocumentProcessingService = Depends(get_document_processing_service),
    graph_service: GraphGenerationService = Depends(get_graph_generation_service)
) -> ProcessDocumentUseCase:
    return ProcessDocumentUseCase(course_repo, file_repo, document_service, graph_service)


def get_get_courses_use_case(
    course_repo: CourseRepository = Depends(get_course_repository)
) -> GetCoursesUseCase:
    return GetCoursesUseCase(course_repo)