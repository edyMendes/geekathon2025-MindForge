"""
AWS Bedrock service for generating chicken feed recommendations
"""
import boto3
import json
import logging
from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException

from app.core.config import settings
from app.models.chicken import ChickenInfo
from app.services.auth_service import AWSAuthService

logger = logging.getLogger(__name__)

class BedrockService:
    """Service for interacting with AWS Bedrock Nova Pro model"""
    
    def __init__(self):
        try:
            self.auth_service = AWSAuthService()
            logger.info(f"Initialized Bedrock service for region: {settings.AWS_REGION}")
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock service: {e}")
            raise
    
    def _get_bedrock_client(self) -> boto3.client:
        """Get Bedrock client with API key authentication"""
        return self.auth_service.create_bedrock_client()

    def get_current_season(self) -> str:
        """Determine current season based on date"""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "autumn"

    def _create_prompt(self, chicken_info: ChickenInfo, season: str) -> str:
        """Create detailed prompt for Nova Pro model"""
        return f"""You are a poultry nutrition expert. Please provide a detailed nutritional feed composition recommendation for the following chicken group:

Chicken Details:
- Number of birds: {chicken_info.count}
- Breed: {chicken_info.breed}
- Average weight: {chicken_info.average_weight_kg} kg per bird
- Age: {chicken_info.age_weeks} weeks
- Current season: {season}

Please provide a comprehensive response in JSON format with the following structure:
{{
    "feed_composition": {{
        "crude_protein_percent": <percentage>,
        "metabolizable_energy_kcal_per_kg": <value>,
        "crude_fat_percent": <percentage>,
        "crude_fiber_percent": <percentage>,
        "calcium_percent": <percentage>,
        "phosphorus_percent": <percentage>,
        "lysine_percent": <percentage>,
        "methionine_percent": <percentage>,
        "vitamins": {{
            "vitamin_a_iu_per_kg": <value>,
            "vitamin_d3_iu_per_kg": <value>,
            "vitamin_e_iu_per_kg": <value>
        }},
        "minerals": {{
            "sodium_percent": <percentage>,
            "chloride_percent": <percentage>,
            "magnesium_percent": <percentage>
        }}
    }},
    "daily_feed_amount_per_bird_kg": <amount in kg>,
    "total_daily_feed_kg": <total for all birds>,
    "seasonal_adjustments": {{
        "energy_adjustment": "<explanation>",
        "protein_adjustment": "<explanation>",
        "water_considerations": "<explanation>"
    }},
    "additional_recommendations": [
        "<recommendation 1>",
        "<recommendation 2>",
        "<recommendation 3>"
    ]
}}

Consider the bird's age, weight, breed characteristics, and seasonal requirements. For laying hens, focus on calcium and protein needs. Adjust energy requirements based on the season and provide practical feeding advice."""

    def _call_nova_pro(self, prompt: str) -> Dict[str, Any]:
        """Call Nova Pro model with the given prompt using the Nova Converse API format"""
        try:
            # Build request payload for Nova Converse API (matching your example)
            request_body = {
                "messages": [
                    {
                        "role": "user", 
                        "content": [{"text": prompt}]
                    }
                ],
                "inferenceConfig": {
                    "maxTokens": settings.MODEL_MAX_TOKENS,
                    "temperature": settings.MODEL_TEMPERATURE,
                    "topP": settings.MODEL_TOP_P,
                },
            }

            # Get authenticated Bedrock client and call Nova Pro model
            bedrock_client = self._get_bedrock_client()
            response = bedrock_client.invoke_model(
                modelId=settings.BEDROCK_MODEL_ID,
                body=json.dumps(request_body)
            )

            model_response = json.loads(response["body"].read())
            
            # Parse Nova response format (matching your example)
            output = model_response.get("output", {})
            message = output.get("message", {})
            content = message.get("content", [])

            if content and len(content) > 0:
                generated_text = content[0].get("text", "").strip()
                if generated_text:
                    return self._parse_response(generated_text)
                else:
                    return self._create_fallback_response("No response generated from model")
            else:
                return self._create_fallback_response("No content in model response")
            
        except Exception as e:
            logger.error(f"Error calling Nova Pro: {e}")
            return self._create_fallback_response(f"Error calling model: {str(e)}")

    def _parse_response(self, generated_text: str) -> Dict[str, Any]:
        """Parse JSON response from Nova Pro model"""
        try:
            # Find JSON in the response
            json_start = generated_text.find('{')
            json_end = generated_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = generated_text[json_start:json_end]
                recommendation = json.loads(json_str)
                return recommendation
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse JSON from Nova Pro response: {e}")
            logger.error(f"Raw response: {generated_text}")
            
            # Fallback: return a structured error response
            return {
                "error": "Failed to parse recommendation",
                "raw_response": generated_text,
                "feed_composition": {
                    "crude_protein_percent": 0,
                    "metabolizable_energy_kcal_per_kg": 0,
                    "crude_fat_percent": 0,
                    "crude_fiber_percent": 0,
                    "calcium_percent": 0,
                    "phosphorus_percent": 0,
                    "lysine_percent": 0,
                    "methionine_percent": 0,
                    "vitamins": {
                        "vitamin_a_iu_per_kg": 0,
                        "vitamin_d3_iu_per_kg": 0,
                        "vitamin_e_iu_per_kg": 0
                    },
                    "minerals": {
                        "sodium_percent": 0,
                        "chloride_percent": 0,
                        "magnesium_percent": 0
                    }
                },
                "daily_feed_amount_per_bird_kg": 0,
                "total_daily_feed_kg": 0,
                "seasonal_adjustments": {
                    "energy_adjustment": "Error occurred",
                    "protein_adjustment": "Error occurred",
                    "water_considerations": "Error occurred"
                },
                "additional_recommendations": ["Please check the raw response for manual parsing"]
            }
    
    def _create_fallback_response(self, error_message: str) -> Dict[str, Any]:
        """Create a fallback response when the model fails"""
        return {
            "error": error_message,
            "feed_composition": {
                "crude_protein_percent": 18.0,
                "metabolizable_energy_kcal_per_kg": 2800,
                "crude_fat_percent": 4.0,
                "crude_fiber_percent": 4.5,
                "calcium_percent": 3.5,
                "phosphorus_percent": 0.6,
                "lysine_percent": 0.9,
                "methionine_percent": 0.35,
                "vitamins": {
                    "vitamin_a_iu_per_kg": 8000,
                    "vitamin_d3_iu_per_kg": 2000,
                    "vitamin_e_iu_per_kg": 25
                },
                "minerals": {
                    "sodium_percent": 0.18,
                    "chloride_percent": 0.20,
                    "magnesium_percent": 0.12
                }
            },
            "daily_feed_amount_per_bird_kg": 0.12,
            "total_daily_feed_kg": 18.0,
            "seasonal_adjustments": {
                "energy_adjustment": "Default recommendation - model unavailable",
                "protein_adjustment": "Default recommendation - model unavailable",
                "water_considerations": "Ensure fresh water is always available"
            },
            "additional_recommendations": [
                "This is a fallback response due to model error",
                "Please check your AWS_BEARER_TOKEN_BEDROCK configuration",
                "Consult with a poultry nutritionist for specific recommendations"
            ]
        }

    def generate_feed_recommendation(self, chicken_info: ChickenInfo) -> Dict[str, Any]:
        """Generate nutritional feed recommendation using Nova Pro"""
        
        # Use provided season or auto-detect
        season = chicken_info.season or self.get_current_season()
        
        logger.info(f"Generating recommendation for {chicken_info.count} {chicken_info.breed} chickens, season: {season}")
        
        # Create prompt
        prompt = self._create_prompt(chicken_info, season)
        
        # Call Nova Pro
        recommendation = self._call_nova_pro(prompt)
        
        # Add metadata
        recommendation["request_info"] = {
            "processed_at": datetime.now().isoformat(),
            "chicken_count": chicken_info.count,
            "breed": chicken_info.breed,
            "average_weight_kg": chicken_info.average_weight_kg,
            "age_weeks": chicken_info.age_weeks,
            "season_used": season
        }
        
        return recommendation
    
    def get_auth_info(self) -> Dict[str, Any]:
        """Get authentication information for debugging"""
        return self.auth_service.get_auth_info()
    
    def validate_credentials(self) -> bool:
        """Validate current AWS credentials"""
        return self.auth_service.validate_credentials()
