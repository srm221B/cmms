from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel, TimestampMixin

class Asset(BaseModel, TimestampMixin):
    __tablename__ = "assets"
    name = Column(String(255), nullable=False)
    description = Column(Text)
    asset_category_id = Column(Integer, ForeignKey("asset_categories.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    status = Column(String(50), default="active")
    manufacturer = Column(String(255))
    model = Column(String(255))
    serial_number = Column(String(255))
    installation_date = Column(DateTime)
    warranty_expiry = Column(DateTime)
    specifications = Column(Text)
    
    # New columns for filtering
    running_hours = Column(DECIMAL(10,2))
    power_generation = Column(DECIMAL(10,2))
    load_factor = Column(DECIMAL(5,2))
    availability = Column(DECIMAL(5,2))
    cod = Column(Date)  # Commercial Operation Date
    bim = Column(DECIMAL(10,2))  # Balance of Plant Index

    # Relationships
    asset_category = relationship("AssetCategory", back_populates="assets")
    location = relationship("Location", back_populates="assets")
    work_orders = relationship("WorkOrder", back_populates="asset")