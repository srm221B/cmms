# 🔄 Development Workflow Guide

## 🎯 **Safe Development Strategy**

### **Branch Strategy**
```bash
main (production)     ← Live application
  ↓
develop (staging)     ← Testing environment
  ↓
feature branches      ← Your development work
```

### **Workflow Steps**

#### **Step 1: Create Feature Branch**
```bash
# Always work on feature branches
git checkout -b feature/new-inventory-feature
git checkout -b bugfix/fix-asset-display
git checkout -b hotfix/critical-security-fix
```

#### **Step 2: Make Changes Safely**
```bash
# Make your changes locally
# Test thoroughly on your machine
# Commit frequently with clear messages
git add .
git commit -m "Add new inventory filtering feature"
```

#### **Step 3: Test Before Deploying**
```bash
# Test locally first
cd backend && python -m uvicorn app.main:app --reload
cd frontend && npm start

# Test all functionality
# Check for errors
# Verify database connections
```

#### **Step 4: Push to Staging (Optional)**
```bash
# Push to develop branch for testing
git push origin feature/new-inventory-feature
# Create pull request to develop branch
```

#### **Step 5: Deploy to Production**
```bash
# Only merge to main when ready
git checkout main
git merge feature/new-inventory-feature
git push origin main
# Railway automatically deploys from main branch
```

## 🚀 **Deployment Strategies**

### **Option 1: Automatic Deployment (Railway)**
```bash
# Railway automatically deploys when you push to main
git push origin main
# → Railway detects changes
# → Builds and deploys automatically
# → Your team sees updates in 2-5 minutes
```

### **Option 2: Manual Deployment (AWS)**
```bash
# SSH to your server
ssh -i your-key.pem ubuntu@your-server-ip

# Pull latest changes
cd /opt/cmms
git pull origin main

# Restart services
sudo systemctl restart cmms-backend
sudo systemctl restart nginx
```

### **Option 3: Staging Environment**
```bash
# Deploy to staging first
git push origin develop
# Test on staging environment
# If everything works, deploy to production
git push origin main
```

## 🛡️ **Safety Measures**

### **1. Environment-Specific Configuration**
```python
# backend/app/core/config.py
import os

class Settings(BaseSettings):
    # Different settings for different environments
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    if ENVIRONMENT == "production":
        DATABASE_URL = os.getenv("PRODUCTION_DATABASE_URL")
        DEBUG = False
        ALLOWED_ORIGINS = ["https://your-app.railway.app"]
    else:
        DATABASE_URL = os.getenv("DEVELOPMENT_DATABASE_URL")
        DEBUG = True
        ALLOWED_ORIGINS = ["*"]
```

### **2. Feature Flags**
```python
# backend/app/core/features.py
class FeatureFlags:
    NEW_INVENTORY_FEATURE = os.getenv("NEW_INVENTORY_FEATURE", "false").lower() == "true"
    ENHANCED_REPORTING = os.getenv("ENHANCED_REPORTING", "false").lower() == "true"

# In your code
if FeatureFlags.NEW_INVENTORY_FEATURE:
    # New feature code
    pass
else:
    # Old feature code
    pass
```

### **3. Database Migrations**
```bash
# Always test migrations locally first
cd backend
alembic revision --autogenerate -m "Add new inventory fields"
alembic upgrade head

# Test with sample data
# Verify no data loss

# Deploy migration to production
# Railway will run migrations automatically
```

## 📋 **Development Checklist**

### **Before Making Changes**
- [ ] Create feature branch
- [ ] Understand what you're changing
- [ ] Plan rollback strategy
- [ ] Test locally first

### **During Development**
- [ ] Make small, focused changes
- [ ] Commit frequently with clear messages
- [ ] Test each change thoroughly
- [ ] Keep backups of important data

### **Before Deploying**
- [ ] Test all functionality locally
- [ ] Check for syntax errors
- [ ] Verify database migrations
- [ ] Test with sample data
- [ ] Review code changes

