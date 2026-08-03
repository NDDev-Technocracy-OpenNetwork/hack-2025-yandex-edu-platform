from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # OpenAI
    OPENAI_API_KEY: str
    MODEL: str = "gpt-5-mini"
    MAX_CONTEXT: int = 75000  # Increased 3x for complex graph building with GPT-4o-mini
    MAX_TOKENS: int = 24000   # Increased 3x (8000 → 24000) for complex graph responses
    TEMPERATURE_GRAPH: float = 0.6
    TEMPERATURE_CONTENT: float = 0.5
    REASONING_EFFORT: str = "medium"
    VERBOSITY_GRAPH: str = "medium"
    VERBOSITY_CONTENT: str = "high"
    
    # Security
    # SECRET_KEY is intentionally required (no default): the app must fail fast at
    # startup if it is not provided via the SECRET_KEY env var / .env file, rather
    # than silently falling back to an insecure hardcoded value.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File uploads
    MAX_FILE_SIZE_MB: int = 500  # Увеличено для загрузки больших книг и документов
    UPLOAD_DIR: str = "/app/uploads"
    ALLOWED_FILE_TYPES: str = ".pdf,.docx,.pptx,.md,.txt,.csv,.xlsx"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000"
    
    # Application
    APP_NAME: str = "ВыготскийГраф API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @property
    def allowed_file_extensions(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_FILE_TYPES.split(",")]
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = "../../.env"  # .env файл в корневой папке проекта
        env_file_encoding = 'utf-8'
        extra = 'ignore'  # Ignore extra fields from .env

settings = Settings()