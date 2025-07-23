from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.config import settings
from app.middleware.security import SecurityMiddleware
from app.api.endpoints import auth, users, assets, work_orders, inventory, locations, health, simple_auth

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Include API routers
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(users.router, prefix=settings.api_v1_prefix)
app.include_router(assets.router, prefix=settings.api_v1_prefix)
app.include_router(work_orders.router, prefix=settings.api_v1_prefix)
app.include_router(inventory.router, prefix=settings.api_v1_prefix)
app.include_router(locations.router, prefix=settings.api_v1_prefix)
app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(simple_auth.router, prefix=settings.api_v1_prefix)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Root endpoint - serve the React app"""
    return FileResponse("static/index.html")

@app.get("/favicon.ico")
async def favicon():
    """Serve favicon"""
    return FileResponse("static/favicon.ico")

@app.get("/manifest.json")
async def manifest():
    """Serve manifest.json"""
    return FileResponse("static/manifest.json")

@app.get("/robots.txt")
async def robots():
    """Serve robots.txt"""
    return FileResponse("static/robots.txt")

@app.get("/logo192.png")
async def logo192():
    """Serve logo192.png"""
    return FileResponse("static/logo192.png")

@app.get("/logo512.png")
async def logo512():
    """Serve logo512.png"""
    return FileResponse("static/logo512.png")

@app.get("/asset-manifest.json")
async def asset_manifest():
    """Serve asset-manifest.json"""
    return FileResponse("static/asset-manifest.json")

# Catch-all route for React Router
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """Catch-all route for React Router - serve index.html for all unmatched routes"""
    # Don't serve index.html for API routes or static files
    if full_path.startswith("api/") or full_path.startswith("static/") or full_path in ["favicon.ico", "manifest.json", "robots.txt", "logo192.png", "logo512.png", "asset-manifest.json"]:
        raise HTTPException(status_code=404, detail="Not found")
    
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 