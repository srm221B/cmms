#!/usr/bin/env python3
"""
Railway startup script for CMMS application
Ensures proper configuration and static file handling
"""
import os
import sys
import uvicorn
from pathlib import Path

def setup_railway_environment():
    """Setup environment for Railway deployment"""
    # Ensure we're in the correct directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Add the backend directory to Python path
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    # Ensure static directory exists
    static_dir = backend_dir / "static"
    if not static_dir.exists():
        print(f"Warning: Static directory not found at {static_dir}")
        static_dir.mkdir(exist_ok=True)
    
    # Check if index.html exists
    index_file = static_dir / "index.html"
    if not index_file.exists():
        print(f"Warning: index.html not found at {index_file}")
        # Create a basic fallback index.html
        with open(index_file, 'w') as f:
            f.write("""<!DOCTYPE html>
<html><head><title>CMMS API</title></head>
<body><h1>CMMS API is Running!</h1>
<p>Visit <a href="/docs">/docs</a> for API documentation</p>
</body></html>""")
    
    print(f"✅ Railway environment setup complete")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"📄 Static files: {static_dir}")
    print(f"🌐 Index file exists: {index_file.exists()}")

if __name__ == "__main__":
    setup_railway_environment()
    
    # Get port from environment (Railway sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting CMMS API on port {port}")
    
    # Start the FastAPI application
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
