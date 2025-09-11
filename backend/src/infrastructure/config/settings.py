from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    app_name: str = "Educational AI Platform"
    app_version: str = "0.1.0"
    debug: bool = False
    secret_key: str = "your-secret-key-change-in-production"
    allowed_hosts: str = "localhost,127.0.0.1"
    
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/educational_ai"
    database_url_sync: str = "postgresql://user:password@localhost:5432/educational_ai"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # File Upload
    max_file_size_mb: int = 20
    upload_dir: str = "./uploads"
    allowed_file_types: str = ".pdf,.docx,.txt,.md"
    
    # AI Services
    openai_api_key: str = ""
    spacy_model: str = "ru_core_news_sm"
    
    # Background Processing
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/1"
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # Security
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()