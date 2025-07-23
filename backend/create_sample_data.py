#!/usr/bin/env python3
"""
Script to create sample data for testing the CMMS application
"""

import sys
import os
from datetime import datetime, date
from decimal import Decimal

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.session import SessionLocal
from app.models.asset_category import AssetCategory
from app.models.location import Location
from app.models.asset import Asset

def create_sample_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_assets = db.query(Asset).count()
        if existing_assets > 0:
            print(f"Database already has {existing_assets} assets. Skipping sample data creation.")
            return
        
        print("Creating sample data...")
        
        # Create asset categories
        categories = [
            AssetCategory(name="Turbine", description="Power generation turbines"),
            AssetCategory(name="Generator", description="Electrical generators"),
            AssetCategory(name="Transformer", description="Power transformers"),
            AssetCategory(name="Pump", description="Water and fuel pumps"),
            AssetCategory(name="Compressor", description="Air compressors"),
        ]
        
        for category in categories:
            db.add(category)
        db.commit()
        
        # Create locations
        locations = [
            Location(name="Plant A", address="Power Plant A, Industrial Zone"),
            Location(name="Plant B", address="Power Plant B, Industrial Zone"),
            Location(name="Plant C", address="Power Plant C, Industrial Zone"),
        ]
        
        for location in locations:
            db.add(location)
        db.commit()
        
        # Create assets
        assets = [
            Asset(
                name="Turbine Unit 1",
                description="Main power generation turbine",
                asset_category_id=1,  # Turbine
                location_id=1,  # Plant A
                status="active",
                manufacturer="GE",
                model="GT-1000",
                serial_number="TURB-001",
                installation_date=datetime(2020, 1, 15),
                warranty_expiry=datetime(2025, 1, 15),
                running_hours=Decimal("8760.50"),
                power_generation=Decimal("500.00"),
                load_factor=Decimal("85.50"),
                availability=Decimal("95.20"),
                cod=date(2020, 2, 1),
                bim=Decimal("92.50")
            ),
            Asset(
                name="Generator Unit 1",
                description="Main electrical generator",
                asset_category_id=2,  # Generator
                location_id=1,  # Plant A
                status="active",
                manufacturer="Siemens",
                model="GEN-500",
                serial_number="GEN-001",
                installation_date=datetime(2020, 1, 15),
                warranty_expiry=datetime(2025, 1, 15),
                running_hours=Decimal("8760.00"),
                power_generation=Decimal("480.00"),
                load_factor=Decimal("88.00"),
                availability=Decimal("96.50"),
                cod=date(2020, 2, 1),
                bim=Decimal("94.20")
            ),
            Asset(
                name="Transformer T1",
                description="Main power transformer",
                asset_category_id=3,  # Transformer
                location_id=1,  # Plant A
                status="active",
                manufacturer="ABB",
                model="TR-500",
                serial_number="TR-001",
                installation_date=datetime(2020, 1, 20),
                warranty_expiry=datetime(2025, 1, 20),
                running_hours=Decimal("8760.00"),
                power_generation=Decimal("0.00"),
                load_factor=Decimal("90.00"),
                availability=Decimal("98.00"),
                cod=date(2020, 2, 1),
                bim=Decimal("96.00")
            ),
            Asset(
                name="Turbine Unit 2",
                description="Secondary power generation turbine",
                asset_category_id=1,  # Turbine
                location_id=2,  # Plant B
                status="maintenance",
                manufacturer="GE",
                model="GT-1000",
                serial_number="TURB-002",
                installation_date=datetime(2021, 3, 10),
                warranty_expiry=datetime(2026, 3, 10),
                running_hours=Decimal("4380.25"),
                power_generation=Decimal("450.00"),
                load_factor=Decimal("82.00"),
                availability=Decimal("92.50"),
                cod=date(2021, 4, 1),
                bim=Decimal("89.50")
            ),
            Asset(
                name="Pump Station 1",
                description="Cooling water pump station",
                asset_category_id=4,  # Pump
                location_id=2,  # Plant B
                status="active",
                manufacturer="Flowserve",
                model="PUMP-200",
                serial_number="PUMP-001",
                installation_date=datetime(2021, 3, 15),
                warranty_expiry=datetime(2026, 3, 15),
                running_hours=Decimal("8760.00"),
                power_generation=Decimal("0.00"),
                load_factor=Decimal("75.00"),
                availability=Decimal("97.50"),
                cod=date(2021, 4, 1),
                bim=Decimal("91.00")
            ),
        ]
        
        for asset in assets:
            db.add(asset)
        db.commit()
        
        print("✅ Sample data created successfully!")
        print(f"Created {len(categories)} asset categories")
        print(f"Created {len(locations)} locations")
        print(f"Created {len(assets)} assets")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data() 