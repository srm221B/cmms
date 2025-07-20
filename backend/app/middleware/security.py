from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.auth import check_ip_restriction, check_rate_limit, SecurityConfig
import time
import logging
import os

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for IP restrictions and rate limiting"""
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP safely
        client_ip = request.client.host if request.client else "unknown"
        
        # Log all requests for monitoring
        logger.info(f"Request from {client_ip}: {request.method} {request.url.path}")
        
        # Skip IP restrictions for Railway deployment (allow all requests)
        # In production, you can enable IP restrictions by setting ENABLE_IP_RESTRICTIONS=true
        if os.getenv("ENABLE_IP_RESTRICTIONS", "false").lower() == "true":
            if request.url.path not in ["/health", "/docs", "/openapi.json", "/api/v1/health"]:
                if not check_ip_restriction(client_ip):
                    logger.warning(f"Blocked request from unauthorized IP: {client_ip}")
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "Access denied from this IP address"}
                    )
        
        # Skip rate limiting for Railway deployment (allow all requests)
        # In production, you can enable rate limiting by setting ENABLE_RATE_LIMITING=true
        if os.getenv("ENABLE_RATE_LIMITING", "false").lower() == "true":
            if not check_rate_limit(client_ip, request.url.path):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please try again later."}
                )
        
        # Add security headers
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for detailed request logging"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request details
        logger.info(f"Request started: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Log response details
        process_time = time.time() - start_time
        logger.info(f"Request completed: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")
        
        return response 