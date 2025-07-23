################ 1️⃣  React build stage ################
FROM node:20-alpine AS client
WORKDIR /client
COPY frontend/ ./                       # React source
RUN npm ci && npm run build             # ➜ /client/dist

################ 2️⃣  FastAPI + startup script #########
FROM python:3.11-slim AS api
WORKDIR /app

# ---- OS build tools (only if some deps need C) ----
RUN apt-get update && apt-get install -y gcc g++ \
 && rm -rf /var/lib/apt/lists/*

# ---- Python deps ----
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ---- Backend source ----
COPY backend/app/ ./app/

# ---- Optional legacy assets (parked in a sub-folder) ----
COPY backend/static/ ./app/static/legacy/

# ---- React build into the true static root ----
COPY --from=client /client/dist/ ./app/static/

# ---- Helper scripts ----
COPY backend/init_db.py        ./
COPY backend/create_sample_data.py ./
COPY backend/startup.sh        ./

# ---- Runtime env ----
ENV PYTHONPATH=/app \
    DATABASE_URL=sqlite:///./app/cmms.db \
    SECRET_KEY=your-secret-key-change-in-production \
    CORS_ORIGINS="*" \
    DEBUG=false \
    PORT=8000

EXPOSE ${PORT}

RUN chmod +x startup.sh
CMD ["./startup.sh"]