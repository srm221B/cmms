#!/bin/bash

# DigitalOcean Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment to DigitalOcean..."

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t cmms-app .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"

# Save the image to a tar file for transfer
echo "💾 Saving Docker image..."
docker save cmms-app > cmms-app.tar

if [ $? -ne 0 ]; then
    echo "❌ Failed to save Docker image"
    exit 1
fi

echo "✅ Docker image saved to cmms-app.tar"

# Instructions for manual deployment
echo ""
echo "📋 Next steps:"
echo "1. Copy the Docker image to your DigitalOcean droplet:"
echo "   scp cmms-app.tar root@46.101.216.102:/tmp/"
echo ""
echo "2. SSH into your droplet:"
echo "   ssh root@46.101.216.102"
echo ""
echo "3. Load and run the Docker image:"
echo "   docker load < /tmp/cmms-app.tar"
echo "   docker stop cmms-app || true"
echo "   docker rm cmms-app || true"
echo "   docker run -d --name cmms-app -p 80:8000 cmms-app"
echo ""
echo "4. Or if you prefer to update the code directly:"
echo "   git clone https://github.com/srm221B/cmms.git"
echo "   cd cmms"
echo "   docker build -t cmms-app ."
echo "   docker run -d --name cmms-app -p 80:8000 cmms-app"
echo ""
echo "🎉 Deployment script completed!" 