### **After Deploying**
- [ ] Monitor application logs
- [ ] Test critical functionality
- [ ] Check for errors
- [ ] Inform team of changes
- [ ] Monitor performance

## 🔧 **Team Communication**

### **1. Change Notifications**
```bash
# Create a simple notification system
# backend/app/utils/notifications.py
import smtplib
from email.mime.text import MIMEText

def notify_team_of_changes(version, changes):
    """Send email to team about new deployment"""
    subject = f"CMMS Update - Version {version}"
    body = f"""
    New deployment is live!
    
    Changes:
    {changes}
    
    Please test the following:
    - Asset management
    - Inventory tracking
    - Work order creation
    
    Report any issues immediately.
    """
    # Send email to team
```

### **2. Version Tracking**
```python
# backend/app/core/version.py
VERSION = "1.2.3"
BUILD_DATE = "2024-01-15"

def get_version_info():
    return {
        "version": VERSION,
        "build_date": BUILD_DATE,
        "environment": os.getenv("ENVIRONMENT", "development")
    }
```

### **3. Health Check Endpoint**
```python
# backend/app/api/endpoints/health.py
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": VERSION,
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }
```

## 🚨 **Emergency Procedures**

### **1. Quick Rollback**
```bash
# If something breaks, quickly rollback
git checkout main
git reset --hard HEAD~1  # Go back one commit
git push --force origin main
# Railway will redeploy automatically
```

### **2. Database Rollback**
```bash
# If database migration breaks
cd backend
alembic downgrade -1  # Go back one migration
# Or restore from backup
```

### **3. Service Restart**
```bash
# Restart services if needed
sudo systemctl restart cmms-backend
sudo systemctl restart nginx
```

## 📊 **Monitoring & Alerts**

### **1. Application Monitoring**
```python
# backend/app/middleware/monitoring.py
import logging
import time
from fastapi import Request

async def log_request(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logging.info(f"{request.method} {request.url} - {response.status_code} - {process_time:.2f}s")
    return response
```

### **2. Error Tracking**
```python
# backend/app/utils/error_tracking.py
import logging
from datetime import datetime

def log_error(error, context=None):
    """Log errors for monitoring"""
    error_log = {
        "timestamp": datetime.now().isoformat(),
        "error": str(error),
        "context": context,
        "environment": os.getenv("ENVIRONMENT")
    }
    
    logging.error(f"Application Error: {error_log}")
    # Could also send to external service like Sentry
```

## 🎯 **Best Practices Summary**

### **✅ Do This:**
- Always work on feature branches
- Test thoroughly before deploying
- Use environment-specific configuration
- Keep backups of important data
- Monitor application after deployment
- Communicate changes to your team

### **❌ Don't Do This:**
- Work directly on main branch
- Deploy without testing
- Make large changes at once
- Ignore error messages
- Deploy during business hours without warning
- Forget to backup data

## 🚀 **Quick Deployment Commands**

### **Safe Deployment Process:**
```bash
# 1. Create feature branch
git checkout -b feature/your-change

# 2. Make changes and test locally
# ... make your changes ...
# ... test thoroughly ...

# 3. Commit and push
git add .
git commit -m "Add new feature: description"
git push origin feature/your-change

# 4. Test on staging (if available)
# Create pull request to develop branch

# 5. Deploy to production
git checkout main
git merge feature/your-change
git push origin main
# Railway automatically deploys

# 6. Monitor and inform team
# Check logs, test functionality, notify team
```

## 📱 **Team Notification Template**

```markdown
# 🚀 CMMS Update - Version 1.2.3

## ✅ What's New:
- Enhanced inventory filtering
- Improved asset search
- Bug fixes in work order creation

## 🔧 What to Test:
- [ ] Asset management
- [ ] Inventory tracking  
- [ ] Work order creation
- [ ] Report generation

## 🚨 Report Issues:
If you encounter any problems, please report immediately.

## 📊 Health Check:
Visit: https://your-app.railway.app/health
```

This workflow ensures your team always has a stable, working CMMS while you can safely develop new features! 🎉 