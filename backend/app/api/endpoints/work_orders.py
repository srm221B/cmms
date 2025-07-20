from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.work_order import WorkOrder as WorkOrderModel, WorkOrderType, WorkOrderTask, WorkOrderPart
from app.models.inventory import InventoryMaster
from app.schemas.work_order import WorkOrder, WorkOrderCreate, WorkOrderUpdate

router = APIRouter(prefix="/work-orders", tags=["work orders"])

@router.get("/test")
def test_work_orders(db: Session = Depends(get_db)):
    """Simple test endpoint"""
    try:
        work_orders = db.query(WorkOrderModel).all()
        return {"message": f"Found {len(work_orders)} work orders", "count": len(work_orders)}
    except Exception as e:
        return {"error": str(e)}

@router.get("/test-simple")
def test_work_orders_simple(db: Session = Depends(get_db)):
    """Test endpoint without response model"""
    try:
        work_orders = db.query(WorkOrderModel).all()
        # Convert to dict manually
        result = []
        for wo in work_orders:
            wo_dict = {
                "id": wo.id,
                "work_order_number": wo.work_order_number,
                "title": wo.title,
                "description": wo.description,
                "status": wo.status,
                "priority": wo.priority,
                "requested_date": wo.requested_date.isoformat() if wo.requested_date else None,
                "scheduled_date": wo.scheduled_date.isoformat() if wo.scheduled_date else None,
                "start_date": wo.start_date.isoformat() if wo.start_date else None,
                "end_date": wo.end_date.isoformat() if wo.end_date else None,
                "estimated_hours": float(wo.estimated_hours) if wo.estimated_hours else None,
                "actual_hours": float(wo.actual_hours) if wo.actual_hours else None,
                "created_at": wo.created_at.isoformat() if wo.created_at else None,
                "updated_at": wo.updated_at.isoformat() if wo.updated_at else None,
            }
            result.append(wo_dict)
        return result
    except Exception as e:
        return {"error": str(e)}

