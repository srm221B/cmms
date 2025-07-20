#!/bin/bash
echo "🚀 Starting CMMS application..."

# Change to the backend directory
cd backend

# Install dependencies if not already installed
pip install -r requirements.txt

# Start the application with gunicorn
echo "📡 Starting FastAPI server with gunicorn..."
gunicorn app.main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120 