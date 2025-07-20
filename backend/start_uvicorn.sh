#!/bin/bash
echo "🚀 Starting CMMS with uvicorn..."

# Change to the backend directory
cd backend

# Install dependencies if not already installed
pip install -r requirements.txt

# Start the application with uvicorn
echo "📡 Starting FastAPI server with uvicorn..."
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT 