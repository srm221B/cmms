#!/bin/bash

echo "🚀 AWS CMMS Deployment Script"
echo "=============================="

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ]; then
    echo "❌ This script should be run on an EC2 instance"
    exit 1
fi

echo "✅ Running on EC2 instance"

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install dependencies
echo "🐍 Installing Python and dependencies..."
sudo yum install python3 python3-pip git -y

# Clone repository
echo "📥 Cloning CMMS repository..."
if [ ! -d "cmms" ]; then
    git clone https://github.com/srm221B/cmms.git
fi
cd cmms

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements-minimal.txt

# Create environment file
echo "🔧 Setting up environment variables..."
cat > .env << EOF
DATABASE_URL=sqlite:///./cmms.db
CORS_ORIGINS=http://localhost:3000,http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
SECRET_KEY=$(openssl rand -hex 32)
EOF

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/cmms.service << EOF
[Unit]
Description=CMMS FastAPI Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/cmms
Environment=PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/ec2-user/.local/bin/uvicorn app.main:app --host 0.0.0.0 --port 80
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start the service
echo "🚀 Starting CMMS service..."
sudo systemctl daemon-reload
sudo systemctl enable cmms
sudo systemctl start cmms

# Check status
echo "📊 Checking service status..."
sudo systemctl status cmms --no-pager

# Test the application
echo "🧪 Testing application..."
sleep 5
curl -s http://localhost/health || echo "⚠️  Application not responding yet, check logs with: sudo journalctl -u cmms -f"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your CMMS is available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📚 API docs: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/docs"
echo ""
echo "📋 Useful commands:"
echo "  Check status: sudo systemctl status cmms"
echo "  View logs: sudo journalctl -u cmms -f"
echo "  Restart: sudo systemctl restart cmms"
echo "  Stop: sudo systemctl stop cmms" 