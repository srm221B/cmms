#!/usr/bin/env python3
"""
Database initialization script for CMMS application
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.session import engine, Base
from app.models import *  # Import all models
from create_sample_data import create_sample_data

def init_database():
    """Initialize the database with tables and sample data"""
    print("🗄️  Initializing database...")
    
    try:
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Create sample data
        print("📊 Creating sample data...")
        create_sample_data()
        
        print("🎉 Database initialization completed!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_database() 