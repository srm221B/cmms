from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class WorkOrderTaskBase(BaseModel):
    description: str
    status: str = "pending"
    assigned_to: Optional[int] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class WorkOrderTaskCreate(WorkOrderTaskBase):
    pass

class WorkOrderTask(WorkOrderTaskBase):
    id: int
    work_order_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class WorkOrderPartBase(BaseModel):
    spare_part_id: int
    quantity_used: int
    location_id: int

class WorkOrderPartCreate(WorkOrderPartBase):
    pass

class WorkOrderPart(WorkOrderPartBase):
    id: int
    work_order_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class WorkOrderBase(BaseModel):
    title: str
    description: Optional[str] = None
    asset_id: Optional[int] = None
    type_id: Optional[int] = None
    priority: str = "medium"
    requested_by: Optional[int] = None
    scheduled_date: Optional[date] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    asset_id: Optional[int] = None
    type_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    scheduled_date: Optional[date] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

class WorkOrder(WorkOrderBase):
    id: int
    work_order_number: str
    status: str
    assigned_to: Optional[int] = None
    requested_date: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    # Related data
    asset: Optional[dict] = None
    work_order_type: Optional[dict] = None
    requester: Optional[dict] = None
    assignee: Optional[dict] = None

    class Config:
        orm_mode = True

class WorkOrderTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkOrderTypeCreate(WorkOrderTypeBase):
    pass

class WorkOrderType(WorkOrderTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True