#!/bin/bash

# 📧 Team Notification Script
# This script helps notify your team about deployments and changes

# Configuration
TEAM_EMAILS=("team@yourcompany.com" "manager@yourcompany.com")
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
APP_NAME="CMMS"
APP_URL="https://your-app.railway.app"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to send email notification
send_email_notification() {
    local version=$1
    local changes=$2
    local commit_hash=$3
    
    subject="🚀 CMMS Update - Version $version"
    body="
New deployment is live!

Changes:
$changes

Commit: $commit_hash
URL: $APP_URL

Please test the following:
- Asset management
- Inventory tracking
- Work order creation
- Report generation

Report any issues immediately.

Best regards,
CMMS Team
"
    
    echo -e "${BLUE}📧 Sending email notifications...${NC}"
    for email in "${TEAM_EMAILS[@]}"; do
        echo "Sending to: $email"
        # You can use mail command or integrate with email service
        # echo "$body" | mail -s "$subject" "$email"
    done
}

# Function to send Slack notification
send_slack_notification() {
    local version=$1
    local changes=$2
    local commit_hash=$3
    
    message="
🚀 *CMMS Update Deployed!*

*Version:* $version
*Commit:* $commit_hash
*URL:* $APP_URL

*Changes:*
$changes

*Please test:*
• Asset management
• Inventory tracking  
• Work order creation
• Report generation

Report any issues immediately! 🚨
"
    
    if [ -n "$SLACK_WEBHOOK_URL" ] && [ "$SLACK_WEBHOOK_URL" != "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" ]; then
        echo -e "${BLUE}📱 Sending Slack notification...${NC}"
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    else
        echo -e "${YELLOW}⚠️  Slack webhook not configured${NC}"
    fi
}

# Function to create deployment summary
create_deployment_summary() {
    local version=$1
    local changes=$2
    local commit_hash=$3
    local author=$4
    local date=$5
    
    echo "=================================================="
    echo -e "${GREEN}🎉 Deployment Summary${NC}"
    echo "=================================================="
    echo "📋 Details:"
    echo "   Version: $version"
    echo "   Commit: $commit_hash"
    echo "   Author: $author"
    echo "   Date: $date"
    echo "   URL: $APP_URL"
    echo ""
    echo "📝 Changes:"
    echo "$changes"
    echo ""
    echo -e "${BLUE}📱 Notifications sent to team${NC}"
    echo ""
    echo "🔧 Testing Checklist:"
    echo "   ☐ Asset management"
    echo "   ☐ Inventory tracking"
    echo "   ☐ Work order creation"
    echo "   ☐ Report generation"
    echo ""
    echo "🚨 Report issues immediately if found!"
}

# Function to generate changelog
generate_changelog() {
    local last_commit=$1
    
    echo "Generating changelog since $last_commit..."
    git log --oneline --since="$last_commit" --pretty=format:"• %s (%h)" | head -10
}

# Main function
main() {
    if [ $# -lt 1 ]; then
        echo "Usage: $0 <version> [changes]"
        echo "Example: $0 1.2.3 'Added new inventory filtering feature'"
        exit 1
    fi
    
    version=$1
    changes=${2:-"Bug fixes and improvements"}
    
    # Get git info
    commit_hash=$(git rev-parse --short HEAD)
    author=$(git log -1 --pretty=%an)
    date=$(git log -1 --pretty=%cd)
    
    echo -e "${BLUE}📧 Sending team notifications...${NC}"
    
    # Send notifications
    send_email_notification "$version" "$changes" "$commit_hash"
    send_slack_notification "$version" "$changes" "$commit_hash"
    
    # Create summary
    create_deployment_summary "$version" "$changes" "$commit_hash" "$author" "$date"
    
    echo -e "${GREEN}✅ Team notification completed!${NC}"
}

# Run main function
main "$@" 