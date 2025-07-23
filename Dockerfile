################ 1️⃣  React build ################
FROM node:20-alpine AS client
WORKDIR /client

# copy only the real React source (skips any weird temp files)
COPY frontend/package*.json ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm ci && npm run build          # ➜ /client/dist

################ 2️⃣  FastAPI ####################
FROM python:3.11-slim AS api
WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ \
 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/ ./app/

#   legacy assets (if any) → /app/static/legacy
COPY backend/static/ ./app/static/legacy/

#   React build → /app/static  (main UI)
COPY --from=client /client/dist/ ./app/static/

COPY backend/init_db.py        ./
COPY backend/create_sample_data.py ./
COPY backend/startup.sh        ./
RUN chmod +x startup.sh

ENV PYTHONPATH=/app PORT=8000
EXPOSE ${PORT}
CMD ["./startup.sh"]