# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy frontend static files
COPY backend/static/ ./backend/static/

# Set environment variables
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./backend/cmms.db
ENV SECRET_KEY=your-secret-key-change-in-production
ENV CORS_ORIGINS=*
ENV DEBUG=false

# Expose port
EXPOSE 8000

# Create database directory
RUN mkdir -p /app/backend

# Initialize database
RUN cd backend && python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine); print('Database initialized')"

# Start the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"] 