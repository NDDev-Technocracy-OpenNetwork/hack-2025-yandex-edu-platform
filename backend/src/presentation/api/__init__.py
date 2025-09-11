from .courses import router as courses_router
from .users import router as users_router
from .files import router as files_router

__all__ = ["courses_router", "users_router", "files_router"]