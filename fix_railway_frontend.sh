#!/bin/bash

# Fix Railway Frontend Issue Script
# This script fixes the issue where Railway frontend is being served instead of CMMS frontend

set -e  # Exit on any error

echo "=== CMMS Railway Frontend Fix Script ==="
echo "Fixing Railway frontend issue and deploying correct CMMS frontend"
echo ""

# Check if VM IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your VM IP address"
    echo "Usage: ./fix_railway_frontend.sh YOUR_VM_IP"
    echo "Example: ./fix_railway_frontend.sh 52.23.45.67"
    exit 1
fi

VM_IP=$1
KEY_FILE="$HOME/.ssh/cmms-digitalocean-key"

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file $KEY_FILE not found"
    echo "Make sure your SSH key is in the correct location"
    exit 1
fi

echo "🔧 Step 1: Building correct CMMS frontend locally..."
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

echo "📁 Step 2: Updating backend static files..."
# Remove old static files and copy new ones
rm -rf backend/static
cp -r frontend/build backend/static

echo "📝 Step 3: Committing changes to Git..."
git add backend/static/
git commit -m "Fix: Replace Railway frontend with correct CMMS frontend" || echo "No changes to commit"

echo "🚀 Step 4: Pushing to Git repository..."
git push origin main

echo "🔄 Step 5: Updating VM deployment..."

# SSH into VM and update the application
ssh -i "$KEY_FILE" root@$VM_IP << 'EOF'
set -e  # Exit on any error

echo "📁 Navigating to application directory..."
cd /root/cmms

echo "🔄 Pulling latest changes from Git..."
git pull origin main

echo "🔧 Restarting CMMS service..."
sudo systemctl restart cmms

echo "⏳ Waiting for service to start..."
sleep 10

echo "📊 Checking service status..."
if sudo systemctl is-active --quiet cmms; then
    echo "✅ CMMS service is running successfully"
else
    echo "❌ CMMS service failed to start"
    echo "Checking logs..."
    sudo journalctl -u cmms --no-pager -l
    exit 1
fi

echo "🧪 Testing application..."
sleep 5

# Test health endpoint
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
fi

# Test frontend
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Frontend serving correctly"
else
    echo "❌ Frontend failed to serve"
fi

# Test nginx proxy
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx proxy working"
else
    echo "❌ Nginx proxy failed"
fi

echo "✅ Railway frontend fix complete!"
echo ""
echo "🌐 Your CMMS application is now fixed at:"
echo "   http://$VM_IP"
echo ""
echo "📊 Service status:"
sudo systemctl status cmms --no-pager -l
echo ""
echo "📝 Useful commands:"
echo "   View logs: sudo journalctl -u cmms -f"
echo "   Restart service: sudo systemctl restart cmms"
echo "   Check nginx: sudo systemctl status nginx"
echo "   View nginx logs: sudo tail -f /var/log/nginx/access.log"
EOF

echo ""
echo "✅ Railway frontend fix complete!"
echo ""
echo "🌐 Your CMMS application is now fixed at:"
echo "   http://$VM_IP"
echo ""
echo "📊 To check the status, SSH into your VM:"
echo "   ssh -i $KEY_FILE root@$VM_IP"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@cmms.com"
echo "   Password: admin123"
echo ""
echo "🔧 What was fixed:"
echo "   - Replaced Railway frontend with correct CMMS frontend"
echo "   - Updated static files in backend/static/"
echo "   - Pushed changes to Git repository"
echo "   - Updated VM deployment"
echo "   - Restarted services" 