# 🚀 Simple AWS CMMS Deployment

## Why AWS is Better Than Railway/Render

✅ **More Reliable** - No dependency compilation issues  
✅ **Full Control** - You control the server completely  
✅ **Better Performance** - Dedicated resources  
✅ **Easier Debugging** - SSH access to server  
✅ **Cost Effective** - Free tier available  
✅ **Scalable** - Easy to upgrade when needed  

## 🎯 **Quick AWS Setup (30 minutes)**

### **Step 1: Create EC2 Instance (10 minutes)**

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose Amazon Linux 2023** (free tier eligible)
3. **Instance Type:** `t3.micro` (free tier)
4. **Security Group:** Create new with these rules:
   - **SSH (22):** Your IP only
   - **HTTP (80):** 0.0.0.0/0
   - **HTTPS (443):** 0.0.0.0/0
5. **Key Pair:** Create new key pair (save the .pem file)
6. **Launch Instance**

### **Step 2: Connect and Deploy (15 minutes)**

```bash
# 1. Connect to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Update system
sudo yum update -y

# 3. Install Python and dependencies
sudo yum install python3 python3-pip git -y

# 4. Clone your repository
git clone https://github.com/srm221B/cmms.git
cd cmms

# 5. Install Python dependencies
pip3 install -r requirements-minimal.txt

# 6. Create systemd service
sudo tee /etc/systemd/system/cmms.service << EOF
[Unit]
Description=CMMS FastAPI Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/cmms
Environment=PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/home/ec2-user/.local/bin/uvicorn app.main:app --host 0.0.0.0 --port 80
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 7. Start the service
sudo systemctl daemon-reload
sudo systemctl enable cmms
sudo systemctl start cmms

# 8. Check status
sudo systemctl status cmms
```

### **Step 3: Test Your Application (5 minutes)**

```bash
# Test locally on the server
curl http://localhost/health

# Test from your computer
curl http://your-ec2-ip/health
```

## 🎯 **Your CMMS Will Be Live At:**

- **Main App:** `http://your-ec2-ip/`
- **API Docs:** `http://your-ec2-ip/docs`
- **Health Check:** `http://your-ec2-ip/health`

## 🔧 **Environment Variables**

Create a `.env` file on your EC2 instance:

```bash
# On your EC2 instance
cat > .env << EOF
DATABASE_URL=sqlite:///./cmms.db
CORS_ORIGINS=http://localhost:3000,http://your-ec2-ip
SECRET_KEY=your-secret-key-here
EOF
```

## 📊 **Monitoring Commands**

```bash
# Check application status
sudo systemctl status cmms

# View logs
sudo journalctl -u cmms -f

# Check if port 80 is listening
sudo netstat -tlnp | grep :80

# Check application health
curl http://localhost/health
```

## 🔒 **Security Best Practices**

1. **Update Security Group** - Only allow your office IP for SSH
2. **Use HTTPS** - Set up SSL certificate later
3. **Regular Updates** - `sudo yum update -y` weekly
4. **Backup Database** - `cp cmms.db cmms.db.backup`

## 💰 **Cost Breakdown**

- **EC2 t3.micro:** Free for 12 months, then ~$8/month
- **Data Transfer:** Free for first 15GB/month
- **Storage:** Free for first 30GB

**Total Cost:** $0 for first year, ~$8/month after

## 🚀 **Advantages Over Railway/Render**

| Feature | Railway/Render | AWS EC2 |
|---------|----------------|---------|
| **Reliability** | ❌ Dependency issues | ✅ Full control |
| **Debugging** | ❌ Limited logs | ✅ SSH access |
| **Performance** | ❌ Shared resources | ✅ Dedicated server |
| **Cost** | ❌ Expensive scaling | ✅ Predictable pricing |
| **Customization** | ❌ Limited options | ✅ Full control |

## 🎯 **Next Steps**

1. **Deploy to EC2** (30 minutes)
2. **Set up domain name** (optional)
3. **Add SSL certificate** (optional)
4. **Set up monitoring** (optional)

**AWS is much more reliable and easier to manage than Railway/Render!** 🚀 