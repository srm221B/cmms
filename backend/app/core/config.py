# app/core/config.py
import os

class Settings:
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./cmms.db")
    
    # CORS
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # API
    api_v1_prefix: str = "/api/v1"

settings = Settings()
