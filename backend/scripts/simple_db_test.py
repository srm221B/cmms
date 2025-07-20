import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
import os

# Connect directly without using models
DATABASE_URL = "postgresql://sriram:sriram@localhost:5432/cmms"

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    with engine.connect() as connection:
        print("Database connection successful!")
        
        # Execute a simple query
        result = connection.execute(text("SELECT COUNT(*) FROM users"))
        for row in result:
            print(f"Found {row[0]} users in the database.")
        
        # Execute another query
        result = connection.execute(text("SELECT name, description FROM roles"))
        print("Roles in the system:")
        for row in result:
            print(f"  - {row[0]}: {row[1]}")

except Exception as e:
    print(f"Error: {str(e)}")