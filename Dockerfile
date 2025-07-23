################ 1️⃣  React build (client) ################
FROM node:20-alpine AS client
WORKDIR /client

# 1. copy dependency manifests first  ────── enables Docker cache
COPY frontend/package*.json ./
RUN npm ci

# 2. copy the actual source
COPY frontend/ ./

# 3. build the production bundle
RUN npm run build                                # → /client/dist

################ 2️⃣  FastAPI (api) #######################
FROM python:3.11-slim AS api
WORKDIR /app

# OS build tools only if you really need them:
RUN apt-get update && apt-get install -y gcc g++ \
 && rm -rf /var/lib/apt/lists/*

# Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend source
COPY backend/app/ ./app/

# Optional legacy assets
COPY backend/static/ ./app/static/legacy/

# React build → /app/static
COPY --from=client /client/build/ ./app/static/

# Startup scripts
COPY backend/init_db.py            ./
COPY backend/create_sample_data.py ./
COPY backend/startup.sh            ./
RUN chmod +x startup.sh

ENV PYTHONPATH=/app PORT=8000
EXPOSE ${PORT}
CMD ["./startup.sh"]