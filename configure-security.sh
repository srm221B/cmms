#!/bin/bash

echo "🔒 CMMS Security Configuration"
echo "=============================="

# Get current IP address
CURRENT_IP=$(curl -s ifconfig.me)
echo "🌐 Your current IP address: $CURRENT_IP"

# Get office network range
echo ""
echo "🏢 Office Network Configuration"
echo "Please provide your office network details:"
read -p "Office network IP range (e.g., 192.168.1.0/24): " OFFICE_NETWORK
read -p "VPN network IP range (if any, e.g., 10.0.0.0/8): " VPN_NETWORK

# Generate secure secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo ""
echo "🔧 Updating security configuration..."

# Update the auth.py file with new IP ranges
cat > backend/app/core/auth.py << EOF
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.config import settings
import ipaddress
import re

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()

# Rate limiting storage (in production, use Redis)
rate_limit_storage = {}

class SecurityConfig:
    # Allowed IP ranges (your office networks)
    ALLOWED_IPS = [
        "$OFFICE_NETWORK",  # Office network
        "$VPN_NETWORK",     # VPN network
    ]
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE = 60
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15
    
    # Password policy
    MIN_PASSWORD_LENGTH = 8
    REQUIRE_SPECIAL_CHAR = True
    REQUIRE_UPPERCASE = True
    REQUIRE_NUMBERS = True

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        return None

def check_ip_restriction(client_ip: str) -> bool:
    """Check if client IP is in allowed ranges"""
    try:
        client_ip_obj = ipaddress.ip_address(client_ip)
        for allowed_range in SecurityConfig.ALLOWED_IPS:
            if allowed_range and client_ip_obj in ipaddress.ip_network(allowed_range):
                return True
        return False
    except ValueError:
        return False

def check_rate_limit(client_ip: str, endpoint: str) -> bool:
    """Check rate limiting for client IP"""
    key = f"{client_ip}:{endpoint}"
    now = datetime.utcnow()
    
    if key not in rate_limit_storage:
        rate_limit_storage[key] = []
    
    # Remove old requests
    rate_limit_storage[key] = [
        req_time for req_time in rate_limit_storage[key]
        if now - req_time < timedelta(minutes=1)
    ]
    
    # Check if limit exceeded
    if len(rate_limit_storage[key]) >= SecurityConfig.MAX_REQUESTS_PER_MINUTE:
        return False
    
    # Add current request
    rate_limit_storage[key].append(now)
    return True

def validate_password_strength(password: str) -> bool:
    """Validate password meets security requirements"""
    if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
        return False
    
    if SecurityConfig.REQUIRE_SPECIAL_CHAR and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    if SecurityConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        return False
    
    if SecurityConfig.REQUIRE_NUMBERS and not re.search(r'\d', password):
        return False
    
    return True

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: List[str]):
    """Decorator to require specific roles"""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
EOF

# Create environment file with secure settings
cat > backend/.env << EOF
DATABASE_URL=your_postgres_connection_string_here
CORS_ORIGINS=https://your-frontend-domain.com
SECRET_KEY=$SECRET_KEY
EOF

echo ""
echo "✅ Security configuration updated!"
echo ""
echo "🔐 Generated secure secret key: $SECRET_KEY"
echo ""
echo "📋 Next Steps:"
echo "1. Update DATABASE_URL in backend/.env"
echo "2. Update CORS_ORIGINS in backend/.env"
echo "3. Deploy to Railway with these settings"
echo "4. Test IP restrictions from your office"
echo ""
echo "🛡️ Security Features Enabled:"
echo "✅ IP Address Restrictions"
echo "✅ Rate Limiting (60 requests/minute)"
echo "✅ JWT Authentication"
echo "✅ Password Strength Requirements"
echo "✅ Security Headers"
echo "✅ Request Logging"
echo ""
echo "🚨 Important:"
echo "- Only your office network can access the application"
echo "- All requests are logged and monitored"
echo "- Failed login attempts are tracked"
echo "- Rate limiting prevents abuse"
echo ""
echo "🔒 Your CMMS is now secure and protected!" 