#!/usr/bin/env python3
"""
Script to add sample work order parts data to the database for testing
"""

import sys
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.work_order import WorkOrder, WorkOrderPart
from app.models.inventory import InventoryMaster
from app.models.location import Location
from app.core.config import settings

def add_sample_work_order_parts():
    """Add sample work order parts data to the database"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get existing work orders, inventory items, and locations
        work_orders = db.query(WorkOrder).all()
        inventory_items = db.query(InventoryMaster).all()
        locations = db.query(Location).all()
        
        if not work_orders:
            print("No work orders found. Please add some work orders first.")
            return
        
        if not inventory_items:
            print("No inventory items found. Please add some inventory items first.")
            return
        
        if not locations:
            print("No locations found. Please run the database initialization first.")
            return
        
        # Sample work order parts data
        sample_parts = [
            {
                "work_order_id": work_orders[0].id,  # First work order
                "spare_part_id": inventory_items[0].id,  # Engine Oil Filter
                "quantity_used": 2,
                "location_id": locations[0].id
            },
            {
                "work_order_id": work_orders[0].id,
                "spare_part_id": inventory_items[2].id,  # V-Belt Set
                "quantity_used": 1,
                "location_id": locations[0].id
            },
            {
                "work_order_id": work_orders[1].id,  # Second work order (Emergency)
                "spare_part_id": inventory_items[1].id,  # Water Pump Impeller
                "quantity_used": 1,
                "location_id": locations[1].id
            },
            {
                "work_order_id": work_orders[1].id,
                "spare_part_id": inventory_items[3].id,  # Ball Bearing
                "quantity_used": 4,
                "location_id": locations[1].id
            },
            {
                "work_order_id": work_orders[2].id,  # Third work order (Inspection)
                "spare_part_id": inventory_items[6].id,  # Temperature Sensor
                "quantity_used": 1,
                "location_id": locations[2].id
            },
            {
                "work_order_id": work_orders[3].id,  # Fourth work order (Installation)
                "spare_part_id": inventory_items[7].id,  # Electric Motor
                "quantity_used": 1,
                "location_id": locations[0].id
            },
            {
                "work_order_id": work_orders[3].id,
                "spare_part_id": inventory_items[4].id,  # Control Valve
                "quantity_used": 2,
                "location_id": locations[0].id
            },
            {
                "work_order_id": work_orders[4].id,  # Fifth work order (Corrective)
                "spare_part_id": inventory_items[5].id,  # Cylinder Head Gasket
                "quantity_used": 1,
                "location_id": locations[1].id
            },
            {
                "work_order_id": work_orders[4].id,
                "spare_part_id": inventory_items[0].id,  # Engine Oil Filter
                "quantity_used": 1,
                "location_id": locations[1].id
            }
        ]
        
        # Add work order parts
        for part_data in sample_parts:
            # Check if part already exists
            existing = db.query(WorkOrderPart).filter_by(
                work_order_id=part_data["work_order_id"],
                spare_part_id=part_data["spare_part_id"]
            ).first()
            
            if existing:
                print(f"Work order part already exists for WO {part_data['work_order_id']} and part {part_data['spare_part_id']}, skipping...")
                continue
            
            work_order_part = WorkOrderPart(
                work_order_id=part_data["work_order_id"],
                spare_part_id=part_data["spare_part_id"],
                quantity_used=part_data["quantity_used"],
                location_id=part_data["location_id"]
            )
            
            db.add(work_order_part)
            print(f"Added work order part: WO {part_data['work_order_id']} - Part {part_data['spare_part_id']} - Qty: {part_data['quantity_used']}")
        
        db.commit()
        print(f"Successfully added {len(sample_parts)} work order parts!")
        
    except Exception as e:
        print(f"Error adding sample work order parts: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_work_order_parts() 