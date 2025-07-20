from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin
from app.models.associations import user_roles

class Role(BaseModel, TimestampMixin):
    __tablename__ = "roles"
    __table_args__ = {'extend_existing': True}
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text)
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")