#!/bin/bash

echo "🚀 CMMS EC2 Instance Setup"
echo "=========================="

# Update system
yum update -y

# Install Python 3.11 and pip
yum install -y python3.11 python3.11-pip

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PostgreSQL client
yum install -y postgresql15

# Install nginx
yum install -y nginx

# Install git
yum install -y git

# Create application directory
mkdir -p /opt/cmms
cd /opt/cmms

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/cmms.git .

# Set up Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..

# Create systemd service for backend
cat > /etc/systemd/system/cmms-backend.service << EOF
[Unit]
Description=CMMS Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/cmms/backend
Environment=PATH=/opt/cmms/venv/bin
ExecStart=/opt/cmms/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
cat > /etc/nginx/conf.d/cmms.conf << EOF
server {
    listen 80;
    server_name your-cmms-domain.com;

    # Frontend
    location / {
        root /opt/cmms/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Create environment file
cat > /opt/cmms/backend/.env << EOF
DATABASE_URL=postgresql://cmms_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/cmms
CORS_ORIGINS=https://your-cmms-domain.com
SECRET_KEY=YOUR_SECRET_KEY_HERE
EOF

# Set up SSL with Let's Encrypt
yum install -y certbot python3-certbot-nginx

# Start services
systemctl enable nginx
systemctl start nginx
systemctl enable cmms-backend
systemctl start cmms-backend

# Set up log rotation
cat > /etc/logrotate.d/cmms << EOF
/opt/cmms/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
}
EOF

echo "✅ EC2 Instance Setup Complete!"
echo ""
echo "🔧 Services Status:"
systemctl status nginx --no-pager
systemctl status cmms-backend --no-pager
echo ""
echo "📋 Next Steps:"
echo "1. Update DATABASE_URL in /opt/cmms/backend/.env"
echo "2. Update CORS_ORIGINS with your domain"
echo "3. Set up SSL certificate: certbot --nginx -d your-cmms-domain.com"
echo "4. Test the application: http://YOUR_EC2_IP" 