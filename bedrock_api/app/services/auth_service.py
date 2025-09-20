"""
Simple AWS Bearer Token authentication service for Bedrock
"""
from tabnanny import check
import boto3
import logging
from botocore.config import Config
from typing import Dict, Any
from fastapi import HTTPException
from botocore import config

from app.core.config import settings

logger = logging.getLogger(__name__)

def get_bedrock_client():
    """Create and return AWS Bedrock client with bearer token authentication"""


    return boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.AWS_REGION,
    )

class AWSAuthService:
    """Simple service for AWS bearer token authentication"""
    
    def __init__(self):
        """Initialize without validation - validation happens at runtime"""
        logger.info("AWS Bearer Token authentication service initialized")
    
    def create_bedrock_client(self) -> boto3.client:
        """Create Bedrock client with bearer token"""
        try:
            # Validate settings when actually needed
            if not settings.AWS_BEARER_TOKEN_BEDROCK:
                raise HTTPException(
                    status_code=500,
                    detail="AWS_BEARER_TOKEN_BEDROCK is required but not set. Please set this environment variable."
                )
            
            if not settings.AWS_REGION:
                raise HTTPException(
                    status_code=500,
                    detail="AWS_REGION is required but not set. Please set this environment variable."
                )
            
            # Simply use the get_bedrock_client function - no credential manipulation
            client = get_bedrock_client()
            logger.info(f"Created Bedrock client for region: {settings.AWS_REGION}")
            return client
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create Bedrock client: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Bedrock client: {str(e)}"
            )
    
    def validate_credentials(self) -> bool:
        """Validate bearer token by making an actual AWS API call"""
        try:
            # Create client and make a real AWS call to test credentials
            client = self.create_bedrock_client()
            
            # Try a simple invoke_model call with minimal payload to test credentials
            # This will fail if credentials are invalid, but we catch the specific error
            import json
            test_payload = {
                "messages": [{"role": "user", "content": [{"text": "test"}]}],
                "inferenceConfig": {"maxTokens": 500, "temperature": 0.8, "topP": 0.9}
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.AWS_BEARER_TOKEN_BEDROCK}"
            }

            logger.info(f"Test payload: {json.dumps(test_payload)}")
            logger.info(f"Model ID: {settings.BEDROCK_MODEL_ID}")
            logger.info(f"Client Key: {client}")

            # get session credentials
            session_credentials = client.meta.session.get_credentials()
            logger.info(f"Session Credentials: {session_credentials}")


            response = client.invoke_model(
                modelId=settings.BEDROCK_MODEL_ID,
                body=json.dumps(test_payload),
                headers=headers
            )
            logger.info(f"Response: {response}")
            logger.info("Bearer token validated successfully with AWS API call")
            return True
            
        except Exception as e:
            error_msg = str(e)
            # If it's a credentials error, the token is invalid
            if any(cred_error in error_msg.lower() for cred_error in [
                "unable to locate credentials", 
                "invalid security token", 
                "access denied",
                "unauthorized"
            ]):
                logger.error(f"Bearer token validation failed - credentials issue: {e}")
                return False
            else:
                # Other errors (like model access, validation errors) mean credentials work
                # but there might be other issues
                logger.info(f"Bearer token appears valid (got non-credential error: {e})")
                return True
    
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