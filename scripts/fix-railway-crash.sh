#!/bin/bash

# 🚨 Quick Fix for Railway Crashes
# This script fixes the missing schema issue and redeploys

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚨 Fixing Railway Deployment Crash${NC}"
echo "=================================================="

# Function to check if location schema exists
check_location_schema() {
    if [ -f "backend/app/schemas/location.py" ]; then
        echo -e "${GREEN}✅ Location schema file exists${NC}"
    else
        echo -e "${RED}❌ Location schema file missing${NC}"
        return 1
    fi
}

# Function to test backend locally
test_backend() {
    echo -e "${BLUE}🧪 Testing backend locally...${NC}"
    
    cd backend
    
    # Test if backend can start without errors
    if python -c "import app.main; print('✅ Backend imports successfully')" 2>/dev/null; then
        echo -e "${GREEN}✅ Backend test passed${NC}"
    else
        echo -e "${RED}❌ Backend test failed${NC}"
        echo "Checking for import errors..."
        python -c "import app.main" 2>&1 | head -10
        return 1
    fi
    
    cd ..
}

# Function to commit and push changes
deploy_fix() {
    echo -e "${BLUE}🚀 Deploying fix to Railway...${NC}"
    
    # Add the new schema file
    git add backend/app/schemas/location.py
    
    # Commit the fix
    git commit -m "Fix: Add missing location schema to prevent Railway crashes"
    
    # Push to trigger Railway deployment
    git push origin main
    
    echo -e "${GREEN}✅ Fix deployed! Railway will rebuild automatically${NC}"
    echo -e "${YELLOW}⏳ Wait 2-5 minutes for deployment to complete${NC}"
}

# Function to check Railway status
check_railway_status() {
    echo -e "${BLUE}📊 Checking Railway deployment status...${NC}"
    
    # Wait a bit for deployment to start
    sleep 30
    
    echo "You can check your Railway dashboard for deployment status"
    echo "Or run: railway logs"
    echo ""
    echo "Your app URL: https://your-app-name.railway.app"
    echo "Health check: https://your-app-name.railway.app/api/v1/health"
}

# Function to show troubleshooting steps
show_troubleshooting() {
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting Steps:${NC}"
    echo "1. Check Railway logs: railway logs"
    echo "2. Verify environment variables in Railway dashboard"
    echo "3. Check if DATABASE_URL is set correctly"
    echo "4. Ensure all required dependencies are in requirements.txt"
    echo ""
    echo -e "${YELLOW}Common Issues:${NC}"
    echo "- Missing environment variables"
    echo "- Database connection issues"
    echo "- Missing dependencies"
    echo "- Import errors in Python code"
}

# Main execution
main() {
    echo -e "${BLUE}Starting Railway crash fix...${NC}"
    
    # Check if location schema exists
    if check_location_schema; then
        # Test backend locally
        if test_backend; then
            # Deploy the fix
            deploy_fix
            
            # Check status
            check_railway_status
            
            # Show troubleshooting
            show_troubleshooting
        else
            echo -e "${RED}❌ Backend test failed - fix the issues first${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Location schema file is missing${NC}"
        exit 1
    fi
}

# Run main function
main "$@" 