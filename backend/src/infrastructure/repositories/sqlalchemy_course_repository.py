from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ...domain.entities import Course, Concept, ConceptConnection, Position
from ...domain.entities.concept import ConceptComment
from ...domain.repositories import CourseRepository
from ...domain.value_objects import CourseId, UserId, ConceptId
from ..database.models import CourseModel, ConceptModel, ConnectionModel, ConceptCommentModel


class SqlAlchemyCourseRepository(CourseRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, course: Course) -> Course:
        # Check if course exists
        existing = await self._session.get(CourseModel, course.id.value)
        
        if existing:
            # Update existing course
            existing.title = course.title
            existing.description = course.description
            existing.difficulty = course.difficulty
            existing.status = course.status
            existing.updated_at = course.updated_at
            
            # Clear existing concepts and connections
            for concept in existing.concepts:
                await self._session.delete(concept)
            for connection in existing.connections:
                await self._session.delete(connection)
                
        else:
            # Create new course
            course_model = CourseModel(
                id=course.id.value,
                title=course.title,
                description=course.description,
                difficulty=course.difficulty,
                status=course.status,
                created_by=course.created_by.value,
                created_at=course.created_at,
                updated_at=course.updated_at
            )
            self._session.add(course_model)
            existing = course_model

        # Add concepts
        for concept in course.concepts:
            concept_model = ConceptModel(
                id=concept.id.value,
                course_id=course.id.value,
                title=concept.title,
                description=concept.description,
                bloom_level=concept.bloom_level,
                position_x=concept.position.x,
                position_y=concept.position.y,
                progress=concept.progress,
                created_at=concept.created_at,
                updated_at=concept.updated_at
            )
            self._session.add(concept_model)
            
            # Add comments
            for comment in concept.comments:
                comment_model = ConceptCommentModel(
                    id=comment.id,
                    concept_id=concept.id.value,
                    text=comment.text,
                    author_id=comment.author_id,
                    created_at=comment.created_at
                )
                self._session.add(comment_model)

        # Add connections
        for connection in course.connections:
            connection_model = ConnectionModel(
                id=connection.id,
                course_id=course.id.value,
                source_id=connection.source_id.value,
                target_id=connection.target_id.value,
                connection_type=connection.connection_type,
                strength=connection.strength,
                created_at=connection.created_at
            )
            self._session.add(connection_model)

        await self._session.commit()
        return course

    async def get_by_id(self, course_id: CourseId) -> Optional[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.concepts).selectinload(ConceptModel.comments),
                selectinload(CourseModel.connections)
            )
            .where(CourseModel.id == course_id.value)
        )
        result = await self._session.execute(stmt)
        course_model = result.scalar_one_or_none()
        
        if not course_model:
            return None
        
        return self._model_to_entity(course_model)

    async def get_by_user(self, user_id: UserId) -> List[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.concepts).selectinload(ConceptModel.comments),
                selectinload(CourseModel.connections)
            )
            .where(CourseModel.created_by == user_id.value)
        )
        result = await self._session.execute(stmt)
        course_models = result.scalars().all()
        
        return [self._model_to_entity(model) for model in course_models]

    async def get_active_courses(self) -> List[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.concepts).selectinload(ConceptModel.comments),
                selectinload(CourseModel.connections)
            )
            .where(CourseModel.status == "active")
        )
        result = await self._session.execute(stmt)
        course_models = result.scalars().all()
        
        return [self._model_to_entity(model) for model in course_models]

    async def get_all(self) -> List[Course]:
        stmt = (
            select(CourseModel)
            .options(
                selectinload(CourseModel.concepts).selectinload(ConceptModel.comments),
                selectinload(CourseModel.connections)
            )
        )
        result = await self._session.execute(stmt)
        course_models = result.scalars().all()
        
        return [self._model_to_entity(model) for model in course_models]

    async def delete(self, course_id: CourseId) -> bool:
        course_model = await self._session.get(CourseModel, course_id.value)
        if not course_model:
            return False
        
        await self._session.delete(course_model)
        await self._session.commit()
        return True

    async def update_status(self, course_id: CourseId, status: str) -> bool:
        course_model = await self._session.get(CourseModel, course_id.value)
        if not course_model:
            return False
        
        course_model.status = status
        await self._session.commit()
        return True

    def _model_to_entity(self, model: CourseModel) -> Course:
        # Convert concepts
        concepts = []
        for concept_model in model.concepts:
            comments = [
                ConceptComment(
                    id=str(comment.id),
                    concept_id=ConceptId.from_string(str(concept_model.id)),
                    text=comment.text,
                    author_id=str(comment.author_id),
                    created_at=comment.created_at
                )
                for comment in concept_model.comments
            ]
            
            concept = Concept(
                id=ConceptId.from_string(str(concept_model.id)),
                course_id=CourseId.from_string(str(model.id)),
                title=concept_model.title,
                description=concept_model.description,
                bloom_level=concept_model.bloom_level.value,
                position=Position(concept_model.position_x, concept_model.position_y),
                progress=concept_model.progress,
                comments=comments,
                created_at=concept_model.created_at,
                updated_at=concept_model.updated_at
            )
            concepts.append(concept)

        # Convert connections
        connections = [
            ConceptConnection(
                id=conn.id,
                source_id=ConceptId.from_string(str(conn.source_id)),
                target_id=ConceptId.from_string(str(conn.target_id)),
                connection_type=conn.connection_type.value,
                strength=conn.strength,
                created_at=conn.created_at
            )
            for conn in model.connections
        ]

        course = Course(
            id=CourseId.from_string(str(model.id)),
            title=model.title,
            description=model.description,
            difficulty=model.difficulty,
            created_by=UserId.from_string(str(model.created_by)),
            status=model.status.value,
            concepts=concepts,
            connections=connections,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
        
        return course