#!/bin/bash

# 🗄️ Database Migration Script for Railway
# This script helps you set up your database on Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  Railway Database Setup${NC}"
echo "=================================================="

# Function to check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    else
        echo -e "${GREEN}✅ Railway CLI found${NC}"
    fi
}

# Function to login to Railway
login_railway() {
    echo -e "${BLUE}🔐 Logging into Railway...${NC}"
    railway login
}

# Function to get database URL from Railway
get_railway_db_url() {
    echo -e "${BLUE}📋 Getting Railway database URL...${NC}"
    
    # Get the database URL from Railway
    DB_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
    
    if [ -z "$DB_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not found in Railway variables${NC}"
        echo -e "${BLUE}Please add DATABASE_URL to your Railway project variables${NC}"
        echo "You can find it in your Railway dashboard under Variables"
        return 1
    else
        echo -e "${GREEN}✅ Found DATABASE_URL${NC}"
        echo "Database URL: $DB_URL"
    fi
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    
    cd backend
    
    # Install alembic if not already installed
    pip install alembic psycopg2-binary
    
    # Run migrations
    echo "Running Alembic migrations..."
    alembic upgrade head
    
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
}

# Function to migrate data from AWS RDS (if needed)
migrate_from_aws() {
    echo -e "${BLUE}🔄 Migrating data from AWS RDS...${NC}"
    
    read -p "Do you want to migrate data from AWS RDS? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  This will copy data from AWS RDS to Railway database${NC}"
        read -p "Enter your AWS RDS database URL: " AWS_DB_URL
        
        if [ -n "$AWS_DB_URL" ]; then
            echo "Exporting data from AWS RDS..."
            pg_dump "$AWS_DB_URL" > aws_backup.sql
            
            echo "Importing data to Railway database..."
            psql "$DB_URL" < aws_backup.sql
            
            echo -e "${GREEN}✅ Data migration completed${NC}"
        else
            echo -e "${RED}❌ No AWS database URL provided${NC}"
        fi
    else
        echo -e "${BLUE}📝 Skipping data migration - using fresh database${NC}"
    fi
}

# Function to add sample data
add_sample_data() {
    echo -e "${BLUE}📊 Adding sample data...${NC}"
    
    read -p "Do you want to add sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        
        # Run sample data scripts
        echo "Adding sample inventory..."
        python scripts/add_sample_inventory.py
        
        echo "Adding sample work orders..."
        python scripts/add_sample_work_orders.py
        
        echo "Adding sample assets..."
        python scripts/add_sample_assets.py
        
        echo -e "${GREEN}✅ Sample data added successfully${NC}"
    else
        echo -e "${BLUE}📝 Skipping sample data - using empty database${NC}"
    fi
}

# Function to test database connection
test_connection() {
    echo -e "${BLUE}🧪 Testing database connection...${NC}"
    
    cd backend
    
    # Test connection
    python -c "
import psycopg2
import os

try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print('✅ Database connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connection test passed${NC}"
    else
        echo -e "${RED}❌ Database connection test failed${NC}"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Database setup completed!${NC}"
    echo "=================================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test your application at: https://your-app-name.railway.app"
    echo "2. Check health status: https://your-app-name.railway.app/api/v1/health"
    echo "3. Share the URL with your team"
    echo "4. Set up team notifications"
    echo ""
    echo "🔧 Useful Commands:"
    echo "- View logs: railway logs"
    echo "- Check status: railway status"
    echo "- Update variables: railway variables set KEY=VALUE"
    echo ""
    echo "📞 If you need help:"
    echo "- Check Railway dashboard for logs"
    echo "- Verify environment variables are set correctly"
    echo "- Test database connection locally first"
}

# Main execution
main() {
    echo -e "${BLUE}Starting Railway database setup...${NC}"
    
    # Check prerequisites
    check_railway_cli
    login_railway
    
    # Get database URL
    if get_railway_db_url; then
        # Run migrations
        run_migrations
        
        # Migrate data if needed
        migrate_from_aws
        
        # Add sample data
        add_sample_data
        
        # Test connection
        test_connection
        
        # Show next steps
        show_next_steps
    else
        echo -e "${RED}❌ Failed to get database URL${NC}"
        echo "Please check your Railway project configuration"
        exit 1
    fi
}

# Run main function
main "$@" 