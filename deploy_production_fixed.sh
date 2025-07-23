#!/bin/bash

# CMMS Production Deployment Script for DigitalOcean VM
# This script sets up the database and deploys the application with comprehensive error handling

set -e  # Exit on any error

echo "=== CMMS Production Deployment Script (Fixed) ==="
echo "Setting up database and deploying to DigitalOcean VM"
echo ""

# Check if VM IP is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your VM IP address"
    echo "Usage: ./deploy_production_fixed.sh YOUR_VM_IP"
    echo "Example: ./deploy_production_fixed.sh 52.23.45.67"
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

# Create production environment file with proper configuration
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

# SSH into VM and set up the application with comprehensive error handling
ssh -i "$KEY_FILE" root@$VM_IP << 'EOF'
set -e  # Exit on any error

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

# Navigate to backend directory
cd backend

# Activate virtual environment
source ../venv/bin/activate

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVEOF'
DATABASE_URL=sqlite:///./cmms.db
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEBUG=false
ENVEOF
fi

# Initialize database with proper error handling
echo "🗄️ Initializing database..."
python3 -c "
import sys
import os
sys.path.append(os.getcwd())

try:
    from app.db.base import Base
    from app.db.session import engine
    
    # Drop all tables first to ensure clean state
    Base.metadata.drop_all(bind=engine)
    print('✅ Dropped existing tables')
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print('✅ Database tables created successfully')
    
    # Test database connection
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('✅ Database connection test successful')
        
except Exception as e:
    print(f'❌ Database initialization failed: {e}')
    sys.exit(1)
"

# Create initial data
echo "📝 Creating initial data..."
python3 -c "
import sys
import os
sys.path.append(os.getcwd())

try:
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.role import Role
    from app.core.auth import get_password_hash
    
    db = SessionLocal()
    
    # Create admin role
    admin_role = db.query(Role).filter(Role.name == 'admin').first()
    if not admin_role:
        admin_role = Role(name='admin', description='Administrator')
        db.add(admin_role)
        db.commit()
        print('✅ Admin role created')
    
    # Create admin user
    admin_user = db.query(User).filter(User.email == 'admin@cmms.com').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@cmms.com',
            hashed_password=get_password_hash('admin123'),
            full_name='System Administrator',
            is_active=True,
            is_superuser=True
        )
        db.add(admin_user)
        db.commit()
        print('✅ Admin user created (email: admin@cmms.com, password: admin123)')
    
    # Create user role
    user_role = db.query(Role).filter(Role.name == 'user').first()
    if not user_role:
        user_role = Role(name='user', description='Regular User')
        db.add(user_role)
        db.commit()
        print('✅ User role created')
    
    db.close()
    print('✅ Initial data created successfully')
    
except Exception as e:
    print(f'❌ Initial data creation failed: {e}')
    sys.exit(1)
"

# Test the application
echo "🧪 Testing application..."
python3 -c "
import sys
import os
sys.path.append(os.getcwd())

try:
    from app.main import app
    print('✅ FastAPI app created successfully')
    
    # Test database connection
    from app.db.session import SessionLocal
    db = SessionLocal()
    db.close()
    print('✅ Database session test successful')
    
except Exception as e:
    print(f'❌ Application test failed: {e}')
    sys.exit(1)
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
Environment=PYTHONPATH=/root/cmms/backend
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
sleep 10

# Check service status
echo "📊 Service status:"
sudo systemctl status cmms --no-pager -l

# Check if service is running
if sudo systemctl is-active --quiet cmms; then
    echo "✅ CMMS service is running"
else
    echo "❌ CMMS service failed to start"
    echo "Checking logs..."
    sudo journalctl -u cmms --no-pager -l
    exit 1
fi

# Create nginx configuration for reverse proxy
echo "🌐 Setting up nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/cmms > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Frontend static files
    location / {
        root /root/cmms/backend/static;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for API calls
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/api/health;
        proxy_set_header Host $host;
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

# Test the application
echo "🧪 Testing application endpoints..."
sleep 5

# Test health endpoint
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
fi

# Test nginx proxy
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx proxy working"
else
    echo "❌ Nginx proxy failed"
fi

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
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@cmms.com"
echo "   Password: admin123"
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
echo "🔐 Admin credentials:"
echo "   Email: admin@cmms.com"
echo "   Password: admin123"
echo ""
echo "🔧 Database location: /root/cmms/backend/cmms.db"
echo "📁 Application directory: /root/cmms/" 