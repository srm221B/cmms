# ---------- base image ----------
FROM python:3.11-slim

# ---------- working dir ----------
WORKDIR /app

# ---------- copy & install Python deps ----------
COPY backend/requirements.txt ./requirements.txt          # <-- correct path
RUN pip install --no-cache-dir -r requirements.txt

# ---------- copy ONLY the backend code ----------
COPY backend/app/ ./app/                                  # app/ now contains main.py, db, …
COPY backend/static/ ./app/static/                        # optional: keep if you really have static/

# ---------- runtime env vars ----------
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./app/cmms.db
ENV SECRET_KEY=change-me-in-prod
ENV CORS_ORIGINS="*"
ENV DEBUG=false

# ---------- ports ----------
EXPOSE 8000

# ---------- start command ----------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
