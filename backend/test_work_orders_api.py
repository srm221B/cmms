#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.work_order import WorkOrder, WorkOrderType
from app.models.asset import Asset
from app.models.user import User
from app.models.location import Location
from app.models.asset_category import AssetCategory

def test_work_orders_api():
    db = SessionLocal()
    try:
        # Replicate the exact query from the API endpoint
        print("Testing API endpoint logic...")
        
        # Start with base query
        query = db.query(WorkOrder)
        
        # Test the joins that might be causing issues
        print("Testing joins...")
        
        # Test join with Asset
        query_with_asset = query.join(Asset, isouter=True)
        print("Join with Asset successful")
        
        # Test join with Location
        query_with_location = query_with_asset.join(Location, isouter=True)
        print("Join with Location successful")
        
        # Test join with AssetCategory
        query_with_category = query_with_asset.join(AssetCategory, Asset.asset_category_id == AssetCategory.id)
        print("Join with AssetCategory successful")
        
        # Test join with WorkOrderType
        query_with_type = query.join(WorkOrderType, WorkOrder.type_id == WorkOrderType.id)
        print("Join with WorkOrderType successful")
        
        # Test the final query
        work_orders = query.offset(0).limit(100).all()
        print(f"Final query successful, found {len(work_orders)} work orders")
        
        # Test serialization
        print("Testing serialization...")
        for wo in work_orders[:1]:  # Test first work order
            print(f"Work Order ID: {wo.id}")
            print(f"Work Order Number: {wo.work_order_number}")
            print(f"Title: {wo.title}")
            print(f"Status: {wo.status}")
            print(f"Priority: {wo.priority}")
            if wo.asset:
                print(f"Asset: {wo.asset.name}")
            if wo.work_order_type:
                print(f"Type: {wo.work_order_type.name}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_work_orders_api() 