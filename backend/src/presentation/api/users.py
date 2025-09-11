from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...domain.entities import User
from ...domain.repositories import UserRepository
from ...application.dto import CreateUserRequest, UserResponse
from ..schemas import CreateUserSchema, UserSchema
from ..dependencies import get_user_repository

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserSchema)
async def create_user(
    user_data: CreateUserSchema,
    user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        # Check if user already exists
        existing_user = await user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create user entity
        if user_data.role == "teacher":
            user = User.create_teacher(user_data.name, user_data.email)
        else:
            user = User.create_student(user_data.name, user_data.email)
        
        # Save user
        saved_user = await user_repo.save(user)
        
        # Convert to response
        user_response = UserResponse.from_entity(saved_user)
        return UserSchema(**user_response.__dict__)
    
    except Exception as e:
        if "already exists" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[UserSchema])
async def get_all_users(
    user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        users = await user_repo.get_all()
        user_responses = [UserResponse.from_entity(user) for user in users]
        return [UserSchema(**response.__dict__) for response in user_responses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{user_id}", response_model=UserSchema)
async def get_user_by_id(
    user_id: str,
    user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        from ...domain.value_objects import UserId
        user_id_obj = UserId.from_string(user_id)
        user = await user_repo.get_by_id(user_id_obj)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_response = UserResponse.from_entity(user)
        return UserSchema(**user_response.__dict__)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        if "not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/email/{email}", response_model=UserSchema)
async def get_user_by_email(
    email: str,
    user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        user = await user_repo.get_by_email(email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_response = UserResponse.from_entity(user)
        return UserSchema(**user_response.__dict__)
    except Exception as e:
        if "not found" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")