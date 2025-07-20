#!/usr/bin/env python3
"""
Minimal CMMS application for Railway deployment
This file is placed at the root level to ensure Railway can find it
"""
import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CMMS - Computerized Maintenance Management System", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
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
                <a href="/test" class="endpoint">
                    <h3>🧪 Test Endpoint</h3>
                    <p>Verify Railway deployment</p>
                </a>
                <a href="/api/status" class="endpoint">
                    <h3>📡 API Status</h3>
                    <p>View API status information</p>
                </a>
            </div>

            <div style="margin-top: 40px; opacity: 0.7;">
                <p>🚀 Deployed on Railway | 🐍 FastAPI | 🎯 Production Ready</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "cmms",
        "version": "1.0.0",
        "message": "CMMS API is running successfully!"
    }

@app.get("/test")
async def test_endpoint():
    return {
        "message": "CMMS API is working on Railway!",
        "status": "success",
        "deployment": "railway",
        "environment": "production",
        "timestamp": "2024-01-15"
    }

@app.get("/api/status")
async def api_status():
    return {
        "api": "CMMS - Computerized Maintenance Management System",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "root": "/",
            "health": "/health",
            "test": "/test",
            "docs": "/docs",
            "api_status": "/api/status"
        },
        "deployment": {
            "platform": "Railway",
            "status": "active",
            "last_updated": "2024-01-15"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
