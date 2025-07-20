# ☁️ AWS CMMS Deployment Guide

## Overview
This guide will help you deploy your CMMS application on AWS with enterprise-grade security, including RDS PostgreSQL database, EC2 application server, and comprehensive monitoring.

## 🏗️ **AWS Architecture**

```
Internet → ALB → EC2 → RDS PostgreSQL
    ↓        ↓      ↓        ↓
  HTTPS   HTTPS   HTTP    SSL/TLS
```

### **Components:**
- **RDS PostgreSQL**: Managed database with automated backups
- **EC2**: Application server with auto-scaling
- **ALB**: Application Load Balancer with SSL termination
- **VPC**: Private network with security groups
- **CloudWatch**: Monitoring and logging
- **S3**: Backup storage with encryption

## 📋 **Prerequisites**

### **AWS CLI Setup**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, Region
```

### **Required AWS Services**
- ✅ **RDS**: PostgreSQL database
- ✅ **EC2**: Application server
- ✅ **VPC**: Private network
- ✅ **ALB**: Load balancer
- ✅ **ACM**: SSL certificates
- ✅ **CloudWatch**: Monitoring
- ✅ **S3**: Backup storage

## 🚀 **Step-by-Step Deployment**

### **Step 1: Security Infrastructure (15 minutes)**
```bash
# 1. Set up VPC and security groups
chmod +x aws-security-config.sh
./aws-security-config.sh

# 2. Note the subnet IDs for next step
```

### **Step 2: Database Setup (10 minutes)**
```bash
# 1. Update aws-setup.sh with your subnet IDs
# 2. Create RDS PostgreSQL instance
chmod +x aws-setup.sh
./aws-setup.sh

# 3. Wait for RDS to be available (5-10 minutes)
# 4. Get database endpoint from AWS Console
```

### **Step 3: Application Deployment (20 minutes)**
```bash
# 1. Update user-data.sh with your repository URL
# 2. Create EC2 instance with user data
# 3. Wait for instance to be ready
# 4. SSH into instance and verify deployment
```

### **Step 4: SSL Certificate (10 minutes)**
```bash
# 1. Request SSL certificate in ACM
# 2. Validate certificate (DNS or email)
# 3. Attach certificate to ALB
# 4. Update DNS records
```

## 🗄️ **Database Configuration**

### **RDS PostgreSQL Setup**
```bash
# Database specifications
Instance Class: db.t3.micro (free tier) or db.t3.small
Engine: PostgreSQL 14.7
Storage: 20 GB GP2
Multi-AZ: Enabled (for production)
Backup Retention: 7 days
Maintenance Window: Sunday 3:00 AM UTC
```

### **Database Connection String**
```bash
# Format
DATABASE_URL=postgresql://username:password@endpoint:5432/database

# Example
DATABASE_URL=postgresql://cmms_admin:SecurePass123@cmms-database.abc123.us-east-1.rds.amazonaws.com:5432/cmms
```

### **Database Security**
- ✅ **SSL/TLS Encryption**: Required for all connections
- ✅ **VPC Security Groups**: Only EC2 can access RDS
- ✅ **Automated Backups**: Daily backups with 7-day retention
- ✅ **Encryption at Rest**: AES-256 encryption
- ✅ **Encryption in Transit**: SSL/TLS for all connections

## 🔒 **Security Features**

### **Network Security**
```bash
# VPC Configuration
CIDR Block: 10.0.0.0/16
Public Subnets: 10.0.1.0/24, 10.0.2.0/24
Private Subnets: 10.0.3.0/24, 10.0.4.0/24

# Security Groups
ALB: Ports 80, 443 (HTTP/HTTPS)
EC2: Ports 22 (SSH), 80, 443 (from ALB)
RDS: Port 5432 (PostgreSQL from EC2 only)
```

### **Application Security**
- ✅ **HTTPS Only**: SSL/TLS encryption
- ✅ **Security Headers**: XSS, clickjacking protection
- ✅ **Rate Limiting**: 60 requests/minute per IP
- ✅ **IP Restrictions**: Office network only
- ✅ **JWT Authentication**: 30-minute token expiration

### **Data Security**
- ✅ **Database Encryption**: AES-256 at rest
- ✅ **Backup Encryption**: S3 with encryption
- ✅ **Transit Encryption**: SSL/TLS everywhere
- ✅ **Access Logging**: All database access logged

## 📊 **Monitoring & Logging**

### **CloudWatch Monitoring**
```bash
# Metrics to monitor
- CPU Utilization (EC2)
- Memory Usage (EC2)
- Database Connections (RDS)
- Request Count (ALB)
- Error Rate (ALB)
- Response Time (ALB)
```

### **Log Management**
```bash
# Log groups created
/aws/ec2/cmms (Application logs)
/aws/rds/instance/cmms-database (Database logs)
/aws/applicationloadbalancer/cmms-alb (ALB logs)
```

### **Alerts Setup**
```bash
# Critical alerts
- CPU > 80% for 5 minutes
- Memory > 85% for 5 minutes
- Database connections > 80%
- Error rate > 5%
- Response time > 5 seconds
```

## 🔄 **Backup & Recovery**

### **Automated Backups**
```bash
# RDS Backups
- Daily automated backups
- 7-day retention period
- Point-in-time recovery
- Cross-region backup copies

