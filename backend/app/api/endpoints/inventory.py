from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.session import get_db
from app.models.inventory import InventoryMaster, InventoryBalance, InventoryInflow
from app.models.work_order import WorkOrderPart, WorkOrder
from app.models.location import Location
from app.models.user import User
from app.models.transfer import TransferHeader, TransferItem
from app.schemas.inventory import InventoryMaster as Inventory, InventoryMasterCreate

router = APIRouter(prefix="/inventory", tags=["inventory"])

# Pydantic models for request/response
class TransferItemRequest(BaseModel):
    spare_part_id: int
    quantity: int
    unit_cost: Optional[float] = None

class TransferRequest(BaseModel):
    from_location_id: int
    to_location_id: int
    transferred_by: int
    transfer_date: datetime
    notes: Optional[str] = None
    items: List[TransferItemRequest]

class ReceivePartRequest(BaseModel):
    spare_part_id: int
    location_id: int
    quantity: int
    received_by: int
    received_date: datetime
    supplier: str
    reference_number: str
    unit_cost: Optional[float] = None

@router.get("/", response_model=List[Inventory])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(InventoryMaster).offset(skip).limit(limit).all()
    return items

@router.get("/filters")
def get_inventory_filters(db: Session = Depends(get_db)):
    """Get filter options for inventory"""
    try:
        # Get unique locations
        locations = db.query(Location).distinct().all()
        location_names = [loc.name for loc in locations]
        
        # Get unique asset categories
        from app.models.asset_category import AssetCategory
        asset_categories = db.query(AssetCategory).distinct().all()
        category_names = [cat.name for cat in asset_categories]
        
        # Get unique categories from inventory_master
        categories = db.query(InventoryMaster.category).distinct().filter(InventoryMaster.category.isnot(None)).all()
        inventory_categories = [cat[0] for cat in categories]
        
        # Get unique criticality values
        criticalities = db.query(InventoryMaster.criticality).distinct().filter(InventoryMaster.criticality.isnot(None)).all()
        criticality_values = [crit[0] for crit in criticalities]
        
        return {
            "locations": location_names,
            "asset_categories": category_names,
            "categories": inventory_categories,
            "criticalities": criticality_values
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching filters: {str(e)}")

@router.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    """Get all locations for dropdowns"""
    locations = db.query(Location).all()
    return [{"id": loc.id, "name": loc.name} for loc in locations]

@router.get("/transfers")
def get_transfer_history(db: Session = Depends(get_db)):
    """Get all transfer history"""
    transfers = db.query(TransferHeader).order_by(TransferHeader.created_at.desc()).all()
    
    results = []
    for transfer in transfers:
        # Get location names
        from_location = db.query(Location).filter(Location.id == transfer.from_location_id).first()
        to_location = db.query(Location).filter(Location.id == transfer.to_location_id).first()
        transferred_by_user = db.query(User).filter(User.id == transfer.transferred_by).first()
        
        # Get transfer items
        items = db.query(TransferItem).filter(TransferItem.transfer_id == transfer.id).all()
        transfer_items = []
        
        for item in items:
            part = db.query(InventoryMaster).filter(InventoryMaster.id == item.spare_part_id).first()
            if part:
                transfer_items.append({
                    "part_code": part.part_code,
                    "part_name": part.part_name,
                    "quantity": item.quantity
                })
        
        results.append({
            "id": transfer.id,
            "transfer_date": transfer.transfer_date.isoformat(),
            "from_location_name": from_location.name if from_location else "Unknown",
            "to_location_name": to_location.name if to_location else "Unknown",
            "transferred_by": transferred_by_user.username if transferred_by_user else "Unknown",
            "status": transfer.status,
            "notes": transfer.notes,
            "items": transfer_items
        })
    
    return results

@router.get("/receipts")
def get_receipt_history(db: Session = Depends(get_db)):
    """Get all receipt history"""
    receipts = db.query(InventoryInflow).order_by(InventoryInflow.created_at.desc()).all()
    
    results = []
    for receipt in receipts:
        # Get location name
        location = db.query(Location).filter(Location.id == receipt.location_id).first()
        received_by_user = db.query(User).filter(User.id == receipt.received_by).first()
        
        # Get part details
        part = db.query(InventoryMaster).filter(InventoryMaster.id == receipt.spare_part_id).first()
        
        if part:
            results.append({
                "id": receipt.id,
                "received_date": receipt.received_date.isoformat(),
                "received_from": receipt.supplier,
                "received_to_name": location.name if location else "Unknown",
                "received_by": received_by_user.username if received_by_user else "Unknown",
                "supplier": receipt.supplier,
                "reference_number": receipt.reference_number,
                "items": [{
                    "part_code": part.part_code,
                    "part_name": part.part_name,
                    "quantity": receipt.quantity,
                    "unit_cost": float(receipt.unit_cost) if receipt.unit_cost else 0
                }]
            })
    
    return results

@router.get("/{item_id}", response_model=Inventory)
def read_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryMaster).filter(InventoryMaster.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.get("/{item_id}/details")
def read_inventory_item_details(item_id: int, db: Session = Depends(get_db)):
    """Get inventory item details with work orders and inflows"""
    item = db.query(InventoryMaster).filter(InventoryMaster.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Get inventory balances across locations
    balances = db.query(InventoryBalance).filter(InventoryBalance.spare_part_id == item_id).all()
    
    balance_details = []
    for balance in balances:
        location = db.query(Location).filter(Location.id == balance.location_id).first()
        if location:
            balance_details.append({
                "id": balance.id,
                "spare_part_id": balance.spare_part_id,
                "location_id": balance.location_id,
                "location_name": location.name,
                "in_stock": balance.in_stock,
                "total_received": balance.total_received,
                "total_consumption": balance.total_consumption
            })
    
    # Get work orders that consumed this part
    work_order_parts = db.query(WorkOrderPart).filter(WorkOrderPart.spare_part_id == item_id).all()
    
    work_order_details = []
    for part in work_order_parts:
        work_order = db.query(WorkOrder).filter(WorkOrder.id == part.work_order_id).first()
        location = db.query(Location).filter(Location.id == part.location_id).first()
        
        if work_order:
            work_order_details.append({
                "id": part.id,
                "work_order_number": work_order.work_order_number,
                "work_order_title": work_order.title,
                "work_order_status": work_order.status,
                "quantity_used": part.quantity_used,
                "location_name": location.name if location else "Unknown",
                "consumption_date": part.created_at.isoformat() if part.created_at else None,
                "work_order_scheduled_date": work_order.scheduled_date.isoformat() if work_order.scheduled_date else None
            })
    
    # Sort work orders by consumption date (most recent first)
    work_order_details.sort(key=lambda x: x["consumption_date"] or "", reverse=True)
    
    # Get inventory inflows
    inflows = db.query(InventoryInflow).filter(InventoryInflow.spare_part_id == item_id).all()
    
    inflow_details = []
    for inflow in inflows:
        location = db.query(Location).filter(Location.id == inflow.location_id).first()
        receiver = db.query(User).filter(User.id == inflow.received_by).first()
        
        inflow_details.append({
            "id": inflow.id,
            "quantity": inflow.quantity,
            "location_name": location.name if location else "Unknown",
            "received_by": receiver.username if receiver else "Unknown",
            "received_date": inflow.received_date.isoformat(),
            "supplier": inflow.supplier,
            "reference_number": inflow.reference_number,
            "unit_cost": float(inflow.unit_cost) if inflow.unit_cost else 0,
            "total_cost": float(inflow.quantity * inflow.unit_cost) if inflow.unit_cost and inflow.quantity else 0
        })
    
    # Sort inflows by received date (most recent first)
    inflow_details.sort(key=lambda x: x["received_date"], reverse=True)
    
    return {
        "inventory_item": item,
        "balances": balance_details,
        "work_orders": work_order_details,
        "inflows": inflow_details
    }

@router.post("/transfer")
def create_transfer(transfer_request: TransferRequest, db: Session = Depends(get_db)):
    """Create a new transfer between locations"""
    try:
        # Create transfer header
        transfer_header = TransferHeader(
            transfer_date=transfer_request.transfer_date,
            from_location_id=transfer_request.from_location_id,
            to_location_id=transfer_request.to_location_id,
            transferred_by=transfer_request.transferred_by,
            status='completed',
            notes=transfer_request.notes,
            created_at=datetime.now()
        )
        db.add(transfer_header)
        db.flush()  # Get the ID
        
        # Create transfer items and update inventory balances
        for item in transfer_request.items:
            # Create transfer item
            transfer_item = TransferItem(
                transfer_id=transfer_header.id,
                spare_part_id=item.spare_part_id,
                quantity=item.quantity,
                created_at=datetime.now()
            )
            db.add(transfer_item)
            
            # Update source location balance (decrease)
            source_balance = db.query(InventoryBalance).filter(
                InventoryBalance.spare_part_id == item.spare_part_id,
                InventoryBalance.location_id == transfer_request.from_location_id
            ).first()
            
            if source_balance:
                if source_balance.in_stock < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for part {item.spare_part_id}")
                source_balance.in_stock -= item.quantity
            else:
                raise HTTPException(status_code=400, detail=f"No stock found for part {item.spare_part_id} at source location")
            
            # Update destination location balance (increase)
            dest_balance = db.query(InventoryBalance).filter(
                InventoryBalance.spare_part_id == item.spare_part_id,
                InventoryBalance.location_id == transfer_request.to_location_id
            ).first()
            
            if dest_balance:
                dest_balance.in_stock += item.quantity
            else:
                # Create new balance record for destination
                new_balance = InventoryBalance(
                    spare_part_id=item.spare_part_id,
                    location_id=transfer_request.to_location_id,
                    in_stock=item.quantity,
                    total_received=item.quantity,
                    total_consumption=0
                )
                db.add(new_balance)
        
        db.commit()
        return {"message": "Transfer created successfully", "transfer_id": transfer_header.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/receive")
def receive_parts(receive_request: ReceivePartRequest, db: Session = Depends(get_db)):
    """Receive parts into inventory"""
    try:
        # Create inventory inflow record
        inventory_inflow = InventoryInflow(
            spare_part_id=receive_request.spare_part_id,
            location_id=receive_request.location_id,
            quantity=receive_request.quantity,
            received_by=receive_request.received_by,
            received_date=receive_request.received_date,
            supplier=receive_request.supplier,
            reference_number=receive_request.reference_number,
            unit_cost=receive_request.unit_cost,
            created_at=datetime.now()
        )
        db.add(inventory_inflow)
        
        # Update or create inventory balance
        balance = db.query(InventoryBalance).filter(
            InventoryBalance.spare_part_id == receive_request.spare_part_id,
            InventoryBalance.location_id == receive_request.location_id
        ).first()
        
        if balance:
            balance.in_stock += receive_request.quantity
            balance.total_received += receive_request.quantity
        else:
            # Create new balance record
            new_balance = InventoryBalance(
                spare_part_id=receive_request.spare_part_id,
                location_id=receive_request.location_id,
                in_stock=receive_request.quantity,
                total_received=receive_request.quantity,
                total_consumption=0
            )
            db.add(new_balance)
        
        db.commit()
        return {"message": "Parts received successfully", "inflow_id": inventory_inflow.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/balances/{location_id}")
def get_inventory_balances(location_id: int, db: Session = Depends(get_db)):
    balances = db.query(InventoryBalance).filter(
        InventoryBalance.location_id == location_id
    ).all()
    
    results = []
    for balance in balances:
        part = db.query(InventoryMaster).filter(
            InventoryMaster.id == balance.spare_part_id
        ).first()
        
        results.append({
            "id": balance.id,
            "part_code": part.part_code,
            "part_name": part.part_name,
            "in_stock": balance.in_stock,
            "total_received": balance.total_received,
            "total_consumption": balance.total_consumption
        })
    
    return results

@router.get("/items/")
def get_inventory_items(db: Session = Depends(get_db)):
    """Get all inventory items for dropdowns"""
    items = db.query(InventoryMaster).all()
    return [
        {
            "id": item.id,
            "part_name": item.part_name,
            "part_code": item.part_code,
            "category": item.category,
            "unit_price": item.unit_price
        }
        for item in items
    ]