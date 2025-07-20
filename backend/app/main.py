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

# Root endpoint - serve the main page
@app.get("/")
async def root():
    from pathlib import Path
    import os
    
    # Try multiple possible paths for the static file
    possible_paths = [
        "static/index.html",
        "backend/static/index.html",
        "/app/static/index.html",
        "/app/backend/static/index.html",
        Path(__file__).parent.parent / "static" / "index.html"
    ]
    
    for path in possible_paths:
        try:
            if isinstance(path, Path):
                if path.exists():
                    return FileResponse(str(path))
            else:
                if os.path.exists(path):
                    return FileResponse(path)
        except Exception:
            continue
    
    # If no static file found, return the CMMS HTML directly
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content="""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMMS - Computerized Maintenance Management System</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        .status {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        .endpoints {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .endpoint {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            text-decoration: none;
            color: white;
            transition: transform 0.2s;
        }
        .endpoint:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,0.2);
        }
        .endpoint h3 {
            margin: 0 0 10px 0;
        }
        .endpoint p {
            margin: 0;
            opacity: 0.8;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏭 CMMS</h1>
        <p class="subtitle">Computerized Maintenance Management System</p>
        
        <div class="status">
            <h2>✅ System Status: Online</h2>
            <p>The CMMS API is running successfully on Railway!</p>
        </div>

        <div class="endpoints">
            <a href="/docs" class="endpoint">
                <h3>📚 API Documentation</h3>
                <p>Interactive API documentation</p>
            </a>
            <a href="/health" class="endpoint">
                <h3>💚 Health Check</h3>
                <p>System health status</p>
            </a>
            <a href="/test-railway" class="endpoint">
                <h3>🧪 Test Endpoint</h3>
                <p>Verify Railway deployment</p>
            </a>
            <a href="/api" class="endpoint">
                <h3>📡 API Root</h3>
                <p>View API status information</p>
            </a>
        </div>

        <div style="margin-top: 40px; opacity: 0.7;">
            <p>🚀 Deployed on Railway | 🐍 FastAPI | 🎯 Production Ready</p>
        </div>
    </div>
</body>
</html>""", status_code=200)

# Mount static files at /static path
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
    print("✅ Static files mounted successfully")
except Exception as e:
    print(f"Warning: Could not mount static files: {e}")

# Add a simple health check for Railway
@app.get("/railway-health")
async def railway_health():
    return {"status": "healthy", "service": "CMMS API v2"}

@app.get("/api")
async def api_root():
    return {
        "message": "CMMS API is running!",
        "version": "2.0",
        "endpoints": {
            "health": "/api/v1/health",
            "docs": "/docs",
            "test": "/test-railway"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "redirect": "/api/v1/health"}
