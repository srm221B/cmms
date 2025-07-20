# WSGI entry point for Render deployment
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    # Import the FastAPI app
    from app.main import app
    application = app
except ImportError as e:
    print(f"Error importing app: {e}")
    # Create a simple fallback app
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def root():
        return {"message": "CMMS API - Import Error", "error": str(e)}
    
    application = app 