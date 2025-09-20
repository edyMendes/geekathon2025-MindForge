"""
Configuration settings for the Chicken Feed Nutritional Advisor API
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings"""
    
    # API Configuration
    API_TITLE: str = "Chicken Feed Nutritional Advisor"
    API_DESCRIPTION: str = "API to get nutritional feed recommendations for chickens using AWS Bedrock Nova Pro"
    API_VERSION: str = "1.0.0"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # AWS Bedrock Configuration - Bearer Token approach
    AWS_BEARER_TOKEN_BEDROCK: str = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    AWS_REGION: str = os.getenv("AWS_REGION")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID")
    
    # Bedrock Configuration
    BEDROCK_CONFIG = {
        "connect_timeout": int(os.getenv("BEDROCK_CONNECT_TIMEOUT", "60")),
        "read_timeout": int(os.getenv("BEDROCK_READ_TIMEOUT", "60")),
        "max_attempts": int(os.getenv("BEDROCK_MAX_ATTEMPTS", "3"))
    }
    
    # Model Configuration
    MODEL_MAX_TOKENS: int = int(os.getenv("MODEL_MAX_TOKENS", "8000"))
    MODEL_TEMPERATURE: float = float(os.getenv("MODEL_TEMPERATURE", "0.3"))
    MODEL_TOP_P: float = float(os.getenv("MODEL_TOP_P", "0.9"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Validation limits
    MAX_CHICKEN_COUNT: int = 10000
    MIN_CHICKEN_COUNT: int = 1
    MAX_WEIGHT_KG: float = 10.0
    MIN_WEIGHT_KG: float = 0.1
    MAX_AGE_WEEKS: int = 200
    MIN_AGE_WEEKS: int = 1
    
    def validate_required_settings(self) -> bool:
        """Validate that required AWS settings are provided"""
        if not self.AWS_BEARER_TOKEN_BEDROCK:
            raise ValueError("AWS_BEARER_TOKEN_BEDROCK is required")
        if not self.AWS_REGION:
            raise ValueError("AWS_REGION is required")
        if not self.BEDROCK_MODEL_ID:
            raise ValueError("BEDROCK_MODEL_ID is required")
        return True

settings = Settings()

# Set the bearer token in environment if provided (like your example)
aws_bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
if aws_bearer_token:
    os.environ["AWS_BEARER_TOKEN_BEDROCK"] = aws_bearer_token
else:
    print("AWS_BEARER_TOKEN_BEDROCK environment variable is not set. API will not work.")
