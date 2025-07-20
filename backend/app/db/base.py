from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData
from app.db.session import engine, Base

# Create a MetaData object that reflects existing tables
metadata = MetaData()
metadata.reflect(bind=engine)

# Create a base model class
class BaseModel:
    """Base model class with common methods"""
    
    @classmethod
    def get_table(cls):
        """Return the table for this model"""
        return metadata.tables[cls.__tablename__]