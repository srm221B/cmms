from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin

class Location(BaseModel, TimestampMixin):
    __tablename__ = "locations"
    __table_args__ = {'extend_existing': True}
    
    name = Column(String(100), nullable=False)
    description = Column(Text)
    address = Column(Text)
    
    # Relationships
    assets = relationship("Asset", back_populates="location")
    inventory_balances = relationship("InventoryBalance", back_populates="location")
    inventory_inflows = relationship("InventoryInflow", back_populates="location")
    transfers_from = relationship("TransferHeader", foreign_keys="TransferHeader.from_location_id", back_populates="from_location")
    transfers_to = relationship("TransferHeader", foreign_keys="TransferHeader.to_location_id", back_populates="to_location")