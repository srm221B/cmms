#!/bin/bash

echo "🚀 CMMS Deployment Script"
echo "=========================="

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }

# Step 1: Update API configuration for production
echo "📝 Updating API configuration..."

# Create .env file for backend
cat > backend/.env << EOF
DATABASE_URL=${DATABASE_URL:-"postgresql://user:pass@host:port/db"}
CORS_ORIGINS=${CORS_ORIGINS:-"https://your-frontend-domain.com"}
SECRET_KEY=${SECRET_KEY:-"your-secret-key-change-in-production"}
EOF

# Step 2: Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 3: Create Railway/Render configuration
echo "⚙️ Creating deployment configuration..."

# Create Procfile for Railway/Render
cat > Procfile << EOF
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port \$PORT
EOF

# Create runtime.txt for Python version
echo "python-3.11" > runtime.txt

echo "✅ Deployment configuration complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Push code to GitHub: git add . && git commit -m 'Deploy to cloud' && git push"
echo "2. Deploy to Railway: railway.app → New Project → Deploy from GitHub"
echo "3. Set environment variables in Railway dashboard:"
echo "   - DATABASE_URL=your_postgres_connection_string"
echo "   - CORS_ORIGINS=https://your-frontend-domain.com"
echo "   - SECRET_KEY=your_secret_key_here"
echo "4. Deploy frontend to Vercel/Netlify"
echo ""
echo "🌐 Your API will be available at: https://your-app.railway.app"
echo "🎨 Your frontend will be available at: https://your-app.vercel.app" 