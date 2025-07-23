#!/bin/bash

# CMMS Production Deployment Script for DigitalOcean VM
# This script sets up the database and deploys the application

set -e  # Exit on any error

echo "=== CMMS Production Deployment Script ==="
echo "Setting up database and deploying to DigitalOcean VM"
echo ""

# Check if VM IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your VM IP address"
    echo "Usage: ./deploy_production.sclearh YOUR_VM_IP"
    echo "Example: ./deploy_production.sh 52.23.45.67"
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

# Create production environment file
cat > /tmp/cmms-deploy/backend/.env << EOF
DATABASE_URL=sqlite:///./cmms.db
SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=http://$VM_IP,http://$VM_IP:3000,http://localhost:3000
DEBUG=false
EOF

echo "🚀 Uploading to VM at $VM_IP..."

# Upload the deployment directory
scp -i "$KEY_FILE" -r /tmp/cmms-deploy/* root@$VM_IP:/root/cmms/

echo "🔧 Setting up on VM..."

# SSH into VM and set up the application
ssh -i "$KEY_FILE" root@$VM_IP << EOF
cd /root/cmms

# Update system packages
echo "📦 Updating system packages..."
sudo apt update -y

# Install system dependencies if not already installed
echo "🔧 Installing system dependencies..."
sudo apt install -y python3 python3-pip python3-venv python3-dev build-essential sqlite3 git curl nginx supervisor

# Set up Python virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
cd backend
source ../venv/bin/activate
python3 -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"

# Create systemd service for production
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/cmms.service > /dev/null << 'SERVICEEOF'
[Unit]
Description=CMMS Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/cmms/backend
Environment=PATH=/root/cmms/venv/bin
ExecStart=/root/cmms/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Enable and start service
echo "🚀 Starting CMMS service..."
sudo systemctl daemon-reload
sudo systemctl enable cmms
sudo systemctl start cmms

# Wait a moment for service to start
sleep 5

# Check service status
echo "📊 Service status:"
sudo systemctl status cmms --no-pager -l

# Create nginx configuration for reverse proxy
echo "🌐 Setting up nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/cmms > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name $VM_IP;

    # Frontend static files
    location / {
        root /root/cmms/backend/static;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/api/health;
        proxy_set_header Host \$host;
    }
}
NGINXEOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/cmms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ Setup complete!"
echo ""
echo "🌐 Your CMMS application is now available at:"
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

# Clean up
rm -rf /tmp/cmms-deploy

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "🌐 Your CMMS application is now running at:"
echo "   http://$VM_IP"
echo ""
echo "📊 To check the status, SSH into your VM:"
echo "   ssh -i $KEY_FILE root@$VM_IP"
echo ""
echo "📝 Useful commands:"
echo "   View application logs: sudo journalctl -u cmms -f"
echo "   Restart application: sudo systemctl restart cmms"
echo "   Check nginx status: sudo systemctl status nginx"
echo "   View nginx logs: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔧 Database location: /home/ubuntu/cmms/backend/cmms.db"
echo "📁 Application directory: /home/ubuntu/cmms/" 