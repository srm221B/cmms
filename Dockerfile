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
# Copy initialization scripts
COPY backend/init_db.py ./
COPY backend/create_sample_data.py ./
COPY backend/startup.sh ./

# ---- Runtime env ----
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./app/cmms.db
ENV SECRET_KEY=your-secret-key-change-in-production
ENV CORS_ORIGINS="*"
ENV DEBUG=false

EXPOSE 8000

# Make startup script executable
RUN chmod +x startup.sh

CMD ["./startup.sh"]
