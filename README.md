# CMMS - Computerized Maintenance Management System

A modern web application for managing maintenance operations, assets, inventory, and work orders.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env  # if .env.example exists
   # Or create .env with:
   echo "DATABASE_URL=sqlite:///./cmms.db" > .env
   echo "SECRET_KEY=your-secret-key-change-in-production" >> .env
   echo "CORS_ORIGINS=http://localhost:3000" >> .env
   ```

5. **Initialize database:**
   ```bash
   python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
   ```

6. **Start backend server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
cmms/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database models and session
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI application
│   ├── static/             # Static files (React build)
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── config/         # Configuration files
│   └── package.json        # Node.js dependencies
└── README.md              # This file
```

## 🔧 Development

### Backend Development
- **API Documentation:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/api/health

### Frontend Development
- **Development Server:** http://localhost:3000
- **Production Build:** `npm run build`

## 🗄️ Database

The application uses SQLite for local development. The database file will be created automatically at `backend/cmms.db`.

## 🔐 Authentication

The application includes both JWT-based authentication and simple authentication for development purposes.

## 📊 Features

- **Asset Management:** Track and manage equipment and assets
- **Work Orders:** Create and manage maintenance work orders
- **Inventory Management:** Track parts and materials
- **Location Management:** Organize assets by location
- **User Management:** User roles and permissions

## 🛠️ API Endpoints

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/assets` - Asset management
- `/api/work-orders` - Work order management
- `/api/inventory` - Inventory management
- `/api/locations` - Location management
- `/api/health` - Health check

## 🚀 Production Deployment

For production deployment, consider:
- Using PostgreSQL instead of SQLite
- Setting up proper environment variables
- Using a production WSGI server like Gunicorn
- Setting up proper CORS configuration
- Implementing proper security measures

## 📝 License

This project is for educational and development purposes. 