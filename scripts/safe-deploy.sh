#!/bin/bash

# 🚀 Safe Deployment Script
# This script helps you deploy changes safely without breaking the live application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="CMMS"
PRODUCTION_BRANCH="main"
STAGING_BRANCH="develop"
RAILWAY_URL="https://your-app.railway.app"

echo -e "${BLUE}🚀 Safe Deployment Script for ${APP_NAME}${NC}"
echo "=================================================="

# Function to check if we're on the right branch
check_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "$PRODUCTION_BRANCH" ]; then
        echo -e "${RED}❌ Error: You must be on the $PRODUCTION_BRANCH branch to deploy${NC}"
        echo -e "${YELLOW}Current branch: $current_branch${NC}"
        echo -e "${BLUE}Switch to $PRODUCTION_BRANCH: git checkout $PRODUCTION_BRANCH${NC}"
        exit 1
    fi
}

# Function to check for uncommitted changes
check_changes() {
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
        echo -e "${YELLOW}Please commit or stash your changes before deploying${NC}"
        git status --short
        exit 1
    fi
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    
    # Test backend
    echo "Testing backend..."
    cd backend
    if ! python -c "import app.main; print('✅ Backend imports successfully')"; then
        echo -e "${RED}❌ Backend test failed${NC}"
        exit 1
    fi
    
    # Test frontend build
    echo "Testing frontend build..."
    cd ../frontend
    if ! npm run build > /dev/null 2>&1; then
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ All tests passed${NC}"
}

# Function to check deployment readiness
check_deployment() {
    echo -e "${BLUE}🔍 Checking deployment readiness...${NC}"
    
    # Check if we're up to date with remote
    git fetch origin
    local_commit=$(git rev-parse HEAD)
    remote_commit=$(git rev-parse origin/$PRODUCTION_BRANCH)
    
    if [ "$local_commit" != "$remote_commit" ]; then
        echo -e "${YELLOW}⚠️  Warning: Your local branch is not up to date with remote${NC}"
        echo -e "${BLUE}Consider: git pull origin $PRODUCTION_BRANCH${NC}"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to deploy
deploy() {
    echo -e "${BLUE}🚀 Deploying to production...${NC}"
    
    # Push to production branch
    echo "Pushing to $PRODUCTION_BRANCH..."
    if git push origin $PRODUCTION_BRANCH; then
        echo -e "${GREEN}✅ Code pushed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to push code${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Deployment initiated!${NC}"
    echo -e "${BLUE}Railway will automatically build and deploy your changes${NC}"
    echo -e "${YELLOW}Deployment typically takes 2-5 minutes${NC}"
}

# Function to monitor deployment
monitor_deployment() {
    echo -e "${BLUE}📊 Monitoring deployment...${NC}"
    echo -e "${YELLOW}Checking application health in 30 seconds...${NC}"
    sleep 30
    
    # Check if application is responding
    if curl -f -s "$RAILWAY_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ Application is healthy!${NC}"
    else
        echo -e "${YELLOW}⚠️  Application might still be deploying...${NC}"
        echo -e "${BLUE}Check Railway dashboard for deployment status${NC}"
    fi
}

# Function to notify team
notify_team() {
    echo -e "${BLUE}📧 Notifying team...${NC}"
    
    # Get latest commit info
    commit_hash=$(git rev-parse --short HEAD)
    commit_message=$(git log -1 --pretty=%B)
    author=$(git log -1 --pretty=%an)
    date=$(git log -1 --pretty=%cd)
    
    echo "=================================================="
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "=================================================="
    echo "📋 Deployment Details:"
    echo "   Commit: $commit_hash"
    echo "   Message: $commit_message"
    echo "   Author: $author"
    echo "   Date: $date"
    echo "   URL: $RAILWAY_URL"
    echo ""
    echo -e "${BLUE}📱 Team Notification:${NC}"
    echo "Please notify your team with the following:"
    echo ""
    echo "🚀 CMMS Update Deployed!"
    echo "✅ Changes are now live at: $RAILWAY_URL"
    echo "🔧 Please test the following features:"
    echo "   - Asset management"
    echo "   - Inventory tracking"
    echo "   - Work order creation"
    echo "   - Report generation"
    echo ""
    echo "🚨 If you encounter any issues, please report immediately."
}

# Function to show rollback instructions
show_rollback() {
    echo ""
    echo -e "${YELLOW}🔄 Rollback Instructions:${NC}"
    echo "If something goes wrong, you can quickly rollback:"
    echo "1. git reset --hard HEAD~1"
    echo "2. git push --force origin $PRODUCTION_BRANCH"
    echo "3. Railway will automatically redeploy"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}Starting safe deployment process...${NC}"
    
    # Run all checks
    check_branch
    check_changes
    run_tests
    check_deployment
    
    # Confirm deployment
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
    echo -e "${BLUE}This will affect all users immediately${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
    
    # Deploy
    deploy
    monitor_deployment
    notify_team
    show_rollback
    
    echo -e "${GREEN}🎉 Deployment process completed!${NC}"
}

# Run main function
main "$@" 