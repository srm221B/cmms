#!/bin/bash

echo "🚀 Building CMMS for Railway..."

# Build frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build

# Copy to backend
echo "📋 Copying to backend..."
cd ../backend
mkdir -p static
cp -r ../frontend/build/* static/

echo "✅ Build complete!" 