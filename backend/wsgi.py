# WSGI entry point for Render deployment
from app.main import app

if __name__ == "__main__":
    app.run() 