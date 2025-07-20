from sqlalchemy import Column, String, Text, Integer, ForeignKey, TIMESTAMP, Numeric
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class TransferHeader(BaseModel):
    __tablename__ = "transfer_header"
    __table_args__ = {'extend_existing': True}

    transfer_date = Column(TIMESTAMP, nullable=False)
    from_location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'))
    to_location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'))
    transferred_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    status = Column(String(20), default='completed')
    notes = Column(Text)
    created_at = Column(TIMESTAMP, nullable=False)
    
    # Relationships
    from_location = relationship("Location", foreign_keys=[from_location_id], back_populates="transfers_from")
    to_location = relationship("Location", foreign_keys=[to_location_id])
    transfer_items = relationship("TransferItem", back_populates="transfer_header")

class TransferItem(BaseModel):
    __tablename__ = "transfer_item"
    __table_args__ = {'extend_existing': True}

    transfer_id = Column(Integer, ForeignKey('transfer_header.id', ondelete='CASCADE'))
    spare_part_id = Column(Integer, ForeignKey('inventory_master.id', ondelete='CASCADE'))
    quantity = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False)
    
    # Relationships
    transfer_header = relationship("TransferHeader", back_populates="transfer_items")
    inventory_master = relationship("InventoryMaster", back_populates="transfer_items")