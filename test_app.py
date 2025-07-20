#!/usr/bin/env python3
# Test script to verify app imports work correctly

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    print("Testing app import...")
    from app.main import app
    print("✅ App imported successfully!")
    print(f"App type: {type(app)}")
    print(f"App title: {app.title}")
except Exception as e:
    print(f"❌ Error importing app: {e}")
    import traceback
    traceback.print_exc() 