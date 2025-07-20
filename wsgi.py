# WSGI entry point for Render deployment
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app
from app.main import app

# Create WSGI application
application = app 