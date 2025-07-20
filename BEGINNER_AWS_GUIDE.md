# 🚀 Complete Beginner's Guide to AWS CMMS Deployment

## Overview
This guide will walk you through deploying your CMMS application on AWS step-by-step, even if you've never used AWS before.

## 📋 **Prerequisites Checklist**

### **What You Need:**
- ✅ **AWS Account** (we'll create this)
- ✅ **Credit Card** (for AWS billing)
- ✅ **Domain Name** (optional, we'll use AWS domain)
- ✅ **Basic Computer Skills** (copy/paste, command line)

### **What You'll Learn:**
- How to create an AWS account
- How to set up AWS CLI
- How to deploy a database
- How to deploy your application
- How to secure everything

---

## 🏗️ **Step 1: Create AWS Account (15 minutes)**

### **1.1 Go to AWS Website**
1. Open your web browser
2. Go to: https://aws.amazon.com
3. Click "Create an AWS Account"

### **1.2 Fill in Account Details**
```
Email Address: your-email@example.com
Password: Create a strong password
AWS Account Name: Your Company Name
```

### **1.3 Contact Information**
```
Full Name: Your Name
Phone Number: Your phone number
Country: Your country
Address: Your address
City: Your city
State: Your state
Postal Code: Your postal code
```

### **1.4 Payment Information**
```
Credit Card Number: Your card number
Expiration Date: MM/YY
Cardholder Name: Your name
Billing Address: Same as above
```

### **1.5 Identity Verification**
- AWS will call your phone number
- Enter the 4-digit code they provide
- Choose "Basic Support Plan" (Free)

### **1.6 Account Created!**
- You'll receive a confirmation email
- Save your AWS account ID (12 digits)
- **Important**: AWS will charge your card $1 for verification, then refund it

---

## 🔧 **Step 2: Install AWS CLI (10 minutes)**

### **2.1 Download AWS CLI**
1. Go to: https://aws.amazon.com/cli/
2. Click "Download AWS CLI"
3. Choose your operating system:
   - **Windows**: Download the MSI installer
   - **Mac**: Download the PKG installer
   - **Linux**: Use the command line

### **2.2 Install AWS CLI**

#### **For Windows:**
1. Run the downloaded MSI file
2. Follow the installation wizard
3. Open Command Prompt and test:
   ```cmd
   aws --version
   ```

#### **For Mac:**
1. Run the downloaded PKG file
2. Follow the installation wizard
3. Open Terminal and test:
   ```bash
   aws --version
   ```

#### **For Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### **2.3 Configure AWS CLI**
```bash
aws configure
```

**Enter the following information:**
```
AWS Access Key ID: [We'll get this next]
AWS Secret Access Key: [We'll get this next]
Default region name: us-east-1
Default output format: json
```

---

## 🔑 **Step 3: Create AWS Access Keys (5 minutes)**

### **3.1 Log into AWS Console**
1. Go to: https://console.aws.amazon.com
2. Sign in with your email and password

### **3.2 Create Access Keys**
1. Click your username in the top-right corner
2. Click "Security credentials"
3. Scroll down to "Access keys"
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Check the confirmation box
7. Click "Next"

### **3.3 Save Your Keys**
```
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**⚠️ IMPORTANT**: 
- Save these keys in a secure place
- Never share them with anyone
- We'll use them in the next step

### **3.4 Configure AWS CLI with Your Keys**
```bash
aws configure
```

**Enter your actual keys:**
```
AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name: us-east-1
Default output format: json
```

### **3.5 Test Configuration**
```bash
aws sts get-caller-identity
```

**You should see:**
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourName"
}
```

---

## 🗄️ **Step 4: Create Database (20 minutes)**

### **4.1 Go to RDS Console**
1. In AWS Console, search for "RDS"
2. Click "RDS" service
3. Click "Create database"

### **4.2 Choose Database Settings**
```
Database creation method: Standard create
Engine type: PostgreSQL
Version: PostgreSQL 14.7
Templates: Free tier
```

### **4.3 Database Settings**
```
DB instance identifier: cmms-database
Master username: cmms_admin
Master password: Create a strong password (save it!)
```

### **4.4 Instance Configuration**
```
DB instance class: db.t3.micro (Free tier)
Storage: 20 GB
Storage type: General Purpose SSD (gp2)
```

### **4.5 Connectivity**
```
VPC: Default VPC
Public access: Yes
VPC security group: Create new
Database port: 5432
```

### **4.6 Additional Configuration**
```
Initial database name: cmms
Backup retention: 7 days
Monitoring: Enable enhanced monitoring
```

### **4.7 Create Database**
1. Click "Create database"
2. Wait 5-10 minutes for creation
3. Note the endpoint URL (we'll need this)

---

## 🖥️ **Step 5: Create Application Server (30 minutes)**

### **5.1 Go to EC2 Console**
1. In AWS Console, search for "EC2"
2. Click "EC2" service
3. Click "Launch Instance"

### **5.2 Choose AMI**
```
Name: Amazon Linux 2023
Architecture: 64-bit (x86)
Type: Amazon Machine Image (AMI)
```

### **5.3 Choose Instance Type**
```
Instance type: t3.micro (Free tier)
vCPUs: 2
Memory: 1 GiB
```

### **5.4 Configure Instance**
```
Number of instances: 1
Network: Default VPC
Subnet: Default subnet
Auto-assign public IP: Enable
```

### **5.5 Add Storage**
```
Size: 8 GB
Volume type: General Purpose SSD (gp2)
```

### **5.6 Configure Security Group**
```
Security group name: cmms-server-sg
Description: Security group for CMMS server
```

**Add these rules:**
```
Type: SSH, Port: 22, Source: 0.0.0.0/0
Type: HTTP, Port: 80, Source: 0.0.0.0/0
Type: HTTPS, Port: 443, Source: 0.0.0.0/0
```

### **5.7 Review and Launch**
1. Click "Launch instance"
2. Choose "Create a new key pair"
3. Name: cmms-key
4. Download the .pem file
5. Save it securely (we'll need it to connect)

### **5.8 Connect to Your Server**
```bash
# For Mac/Linux:
chmod 400 cmms-key.pem
ssh -i cmms-key.pem ec2-user@YOUR_SERVER_IP

# For Windows (using PuTTY):
# Convert .pem to .ppk using PuTTYgen
```

---

## 🚀 **Step 6: Deploy Your Application (45 minutes)**

### **6.1 Connect to Your Server**
```bash
ssh -i cmms-key.pem ec2-user@YOUR_SERVER_IP
```

### **6.2 Update System**
```bash
sudo yum update -y
```

### **6.3 Install Required Software**
```bash
# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL client
sudo yum install -y postgresql15

# Install nginx
sudo yum install -y nginx

# Install git
sudo yum install -y git
```

### **6.4 Clone Your Application**
```bash
# Create application directory
mkdir -p /opt/cmms
cd /opt/cmms

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/cmms.git .
```

### **6.5 Set Up Python Environment**
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### **6.6 Build Frontend**
```bash
# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

### **6.7 Configure Environment**
```bash
# Create environment file
cat > backend/.env << EOF
DATABASE_URL=postgresql://cmms_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/cmms
CORS_ORIGINS=http://YOUR_SERVER_IP
SECRET_KEY=your-secret-key-here
EOF
```

**Replace:**
- `YOUR_PASSWORD` with the password you created for RDS
- `YOUR_RDS_ENDPOINT` with your RDS endpoint URL
- `YOUR_SERVER_IP` with your EC2 server's public IP

### **6.8 Create System Service**
```bash
# Create systemd service for backend
sudo tee /etc/systemd/system/cmms-backend.service << EOF
[Unit]
Description=CMMS Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/cmms/backend
Environment=PATH=/opt/cmms/venv/bin
ExecStart=/opt/cmms/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### **6.9 Configure Nginx**
```bash
# Create nginx configuration
sudo tee /etc/nginx/conf.d/cmms.conf << EOF
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    # Frontend
    location / {
        root /opt/cmms/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
```

### **6.10 Start Services**
```bash
# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Start backend service
sudo systemctl enable cmms-backend
sudo systemctl start cmms-backend

# Check status
sudo systemctl status nginx
sudo systemctl status cmms-backend
```

---

## 🔐 **Step 7: Set Up SSL Certificate (15 minutes)**

### **7.1 Install Certbot**
```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx
```

### **7.2 Get SSL Certificate**
```bash
# Request certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Or if you don't have a domain, use your server IP
sudo certbot --nginx -d YOUR_SERVER_IP
```

### **7.3 Test SSL**
```bash
# Test your application
curl https://YOUR_SERVER_IP
```

---

## 🧪 **Step 8: Test Your Application (10 minutes)**

### **8.1 Test Backend API**
```bash
# Test health endpoint
curl http://YOUR_SERVER_IP/api/v1/health

# Should return: {"status": "healthy"}
```

### **8.2 Test Frontend**
1. Open your web browser
2. Go to: `http://YOUR_SERVER_IP`
3. You should see your CMMS application

### **8.3 Test Database Connection**
```bash
# Connect to your database
psql -h YOUR_RDS_ENDPOINT -U cmms_admin -d cmms

# Test connection
\dt
\q
```

---

## 📊 **Step 9: Monitor Your Application (5 minutes)**

### **9.1 Check Logs**
```bash
# Check backend logs
sudo journalctl -u cmms-backend -f

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
```

### **9.2 Set Up Monitoring**
1. Go to AWS Console
2. Search for "CloudWatch"
3. Create dashboard for your resources

---

## 💰 **Step 10: Cost Management (5 minutes)**

### **10.1 Set Up Billing Alerts**
1. Go to AWS Console
2. Search for "Billing"
3. Click "Billing preferences"
4. Set up billing alerts

### **10.2 Monitor Costs**
- Check AWS Cost Explorer
- Set up budget alerts
- Review monthly charges

---

## 🎉 **Congratulations!**

Your CMMS application is now running on AWS with:
- ✅ **Secure Database**: RDS PostgreSQL
- ✅ **Application Server**: EC2 with auto-restart
- ✅ **Web Server**: Nginx with SSL
- ✅ **Monitoring**: CloudWatch logs
- ✅ **Backups**: Automated database backups

### **Your Application URLs:**
- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api/v1`
- **Health Check**: `http://YOUR_SERVER_IP/api/v1/health`

### **Next Steps:**
1. **Add your team members** to the application
2. **Set up regular backups**
3. **Monitor performance**
4. **Scale as needed**

---

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **Can't connect to server:**
```bash
# Check security group rules
# Make sure ports 22, 80, 443 are open
```

#### **Database connection failed:**
```bash
# Check RDS endpoint
# Verify password
# Test connection manually
```

#### **Application not starting:**
```bash
# Check logs
sudo journalctl -u cmms-backend -f

# Check environment variables
cat /opt/cmms/backend/.env
```

#### **SSL certificate issues:**
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 📞 **Support Resources**

### **AWS Documentation:**
- **RDS**: https://docs.aws.amazon.com/rds/
- **EC2**: https://docs.aws.amazon.com/ec2/
- **CloudWatch**: https://docs.aws.amazon.com/cloudwatch/

### **AWS Support:**
- **Free Tier**: Community forums
- **Paid Support**: $29/month for developer support

---

**🎉 You've successfully deployed your CMMS on AWS!** 