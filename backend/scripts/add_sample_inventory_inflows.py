#!/usr/bin/env python3
"""
Script to add sample inventory inflow data to the database for testing
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.inventory import InventoryMaster, InventoryInflow
from app.models.location import Location
from app.models.user import User
from app.core.config import settings

def add_sample_inventory_inflows():
    """Add sample inventory inflow data to the database"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get existing inventory items, locations, and users
        inventory_items = db.query(InventoryMaster).all()
        locations = db.query(Location).all()
        users = db.query(User).all()
        
        if not inventory_items:
            print("No inventory items found. Please add some inventory items first.")
            return
        
        if not locations:
            print("No locations found. Please run the database initialization first.")
            return
        
        if not users:
            print("No users found. Please run the database initialization first.")
            return
        
        # Sample inventory inflows data
        sample_inflows = [
            {
                "spare_part_id": inventory_items[0].id,  # Engine Oil Filter
                "location_id": locations[0].id,
                "quantity": 50,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=30),
                "supplier": "ABC Supplies",
                "reference_number": "PO-2024-001",
                "unit_cost": 25.50
            },
            {
                "spare_part_id": inventory_items[0].id,  # Engine Oil Filter
                "location_id": locations[1].id,
                "quantity": 30,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=15),
                "supplier": "XYZ Parts",
                "reference_number": "PO-2024-002",
                "unit_cost": 24.75
            },
            {
                "spare_part_id": inventory_items[1].id,  # Water Pump Impeller
                "location_id": locations[0].id,
                "quantity": 10,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=45),
                "supplier": "Industrial Parts Co",
                "reference_number": "PO-2024-003",
                "unit_cost": 150.00
            },
            {
                "spare_part_id": inventory_items[2].id,  # V-Belt Set
                "location_id": locations[1].id,
                "quantity": 25,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=20),
                "supplier": "Belt Solutions",
                "reference_number": "PO-2024-004",
                "unit_cost": 45.75
            },
            {
                "spare_part_id": inventory_items[3].id,  # Ball Bearing
                "location_id": locations[2].id,
                "quantity": 100,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=10),
                "supplier": "Bearing World",
                "reference_number": "PO-2024-005",
                "unit_cost": 12.25
            },
            {
                "spare_part_id": inventory_items[4].id,  # Control Valve
                "location_id": locations[0].id,
                "quantity": 5,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=60),
                "supplier": "Valve Systems",
                "reference_number": "PO-2024-006",
                "unit_cost": 320.00
            },
            {
                "spare_part_id": inventory_items[5].id,  # Cylinder Head Gasket
                "location_id": locations[1].id,
                "quantity": 15,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=25),
                "supplier": "Gasket Pro",
                "reference_number": "PO-2024-007",
                "unit_cost": 85.00
            },
            {
                "spare_part_id": inventory_items[6].id,  # Temperature Sensor
                "location_id": locations[2].id,
                "quantity": 20,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=5),
                "supplier": "Sensor Tech",
                "reference_number": "PO-2024-008",
                "unit_cost": 75.50
            },
            {
                "spare_part_id": inventory_items[7].id,  # Electric Motor
                "location_id": locations[0].id,
                "quantity": 2,
                "received_by": users[0].id,
                "received_date": datetime.now() - timedelta(days=90),
                "supplier": "Motor Solutions",
                "reference_number": "PO-2024-009",
                "unit_cost": 1200.00
            }
        ]
        
        # Add inventory inflows
        for inflow_data in sample_inflows:
            # Check if inflow already exists
            existing = db.query(InventoryInflow).filter_by(
                spare_part_id=inflow_data["spare_part_id"],
                location_id=inflow_data["location_id"],
                received_date=inflow_data["received_date"]
            ).first()
            
            if existing:
                print(f"Inventory inflow already exists for part {inflow_data['spare_part_id']} at location {inflow_data['location_id']}, skipping...")
                continue
            
            inventory_inflow = InventoryInflow(
                spare_part_id=inflow_data["spare_part_id"],
                location_id=inflow_data["location_id"],
                quantity=inflow_data["quantity"],
                received_by=inflow_data["received_by"],
                received_date=inflow_data["received_date"],
                supplier=inflow_data["supplier"],
                reference_number=inflow_data["reference_number"],
                unit_cost=inflow_data["unit_cost"],
                created_at=datetime.now()
            )
            
            db.add(inventory_inflow)
            print(f"Added inventory inflow: Part {inflow_data['spare_part_id']} - Qty: {inflow_data['quantity']} - Supplier: {inflow_data['supplier']}")
        
        db.commit()
        print(f"Successfully added {len(sample_inflows)} inventory inflows!")
        
    except Exception as e:
        print(f"Error adding sample inventory inflows: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_inventory_inflows() 