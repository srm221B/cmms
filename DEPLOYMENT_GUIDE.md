# 🚀 CMMS Deployment Guide for Small Team

## Overview
This guide will help you deploy your CMMS application to the cloud for use by your small team (<50 users).

## 📋 Prerequisites
- GitHub account
- Railway account (free tier available)
- Vercel account (free tier available)
- PostgreSQL database (Railway/Supabase/Neon)

## 🗄️ Step 1: Database Setup

### Option A: Railway PostgreSQL (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy the connection string

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

## 🔧 Step 2: Backend Deployment

### Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Set environment variables:
   ```
   DATABASE_URL=your_postgres_connection_string
   CORS_ORIGINS=https://your-frontend-domain.com
   SECRET_KEY=your_secret_key_here
   ```
5. Deploy

### Alternative: Deploy to Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Set environment variables (same as above)

## 🎨 Step 3: Frontend Deployment

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
4. Deploy

### Alternative: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Import your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Set environment variables (same as above)

## 🔄 Step 4: Database Migration

### Run migrations on cloud database
```bash
# Connect to your cloud database
psql your_connection_string

# Or use Alembic
alembic upgrade head
```

## 📊 Step 5: Team Access

### Share with your team
1. **Frontend URL**: Share the Vercel/Netlify URL
2. **API URL**: Keep this private (only for development)
3. **Database**: Access through Railway/Supabase dashboard

## 🔄 Step 6: Updates and Maintenance

### Automatic Updates
- **GitHub**: Push changes to main branch
- **Railway**: Automatically redeploys
- **Vercel**: Automatically redeploys

### Manual Updates
```bash
# 1. Make changes locally
# 2. Test locally
# 3. Push to GitHub
git add .
git commit -m "Update feature"
git push origin main
```

## 💰 Cost Estimation

### Free Tier (Up to 50 users)
- **Railway**: $0/month (free tier)
- **Vercel**: $0/month (free tier)
- **PostgreSQL**: $0/month (free tier)
- **Total**: $0/month

### Paid Tier (50+ users)
- **Railway**: $5-20/month
- **Vercel**: $20/month
- **PostgreSQL**: $5-15/month
- **Total**: $30-55/month

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Railway/Render environment variables
- Rotate `SECRET_KEY` regularly

### CORS Configuration
- Only allow your frontend domain
- Don't use `*` in production

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups

## 📱 Team Onboarding

### For Team Members
1. **Access**: Share the frontend URL
2. **Training**: Create user guide
3. **Support**: Set up communication channel

### For Administrators
1. **Database Access**: Railway/Supabase dashboard
2. **Logs**: Railway/Render logs
3. **Monitoring**: Set up alerts

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Check `CORS_ORIGINS` environment variable
2. **Database Connection**: Verify `DATABASE_URL`
3. **Build Failures**: Check logs in Railway/Vercel

### Support
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **PostgreSQL**: [postgresql.org/docs](https://postgresql.org/docs)

## 🎯 Quick Start Commands

```bash
# 1. Run deployment script
chmod +x deploy.sh
./deploy.sh

# 2. Push to GitHub
git add .
git commit -m "Deploy to cloud"
git push origin main

# 3. Deploy to Railway
# Go to railway.app and connect repository

# 4. Deploy to Vercel
# Go to vercel.com and import repository
```

## 📈 Scaling Considerations

### When to Upgrade
- **Users**: >50 concurrent users
- **Data**: >1GB database
- **Performance**: Slow response times

### Upgrade Path
1. **Railway**: Upgrade to paid plan
2. **Database**: Larger PostgreSQL instance
3. **CDN**: Add Vercel Pro for better performance

---

**🎉 Congratulations!** Your CMMS is now deployed and ready for your team! 