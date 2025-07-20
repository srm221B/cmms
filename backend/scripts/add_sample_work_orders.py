#!/usr/bin/env python3
"""
Script to add sample work orders to the database for testing
"""

import sys
import os
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.work_order import WorkOrder, WorkOrderType
from app.models.asset import Asset
from app.models.user import User
from app.core.config import settings

def add_sample_work_orders():
    """Add sample work orders to the database"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get existing data
        work_order_types = db.query(WorkOrderType).all()
        assets = db.query(Asset).all()
        users = db.query(User).all()
        
        if not work_order_types:
            print("No work order types found. Please run the database initialization first.")
            return
        
        if not assets:
            print("No assets found. Please add some assets first.")
            return
        
        if not users:
            print("No users found. Please run the database initialization first.")
            return
        
        # Sample work orders data
        sample_work_orders = [
            {
                "work_order_number": "WO-2024-0001",
                "title": "Engine Maintenance",
                "description": "Regular preventive maintenance for Engine 01",
                "asset_id": assets[0].id if assets else None,
                "type_id": work_order_types[0].id,  # Preventive
                "priority": "medium",
                "status": "open",
                "requested_by": users[0].id,
                "scheduled_date": date.today() + timedelta(days=7),
                "estimated_hours": 4.0
            },
            {
                "work_order_number": "WO-2024-0002",
                "title": "Emergency Pump Repair",
                "description": "Critical pump failure in cooling system",
                "asset_id": assets[0].id if assets else None,
                "type_id": work_order_types[2].id,  # Emergency
                "priority": "critical",
                "status": "in_progress",
                "requested_by": users[0].id,
                "assigned_to": users[0].id,
                "scheduled_date": date.today(),
                "start_date": datetime.now(),
                "estimated_hours": 8.0
            },
            {
                "work_order_number": "WO-2024-0003",
                "title": "Equipment Inspection",
                "description": "Monthly safety inspection of all equipment",
                "asset_id": assets[0].id if assets else None,
                "type_id": work_order_types[4].id,  # Inspection
                "priority": "low",
                "status": "completed",
                "requested_by": users[0].id,
                "assigned_to": users[0].id,
                "scheduled_date": date.today() - timedelta(days=1),
                "start_date": datetime.now() - timedelta(days=1, hours=2),
                "end_date": datetime.now() - timedelta(days=1),
                "estimated_hours": 2.0,
                "actual_hours": 1.5
            },
            {
                "work_order_number": "WO-2024-0004",
                "title": "New Equipment Installation",
                "description": "Install new monitoring system",
                "asset_id": assets[0].id if assets else None,
                "type_id": work_order_types[3].id,  # Installation
                "priority": "high",
                "status": "open",
                "requested_by": users[0].id,
                "scheduled_date": date.today() + timedelta(days=14),
                "estimated_hours": 16.0
            },
            {
                "work_order_number": "WO-2024-0005",
                "title": "Corrective Maintenance",
                "description": "Fix vibration issues in motor",
                "asset_id": assets[0].id if assets else None,
                "type_id": work_order_types[1].id,  # Corrective
                "priority": "high",
                "status": "open",
                "requested_by": users[0].id,
                "scheduled_date": date.today() + timedelta(days=3),
                "estimated_hours": 6.0
            }
        ]
        
        # Add work orders
        for wo_data in sample_work_orders:
            # Check if work order already exists
            existing = db.query(WorkOrder).filter_by(work_order_number=wo_data["work_order_number"]).first()
            if existing:
                print(f"Work order {wo_data['work_order_number']} already exists, skipping...")
                continue
            
            work_order = WorkOrder(
                work_order_number=wo_data["work_order_number"],
                title=wo_data["title"],
                description=wo_data["description"],
                asset_id=wo_data["asset_id"],
                type_id=wo_data["type_id"],
                priority=wo_data["priority"],
                status=wo_data["status"],
                requested_by=wo_data["requested_by"],
                assigned_to=wo_data.get("assigned_to"),
                requested_date=datetime.now(),
                scheduled_date=wo_data["scheduled_date"],
                start_date=wo_data.get("start_date"),
                end_date=wo_data.get("end_date"),
                estimated_hours=wo_data.get("estimated_hours"),
                actual_hours=wo_data.get("actual_hours")
            )
            
            db.add(work_order)
            print(f"Added work order: {wo_data['work_order_number']} - {wo_data['title']}")
        
        db.commit()
        print(f"Successfully added {len(sample_work_orders)} sample work orders!")
        
    except Exception as e:
        print(f"Error adding sample work orders: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_work_orders() 