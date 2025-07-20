#!/usr/bin/env python3
"""
Simple test script to verify Railway deployment
"""
import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI(title="CMMS Test")

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>CMMS - Railway Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f0f0f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
            h1 { color: #333; }
            .status { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏭 CMMS Application</h1>
            <div class="status">
                <h2>✅ Railway Deployment Successful!</h2>
                <p>Your CMMS application is now running on Railway.</p>
            </div>
            <h3>Available Endpoints:</h3>
            <ul>
                <li><a href="/docs">📚 API Documentation</a></li>
                <li><a href="/test">🧪 Test Endpoint</a></li>
                <li><a href="/health">💚 Health Check</a></li>
            </ul>
        </div>
    </body>
    </html>
    """

@app.get("/test")
async def test():
    return {
        "message": "CMMS API is working!",
        "status": "success",
        "railway": True,
        "environment": "production"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "cmms"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
