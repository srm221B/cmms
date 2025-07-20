from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, TimestampMixin
from app.models.associations import user_roles

class User(BaseModel, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    work_orders_requested = relationship("WorkOrder", foreign_keys="WorkOrder.requested_by", back_populates="requester")
    work_orders_assigned = relationship("WorkOrder", foreign_keys="WorkOrder.assigned_to", back_populates="assignee")
    work_order_tasks = relationship("WorkOrderTask", back_populates="assigned_user")