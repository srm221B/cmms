# CMMS Application

A Computerized Maintenance Management System with both web and desktop (Electron) interfaces.

## Quick Start

### Web Application
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

### Electron Application
```bash
cd electron-app
npm install
npm run dev
```

## Database
The application uses PostgreSQL. Make sure your database is configured in `backend/app/core/config.py` and `electron-app/backend/app/core/config.py`. 