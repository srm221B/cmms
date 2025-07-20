#!/bin/bash
echo "🚀 Starting CMMS build process..."

# Navigate to backend directory
cd backend

# Install Python dependencies with pre-compiled wheels
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install --only-binary=all -r requirements.txt

# If the above fails, try without binary restriction
if [ $? -ne 0 ]; then
    echo "⚠️  Binary installation failed, trying without restrictions..."
    pip install -r requirements.txt
fi

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi, uvicorn, gunicorn; print('✅ All dependencies installed successfully')"

# Create static directory if it doesn't exist
mkdir -p static

# Test the app import
echo "🧪 Testing app import..."
python -c "import app.main; print('✅ App imports successfully')"

echo "✅ Build completed successfully!" 