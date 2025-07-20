#!/bin/bash

echo "🚀 Building CMMS for Railway deployment..."

# Install Node.js dependencies and build frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build

# Create static directory in backend
echo "📁 Setting up static files..."
cd ../backend
mkdir -p static

# Copy built frontend to backend static folder
echo "📋 Copying frontend to backend..."
cp -r ../frontend/build/* static/

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

# Create a simple index.html fallback if needed
if [ ! -f "static/index.html" ]; then
    echo "⚠️  No index.html found, creating fallback..."
    cat > static/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>CMMS - Computerized Maintenance Management System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 20px; background: #f0f8ff; border-radius: 8px; margin: 20px 0; }
        .api-link { color: #0066cc; text-decoration: none; }
        .api-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏭 CMMS System</h1>
        <div class="status">
            <h2>✅ Backend API is Running</h2>
            <p>Your CMMS backend is successfully deployed on Railway!</p>
        </div>
        <div class="status">
            <h3>🔗 API Endpoints:</h3>
            <p><a href="/api" class="api-link">API Root</a></p>
            <p><a href="/health" class="api-link">Health Check</a></p>
            <p><a href="/docs" class="api-link">API Documentation</a></p>
        </div>
        <div class="status">
            <h3>📊 Available Modules:</h3>
            <p>• Assets Management</p>
            <p>• Work Orders</p>
            <p>• Inventory Management</p>
            <p>• User Management</p>
        </div>
    </div>
</body>
</html>
EOF
fi

echo "✅ Build complete! Ready for deployment." 