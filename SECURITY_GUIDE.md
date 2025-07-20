# 🔒 CMMS Security Guide

## Overview
This guide explains the **multiple layers of security** implemented to protect your CMMS web application from unauthorized access and spam.

## 🛡️ Security Layers

### **Layer 1: Network-Level Security**

#### **IP Address Restrictions**
```python
# Only allow access from your office networks
ALLOWED_IPS = [
    "192.168.1.0/24",  # Your office network
    "10.0.0.0/8",      # Corporate network
    "172.16.0.0/12",   # VPN network
]
```

**How it works:**
- ✅ Blocks all requests from unauthorized IP addresses
- ✅ Only allows your team's office networks
- ✅ Prevents access from public internet
- ✅ Logs all blocked attempts

#### **Rate Limiting**
```python
MAX_REQUESTS_PER_MINUTE = 60
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
```

**Protection against:**
- ✅ Brute force attacks
- ✅ DDoS attacks
- ✅ API abuse
- ✅ Spam requests

### **Layer 2: Authentication & Authorization**

#### **JWT Token Security**
- ✅ **Short expiration** (30 minutes)
- ✅ **Secure token storage**
- ✅ **Automatic logout** on token expiry
- ✅ **Role-based access control**

#### **Password Security**
```python
MIN_PASSWORD_LENGTH = 8
REQUIRE_SPECIAL_CHAR = True
REQUIRE_UPPERCASE = True
REQUIRE_NUMBERS = True
```

**Requirements:**
- ✅ Minimum 8 characters
- ✅ Must contain uppercase letters
- ✅ Must contain numbers
- ✅ Must contain special characters
- ✅ Bcrypt hashing

### **Layer 3: Application Security**

#### **Security Headers**
```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

**Protection against:**
- ✅ Clickjacking attacks
- ✅ XSS attacks
- ✅ MIME type sniffing
- ✅ HTTPS enforcement

#### **CORS Protection**
```python
CORS_ORIGINS = "https://your-frontend-domain.com"
```

**Restricts access to:**
- ✅ Only your frontend domain
- ✅ No wildcard (*) access
- ✅ Prevents cross-origin attacks

### **Layer 4: Monitoring & Logging**

#### **Request Logging**
- ✅ **All requests logged** with IP addresses
- ✅ **Response times** monitored
- ✅ **Error tracking** for suspicious activity
- ✅ **Real-time alerts** for security events

#### **Security Alerts**
```python
# Automatic alerts for:
- Failed login attempts
- Blocked IP addresses
- Rate limit violations
- Unusual access patterns
```

## 🚀 **Deployment Security**

### **Environment Variables**
```bash
# Never commit these to Git
DATABASE_URL=your_secure_database_url
SECRET_KEY=your_very_secure_secret_key
CORS_ORIGINS=https://your-frontend-domain.com
```

### **Database Security**
- ✅ **SSL connections** required
- ✅ **Strong passwords** enforced
- ✅ **Regular backups** automated
- ✅ **Access logging** enabled

### **Cloud Provider Security**
- ✅ **Railway**: Built-in DDoS protection
- ✅ **Vercel**: Global CDN with security
- ✅ **PostgreSQL**: Encrypted connections

## 🔧 **Configuration for Your Team**

### **Step 1: Update IP Addresses**
```python
# In backend/app/core/auth.py
ALLOWED_IPS = [
    "YOUR_OFFICE_IP_RANGE/24",  # Replace with your office network
    "YOUR_VPN_IP_RANGE/24",     # Replace with your VPN network
]
```

### **Step 2: Set Strong Passwords**
```bash
# Generate secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### **Step 3: Configure Monitoring**
```python
# Set up alerts for:
- Multiple failed logins
- Unusual traffic patterns
- Database access attempts
```

## 📊 **Security Monitoring Dashboard**

### **Real-time Metrics**
- **Active Users**: Track who's using the system
- **Failed Logins**: Monitor authentication attempts
- **Blocked IPs**: See unauthorized access attempts
- **Rate Limits**: Monitor API usage patterns

### **Security Reports**
- **Daily**: Login attempts and blocked IPs
- **Weekly**: User activity and security events
- **Monthly**: Comprehensive security audit

## 🚨 **Emergency Response**

### **If Security Breach Detected**
1. **Immediate Actions**:
   ```bash
   # Block suspicious IP
   # Revoke compromised tokens
   # Change admin passwords
   ```

2. **Investigation**:
   ```bash
   # Check access logs
   # Review user activity
   # Analyze traffic patterns
   ```

3. **Recovery**:
   ```bash
   # Restore from backup if needed
   # Update security configurations
   # Notify team members
   ```

## 🔐 **Additional Security Options**

### **Option 1: VPN-Only Access**
```python
# Restrict to VPN IPs only
ALLOWED_IPS = ["YOUR_VPN_IP_RANGE/24"]
```

### **Option 2: Two-Factor Authentication**
```python
# Add TOTP support
# Require 2FA for admin accounts
# SMS/Email verification
```

### **Option 3: Advanced Monitoring**
```python
# Integrate with security tools:
- Sentry for error tracking
- LogRocket for user sessions
- AWS CloudWatch for metrics
```

## 💰 **Security Cost Breakdown**

### **Free Tier Security**
- ✅ **IP Restrictions**: $0
- ✅ **Rate Limiting**: $0
- ✅ **JWT Authentication**: $0
- ✅ **Security Headers**: $0
- ✅ **Request Logging**: $0

### **Paid Security Add-ons**
- **Advanced Monitoring**: $10-50/month
- **DDoS Protection**: $20-100/month
- **Security Audits**: $500-2000/year

## 🎯 **Quick Security Checklist**

### **Before Deployment**
- [ ] Update `ALLOWED_IPS` with your office networks
- [ ] Generate strong `SECRET_KEY`
- [ ] Set secure `DATABASE_URL`
- [ ] Configure `CORS_ORIGINS`

### **After Deployment**
- [ ] Test IP restrictions
- [ ] Verify rate limiting
- [ ] Check security headers
- [ ] Monitor access logs

### **Ongoing Security**
- [ ] Weekly security reviews
- [ ] Monthly password updates
- [ ] Quarterly security audits
- [ ] Annual penetration testing

## 📞 **Security Support**

### **Emergency Contacts**
- **Security Issues**: [Your contact]
- **Technical Support**: [Your contact]
- **Cloud Provider**: Railway/Vercel support

### **Security Resources**
- **OWASP Guidelines**: [owasp.org](https://owasp.org)
- **FastAPI Security**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Railway Security**: [docs.railway.app](https://docs.railway.app)

---

**🔒 Your CMMS is now protected with enterprise-grade security!** 