from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ...infrastructure.config import get_settings


def setup_cors(app: FastAPI) -> None:
    settings = get_settings()
    
    # Convert comma-separated string to list
    cors_origins = [origin.strip() for origin in settings.cors_origins.split(",")]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )