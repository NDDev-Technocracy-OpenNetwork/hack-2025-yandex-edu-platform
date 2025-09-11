from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_FILE_TYPES: str = "pdf,docx,pptx,md,txt,csv,xlsx"

    @property
    def allowed_file_extensions(self) -> List[str]:
        return [f".{ext}" for ext in self.ALLOWED_FILE_TYPES.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()