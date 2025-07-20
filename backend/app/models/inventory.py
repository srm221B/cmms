from sqlalchemy import Column, String, Text, Integer, ForeignKey, Numeric, UniqueConstraint, TIMESTAMP
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin

class InventoryMaster(BaseModel, TimestampMixin):
    __tablename__ = "inventory_master"
    __table_args__ = {'extend_existing': True}

    part_code = Column(String(50), unique=True, nullable=False)
    part_name = Column(String(100), nullable=False)
    description = Column(Text)
    unit_of_issue = Column(String(20), nullable=False)
    unit_price = Column(Numeric(15, 2))
    minimum_quantity = Column(Integer, default=0)
    category = Column(String(100))
    criticality = Column(String(50))
    
    # Relationships
    balances = relationship("InventoryBalance", back_populates="inventory_master")
    inflows = relationship("InventoryInflow", back_populates="inventory_master")
    transfer_items = relationship("TransferItem", back_populates="inventory_master")
    work_order_parts = relationship("WorkOrderPart", back_populates="inventory_master")

class InventoryBalance(BaseModel):
    __tablename__ = "inventory_balances"
    __table_args__ = (
        UniqueConstraint('spare_part_id', 'location_id', name='uix_inventory_balance_part_location'),
        {'extend_existing': True}
    )

    spare_part_id = Column(Integer, ForeignKey('inventory_master.id', ondelete='CASCADE'))
    location_id = Column(Integer, ForeignKey('locations.id', ondelete='CASCADE'))
    in_stock = Column(Integer, default=0, nullable=False)
    total_received = Column(Integer, default=0, nullable=False)
    total_consumption = Column(Integer, default=0, nullable=False)
    
    # Relationships
    inventory_master = relationship("InventoryMaster", back_populates="balances")
    location = relationship("Location", back_populates="inventory_balances")

class InventoryInflow(BaseModel):
    __tablename__ = "inventory_inflow"
    __table_args__ = {'extend_existing': True}
    
    spare_part_id = Column(Integer, ForeignKey('inventory_master.id', ondelete='SET NULL'))
    location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'))
    quantity = Column(Integer, nullable=False)
    received_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    received_date = Column(TIMESTAMP, nullable=False)
    supplier = Column(String(100))
    reference_number = Column(String(100))
    unit_cost = Column(Numeric(15, 2))
    created_at = Column(TIMESTAMP, nullable=False)
    
    # Relationships
    inventory_master = relationship("InventoryMaster", back_populates="inflows")
    location = relationship("Location", back_populates="inventory_inflows")
    receiver = relationship("User", foreign_keys=[received_by])