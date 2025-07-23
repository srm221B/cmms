# CMMS 500 Internal Server Error - Troubleshooting Guide

## 🔍 Quick Diagnosis

If you're experiencing a 500 Internal Server Error, follow these steps in order:

### 1. Run the Diagnostic Script
```bash
cd backend
python3 diagnose_server.py
```

### 2. Run the Fix Script
```bash
cd backend
python3 fix_server_issues.py
```

### 3. Fix Railway Frontend Issue (if frontend shows Railway instead of CMMS)
```bash
./fix_railway_frontend.sh YOUR_VM_IP
```

### 3. Check Service Status
```bash
# On the VM
sudo systemctl status cmms
sudo journalctl -u cmms -f
```

## 🚨 Common Causes and Solutions

### 0. Railway Frontend Issue

**Symptoms:**
- Frontend shows Railway custom-made frontend instead of CMMS application
- Wrong React app being served
- Frontend doesn't match your CMMS application

**Solutions:**
```bash
# Use the comprehensive fix script
./fix_railway_frontend.sh YOUR_VM_IP

# Or manually:
# 1. Build correct frontend
cd frontend
npm run build

# 2. Update backend static files
rm -rf ../backend/static
cp -r build ../backend/static

# 3. Commit and push to Git
git add backend/static/
git commit -m "Fix: Replace Railway frontend with correct CMMS frontend"
git push origin main

# 4. Update VM
ssh -i ~/.ssh/cmms-digitalocean-key root@YOUR_VM_IP
cd /root/cmms
git pull origin main
sudo systemctl restart cmms
```

### 1. Database Issues

**Symptoms:**
- 500 error on API endpoints
- Database connection errors in logs
- Missing database file

**Solutions:**
```bash
# Reinitialize database
cd backend
source ../venv/bin/activate
python3 -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print('Database reinitialized')
"
```

### 2. Model Import Issues

**Symptoms:**
- Import errors in logs
- Missing model attributes
- SQLAlchemy errors

**Solutions:**
```bash
# Check model imports
cd backend
python3 -c "
from app.models.user import User
from app.models.role import Role
from app.models.asset import Asset
print('Models imported successfully')
"
```

### 3. Environment Configuration

**Symptoms:**
- Missing environment variables
- Incorrect database URL
- CORS issues

**Solutions:**
```bash
# Create proper .env file
cat > backend/.env << EOF
DATABASE_URL=sqlite:///./cmms.db
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEBUG=true
EOF
```

### 4. Dependencies Issues

**Symptoms:**
- Import errors for packages
- Missing Python packages

**Solutions:**
```bash
# Reinstall dependencies
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
```

### 5. File Permissions

**Symptoms:**
- Permission denied errors
- Database file not writable

**Solutions:**
```bash
# Fix permissions
sudo chown -R $USER:$USER /root/cmms
chmod 644 backend/cmms.db
chmod 644 backend/.env
```

## 🔧 Production Deployment Fixes

### 1. Use the Fixed Deployment Script
```bash
./deploy_production_fixed.sh YOUR_VM_IP
```

### 2. Manual Database Reset
```bash
# SSH into VM
ssh -i ~/.ssh/cmms-digitalocean-key root@YOUR_VM_IP

# Navigate to application
cd /root/cmms/backend

# Activate virtual environment
source ../venv/bin/activate

# Reset database
python3 -c "
import sys
import os
sys.path.append(os.getcwd())

from app.db.base import Base
from app.db.session import engine

# Drop and recreate all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print('Database reset complete')
"

# Restart service
sudo systemctl restart cmms
```

### 3. Check Service Logs
```bash
# View real-time logs
sudo journalctl -u cmms -f

# View recent logs
sudo journalctl -u cmms --no-pager -l

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🧪 Testing Steps

### 1. Test Database Connection
```bash
cd backend
python3 -c "
from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('Database connection successful')
"
```

### 2. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test root endpoint
curl http://localhost:8000/

# Test nginx proxy
curl http://YOUR_VM_IP/health
```

### 3. Test Application Startup
```bash
cd backend
python3 -c "
from app.main import app
print('FastAPI app created successfully')
"
```

## 📋 Complete Reset Procedure

If all else fails, perform a complete reset:

### 1. Stop Services
```bash
sudo systemctl stop cmms
sudo systemctl stop nginx
```

### 2. Backup and Reset
```bash
cd /root/cmms
cp backend/cmms.db backend/cmms.db.backup.$(date +%Y%m%d_%H%M%S)
rm -f backend/cmms.db
```

### 3. Reinitialize
```bash
cd backend
source ../venv/bin/activate

# Create .env
cat > .env << EOF
DATABASE_URL=sqlite:///./cmms.db
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEBUG=false
EOF

# Initialize database
python3 -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('Database initialized')
"

# Create initial data
python3 -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.auth import get_password_hash

db = SessionLocal()

# Create admin role
admin_role = Role(name='admin', description='Administrator')
db.add(admin_role)
db.commit()

# Create admin user
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

db.close()
print('Initial data created')
"
```

### 4. Restart Services
```bash
sudo systemctl start cmms
sudo systemctl start nginx
sudo systemctl status cmms
```

## 🔍 Debugging Commands

### Check Application Status
```bash
# Service status
sudo systemctl status cmms

# Process status
ps aux | grep uvicorn

# Port usage
sudo netstat -tlnp | grep :8000
```

### Check Database
```bash
# Database file
ls -la backend/cmms.db

# Database size
du -h backend/cmms.db

# Database integrity (SQLite)
sqlite3 backend/cmms.db "PRAGMA integrity_check;"
```

### Check Logs
```bash
# Application logs
sudo journalctl -u cmms --no-pager -l

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo dmesg | tail
```

## 🚀 Prevention Tips

1. **Always use the fixed deployment script** for production deployments
2. **Test locally** before deploying to production
3. **Monitor logs** regularly for early warning signs
4. **Backup database** before making changes
5. **Use proper environment variables** in production
6. **Check file permissions** after deployment

## 📞 Getting Help

If you're still experiencing issues:

1. Run the diagnostic script and share the output
2. Check the service logs for specific error messages
3. Verify your VM IP and SSH key configuration
4. Ensure all dependencies are properly installed
5. Test the application locally before deploying

## 🔐 Admin Access

Default admin credentials:
- **Email:** admin@cmms.com
- **Password:** admin123

These are created automatically during the deployment process. 