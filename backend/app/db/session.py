# app/db/session.py
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sriram:sriram@localhost:5432/cmms")
engine = create_engine(DATABASE_URL)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create metadata and declarative base
metadata = MetaData()
Base = declarative_base(metadata=metadata)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
