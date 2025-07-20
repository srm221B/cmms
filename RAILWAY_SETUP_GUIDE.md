# Railway Setup Guide

## 🚨 Current Issue
Railway is showing its default page instead of your CMMS application. This means Railway isn't connected to your repository properly.

## 🔧 Solution Steps

### Option 1: Fix Current Railway Project

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**
2. **Find your CMMS project**
3. **Go to Settings tab**
4. **Verify GitHub repository is: `https://github.com/srm221B/cmms.git`**
5. **If not connected, click "Connect Repository"**
6. **Select your `cmms` repository**
7. **Go to Deployments tab**
8. **Click "Redeploy"**

### Option 2: Create New Railway Project

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your `cmms` repository**
5. **Railway will automatically detect it's a Python project**
6. **Set environment variables if needed**
7. **Deploy**

### Option 3: Manual Railway CLI Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy
railway up
```

## 🔧 Latest Fixes Applied

### ✅ Updated Configuration Files:
- **`railway.json`** - Simplified start command
- **`build.sh`** - Proper build script with dependency installation
- **`runtime.txt`** - Specified Python 3.11
- **`backend/static/index.html`** - Fallback static page

### 🚀 Key Changes:
1. **Simplified start command** - Removed complex pip install from start command
2. **Added build script** - `build.sh` handles dependency installation
3. **Static file fallback** - Beautiful HTML page when frontend isn't built
4. **Python version specification** - `runtime.txt` ensures correct Python version

## 📊 Expected Results

After fixing the Railway connection, you should see:

- **`https://cmms.railway.app/`** → Beautiful CMMS interface (like your local server)
- **`https://cmms.railway.app/api`** → API root
- **`https://cmms.railway.app/health`** → Health check
- **`https://cmms.railway.app/test-railway`** → Test endpoint

## 🚨 If Still Not Working

1. **Check Railway deployment logs** for errors
2. **Verify the repository branch is `main`**
3. **Make sure Railway has access to your GitHub repository**
4. **Try creating a completely new Railway project**
5. **Check if build script is executable** (`chmod +x build.sh`)

## 🔍 Troubleshooting Steps

### Check Deployment Logs:
1. Go to Railway Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check "Build Logs" and "Deploy Logs"

### Common Issues:
- **Build fails**: Check if `requirements.txt` is valid
- **Start command fails**: Verify Python path and dependencies
- **Static files not found**: Check if `backend/static/` directory exists

## 📞 Support

If Railway still shows the default page after following these steps, the issue is with Railway's project configuration, not your code (since your local server works perfectly). 