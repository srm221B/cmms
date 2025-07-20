import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models import User, Role, Location, Asset, InventoryMaster

def test_database_connection():
    """Test database connection and verify models"""
    try:
        # Create a session
        db = SessionLocal()
        
        # Try some simple queries
        print("Testing database connection...")
        
        # Count users
        user_count = db.query(User).count()
        print(f"Found {user_count} users")
        
        # Get all roles
        roles = db.query(Role).all()
        print(f"Found {len(roles)} roles:")
        for role in roles:
            print(f"  - {role.name}: {role.description}")
        
        # Get locations
        locations = db.query(Location).all()
        print(f"Found {len(locations)} locations")
        
        # Count assets
        asset_count = db.query(Asset).count()
        print(f"Found {asset_count} assets")
        
        # Count inventory items
        inventory_count = db.query(InventoryMaster).count()
        print(f"Found {inventory_count} inventory items")
        
        print("Database connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error testing database connection: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    test_database_connection()