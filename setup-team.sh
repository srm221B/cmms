#!/bin/bash

echo "👥 CMMS Team Setup Script"
echo "========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "Download from: https://git-scm.com/"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Clone the repository (if not already done)
if [ ! -d "cmms" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/cmms.git
    cd cmms
else
    echo "📁 Repository already exists, updating..."
    cd cmms
    git pull origin main
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Create environment file for frontend
echo "⚙️ Creating frontend environment file..."
cat > .env << EOF
REACT_APP_API_URL=https://your-backend-url.railway.app
EOF

echo "✅ Frontend setup complete!"

# Instructions for team members
echo ""
echo "🎯 Next Steps for Team Members:"
echo "1. Start the frontend: cd frontend && npm start"
echo "2. Open browser to: http://localhost:3000"
echo "3. Access the application!"
echo ""
echo "📚 Additional Resources:"
echo "- User Guide: [Link to your user guide]"
echo "- Support: [Your support contact]"
echo "- Admin: [Your admin contact]"
echo ""
echo "🚀 Your CMMS is ready to use!" 