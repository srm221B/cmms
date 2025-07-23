FROM python:3.11-slim
WORKDIR /app

# Install build tools only if you really need C-extensions; else remove gcc/g++
RUN apt-get update && apt-get install -y gcc g++ \
 && rm -rf /var/lib/apt/lists/*

# ---- Python deps ----
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ---- Copy backend code ----
# If your FastAPI code is in backend/app/
COPY backend/app/    ./app/
# Static assets (optional—remove if folder doesn't exist)
COPY backend/static/ ./app/static/

# ---- Runtime env ----
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./app/cmms.db
ENV SECRET_KEY=your-secret-key-change-in-production
ENV CORS_ORIGINS="*"
ENV DEBUG=false

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
