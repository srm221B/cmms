# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import assets, auth, inventory, locations, simple_auth, users, work_orders, health
from app.core.config import settings
from app.middleware.security import SecurityMiddleware, RequestLoggingMiddleware

app = FastAPI(title="CMMS API", version="1.0.0")

# Security middleware (add first)
app.add_middleware(SecurityMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(simple_auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(assets.router, prefix=settings.api_v1_prefix)
app.include_router(work_orders.router, prefix=settings.api_v1_prefix)
app.include_router(inventory.router, prefix=settings.api_v1_prefix)
app.include_router(locations.router, prefix=settings.api_v1_prefix)
app.include_router(health.router, prefix=settings.api_v1_prefix)

# Test endpoint to verify Railway is running our code
@app.get("/test-railway")
async def test_railway():
    return {
        "message": "CMMS API is running on Railway!",
        "version": "2.0",
        "timestamp": "2024-01-15",
        "status": "active"
    }

# Mount static files (React frontend)
try:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
    print("✅ Static files mounted successfully")
except Exception as e:
    print(f"Warning: Could not mount static files: {e}")
    # Create a fallback route for the root
    @app.get("/")
    async def root_fallback():
        return {
            "message": "CMMS API is running!",
            "status": "Frontend not built yet",
            "endpoints": {
                "api": "/api",
                "health": "/health",
                "docs": "/docs",
                "test": "/test-railway"
            }
        }

# Add a simple health check for Railway
@app.get("/railway-health")
async def railway_health():
    return {"status": "healthy", "service": "CMMS API v2"}

@app.get("/api")
async def api_root():
    return {"message": "CMMS API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
