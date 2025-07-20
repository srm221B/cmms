from pydantic import BaseModel, validator
from typing import List, Optional
import re

class UserBase(BaseModel):
    username: str
    email: str  # Changed from EmailStr to str
    is_active: bool = True
    
    @validator('email')
    def email_must_be_valid(cls, v):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(pattern, v):
            raise ValueError('Invalid email format')
        return v

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_superuser: bool

    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True