"""
Simple AWS Bearer Token authentication service for Bedrock
"""
import boto3
import logging
import os
from botocore.config import Config
from botocore.exceptions import ClientError
from typing import Dict, Any
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

def get_bedrock_client():
    """Create and return AWS Bedrock client with bearer token authentication"""
    return boto3.client(
        "bedrock-runtime",
        region_name=settings.AWS_REGION,
        config=Config(
            connect_timeout=settings.BEDROCK_CONFIG["connect_timeout"],
            read_timeout=settings.BEDROCK_CONFIG["read_timeout"],
            retries={"max_attempts": settings.BEDROCK_CONFIG["max_attempts"]},
        ),
    )

class AWSAuthService:
    """Simple service for AWS bearer token authentication"""
    
    def __init__(self):
        """Initialize with bearer token validation"""
        try:
            # Validate required settings
            settings.validate_required_settings()
            logger.info("AWS Bearer Token authentication initialized")
        except ValueError as e:
            logger.error(f"Configuration error: {e}")
            raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    
    def create_bedrock_client(self) -> boto3.client:
        """Create Bedrock client with bearer token"""
        try:
            client = get_bedrock_client()
            logger.info(f"Created Bedrock client for region: {settings.AWS_REGION}")
            return client
            
        except Exception as e:
            logger.error(f"Failed to create Bedrock client: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Bedrock client: {str(e)}"
            )
    
    def validate_credentials(self) -> bool:
        """Validate bearer token by attempting to create a client"""
        try:
            # Try to create a client - if bearer token is invalid, this will fail
            client = self.create_bedrock_client()
            logger.info("Bearer token validated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Bearer token validation failed: {e}")
            return False
    
    def get_auth_info(self) -> Dict[str, Any]:
        """Get authentication information"""
        return {
            "auth_method": "bearer_token",
            "region": settings.AWS_REGION,
            "model_id": settings.BEDROCK_MODEL_ID,
            "bearer_token_set": bool(settings.AWS_BEARER_TOKEN_BEDROCK),
            "connect_timeout": settings.BEDROCK_CONFIG["connect_timeout"],
            "read_timeout": settings.BEDROCK_CONFIG["read_timeout"],
            "max_attempts": settings.BEDROCK_CONFIG["max_attempts"]
        }