#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.work_order import WorkOrder, WorkOrderType
from app.models.asset import Asset
from app.models.user import User

def test_work_orders():
    db = SessionLocal()
    try:
        # Test basic query
        print("Testing basic work orders query...")
        work_orders = db.query(WorkOrder).all()
        print(f"Found {len(work_orders)} work orders")
        
        # Test with joins
        print("Testing work orders with joins...")
        query = db.query(WorkOrder)
        work_orders_with_joins = query.all()
        print(f"Found {len(work_orders_with_joins)} work orders with joins")
        
        # Test individual models
        print("Testing individual models...")
        assets = db.query(Asset).all()
        print(f"Found {len(assets)} assets")
        
        users = db.query(User).all()
        print(f"Found {len(users)} users")
        
        work_order_types = db.query(WorkOrderType).all()
        print(f"Found {len(work_order_types)} work order types")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_work_orders() 