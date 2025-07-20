#!/bin/bash

echo "☁️ AWS CMMS Deployment Setup"
echo "============================="

# Check AWS CLI installation
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "aws configure"
    exit 1
fi

echo "✅ AWS CLI configured successfully!"

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
echo "🏢 AWS Account: $AWS_ACCOUNT_ID"
echo "🌍 AWS Region: $AWS_REGION"

echo ""
echo "🗄️ Setting up RDS PostgreSQL Database..."

# Create security group for RDS
echo "🔒 Creating RDS Security Group..."
aws ec2 create-security-group \
    --group-name cmms-rds-sg \
    --description "Security group for CMMS RDS database" \
    --region $AWS_REGION

# Add rule to allow PostgreSQL access from EC2
aws ec2 authorize-security-group-ingress \
    --group-name cmms-rds-sg \
    --protocol tcp \
    --port 5432 \
    --source-group cmms-ec2-sg \
    --region $AWS_REGION

# Create RDS subnet group
echo "🌐 Creating RDS Subnet Group..."
aws rds create-db-subnet-group \
    --db-subnet-group-name cmms-subnet-group \
    --db-subnet-group-description "Subnet group for CMMS RDS" \
    --subnet-ids subnet-12345678 subnet-87654321 \
    --region $AWS_REGION

# Create RDS PostgreSQL instance
echo "🗄️ Creating RDS PostgreSQL Instance..."
aws rds create-db-instance \
    --db-instance-identifier cmms-database \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 14.7 \
    --master-username cmms_admin \
    --master-user-password $(openssl rand -base64 32) \
    --allocated-storage 20 \
    --storage-type gp2 \
    --db-subnet-group-name cmms-subnet-group \
    --vpc-security-group-ids cmms-rds-sg \
    --backup-retention-period 7 \
    --multi-az \
    --region $AWS_REGION

echo ""
echo "🖥️ Setting up EC2 Instance..."

# Create security group for EC2
echo "🔒 Creating EC2 Security Group..."
aws ec2 create-security-group \
    --group-name cmms-ec2-sg \
    --description "Security group for CMMS EC2 instance" \
    --region $AWS_REGION

# Add rules for EC2
aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION

# Create EC2 instance
echo "🖥️ Creating EC2 Instance..."
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.micro \
    --key-name cmms-key \
    --security-group-ids cmms-ec2-sg \
    --subnet-id subnet-12345678 \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cmms-server}]' \
    --user-data file://user-data.sh \
    --region $AWS_REGION

echo ""
echo "🌐 Setting up Application Load Balancer..."

# Create ALB
aws elbv2 create-load-balancer \
    --name cmms-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups cmms-alb-sg \
    --region $AWS_REGION

echo ""
echo "🔐 Setting up SSL Certificate..."

# Request SSL certificate
aws acm request-certificate \
    --domain-name your-cmms-domain.com \
    --validation-method DNS \
    --region $AWS_REGION

echo ""
echo "✅ AWS Infrastructure Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Wait for RDS to be available (5-10 minutes)"
echo "2. Get RDS endpoint from AWS Console"
echo "3. Update DATABASE_URL in your deployment"
echo "4. Deploy your application to EC2"
echo ""
echo "🔗 Useful AWS Console Links:"
echo "- RDS: https://console.aws.amazon.com/rds/"
echo "- EC2: https://console.aws.amazon.com/ec2/"
echo "- ALB: https://console.aws.amazon.com/ec2/v2/home#LoadBalancers"
echo "- ACM: https://console.aws.amazon.com/acm/"
echo ""
echo "💰 Estimated Monthly Cost:"
echo "- RDS PostgreSQL: $15-30/month"
echo "- EC2 t3.micro: $8-12/month"
echo "- ALB: $20-30/month"
echo "- Data Transfer: $5-15/month"
echo "- Total: $50-90/month" 