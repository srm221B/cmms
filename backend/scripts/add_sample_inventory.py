#!/usr/bin/env python3
"""
Script to add sample inventory data to the database for testing
"""

import sys
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.inventory import InventoryMaster, InventoryBalance
from app.models.location import Location
from app.core.config import settings

def add_sample_inventory():
    """Add sample inventory data to the database"""
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get existing locations
        locations = db.query(Location).all()
        
        if not locations:
            print("No locations found. Please run the database initialization first.")
            return
        
        # Sample inventory items
        sample_inventory = [
            {
                "part_code": "BEARING-001",
                "part_name": "Ball Bearing",
                "description": "High-quality ball bearing for industrial machinery",
                "unit_of_issue": "PCS",
                "unit_price": 25.50,
                "minimum_quantity": 10,
                "category": "Mechanical",
                "criticality": "High"
            },
            {
                "part_code": "FILTER-002",
                "part_name": "Oil Filter",
                "description": "Premium oil filter for engine protection",
                "unit_of_issue": "PCS",
                "unit_price": 15.75,
                "minimum_quantity": 20,
                "category": "Filtration",
                "criticality": "Medium"
            },
            {
                "part_code": "PUMP-003",
                "part_name": "Water Pump",
                "description": "Industrial water pump for cooling systems",
                "unit_of_issue": "PCS",
                "unit_price": 450.00,
                "minimum_quantity": 2,
                "category": "Hydraulic",
                "criticality": "High"
            },
            {
                "part_code": "VALVE-004",
                "part_name": "Control Valve",
                "description": "Precision control valve for fluid systems",
                "unit_of_issue": "PCS",
                "unit_price": 120.00,
                "minimum_quantity": 5,
                "category": "Control",
                "criticality": "Medium"
            },
            {
                "part_code": "MOTOR-005",
                "part_name": "Electric Motor",
                "description": "3HP electric motor for industrial applications",
                "unit_of_issue": "PCS",
                "unit_price": 800.00,
                "minimum_quantity": 3,
                "category": "Electrical",
                "criticality": "High"
            },
            {
                "part_code": "GASKET-006",
                "part_name": "Cylinder Head Gasket",
                "description": "High-temperature gasket for engine heads",
                "unit_of_issue": "PCS",
                "unit_price": 85.00,
                "minimum_quantity": 6,
                "category": "Sealing",
                "criticality": "Medium"
            },
            {
                "part_code": "SENSOR-007",
                "part_name": "Temperature Sensor",
                "description": "Digital temperature sensor for monitoring",
                "unit_of_issue": "PCS",
                "unit_price": 75.50,
                "minimum_quantity": 12,
                "category": "Instrumentation",
                "criticality": "Low"
            },
            {
                "part_code": "MOTOR-008",
                "part_name": "Electric Motor",
                "description": "5HP electric motor for industrial use",
                "unit_of_issue": "PCS",
                "unit_price": 1200.00,
                "minimum_quantity": 2,
                "category": "Electrical",
                "criticality": "High"
            }
        ]
        
        # Add inventory items
        for item_data in sample_inventory:
            # Check if item already exists
            existing = db.query(InventoryMaster).filter_by(part_code=item_data["part_code"]).first()
            if existing:
                print(f"Inventory item {item_data['part_code']} already exists, skipping...")
                continue
            
            inventory_item = InventoryMaster(
                part_code=item_data["part_code"],
                part_name=item_data["part_name"],
                description=item_data["description"],
                unit_of_issue=item_data["unit_of_issue"],
                unit_price=item_data["unit_price"],
                minimum_quantity=item_data["minimum_quantity"],
                category=item_data.get("category"),
                criticality=item_data.get("criticality")
            )
            
            db.add(inventory_item)
            print(f"Added inventory item: {item_data['part_code']} - {item_data['part_name']}")
        
        db.commit()
        
        # Add inventory balances for each location
        inventory_items = db.query(InventoryMaster).all()
        
        for item in inventory_items:
            for location in locations:
                # Check if balance already exists
                existing_balance = db.query(InventoryBalance).filter_by(
                    spare_part_id=item.id,
                    location_id=location.id
                ).first()
                
                if existing_balance:
                    continue
                
                # Create balance with some sample stock
                import random
                in_stock = random.randint(5, 50)
                total_received = in_stock + random.randint(0, 20)
                total_consumption = total_received - in_stock
                
                balance = InventoryBalance(
                    spare_part_id=item.id,
                    location_id=location.id,
                    in_stock=in_stock,
                    total_received=total_received,
                    total_consumption=total_consumption
                )
                
                db.add(balance)
                print(f"Added balance for {item.part_code} at {location.name}: {in_stock} in stock")
        
        db.commit()
        print(f"Successfully added {len(sample_inventory)} inventory items with balances!")
        
    except Exception as e:
        print(f"Error adding sample inventory: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_inventory() 