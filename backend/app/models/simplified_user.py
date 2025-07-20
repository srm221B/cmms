from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import os

# Define connection string directly in this file to avoid circular imports
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sriram:sriram@localhost:5432/cmms")
engine = create_engine(DATABASE_URL)

# Create an independent Base for this file using automap
Base = automap_base()

# Reflect the tables
Base.prepare(autoload_with=engine)

# Access the reflected tables
User = Base.classes.users
Role = Base.classes.roles

def test_user_model():
    """Test the User model"""
    with Session(engine) as session:
        # Query users
        users = session.query(User).all()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"  - {user.username} ({user.email})")
        
        # Query roles
        roles = session.query(Role).all()
        print(f"Found {len(roles)} roles:")
        for role in roles:
            print(f"  - {role.name}: {role.description}")
        
        return True

if __name__ == "__main__":
    test_user_model()