#!/bin/bash

# CMMS Deployment Script
# This script builds the frontend locally and uploads to VM

set -e  # Exit on any error

echo "=== CMMS Deployment Script ==="
echo "Building frontend locally and deploying to VM"
echo ""

# Check if VM IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your VM IP address"
    echo "Usage: ./deploy_to_vm.sh YOUR_VM_IP"
    echo "Example: ./deploy_to_vm.sh 52.23.45.67"
    exit 1
fi

VM_IP=$1
KEY_FILE="$HOME/.ssh/cmms-key.pem"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file $KEY_FILE not found"
    echo "Make sure your SSH key is in the current directory"
    exit 1
fi

echo "🔧 Building frontend locally..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

# Build the frontend
echo "🏗️ Building frontend for production..."
npm run build

cd ..

echo "📁 Preparing files for upload..."

# Create a temporary deployment directory
rm -rf /tmp/cmms-deploy
mkdir -p /tmp/cmms-deploy

# Copy backend files
cp -r backend /tmp/cmms-deploy/

# Copy built frontend to backend/static
mkdir -p /tmp/cmms-deploy/backend/static
cp -r frontend/build/* /tmp/cmms-deploy/backend/static/

# Copy environment file
cp .env /tmp/cmms-deploy/backend/

echo "🚀 Uploading to VM at $VM_IP..."

# Upload the deployment directory
scp -i "$KEY_FILE" -r /tmp/cmms-deploy/* ubuntu@$VM_IP:/home/ubuntu/cmms/

echo "🔧 Setting up on VM..."

# SSH into VM and start the application
ssh -i "$KEY_FILE" ubuntu@$VM_IP << 'EOF'
cd /home/ubuntu/cmms/backend
source ../venv/bin/activate

# Initialize database if needed
python3 -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"

# Start the application
echo "Starting CMMS application..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
EOF

# Clean up
rm -rf /tmp/cmms-deploy

echo ""
echo "✅ Deployment complete!"
echo "Your CMMS application should now be running at:"
echo "http://$VM_IP:8000"
echo ""
echo "To check the status, SSH into your VM:"
echo "ssh -i $KEY_FILE ubuntu@$VM_IP"
echo ""
echo "To view logs:"
echo "cd /home/ubuntu/cmms/backend && source ../venv/bin/activate" 