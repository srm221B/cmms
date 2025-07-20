#!/bin/bash
# User data script for EC2 instance - automatically deploys CMMS

echo "🚀 Starting CMMS deployment on EC2..."

# Update system
yum update -y

# Install dependencies
yum install python3 python3-pip git -y

# Clone repository
cd /home/ec2-user
git clone https://github.com/srm221B/cmms.git
cd cmms

# Install Python dependencies
pip3 install -r requirements-minimal.txt

# Create environment file
cat > .env << EOF
DATABASE_URL=sqlite:///./cmms.db
CORS_ORIGINS=http://localhost:3000,http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
SECRET_KEY=$(openssl rand -hex 32)
EOF

# Create systemd service
cat > /tmp/cmms.service << EOF
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

# Install service
cp /tmp/cmms.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cmms
systemctl start cmms

# Create a simple status page
cat > /home/ec2-user/cmms-status.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>CMMS Deployment Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .status { padding: 20px; border-radius: 10px; margin: 20px 0; }
        .success { background: #d4edda; color: #155724; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>🏭 CMMS Deployment Status</h1>
    <div class="status success">
        <h2>✅ Deployment Complete!</h2>
        <p>Your CMMS application has been successfully deployed on AWS EC2.</p>
    </div>
    <div class="status info">
        <h3>📋 Access URLs:</h3>
        <ul>
            <li><strong>Main App:</strong> <a href="/">http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/</a></li>
            <li><strong>API Docs:</strong> <a href="/docs">http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/docs</a></li>
            <li><strong>Health Check:</strong> <a href="/health">http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/health</a></li>
        </ul>
    </div>
    <div class="status info">
        <h3>🔧 Management Commands:</h3>
        <ul>
            <li><code>sudo systemctl status cmms</code> - Check service status</li>
            <li><code>sudo journalctl -u cmms -f</code> - View logs</li>
            <li><code>sudo systemctl restart cmms</code> - Restart service</li>
        </ul>
    </div>
</body>
</html>
EOF

echo "✅ CMMS deployment completed!"
echo "🌐 Your CMMS is available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" 