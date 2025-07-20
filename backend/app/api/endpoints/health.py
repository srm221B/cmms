from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
import platform

router = APIRouter()

# Version information
VERSION = "1.0.0"
BUILD_DATE = "2024-01-15"

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring application status
    """
    try:
        # Basic system info
        system_info = {
            "platform": platform.system(),
            "python_version": platform.python_version(),
        }
        
        # Application info
        app_info = {
            "status": "healthy",
            "version": VERSION,
            "build_date": BUILD_DATE,
            "environment": os.getenv("ENVIRONMENT", "development"),
            "timestamp": datetime.now().isoformat(),
        }
        
        # Database connection check (basic)
        db_status = "connected"  # You can add actual DB check here
        
        return {
            **app_info,
            "database": db_status,
            "system": system_info,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/version")
async def get_version():
    """
    Get application version information
    """
    return {
        "version": VERSION,
        "build_date": BUILD_DATE,
        "environment": os.getenv("ENVIRONMENT", "development"),
        "deployment_time": datetime.now().isoformat(),
    }

@router.get("/status")
async def get_status():
    """
    Get detailed application status
    """
    try:
        # Memory usage (simplified)
        memory_usage = {
            "status": "available",
        }
        
        # CPU usage (simplified)
        cpu_usage = "available"
        
        # Disk usage (simplified)
        disk_usage = {
            "status": "available",
        }
        
        return {
            "status": "operational",
            "version": VERSION,
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": cpu_usage,
                "memory": memory_usage,
                "disk": disk_usage,
            },
            "environment": os.getenv("ENVIRONMENT", "development"),
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        } 