@router.get("/", response_model=List[WorkOrder])
def read_work_orders(
    skip: int = 0, 
    limit: int = 100, 
    plant: str = None,
    asset: str = None,
    type: str = None,
    status: str = None,
    scheduled_date_start: str = None,
    scheduled_date_end: str = None,
    start_date_start: str = None,
    start_date_end: str = None,
    end_date_start: str = None,
    end_date_end: str = None,
    estimated_hours_min: float = None,
    estimated_hours_max: float = None,
    actual_hours_min: float = None,
    actual_hours_max: float = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    from app.models import Asset, Location, AssetCategory, WorkOrderType
    
    # Start with base query
    query = db.query(WorkOrderModel)
    
    # Apply filters
    if plant:
        query = query.join(Asset, isouter=True).join(Location, isouter=True)
        query = query.filter(Location.address.ilike(f"%{plant}%"))
    elif asset or search:
        query = query.join(Asset, isouter=True)
    
    if asset:
        query = query.join(AssetCategory, Asset.asset_category_id == AssetCategory.id)
        query = query.filter(AssetCategory.name.ilike(f"%{asset}%"))
    
    if type:
        query = query.join(WorkOrderType, WorkOrderModel.type_id == WorkOrderType.id)
        query = query.filter(WorkOrderType.name.ilike(f"%{type}%"))
    
    if status:
        query = query.filter(WorkOrderModel.status == status)
    
    if search:
        query = query.filter(
            (WorkOrderModel.title.ilike(f"%{search}%")) |
            (WorkOrderModel.description.ilike(f"%{search}%")) |
            (WorkOrderModel.work_order_number.ilike(f"%{search}%"))
        )
    
    if scheduled_date_start:
        query = query.filter(WorkOrderModel.scheduled_date >= scheduled_date_start)
    
    if scheduled_date_end:
        query = query.filter(WorkOrderModel.scheduled_date <= scheduled_date_end)
    
    if start_date_start:
        query = query.filter(WorkOrderModel.start_date >= start_date_start)
    
    if start_date_end:
        query = query.filter(WorkOrderModel.start_date <= start_date_end)
    
    if end_date_start:
        query = query.filter(WorkOrderModel.end_date >= end_date_start)
    
    if end_date_end:
        query = query.filter(WorkOrderModel.end_date <= end_date_end)
    
    if estimated_hours_min is not None:
        query = query.filter(WorkOrderModel.estimated_hours >= estimated_hours_min)
    
    if estimated_hours_max is not None:
        query = query.filter(WorkOrderModel.estimated_hours <= estimated_hours_max)
    
    if actual_hours_min is not None:
        query = query.filter(WorkOrderModel.actual_hours >= actual_hours_min)
    
    if actual_hours_max is not None:
        query = query.filter(WorkOrderModel.actual_hours <= actual_hours_max)
    
    work_orders = query.offset(skip).limit(limit).all()
    
    # Convert to dict to handle related data properly
    result = []
    for wo in work_orders:
        wo_dict = {
            "id": wo.id,
            "work_order_number": wo.work_order_number,
            "title": wo.title,
            "description": wo.description,
            "asset_id": wo.asset_id,
            "type_id": wo.type_id,
            "priority": wo.priority,
            "status": wo.status,
            "requested_by": wo.requested_by,
            "assigned_to": wo.assigned_to,
            "requested_date": wo.requested_date,
            "scheduled_date": wo.scheduled_date,
            "start_date": wo.start_date,
            "end_date": wo.end_date,
            "estimated_hours": float(wo.estimated_hours) if wo.estimated_hours else None,
            "actual_hours": float(wo.actual_hours) if wo.actual_hours else None,
            "created_at": wo.created_at,
            "updated_at": wo.updated_at,
            "asset": {
                "id": wo.asset.id,
                "name": wo.asset.name,
                "asset_code": wo.asset.asset_code if hasattr(wo.asset, 'asset_code') else None
            } if wo.asset else None,
            "work_order_type": {
                "id": wo.work_order_type.id,
                "name": wo.work_order_type.name
            } if wo.work_order_type else None,
            "requester": {
                "id": wo.requester.id,
                "username": wo.requester.username
            } if wo.requester else None,
            "assignee": {
                "id": wo.assignee.id,
                "username": wo.assignee.username
            } if wo.assignee else None
        }
        result.append(wo_dict)
    
    return result

@router.get("/filters")
def get_work_order_filters(db: Session = Depends(get_db)):
    """Get unique values for filter dropdowns"""
    from app.models import Location, AssetCategory, WorkOrderType
    
    # Get unique plants (location addresses)
    plants = db.query(Location.address).distinct().all()
    plants = [plant[0] for plant in plants if plant[0]]
    
    # Get unique asset categories
    asset_categories = db.query(AssetCategory.name).distinct().all()
    asset_categories = [cat[0] for cat in asset_categories if cat[0]]
    
    # Get unique work order types
    work_order_types = db.query(WorkOrderType.name).distinct().all()
    work_order_types = [type[0] for type in work_order_types if type[0]]
    
    # Get unique statuses
    statuses = db.query(WorkOrderModel.status).distinct().all()
    statuses = [status[0] for status in statuses if status[0]]
    
    return {
        "plants": plants,
        "asset_categories": asset_categories,
        "work_order_types": work_order_types,
        "statuses": statuses
    }

@router.get("/{work_order_id}")
def read_work_order_details(work_order_id: int, db: Session = Depends(get_db)):
    """Get work order details with parts consumed"""
    work_order = db.query(WorkOrderModel).filter(WorkOrderModel.id == work_order_id).first()
    
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    # Get work order parts with inventory details
    parts = db.query(WorkOrderPart).filter(WorkOrderPart.work_order_id == work_order_id).all()
    
    parts_details = []
    for part in parts:
        # Get inventory item details
        inventory_item = db.query(InventoryMaster).filter(
            InventoryMaster.id == part.spare_part_id
        ).first()
        
        if inventory_item:
            parts_details.append({
                "id": part.id,
                "spare_part_id": part.spare_part_id,
                "quantity_used": part.quantity_used,
                "location_id": part.location_id,
                "inventory_item": {
                    "part_code": inventory_item.part_code,
                    "part_name": inventory_item.part_name,
                    "unit_of_issue": inventory_item.unit_of_issue,
                    "unit_price": float(inventory_item.unit_price) if inventory_item.unit_price else 0
                }
            })
    
    return {
        "work_order": work_order,
        "parts_consumed": parts_details
    }

@router.post("/", response_model=WorkOrder, status_code=status.HTTP_201_CREATED)
def create_work_order(work_order: WorkOrderCreate, db: Session = Depends(get_db)):
    # Generate a work order number
    current_year = datetime.now().year
    last_wo = db.query(WorkOrderModel).order_by(WorkOrderModel.id.desc()).first()
    
    if last_wo:
        wo_number = f"WO-{current_year}-{last_wo.id + 1:04d}"
    else:
        wo_number = f"WO-{current_year}-0001"
    
    db_work_order = WorkOrderModel(
        work_order_number=wo_number,
        title=work_order.title,
        description=work_order.description,
        asset_id=work_order.asset_id,
        type_id=work_order.type_id,
        priority=work_order.priority,
        requested_by=work_order.requested_by,
        scheduled_date=work_order.scheduled_date,
        requested_date=datetime.now()
    )
    
    db.add(db_work_order)
    db.commit()
    db.refresh(db_work_order)
    return db_work_order

@router.get("/types/")
def read_work_order_types(db: Session = Depends(get_db)):
    return db.query(WorkOrderType).all()