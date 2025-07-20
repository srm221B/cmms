from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import hashlib
import secrets
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User

# Define Pydantic models for auth
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool = False

# Simple in-memory token store
tokens: Dict[str, Dict[str, Any]] = {}

router = APIRouter(tags=["authentication"])

def get_password_hash(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return get_password_hash(plain_password) == hashed_password

def create_token(username: str) -> str:
    """Create a token for a user"""
    token = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
    # Store token with expiration (30 minutes)
    tokens[token] = {
        "username": username,
        "expires": datetime.utcnow() + timedelta(minutes=30)
    }
    return token

def get_current_user(x_token: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current user from token"""
    if not x_token or x_token not in tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = tokens[x_token]
    
    # Check if token has expired
    if datetime.utcnow() > token_data["expires"]:
        tokens.pop(x_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.username == token_data["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login using JSON request instead of form data"""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # For demo purposes, allow any password for admin user
    # In production, you should verify the password
    if user.username != 'admin':
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
    
    token = create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserInfo)
def read_users_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser
    }