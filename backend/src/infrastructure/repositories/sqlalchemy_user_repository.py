from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...domain.entities import User
from ...domain.repositories import UserRepository
from ...domain.value_objects import UserId
from ..database.models import UserModel


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def save(self, user: User) -> User:
        user_model = UserModel(
            id=user.id.value,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
        # Check if user exists
        existing = await self._session.get(UserModel, user.id.value)
        if existing:
            existing.name = user.name
            existing.email = user.email
            existing.role = user.role
            existing.updated_at = user.updated_at
        else:
            self._session.add(user_model)
        
        await self._session.commit()
        return user

    async def get_by_id(self, user_id: UserId) -> Optional[User]:
        user_model = await self._session.get(UserModel, user_id.value)
        if not user_model:
            return None
        
        return self._model_to_entity(user_model)

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self._session.execute(stmt)
        user_model = result.scalar_one_or_none()
        
        if not user_model:
            return None
        
        return self._model_to_entity(user_model)

    async def get_all(self) -> List[User]:
        stmt = select(UserModel)
        result = await self._session.execute(stmt)
        user_models = result.scalars().all()
        
        return [self._model_to_entity(model) for model in user_models]

    async def delete(self, user_id: UserId) -> bool:
        user_model = await self._session.get(UserModel, user_id.value)
        if not user_model:
            return False
        
        await self._session.delete(user_model)
        await self._session.commit()
        return True

    async def exists_by_email(self, email: str) -> bool:
        stmt = select(UserModel.id).where(UserModel.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    def _model_to_entity(self, model: UserModel) -> User:
        return User(
            id=UserId.from_string(str(model.id)),
            name=model.name,
            email=model.email,
            role=model.role.value,
            created_at=model.created_at,
            updated_at=model.updated_at
        )