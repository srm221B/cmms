from sqlalchemy import Column, String, Text, Integer, ForeignKey, Numeric, Date, TIMESTAMP
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin
from datetime import datetime

class WorkOrderType(BaseModel, TimestampMixin):
    __tablename__ = "work_order_types"
    __table_args__ = {'extend_existing': True}
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    
    # Relationships
    work_orders = relationship("WorkOrder", back_populates="work_order_type")

class WorkOrder(BaseModel, TimestampMixin):
    __tablename__ = "work_orders"
    __table_args__ = {'extend_existing': True}

    work_order_number = Column(String(20), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    asset_id = Column(Integer, ForeignKey('assets.id', ondelete='SET NULL'))
    type_id = Column(Integer, ForeignKey('work_order_types.id', ondelete='SET NULL'))
    priority = Column(String(20), default='medium')
    status = Column(String(20), default='open')
    requested_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    assigned_to = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    requested_date = Column(TIMESTAMP, nullable=False)
    scheduled_date = Column(Date)
    start_date = Column(TIMESTAMP)
    end_date = Column(TIMESTAMP)
    estimated_hours = Column(Numeric(8, 2))
    actual_hours = Column(Numeric(8, 2))
    
    # Relationships
    asset = relationship("Asset", back_populates="work_orders")
    work_order_type = relationship("WorkOrderType", back_populates="work_orders")
    requester = relationship("User", foreign_keys=[requested_by], back_populates="work_orders_requested")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="work_orders_assigned")
    tasks = relationship("WorkOrderTask", back_populates="work_order")
    parts = relationship("WorkOrderPart", back_populates="work_order")

class WorkOrderTask(BaseModel, TimestampMixin):
    __tablename__ = "work_order_tasks"
    __table_args__ = {'extend_existing': True}

    work_order_id = Column(Integer, ForeignKey('work_orders.id', ondelete='CASCADE'))
    task_name = Column(String(100), nullable=False)
    description = Column(Text)
    assigned_user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    status = Column(String(20), default='pending')
    estimated_hours = Column(Numeric(8, 2))
    actual_hours = Column(Numeric(8, 2))
    start_date = Column(TIMESTAMP)
    end_date = Column(TIMESTAMP)
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="tasks")
    assigned_user = relationship("User", back_populates="work_order_tasks")

class WorkOrderPart(BaseModel):
    __tablename__ = "work_order_parts"
    __table_args__ = {'extend_existing': True}

    work_order_id = Column(Integer, ForeignKey('work_orders.id', ondelete='CASCADE'))
    spare_part_id = Column(Integer, ForeignKey('inventory_master.id', ondelete='SET NULL'))
    quantity_used = Column(Integer, nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'))
    created_at = Column(TIMESTAMP, nullable=False, default=lambda: datetime.utcnow())
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="parts")
    inventory_master = relationship("InventoryMaster", back_populates="work_order_parts")