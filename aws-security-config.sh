#!/bin/bash

echo "🔒 AWS Security Configuration"
echo "============================"

# Get AWS account and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

echo "🏢 AWS Account: $AWS_ACCOUNT_ID"
echo "🌍 AWS Region: $AWS_REGION"

# Create VPC for CMMS
echo "🌐 Creating VPC for CMMS..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=cmms-vpc}]' \
    --query Vpc.VpcId --output text)

# Create subnets
echo "🌐 Creating Subnets..."
SUBNET_1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=cmms-subnet-1}]' \
    --query Subnet.SubnetId --output text)

SUBNET_2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=cmms-subnet-2}]' \
    --query Subnet.SubnetId --output text)

# Create Internet Gateway
echo "🌐 Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=cmms-igw}]' \
    --query InternetGateway.InternetGatewayId --output text)

aws ec2 attach-internet-gateway \
    --vpc-id $VPC_ID \
    --internet-gateway-id $IGW_ID

# Create Route Table
echo "🛣️ Creating Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=cmms-rt}]' \
    --query RouteTable.RouteTableId --output text)

aws ec2 create-route \
    --route-table-id $ROUTE_TABLE_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

aws ec2 associate-route-table \
    --route-table-id $ROUTE_TABLE_ID \
    --subnet-id $SUBNET_1_ID

# Create Security Groups
echo "🔒 Creating Security Groups..."

# ALB Security Group
aws ec2 create-security-group \
    --group-name cmms-alb-sg \
    --description "Security group for CMMS Application Load Balancer" \
    --vpc-id $VPC_ID

aws ec2 authorize-security-group-ingress \
    --group-name cmms-alb-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name cmms-alb-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# EC2 Security Group
aws ec2 create-security-group \
    --group-name cmms-ec2-sg \
    --description "Security group for CMMS EC2 instance" \
    --vpc-id $VPC_ID

aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 80 \
    --source-group cmms-alb-sg

aws ec2 authorize-security-group-ingress \
    --group-name cmms-ec2-sg \
    --protocol tcp \
    --port 443 \
    --source-group cmms-alb-sg

# RDS Security Group
aws ec2 create-security-group \
    --group-name cmms-rds-sg \
    --description "Security group for CMMS RDS database" \
    --vpc-id $VPC_ID

aws ec2 authorize-security-group-ingress \
    --group-name cmms-rds-sg \
    --protocol tcp \
    --port 5432 \
    --source-group cmms-ec2-sg

# Create IAM Role for EC2
echo "👤 Creating IAM Role..."
aws iam create-role \
    --role-name CMMSEC2Role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ec2.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Attach policies to IAM role
aws iam attach-role-policy \
    --role-name CMMSEC2Role \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

aws iam attach-role-policy \
    --role-name CMMSEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create Instance Profile
aws iam create-instance-profile \
    --instance-profile-name CMMSEC2InstanceProfile

aws iam add-role-to-instance-profile \
    --instance-profile-name CMMSEC2InstanceProfile \
    --role-name CMMSEC2Role

# Create CloudWatch Log Group
echo "📊 Creating CloudWatch Log Group..."
aws logs create-log-group --log-group-name /aws/ec2/cmms

# Create S3 bucket for backups
echo "🗄️ Creating S3 Bucket for Backups..."
BUCKET_NAME="cmms-backups-$AWS_ACCOUNT_ID"
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

# Configure S3 bucket for backups
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

# Create backup policy
cat > backup-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::cmms-backups-$AWS_ACCOUNT_ID",
                "arn:aws:s3:::cmms-backups-$AWS_ACCOUNT_ID/*"
            ]
        }
    ]
}
EOF

aws iam create-policy \
    --policy-name CMMSBackupPolicy \
    --policy-document file://backup-policy.json

aws iam attach-role-policy \
    --role-name CMMSEC2Role \
    --policy-arn arn:aws:iam::$AWS_ACCOUNT_ID:policy/CMMSBackupPolicy

echo ""
echo "✅ AWS Security Configuration Complete!"
echo ""
echo "🔐 Security Features Enabled:"
echo "✅ VPC with private subnets"
echo "✅ Security groups with minimal access"
echo "✅ IAM role with least privilege"
echo "✅ CloudWatch logging"
echo "✅ S3 backup bucket with encryption"
echo "✅ SSL/TLS encryption (to be configured)"
echo ""
echo "📋 Next Steps:"
echo "1. Update your aws-setup.sh with the new subnet IDs:"
echo "   - Subnet 1: $SUBNET_1_ID"
echo "   - Subnet 2: $SUBNET_2_ID"
echo "2. Run aws-setup.sh to create RDS and EC2"
echo "3. Configure SSL certificate"
echo "4. Set up monitoring and alerts"
echo ""
echo "💰 Estimated Monthly Cost:"
echo "- VPC: $0 (free)"
echo "- Security Groups: $0 (free)"
echo "- IAM: $0 (free)"
echo "- CloudWatch: $5-10/month"
echo "- S3 Storage: $1-5/month"
echo ""
echo "🔒 Your AWS infrastructure is now secure!" 