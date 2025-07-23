from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from datetime import date

from ...db.session import get_db
from ...models.asset import Asset
from ...models.location import Location
from ...models.asset_category import AssetCategory
from ...schemas.asset import Asset as AssetSchema, AssetCreate, AssetUpdate

router = APIRouter(prefix="/assets", tags=["assets"])

@router.get("/", response_model=List[AssetSchema])
def get_assets(
    db: Session = Depends(get_db),
    plant: Optional[str] = Query(None, description="Filter by plant (location address)"),
    asset_category: Optional[str] = Query(None, description="Filter by asset category name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    running_hours_min: Optional[float] = Query(None, description="Minimum running hours"),
    running_hours_max: Optional[float] = Query(None, description="Maximum running hours"),
    power_generation_min: Optional[float] = Query(None, description="Minimum power generation"),
    power_generation_max: Optional[float] = Query(None, description="Maximum power generation"),
    load_factor_min: Optional[float] = Query(None, description="Minimum load factor"),
    load_factor_max: Optional[float] = Query(None, description="Maximum load factor"),
    availability_min: Optional[float] = Query(None, description="Minimum availability"),
    availability_max: Optional[float] = Query(None, description="Maximum availability"),
    cod_start: Optional[str] = Query(None, description="COD start date"),
    cod_end: Optional[str] = Query(None, description="COD end date"),
    bim_min: Optional[float] = Query(None, description="Minimum BIM"),
    bim_max: Optional[float] = Query(None, description="Maximum BIM"),
    search: Optional[str] = Query(None, description="Search in asset name, description, manufacturer, model, serial number")
):
    query = db.query(Asset).join(Location).join(AssetCategory)
    
    # Apply filters
    if plant:
        query = query.filter(Location.address.ilike(f"%{plant}%"))
    
    if asset_category:
        query = query.filter(AssetCategory.name.ilike(f"%{asset_category}%"))
    
    if status:
        query = query.filter(Asset.status == status)
    
    if running_hours_min is not None:
        query = query.filter(Asset.running_hours >= running_hours_min)
    
    if running_hours_max is not None:
        query = query.filter(Asset.running_hours <= running_hours_max)
    
    if power_generation_min is not None:
        query = query.filter(Asset.power_generation >= power_generation_min)
    
    if power_generation_max is not None:
        query = query.filter(Asset.power_generation <= power_generation_max)
    
    if load_factor_min is not None:
        query = query.filter(Asset.load_factor >= load_factor_min)
    
    if load_factor_max is not None:
        query = query.filter(Asset.load_factor <= load_factor_max)
    
    if availability_min is not None:
        query = query.filter(Asset.availability >= availability_min)
    
    if availability_max is not None:
        query = query.filter(Asset.availability <= availability_max)
    
    if cod_start:
        query = query.filter(Asset.cod >= cod_start)
    
    if cod_end:
        query = query.filter(Asset.cod <= cod_end)
    
    if bim_min is not None:
        query = query.filter(Asset.bim >= bim_min)
    
    if bim_max is not None:
        query = query.filter(Asset.bim <= bim_max)
    
    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            Asset.name.ilike(search_filter) |
            Asset.description.ilike(search_filter) |
            Asset.manufacturer.ilike(search_filter) |
            Asset.model.ilike(search_filter) |
            Asset.serial_number.ilike(search_filter)
        )
    
    return query.all()

@router.get("/filters")
def get_asset_filters(db: Session = Depends(get_db)):
    """Get unique values for filter dropdowns"""
    # Get unique plants (location addresses)
    plants = db.query(Location.address).distinct().all()
    plants = [plant[0] for plant in plants if plant[0]]
    
    # Get unique asset categories
    asset_categories = db.query(AssetCategory.name).distinct().all()
    asset_categories = [cat[0] for cat in asset_categories if cat[0]]
    
    # Get unique statuses
    statuses = db.query(Asset.status).distinct().all()
    statuses = [status[0] for status in statuses if status[0]]
    
    return {
        "plants": plants,
        "asset_categories": asset_categories,
        "statuses": statuses
    }

@router.get("/asset-categories/")
def get_asset_categories(db: Session = Depends(get_db)):
    """Get all asset categories"""
    from app.models.asset_category import AssetCategory
    categories = db.query(AssetCategory).all()
    return [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
        for category in categories
    ]

@router.get("/filtered/")
def get_filtered_assets(
    plant: Optional[str] = Query(None, description="Filter by plant (location address)"),
    asset_category: Optional[str] = Query(None, description="Filter by asset category name"),
    db: Session = Depends(get_db)
):
    """Get assets filtered by plant and asset category"""
    query = db.query(Asset).join(Location).join(AssetCategory)
    
    if plant:
        query = query.filter(Location.address == plant)
    
    if asset_category:
        query = query.filter(AssetCategory.name == asset_category)
    
    assets = query.all()
    return [
        {
            "id": asset.id,
            "name": asset.name,
            "location": {
                "id": asset.location.id,
                "name": asset.location.name,
                "address": asset.location.address
            },
            "asset_category": {
                "id": asset.asset_category.id,
                "name": asset.asset_category.name
            }
        }
        for asset in assets
    ]

@router.post("/", response_model=AssetSchema)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    db_asset = Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/{asset_id}", response_model=AssetSchema)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetSchema)
def update_asset(asset_id: int, asset: AssetUpdate, db: Session = Depends(get_db)):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for field, value in asset.dict(exclude_unset=True).items():
        setattr(db_asset, field, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}

