from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.infrastructure.config import get_settings
from src.presentation.api import courses_router, users_router, files_router
from src.presentation.middleware import setup_cors, setup_error_handling
from src.presentation.dependencies import get_database_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = get_settings()
    
    # Initialize database
    db_connection = await get_database_connection()
    await db_connection.create_tables()
    
    yield
    
    # Shutdown
    await db_connection.close()


def create_app() -> FastAPI:
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan
    )
    
    # Setup middleware
    setup_cors(app)
    setup_error_handling(app)
    
    # Include routers
    app.include_router(courses_router, prefix=settings.api_v1_prefix)
    app.include_router(users_router, prefix=settings.api_v1_prefix)
    app.include_router(files_router, prefix=settings.api_v1_prefix)
    
    @app.get("/")
    async def root():
        return {
            "message": f"Welcome to {settings.app_name}",
            "version": settings.app_version,
            "docs": "/docs"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )