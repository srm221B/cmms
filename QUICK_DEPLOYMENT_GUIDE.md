# 🚀 Quick Deployment Guide (RDS Already Set Up)

## Overview
Since your RDS database is already set up and your data is migrated, let's deploy your application to AWS EC2.

## 📋 **What You Need**

### **Prerequisites (Already Done):**
- ✅ AWS Account created
- ✅ RDS PostgreSQL database running
- ✅ Data migrated to RDS
- ✅ AWS CLI installed and configured

### **What We'll Do:**
1. Create EC2 instance
2. Deploy your application
3. Connect to RDS database
4. Set up SSL certificate
5. Test everything

---

## 🖥️ **Step 1: Create EC2 Instance (5 minutes)**

### **1.1 Go to EC2 Console**
1. Open AWS Console: https://console.aws.amazon.com
2. Search for "EC2"
3. Click "Launch Instance"

### **1.2 Configure Instance**
```
Name: cmms-server
AMI: Amazon Linux 2023
Instance type: t3.micro (Free tier)
Key pair: Create new (cmms-key)
Network settings: Default VPC
Security group: Create new (cmms-server-sg)
```

### **1.3 Security Group Rules**
Add these rules to your security group:
```
Type: SSH, Port: 22, Source: 0.0.0.0/0
Type: HTTP, Port: 80, Source: 0.0.0.0/0
Type: HTTPS, Port: 443, Source: 0.0.0.0/0
```

### **1.4 Launch Instance**
1. Click "Launch instance"
2. Download the .pem key file
3. Note your instance's public IP address

---

## 🔧 **Step 2: Connect to Your Server (2 minutes)**

### **2.1 Connect via SSH**
```bash
# For Mac/Linux:
chmod 400 cmms-key.pem
ssh -i cmms-key.pem ec2-user@YOUR_SERVER_IP

# For Windows (using PuTTY):
# Convert .pem to .ppk using PuTTYgen
```

### **2.2 Verify Connection**
You should see a Linux prompt like:
```bash
[ec2-user@ip-172-31-1-1 ~]$
```

---

## 🚀 **Step 3: Deploy Your Application (15 minutes)**

### **3.1 Update System**
```bash
sudo yum update -y
```

### **3.2 Install Required Software**
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

### **3.3 Clone Your Application**
```bash
# Create application directory
mkdir -p /opt/cmms
cd /opt/cmms

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/cmms.git .
```

### **3.4 Set Up Python Environment**
```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### **3.5 Build Frontend**
```bash
# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

---

## 🔗 **Step 4: Connect to Your RDS Database (5 minutes)**

### **4.1 Get Your RDS Information**
From your AWS Console → RDS, note:
- **Endpoint**: `cmms-database.abc123.us-east-1.rds.amazonaws.com`
- **Username**: `cmms_admin`
- **Password**: Your database password
- **Database**: `cmms`

### **4.2 Configure Environment**
```bash
# Create environment file
cat > backend/.env << EOF
DATABASE_URL=postgresql://cmms_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/cmms
CORS_ORIGINS=http://YOUR_SERVER_IP
SECRET_KEY=your-secret-key-here
EOF
```

**Replace:**
- `YOUR_PASSWORD` with your RDS password
- `YOUR_RDS_ENDPOINT` with your RDS endpoint URL
- `YOUR_SERVER_IP` with your EC2 public IP

### **4.3 Test Database Connection**
```bash
# Test connection to RDS
psql -h YOUR_RDS_ENDPOINT -U cmms_admin -d cmms

# You should see a PostgreSQL prompt
# Type \dt to see your tables
# Type \q to exit
```

---

## ⚙️ **Step 5: Create Services (5 minutes)**

### **5.1 Create Backend Service**
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

### **5.2 Configure Nginx**
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

### **5.3 Start Services**
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

## 🔐 **Step 6: Set Up SSL Certificate (5 minutes)**

### **6.1 Install Certbot**
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### **6.2 Get SSL Certificate**
```bash
# Request certificate
sudo certbot --nginx -d YOUR_SERVER_IP

# Or if you have a domain:
sudo certbot --nginx -d your-domain.com
```

---

## 🧪 **Step 7: Test Your Application (5 minutes)**

### **7.1 Test Backend API**
```bash
# Test health endpoint
curl http://YOUR_SERVER_IP/api/v1/health

# Should return: {"status": "healthy"}
```

### **7.2 Test Frontend**
1. Open your web browser
2. Go to: `http://YOUR_SERVER_IP`
3. You should see your CMMS application

### **7.3 Test Database Connection**
```bash
# Test database connection
psql -h YOUR_RDS_ENDPOINT -U cmms_admin -d cmms -c "SELECT COUNT(*) FROM users;"
```

---

## 📊 **Step 8: Monitor Your Application (2 minutes)**

### **8.1 Check Logs**
```bash
# Check backend logs
sudo journalctl -u cmms-backend -f

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
```

### **8.2 Set Up Monitoring**
1. Go to AWS Console → CloudWatch
2. Create dashboard for your resources
3. Set up billing alerts

---

## 🎉 **Success!**

Your CMMS application is now running on AWS with:
- ✅ **Application Server**: EC2 t3.micro (Free tier)
- ✅ **Database**: RDS PostgreSQL (Your existing setup)
- ✅ **Web Server**: Nginx with SSL
- ✅ **Auto-restart**: Services start automatically
- ✅ **Monitoring**: CloudWatch logs

### **Your Application URLs:**
- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api/v1`
- **Health Check**: `http://YOUR_SERVER_IP/api/v1/health`

### **Next Steps:**
1. **Add your team members** to the application
2. **Set up regular backups** (already configured in RDS)
3. **Monitor performance** via CloudWatch
4. **Scale as needed** (upgrade instance types)

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

## 💰 **Cost Summary**

### **Free Tier (12 months):**
- ✅ **EC2 t3.micro**: $0/month
- ✅ **RDS db.t3.micro**: $0/month (if using free tier)
- ✅ **Data Transfer**: $0/month

### **After Free Tier:**
- **EC2 t3.small**: $15-20/month
- **RDS db.t3.small**: $25-35/month
- **Total**: $40-55/month

---

**🎉 Your CMMS is now deployed on AWS with enterprise-grade infrastructure!** 