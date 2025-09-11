import asyncio
from typing import Dict, List, Tuple
from ...domain.entities import Course, Concept, ConceptConnection, Position
from ...domain.repositories import CourseRepository, FileRepository
from ...domain.value_objects import CourseId, UserId, ConceptId
from ...domain.services import DocumentProcessingService, GraphGenerationService
from ..dto import ProcessingStatusResponse
from ..exceptions import FileNotFoundError, ProcessingError


class ProcessDocumentUseCase:
    def __init__(
        self,
        course_repository: CourseRepository,
        file_repository: FileRepository,
        document_service: DocumentProcessingService,
        graph_service: GraphGenerationService
    ):
        self._course_repository = course_repository
        self._file_repository = file_repository
        self._document_service = document_service
        self._graph_service = graph_service

    async def execute(
        self, 
        file_path: str, 
        course_title: str,
        course_description: str,
        difficulty: str,
        created_by: str
    ) -> ProcessingStatusResponse:
        try:
            # Get file content
            file_content = await self._file_repository.get_file(file_path)
            if not file_content:
                raise FileNotFoundError(f"File not found: {file_path}")

            file_info = await self._file_repository.get_file_info(file_path)
            if not file_info:
                raise FileNotFoundError(f"File info not found: {file_path}")

            # Create course
            course_id = CourseId.generate()
            user_id = UserId.from_string(created_by)
            
            course = Course.create(
                title=course_title,
                description=course_description,
                difficulty=difficulty,
                created_by=user_id
            )
            course.start_processing()

            # Save course in processing state
            await self._course_repository.save(course)

            # Process document in background
            asyncio.create_task(self._process_document_background(
                course, file_content, file_info, file_path
            ))

            return ProcessingStatusResponse(
                file_id=file_path,
                status="processing",
                progress=10.0,
                message="Document processing started",
                course_id=str(course.id)
            )

        except Exception as e:
            return ProcessingStatusResponse(
                file_id=file_path,
                status="error",
                progress=0.0,
                error=str(e)
            )

    async def _process_document_background(
        self, 
        course: Course, 
        file_content: bytes, 
        file_info, 
        file_path: str
    ) -> None:
        try:
            # Extract text from document
            text_content = await self._document_service.extract_text(
                file_content, file_info.file_type
            )

            # Generate concepts and connections
            concepts_data, connections_data = await self._graph_service.generate_graph(
                text_content
            )

            # Create concept entities
            for i, concept_data in enumerate(concepts_data):
                concept = Concept.create(
                    course_id=course.id,
                    title=concept_data["title"],
                    description=concept_data["description"],
                    bloom_level=concept_data["bloom_level"],
                    position=Position(
                        x=concept_data.get("x", i * 100),
                        y=concept_data.get("y", i * 100)
                    )
                )
                course.add_concept(concept)

            # Create connections
            concept_id_map = {c.title: c.id for c in course.concepts}
            for conn_data in connections_data:
                if (conn_data["source"] in concept_id_map and 
                    conn_data["target"] in concept_id_map):
                    
                    connection = ConceptConnection.create(
                        source_id=concept_id_map[conn_data["source"]],
                        target_id=concept_id_map[conn_data["target"]],
                        connection_type=conn_data["type"],
                        strength=conn_data.get("strength", 0.5)
                    )
                    course.add_connection(connection)

            # Activate course
            course.activate()
            await self._course_repository.save(course)

        except Exception as e:
            # Mark course as failed
            course.status = "error"
            await self._course_repository.save(course)
            raise ProcessingError(f"Document processing failed: {str(e)}")

    async def get_processing_status(self, file_id: str) -> ProcessingStatusResponse:
        # In a real implementation, this would check processing status
        # For now, return a mock status
        return ProcessingStatusResponse(
            file_id=file_id,
            status="success",
            progress=100.0,
            message="Processing completed"
        )