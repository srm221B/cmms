from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
import psutil
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
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "memory_available": psutil.virtual_memory().available,
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
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = {
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent,
            "used": memory.used,
        }
        
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent,
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