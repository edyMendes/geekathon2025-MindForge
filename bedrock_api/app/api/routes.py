"""
API routes for the Chicken Feed Nutritional Advisor
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Dict, Any
import logging

from app.models.chicken import ChickenInfo
from app.services.bedrock_service import BedrockService

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize Bedrock service
bedrock_service = BedrockService()

@router.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Chicken Feed Nutritional Advisor API", 
        "version": "1.0.0",
        "docs": "/docs"
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "service": "chicken-feed-advisor"
    }

@router.get("/seasons")
async def get_current_season():
    """Get the current season based on date"""
    return {
        "current_season": bedrock_service.get_current_season(),
        "date": datetime.now().isoformat()
    }

@router.get("/auth/info")
async def get_auth_info():
    """Get authentication information for debugging"""
    try:
        auth_info = bedrock_service.get_auth_info()
        return {
            "status": "success",
            "auth_info": auth_info,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get auth info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get auth info: {str(e)}")

@router.get("/auth/validate")
async def validate_credentials():
    """Validate current AWS credentials"""
    try:
        is_valid = bedrock_service.validate_credentials()
        return {
            "status": "success",
            "credentials_valid": is_valid,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to validate credentials: {e}")
        return {
            "status": "error",
            "credentials_valid": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/recommend-feed", response_model=Dict[str, Any])
async def recommend_feed(chicken_info: ChickenInfo):
    """
    Generate nutritional feed recommendations for chickens using AWS Bedrock Nova Pro
    
    - **count**: Number of chickens (1-10000)
    - **breed**: Breed of chickens (e.g., 'laying hen')
    - **average_weight_kg**: Average weight in kilograms (0.1-10.0)
    - **age_weeks**: Age in weeks (1-200)
    - **season**: Optional season override (spring/summer/autumn/winter)
    """
    try:
        logger.info(f"Processing feed recommendation request for {chicken_info.count} {chicken_info.breed}")
        
        # Generate recommendation
        recommendation = bedrock_service.generate_feed_recommendation(chicken_info)
        
        logger.info("Feed recommendation generated successfully")
        return recommendation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in recommend_feed: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
