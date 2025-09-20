"""
API routes for the Chicken Feed Nutritional Advisor
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Dict, Any
import logging

from app.models.chicken import ChickenInfo, FeedCalculationResponse
from app.services.bedrock_service import BedrockService
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize Bedrock service
bedrock_service = BedrockService()

@router.get("/")
async def root():
    """Root endpoint with API information and configuration status"""
    
    # Check configuration status
    config_status = "ready"
    missing_vars = []
    
    if not settings.AWS_BEARER_TOKEN_BEDROCK:
        missing_vars.append("AWS_BEARER_TOKEN_BEDROCK")
        config_status = "missing_credentials"
        
    if not settings.AWS_REGION:
        missing_vars.append("AWS_REGION")
        config_status = "missing_credentials"
    
    response = {
        "message": "Chicken Feed Nutritional Advisor API", 
        "version": "1.0.0",
        "docs": "/docs",
        "status": config_status,
        "aws_region": settings.AWS_REGION,
        "model_id": settings.BEDROCK_MODEL_ID
    }
    
    if missing_vars:
        response["missing_environment_variables"] = missing_vars
        response["setup_instructions"] = {
            "1": "Set AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here",
            "2": "Set AWS_REGION=us-east-1", 
            "3": "Restart the server",
            "4": "Visit /docs for API documentation"
        }
    
    return response

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

@router.post("/calculate-feed", response_model=Dict[str, Any])
async def calculate_feed(chicken_info: ChickenInfo):
    """
    Generate detailed feed calculations including quantities per day, per chicken, per meal, and feeding schedule
    
    Based on the nutritional recommendation, this endpoint provides:
    - **total_quantity_per_day_kg**: Total feed needed per day in kg
    - **quantity_per_chicken_g**: Feed amount per chicken in grams
    - **quantity_per_meal_g**: Feed amount per meal in grams  
    - **meals_per_day**: Recommended number of meals per day
    - **feeding_schedule**: Optimal feeding times
    - **storage_recommendations**: Feed storage best practices
    
    Input parameters:
    - **count**: Number of chickens (1-10000)
    - **breed**: Breed of chickens (e.g., 'laying hen')
    - **average_weight_kg**: Average weight in kilograms (0.1-10.0)
    - **age_weeks**: Age in weeks (1-200)
    - **season**: Optional season override (spring/summer/autumn/winter)
    """
    try:
        logger.info(f"Processing feed calculation request for {chicken_info.count} {chicken_info.breed}")
        
        # Generate detailed feed calculations
        calculation = bedrock_service.generate_feed_calculation(chicken_info)
        
        logger.info("Feed calculation generated successfully")
        return calculation
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in calculate_feed: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
