FROM python:3.11-slim
WORKDIR /app

# deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# application code
COPY backend/app/    ./app/
COPY backend/static/ ./app/static/   # delete if you don’t actually have this folder

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
