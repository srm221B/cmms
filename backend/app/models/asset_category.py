

from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin

class AssetCategory(BaseModel, TimestampMixin):
    __tablename__ = "asset_categories"
    __table_args__ = {'extend_existing': True}
    
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Relationships
    assets = relationship("Asset", back_populates="asset_category")