"""
Main entry point for the Chicken Feed Nutritional Advisor API
"""
import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")
    logger.info(f"AWS Region: {settings.AWS_REGION}")
    logger.info(f"Model ID: {settings.BEDROCK_MODEL_ID}")
    
    # Check configuration and provide helpful messages
    missing_vars = []
    
    if not settings.AWS_BEARER_TOKEN_BEDROCK:
        missing_vars.append("AWS_BEARER_TOKEN_BEDROCK")
        
    if not settings.AWS_REGION:
        missing_vars.append("AWS_REGION")
    
    if missing_vars:
        logger.warning("⚠️  Missing required environment variables:")
        for var in missing_vars:
            logger.warning(f"   - {var}")
        logger.warning("")
        logger.warning("🔧 To fix this, set the following environment variables:")
        logger.warning("   export AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here")
        logger.warning("   export AWS_REGION=us-east-1")
        logger.warning("")
        logger.warning("📚 Then restart the server: python main.py")
        logger.warning("")
        logger.warning("⚡ Server will start but API calls will fail until credentials are set.")
    else:
        logger.info("✅ Configuration looks good!")
        logger.info("🚀 API is ready to receive requests")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.API_TITLE}")

# Create FastAPI app with lifespan
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

if __name__ == "__main__":
    logger.info(f"Starting server on {settings.API_HOST}:{settings.API_PORT}")
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )