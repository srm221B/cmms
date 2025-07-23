#!/bin/bash

echo "=== CMMS Repository Cleanup Script ==="
echo "Removing unwanted and junk files from Git repository"
echo ""

# Remove all deleted files from Git
echo "🗑️ Removing deleted files from Git..."
git rm -f AWS_CHECKLIST.md AWS_DEPLOYMENT_GUIDE.md BEGINNER_AWS_GUIDE.md DEPLOYMENT_ALTERNATIVES.md DEVELOPMENT_WORKFLOW.md Dockerfile Procfile QUICK_DEPLOYMENT_GUIDE.md RAILWAY_SETUP_GUIDE.md SECURITY_GUIDE.md SIMPLE_AWS_DEPLOYMENT.md TEAM_GUIDE.md aws-security-config.sh aws-setup.sh backend/.env.rtf backend/Procfile backend/alembic.ini backend/alembic/README backend/alembic/env.py backend/alembic/script.py.mako backend/alembic/versions/6f5b3557e360_initial.py backend/alembic/versions/add_asset_columns.py backend/alembic/versions/add_inventory_filters.py backend/alembic/versions/fix_asset_column_names.py backend/migrations/add_asset_columns.sql backend/railway_start.py backend/scripts/add_sample_inventory.py backend/scripts/add_sample_inventory_inflows.py backend/scripts/add_sample_work_order_parts.py backend/scripts/add_sample_work_orders.py backend/scripts/simple_db_test.py backend/scripts/test_models.py backend/simple_test.py backend/sql/init_data.sql backend/sql/init_schema.sql backend/standalone_test.py backend/start.sh backend/start_app.py backend/start_server.sh backend/start_uvicorn.sh backend/test_work_orders.py backend/test_work_orders_api.py backend/wsgi.py backup-policy.json build.sh configure-security.sh database/ deploy-aws.sh deploy-to-aws.sh deploy.sh fly.toml main.py nixpacks.toml railway-deploy.md railway.json render.yaml requirements-minimal.txt runtime.txt scripts/ setup-team.sh start.sh test_app.py user-data.sh vercel.json wsgi.py your_application.py 2>/dev/null || true

# Remove all __pycache__ directories and .pyc files
echo "🧹 Removing Python cache files..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# Remove all .DS_Store files
echo "🍎 Removing .DS_Store files..."
find . -name ".DS_Store" -delete 2>/dev/null || true

# Remove backup files
echo "🗂️ Removing backup files..."
rm -f backend/cmms.db.backup.* 2>/dev/null || true
rm -f backend/app/main*.py 2>/dev/null || true
rm -f backend/app/main.py.backup 2>/dev/null || true

# Remove temporary and test files
echo "🧪 Removing temporary and test files..."
rm -f backend/diagnose_server.py backend/fix_server_issues.py backend/start_dev.py 2>/dev/null || true

# Remove SSH key files (should not be in repository)
echo "🔑 Removing SSH key files..."
rm -f cmms_key_pair.pem 2>/dev/null || true

# Remove deployment scripts that are no longer needed
echo "📜 Removing old deployment scripts..."
rm -f clean_ssh_commands.txt cleanup_vm_commands.txt cleanup_vm_files.sh database_setup.sh dependencies_only.txt direct_ssh_commands.txt direct_ssh_commands_fixed.txt install_cmms.sh manual_install.md setup_production.sh ssh_install_commands.sh update_vm_frontend.sh vm_install_commands.txt 2>/dev/null || true

# Keep only essential deployment scripts
echo "✅ Keeping essential deployment scripts..."

# Update .gitignore to prevent future junk files
echo "📝 Updating .gitignore..."
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
venv/
env/
ENV/
env.bak/
venv.bak/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
build/
dist/
*.tgz

# SSH keys
*.pem
*.key

# Backup files
*.backup
*.bak
*.old

# Temporary files
*.tmp
*.temp
EOF

# Add and commit the cleanup
echo "📝 Committing cleanup changes..."
git add .gitignore
git add -A
git commit -m "Cleanup: Remove all unwanted files and Railway references

- Removed all Railway deployment files
- Removed AWS deployment files  
- Removed old migration files
- Removed backup and cache files
- Removed test and temporary files
- Updated .gitignore to prevent future junk files
- Kept only essential CMMS application files"

echo "🚀 Pushing cleanup to repository..."
git push origin main

echo ""
echo "✅ Repository cleanup complete!"
echo ""
echo "📊 What was cleaned up:"
echo "   - All Railway deployment files"
echo "   - All AWS deployment files"
echo "   - Python cache files (__pycache__, *.pyc)"
echo "   - OS files (.DS_Store)"
echo "   - Backup files (*.backup)"
echo "   - Test and temporary files"
echo "   - SSH keys (security)"
echo "   - Old migration files"
echo ""
echo "📁 What was kept:"
echo "   - Core CMMS application (backend/app/)"
echo "   - Frontend React application (frontend/)"
echo "   - Essential deployment scripts"
echo "   - Documentation files"
echo "   - Requirements and configuration"
echo ""
echo "🔒 Security note: SSH keys have been removed from repository"
echo "   Make sure to keep your SSH keys secure locally" 