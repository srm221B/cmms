#!/bin/bash
echo "🚀 Starting CMMS build process..."

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create static directory if it doesn't exist
mkdir -p static

# Copy frontend build to static directory (if frontend is built)
if [ -d "../frontend/build" ]; then
    echo "📁 Copying frontend build to static directory..."
    cp -r ../frontend/build/* static/
else
    echo "⚠️  Frontend build not found, creating fallback..."
    echo "<!DOCTYPE html><html><head><title>CMMS API</title></head><body><h1>CMMS API is running!</h1><p>Frontend not built. Check <a href='/api'>/api</a> for endpoints.</p></body></html>" > static/index.html
fi

echo "✅ Build completed successfully!" 