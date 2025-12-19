from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Google AI Studio
    google_api_key: str = ""

    # Storage
    upload_dir: Path = Path("./uploads")
    processed_dir: Path = Path("./processed")

    # File limits
    max_file_size_mb: int = 100

    # Redis (optional)
    redis_url: Optional[str] = None

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes"""
        return self.max_file_size_mb * 1024 * 1024


# Global settings instance
settings = Settings()
