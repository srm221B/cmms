#!/bin/bash
echo "🚀 Starting CMMS build process..."

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi, uvicorn, gunicorn; print('✅ All dependencies installed successfully')"

# Create static directory if it doesn't exist
mkdir -p static

# Test the app import
echo "🧪 Testing app import..."
python -c "import app.main; print('✅ App imports successfully')"

echo "✅ Build completed successfully!" 