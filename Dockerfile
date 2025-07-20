# Use Node.js to build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Add a build timestamp to force rebuild
RUN echo "Build timestamp: $(date)" > build-info.txt

# Use Python for the backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from the first stage
COPY --from=frontend-builder /app/build ./static

# Create a simple index.html if static files don't exist
RUN if [ ! -f "static/index.html" ]; then \
    echo '<!DOCTYPE html><html><head><title>CMMS API</title></head><body><h1>CMMS API Running</h1><p>Backend is working! Check <a href="/api">/api</a> for endpoints.</p></body></html>' > static/index.html; \
    fi

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 