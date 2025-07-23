# app/core/config.py
"""
Configuration settings for the CMMS application.
Optimized for local development with SQLite database.
"""
import os
from typing import List

class Settings:
    # Database Configuration
    # Use SQLite for local development - simple and no setup required
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./cmms.db")
    
    # CORS Configuration
    # Allow localhost for development - add production domains when deploying
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
    
    # Security Configuration
    # Change this in production - use a strong, random secret key
    secret_key: str = os.getenv("SECRET_KEY", "cmms-dev-secret-key-change-in-production")
    
    # JWT Configuration
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # API Configuration
    api_v1_prefix: str = "/api"
    
    # Application Configuration
    app_name: str = "CMMS API"
    app_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database Configuration
    echo_sql: bool = debug  # Log SQL queries in debug mode
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list for FastAPI"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

# Global settings instance
settings = Settings()
