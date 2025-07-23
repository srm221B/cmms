#!/usr/bin/env python3
"""
Simple startup script for the CMMS FastAPI application
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting CMMS FastAPI server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/api/health")
    print("📚 API docs: http://localhost:8000/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 