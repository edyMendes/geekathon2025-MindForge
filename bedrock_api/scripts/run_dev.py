#!/usr/bin/env python3
"""
Development server runner script
"""
import os
import sys
import uvicorn

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

if __name__ == "__main__":
    print(f"🚀 Starting {settings.API_TITLE} in development mode")
    print(f"📍 Server: http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📚 Docs: http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print(f"🔄 Auto-reload: Enabled")
    print(f"📊 Log level: {settings.LOG_LEVEL}")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
