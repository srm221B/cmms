from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class AssetCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class AssetCategoryCreate(AssetCategoryBase):
    pass

class AssetCategory(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class Location(BaseModel):
    id: int
    name: str
    address: Optional[str] = None

    class Config:
        orm_mode = True

class AssetBase(BaseModel):
    name: str
    description: Optional[str] = None
    asset_category_id: Optional[int] = None
    location_id: Optional[int] = None
    status: Optional[str] = "active"
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    specifications: Optional[str] = None
    running_hours: Optional[Decimal] = None
    power_generation: Optional[Decimal] = None
    load_factor: Optional[Decimal] = None
    availability: Optional[Decimal] = None
    cod: Optional[date] = None
    bim: Optional[Decimal] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    asset_category: Optional[AssetCategory] = None
    location: Optional[Location] = None

    class Config:
        from_attributes = True