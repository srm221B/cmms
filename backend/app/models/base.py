# app/models/base.py
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from app.db.session import Base

class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps to models"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BaseModel(Base):
    """Base model class that includes common columns"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)


