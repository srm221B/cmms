# 🚀 Railway Setup Guide (Recommended)

## 🎯 **Why Railway?**
- ✅ **Easiest deployment** (30 minutes)
- ✅ **Much cheaper** ($5/month vs $40-55/month)
- ✅ **Automatic deployments** from GitHub
- ✅ **Perfect for small teams** (< 50 users)
- ✅ **No server management** needed

## 📋 **Prerequisites**
- ✅ Your code is on GitHub
- ✅ You have a GitHub account
- ✅ Your AWS RDS database is set up (optional)

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Railway to access your GitHub

### **Step 2: Deploy Your Application**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your CMMS repository
4. Click "Deploy"

### **Step 3: Configure Environment Variables**
In Railway dashboard, add these variables:

```bash
# Database (use your AWS RDS or Railway database)
DATABASE_URL=postgresql://user:pass@your-db-url/db

# Security
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production

# CORS (update with your Railway URL)
ALLOWED_ORIGINS=https://your-app.railway.app
```

### **Step 4: Add PostgreSQL Database (Optional)**
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway creates a database automatically
4. Copy the database URL from settings
5. Update your `DATABASE_URL` environment variable

### **Step 5: Configure Build Settings**
In Railway dashboard:

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### **Step 6: Deploy and Test**
1. Railway automatically builds and deploys
2. Wait 2-5 minutes for deployment
3. Visit your Railway URL (e.g., `https://your-app.railway.app`)
4. Test all functionality

## 🔧 **Configuration Files**

### **railway.json** (Already created)
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **build.sh** (Already created)
```bash
#!/bin/bash
# Builds frontend and prepares backend for Railway
cd frontend && npm install && npm run build
mkdir -p ../backend/static && cp -r build/* ../backend/static/
cd ../backend && pip install -r requirements.txt
```

## 📊 **Cost Comparison**

| Service | Railway | AWS |
|---------|---------|-----|
| **Setup Time** | 30 minutes | 2+ hours |
| **Monthly Cost** | $5 | $40-55 |
| **Annual Cost** | $60 | $480-660 |
| **Savings** | - | $420-600/year! |

## 🎯 **Benefits for Your Team**

### **✅ What Your Team Gets:**
- ✅ **Immediate access** to CMMS
- ✅ **Automatic updates** when you push code
- ✅ **No downtime** during deployments
- ✅ **Professional hosting** with HTTPS
- ✅ **24/7 availability**

### **✅ What You Get:**
- ✅ **Easy deployments** (just push to GitHub)
- ✅ **No server management**
- ✅ **Automatic SSL certificates**
- ✅ **Built-in monitoring**
- ✅ **Much lower costs**

## 🔄 **Deployment Workflow**

### **Making Changes:**
```bash
# 1. Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# 2. Railway automatically deploys
# 3. Your team sees updates in 2-5 minutes
```

### **Monitoring:**
- **Health Check**: `https://your-app.railway.app/api/v1/health`
- **Version Info**: `https://your-app.railway.app/api/v1/version`
- **Railway Dashboard**: Monitor deployments and logs

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Build Fails**
- Check Railway logs in dashboard
- Verify `build.sh` is executable
- Check environment variables

#### **2. Database Connection Fails**
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Test connection locally first

#### **3. Application Won't Start**
- Check Railway logs
- Verify start command
- Check Python dependencies

## 📱 **Team Access**

### **Share with Your Team:**
```
🚀 CMMS is now live!

URL: https://your-app.railway.app
Status: https://your-app.railway.app/api/v1/health

Features:
- Asset management
- Inventory tracking
- Work order creation
- Report generation

Please test and report any issues!
```

## 🎉 **Success Metrics**

### **After Deployment:**
- ✅ **Application loads** without errors
- ✅ **Database connection** works
- ✅ **All features** function properly
- ✅ **Team can access** the system
- ✅ **Automatic deployments** work

## 💡 **Next Steps**

1. **Deploy to Railway** (30 minutes)
2. **Test all functionality**
3. **Share URL with team**
4. **Set up team notifications**
5. **Start developing** with confidence!

**Result**: Professional CMMS hosting for $5/month with zero server management! 🚀 