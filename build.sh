#!/bin/bash

echo "🚀 Building CMMS for Railway deployment..."

# Build frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build

# Copy built frontend to backend static folder
echo "📁 Copying frontend to backend..."
mkdir -p ../backend/static
cp -r build/* ../backend/static/

# Install backend dependencies
echo "🐍 Installing Python dependencies..."
cd ../backend
pip install -r requirements.txt

echo "✅ Build complete! Ready for deployment." 