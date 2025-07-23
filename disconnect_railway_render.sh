#!/bin/bash

echo "=== Disconnect Railway/Render Deployments Script ==="
echo "This script helps you disconnect Railway and Render from your repository"
echo ""

echo "🔍 Checking for deployment configuration files..."

# Check for Railway/Render configuration files
if [ -f "railway.json" ]; then
    echo "❌ Found railway.json - removing..."
    rm railway.json
fi

if [ -f "render.yaml" ]; then
    echo "❌ Found render.yaml - removing..."
    rm render.yaml
fi

if [ -f "vercel.json" ]; then
    echo "❌ Found vercel.json - removing..."
    rm vercel.json
fi

if [ -f "fly.toml" ]; then
    echo "❌ Found fly.toml - removing..."
    rm fly.toml
fi

if [ -f "nixpacks.toml" ]; then
    echo "❌ Found nixpacks.toml - removing..."
    rm nixpacks.toml
fi

if [ -f "Procfile" ]; then
    echo "❌ Found Procfile - removing..."
    rm Procfile
fi

echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. 🚫 Disconnect Railway:"
echo "   - Go to https://railway.app/dashboard"
echo "   - Find your CMMS project"
echo "   - Go to Settings > General"
echo "   - Click 'Delete Project' or disconnect the GitHub integration"
echo ""
echo "2. 🚫 Disconnect Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Find your CMMS service"
echo "   - Go to Settings > General"
echo "   - Click 'Delete Service' or disconnect the GitHub integration"
echo ""
echo "3. 🔗 Check GitHub Webhooks:"
echo "   - Go to https://github.com/srm221B/cmms/settings/hooks"
echo "   - Look for any Railway or Render webhooks"
echo "   - Delete them if found"
echo ""
echo "4. ✅ Verify DigitalOcean Only:"
echo "   - Make sure only DigitalOcean App Platform is connected"
echo "   - Check that your DigitalOcean app is configured correctly"
echo ""
echo "5. 🧪 Test Deployment:"
echo "   - Make a small change to trigger deployment"
echo "   - Verify only DigitalOcean deploys the changes"
echo ""
echo "📝 What this script did:"
echo "   - Removed Railway/Render configuration files"
echo "   - Cleaned up deployment settings"
echo ""
echo "⚠️  Important: You must manually disconnect the services"
echo "   from their respective dashboards to stop automatic deployments" 