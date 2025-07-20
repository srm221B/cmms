#!/bin/bash
echo "🚀 Starting CMMS application..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Start the application
echo "📡 Starting FastAPI server..."
gunicorn wsgi:application --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120 