#!/bin/bash

echo "🚀 Deploying CMMS to AWS EC2"
echo "============================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run:"
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
echo "🖥️ Creating EC2 Instance..."

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
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cmms-server}]' \
    --user-data file://user-data.sh \
    --region $AWS_REGION

echo ""
echo "⏳ Waiting for instance to be ready..."
aws ec2 wait instance-running --filters "Name=tag:Name,Values=cmms-server"

# Get instance ID and public IP
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=cmms-server" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' --output text)

PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo ""
echo "✅ EC2 Instance Created Successfully!"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"

echo ""
echo "📋 Next Steps:"
echo "1. Wait 2-3 minutes for instance to fully boot"
echo "2. Connect to your server:"
echo "   ssh -i cmms-key.pem ec2-user@$PUBLIC_IP"
echo "3. Verify deployment:"
echo "   curl http://$PUBLIC_IP/api/v1/health"
echo "4. Open in browser:"
echo "   http://$PUBLIC_IP"
echo ""
echo "🔐 Security Information:"
echo "- SSH Key: cmms-key.pem"
echo "- Username: ec2-user"
echo "- Ports open: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""
echo "💰 Cost Information:"
echo "- EC2 t3.micro: $0/month (Free tier)"
echo "- Data Transfer: $0/month (Free tier)"
echo ""
echo "🎉 Your CMMS is being deployed to AWS!" 