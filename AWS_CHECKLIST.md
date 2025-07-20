# ✅ AWS Deployment Checklist

## 📋 **Pre-Deployment Checklist**

### **Step 1: AWS Account Setup**
- [ ] Create AWS account at https://aws.amazon.com
- [ ] Verify email and phone number
- [ ] Add credit card for billing
- [ ] Note your AWS Account ID (12 digits)
- [ ] Choose "Basic Support Plan" (Free)

### **Step 2: AWS CLI Setup**
- [ ] Download AWS CLI from https://aws.amazon.com/cli/
- [ ] Install AWS CLI on your computer
- [ ] Test installation: `aws --version`
- [ ] Go to AWS Console → IAM → Users → Your User → Security Credentials
- [ ] Create Access Key ID and Secret Access Key
- [ ] Run `aws configure` and enter your keys
- [ ] Test configuration: `aws sts get-caller-identity`

---

## 🗄️ **Database Setup Checklist**

### **Step 3: RDS PostgreSQL Database**
- [ ] Go to AWS Console → RDS
- [ ] Click "Create database"
- [ ] Choose "Standard create"
- [ ] Select "PostgreSQL" engine
- [ ] Choose "Free tier" template
- [ ] Set DB instance identifier: `cmms-database`
- [ ] Set master username: `cmms_admin`
- [ ] Create strong password (save it!)
- [ ] Choose "db.t3.micro" instance class
- [ ] Set storage to 20 GB
- [ ] Enable "Public access"
- [ ] Create new security group
- [ ] Set initial database name: `cmms`
- [ ] Enable backup retention: 7 days
- [ ] Click "Create database"
- [ ] Wait 5-10 minutes for creation
- [ ] Note the endpoint URL (we'll need this)

**Database Information to Save:**
```
Endpoint: cmms-database.abc123.us-east-1.rds.amazonaws.com
Username: cmms_admin
Password: [your password]
Database: cmms
Port: 5432
```

---

## 🖥️ **Server Setup Checklist**

### **Step 4: EC2 Application Server**
- [ ] Go to AWS Console → EC2
- [ ] Click "Launch Instance"
- [ ] Choose "Amazon Linux 2023" AMI
- [ ] Select "t3.micro" instance type (Free tier)
- [ ] Configure instance details (use defaults)
- [ ] Add storage: 8 GB
- [ ] Create new security group: `cmms-server-sg`
- [ ] Add security group rules:
  - [ ] SSH (Port 22) from 0.0.0.0/0
  - [ ] HTTP (Port 80) from 0.0.0.0/0
  - [ ] HTTPS (Port 443) from 0.0.0.0/0
- [ ] Create new key pair: `cmms-key`
- [ ] Download the .pem file
- [ ] Launch instance
- [ ] Note the public IP address

**Server Information to Save:**
```
Public IP: 12.34.56.78
Key Pair: cmms-key.pem
Username: ec2-user
```

---

## 🚀 **Application Deployment Checklist**

### **Step 5: Connect to Server**
- [ ] Open terminal/command prompt
- [ ] Navigate to folder with cmms-key.pem
- [ ] Set permissions: `chmod 400 cmms-key.pem`
- [ ] Connect: `ssh -i cmms-key.pem ec2-user@YOUR_SERVER_IP`
- [ ] Verify connection (you should see a Linux prompt)

### **Step 6: Install Software**
- [ ] Update system: `sudo yum update -y`
- [ ] Install Python: `sudo yum install -y python3.11 python3.11-pip`
- [ ] Install Node.js: 
  ```bash
  curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
  sudo yum install -y nodejs
  ```
- [ ] Install PostgreSQL client: `sudo yum install -y postgresql15`
- [ ] Install nginx: `sudo yum install -y nginx`
- [ ] Install git: `sudo yum install -y git`

### **Step 7: Deploy Application**
- [ ] Create app directory: `mkdir -p /opt/cmms && cd /opt/cmms`
- [ ] Clone your repository: `git clone https://github.com/your-username/cmms.git .`
- [ ] Create Python environment: `python3.11 -m venv venv`
- [ ] Activate environment: `source venv/bin/activate`
- [ ] Install Python dependencies: `pip install -r backend/requirements.txt`
- [ ] Install frontend dependencies: `cd frontend && npm install`
- [ ] Build frontend: `npm run build`
- [ ] Go back to root: `cd ..`

### **Step 8: Configure Environment**
- [ ] Create environment file:
  ```bash
  cat > backend/.env << EOF
  DATABASE_URL=postgresql://cmms_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/cmms
  CORS_ORIGINS=http://YOUR_SERVER_IP
  SECRET_KEY=your-secret-key-here
  EOF
  ```
- [ ] Replace `YOUR_PASSWORD` with your RDS password
- [ ] Replace `YOUR_RDS_ENDPOINT` with your RDS endpoint
- [ ] Replace `YOUR_SERVER_IP` with your EC2 public IP

### **Step 9: Create Services**
- [ ] Create backend service file (copy from guide)
- [ ] Create nginx configuration (copy from guide)
- [ ] Enable nginx: `sudo systemctl enable nginx && sudo systemctl start nginx`
- [ ] Enable backend: `sudo systemctl enable cmms-backend && sudo systemctl start cmms-backend`
- [ ] Check status: `sudo systemctl status nginx && sudo systemctl status cmms-backend`

---

## 🔐 **Security Setup Checklist**

### **Step 10: SSL Certificate**
- [ ] Install certbot: `sudo yum install -y certbot python3-certbot-nginx`
- [ ] Request SSL certificate: `sudo certbot --nginx -d YOUR_SERVER_IP`
- [ ] Test HTTPS: `curl https://YOUR_SERVER_IP`

---

## 🧪 **Testing Checklist**

### **Step 11: Test Application**
- [ ] Test backend health: `curl http://YOUR_SERVER_IP/api/v1/health`
- [ ] Test frontend: Open browser to `http://YOUR_SERVER_IP`
- [ ] Test database connection: `psql -h YOUR_RDS_ENDPOINT -U cmms_admin -d cmms`
- [ ] Test SSL: `curl https://YOUR_SERVER_IP`

**Expected Results:**
- [ ] Health endpoint returns: `{"status": "healthy"}`
- [ ] Frontend loads in browser
- [ ] Database connection successful
- [ ] SSL certificate working

---

## 📊 **Monitoring Checklist**

### **Step 12: Set Up Monitoring**
- [ ] Check backend logs: `sudo journalctl -u cmms-backend -f`
- [ ] Check nginx logs: `sudo tail -f /var/log/nginx/access.log`
- [ ] Go to AWS Console → CloudWatch
- [ ] Create dashboard for your resources
- [ ] Set up billing alerts in AWS Console → Billing

---

## 💰 **Cost Management Checklist**

### **Step 13: Cost Control**
- [ ] Set up billing alerts in AWS Console
- [ ] Check AWS Cost Explorer
- [ ] Monitor monthly charges
- [ ] Set budget limits

---

## 🎉 **Final Checklist**

### **Step 14: Verify Everything Works**
- [ ] Application accessible via HTTP: `http://YOUR_SERVER_IP`
- [ ] Application accessible via HTTPS: `https://YOUR_SERVER_IP`
- [ ] Backend API responding: `http://YOUR_SERVER_IP/api/v1/health`
- [ ] Database connection working
- [ ] SSL certificate valid
- [ ] Services auto-starting on reboot
- [ ] Logs being generated
- [ ] Backups configured

---

## 📞 **Support Information**

### **If Something Goes Wrong:**
- [ ] Check AWS Console for service status
- [ ] Review CloudWatch logs
- [ ] Check security group rules
- [ ] Verify environment variables
- [ ] Test database connection manually
- [ ] Check service status: `sudo systemctl status cmms-backend`

### **Useful Commands:**
```bash
# Check service status
sudo systemctl status cmms-backend
sudo systemctl status nginx

# Check logs
sudo journalctl -u cmms-backend -f
sudo tail -f /var/log/nginx/access.log

# Test database
psql -h YOUR_RDS_ENDPOINT -U cmms_admin -d cmms

# Restart services
sudo systemctl restart cmms-backend
sudo systemctl restart nginx
```

---

## 🎯 **Success Criteria**

Your deployment is successful when:
- ✅ Application loads in browser
- ✅ Backend API responds
- ✅ Database connection works
- ✅ SSL certificate is valid
- ✅ Services auto-start on reboot
- ✅ Logs are being generated
- ✅ Backups are configured

**🎉 Congratulations! Your CMMS is now running on AWS!** 