# Application Backups
- S3 bucket for file backups
- Daily database dumps
- Configuration backups
- Log archives
```

### **Disaster Recovery**
```bash
# Recovery procedures
1. Database restore from snapshot
2. Application redeployment
3. DNS failover
4. Data validation
```

## 💰 **Cost Optimization**

### **Free Tier (12 months)**
- ✅ **EC2 t3.micro**: 750 hours/month
- ✅ **RDS db.t3.micro**: 750 hours/month
- ✅ **ALB**: 15 GB data processing
- ✅ **CloudWatch**: 5 GB data ingestion
- ✅ **S3**: 5 GB storage

### **Production Costs (after free tier)**
```bash
Monthly Estimate:
- RDS PostgreSQL (db.t3.small): $25-35
- EC2 (t3.small): $15-20
- ALB: $20-30
- CloudWatch: $10-20
- S3 Storage: $5-10
- Data Transfer: $10-20
- Total: $85-135/month
```

## 🚨 **Troubleshooting**

### **Common Issues**
```bash
# Database connection issues
- Check security group rules
- Verify endpoint URL
- Test SSL connection
- Check credentials

# Application deployment issues
- Check user data script
- Verify instance profile
- Review CloudWatch logs
- Test service status
```

### **Performance Issues**
```bash
# High CPU/Memory
- Scale up instance type
- Optimize application code
- Add caching layer
- Review database queries

# Slow response times
- Check ALB health
- Review security group rules
- Monitor database performance
- Optimize frontend assets
```

## 📈 **Scaling Options**

### **Vertical Scaling**
```bash
# Scale up resources
- EC2: t3.micro → t3.small → t3.medium
- RDS: db.t3.micro → db.t3.small → db.r5.large
- Storage: 20 GB → 100 GB → 1 TB
```

### **Horizontal Scaling**
```bash
# Auto Scaling Group
- Minimum: 1 instance
- Maximum: 5 instances
- Target CPU: 70%
- Health checks: ALB

# Read Replicas
- Add RDS read replicas
- Distribute read load
- Improve performance
```

## 🔧 **Maintenance**

### **Regular Tasks**
```bash
# Weekly
- Review CloudWatch metrics
- Check security group rules
- Update application code
- Test backup restoration

# Monthly
- Review cost optimization
- Update SSL certificates
- Security audit
- Performance review
```

### **Updates & Patches**
```bash
# Security updates
- RDS maintenance windows
- EC2 system updates
- Application updates
- SSL certificate renewal
```

## 🎯 **Quick Start Commands**

```bash
# 1. Set up security infrastructure
./aws-security-config.sh

# 2. Deploy database and application
./aws-setup.sh

# 3. Configure SSL certificate
aws acm request-certificate --domain-name your-domain.com

# 4. Update DNS records
# Point your domain to ALB endpoint

# 5. Test deployment
curl https://your-domain.com/health
```

## 📞 **Support Resources**

### **AWS Documentation**
- **RDS**: [docs.aws.amazon.com/rds](https://docs.aws.amazon.com/rds)
- **EC2**: [docs.aws.amazon.com/ec2](https://docs.aws.amazon.com/ec2)
- **VPC**: [docs.aws.amazon.com/vpc](https://docs.aws.amazon.com/vpc)
- **ALB**: [docs.aws.amazon.com/elasticloadbalancing](https://docs.aws.amazon.com/elasticloadbalancing)

### **AWS Support**
- **Basic**: Community forums
- **Developer**: $29/month
- **Business**: $100/month
- **Enterprise**: $15,000/month

---

**☁️ Your CMMS is now deployed on AWS with enterprise-grade security and scalability!** 