from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryMasterBase(BaseModel):
    part_code: str
    part_name: str
    description: Optional[str] = None
    unit_of_issue: str
    unit_price: Optional[float] = None
    minimum_quantity: int = 0
    category: Optional[str] = None
    criticality: Optional[str] = None

class InventoryMasterCreate(InventoryMasterBase):
    pass

class InventoryMasterUpdate(BaseModel):
    part_code: Optional[str] = None
    part_name: Optional[str] = None
    description: Optional[str] = None
    unit_of_issue: Optional[str] = None
    unit_price: Optional[float] = None
    minimum_quantity: Optional[int] = None
    category: Optional[str] = None
    criticality: Optional[str] = None

class InventoryMaster(InventoryMasterBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryBalanceBase(BaseModel):
    spare_part_id: int
    location_id: int
    in_stock: int
    total_received: int = 0
    total_consumption: int = 0

class InventoryBalance(InventoryBalanceBase):
    id: int

    class Config:
        from_attributes = True