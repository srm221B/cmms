#!/bin/bash

echo "🚀 Starting CMMS application..."

# Initialize database if it doesn't exist
if [ ! -f "./app/cmms.db" ]; then
    echo "🗄️  Initializing database..."
    python init_db.py
else
    echo "✅ Database already exists"
fi

# Start the FastAPI server
echo "🌐 Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 