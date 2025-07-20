from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, MetaData
import os

# Create a completely fresh engine and metadata
DATABASE_URL = "postgresql://sriram:sriram@localhost:5432/cmms"
engine = create_engine(DATABASE_URL)

# Create a fresh metadata
metadata = MetaData()

# Create automap base with the fresh metadata
Base = automap_base(metadata=metadata)

# Reflect tables
print("Reflecting tables...")
Base.prepare(autoload_with=engine)
print("Tables reflected.")

# List all reflected tables
print("\nReflected tables:")
for table_name in Base.metadata.tables.keys():
    print(f"  - {table_name}")

# Try to access some tables
print("\nAccessing tables...")
if hasattr(Base.classes, 'users'):
    User = Base.classes.users
    Role = Base.classes.roles
    
    # Test with a session
    with Session(engine) as session:
        # Query users
        users = session.query(User).all()
        print(f"\nFound {len(users)} users:")
        for user in users:
            print(f"  - {user.username} ({user.email})")
        
        # Query roles
        roles = session.query(Role).all()
        print(f"\nFound {len(roles)} roles:")
        for role in roles:
            print(f"  - {role.name}: {role.description}")
else:
    print("No 'users' table found in the reflected tables!")
    print("Available classes:", dir(Base.classes))