#!/usr/bin/env python3
"""
Simple startup script without reload for testing
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting CMMS FastAPI server (simple mode)...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/api/health")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    ) 