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
- Environment: {chicken_info.environment}
- Purpose: {chicken_info.purpose}
- Current season: {season}

Please provide a comprehensive response in JSON format with the following structure. Return ONLY valid JSON without any markdown formatting or code blocks:
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

Consider the bird's age, weight, breed characteristics, environment, purpose, and seasonal requirements:

Environment considerations:
- Free range: Higher energy needs due to activity, may need additional supplements
- Barn: Standard indoor nutrition requirements
- Battery cage: Optimized for confined space, focus on nutrient density
- Organic: Must meet organic certification standards, natural feed sources only

Purpose considerations:
- Eggs: High calcium and protein for egg production, specific amino acid requirements
- Breeding: Balanced nutrition for reproductive health, fertility optimization
- Meat production: High protein for muscle development, energy for growth

Adjust energy requirements based on the season, environment activity levels, and production purpose. Provide practical feeding advice tailored to the specific environment and production goals."""

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
                    raise HTTPException(
                        status_code=500,
                        detail="No response generated from Nova Pro model"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="No content in Nova Pro model response"
                )
            
        except HTTPException:
            raise
        except Exception as e:
            error_msg = f"Error calling Nova Pro: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Full error details: {repr(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error calling Nova Pro model: {str(e)}"
            )

    def _parse_response(self, generated_text: str) -> Dict[str, Any]:
        """Parse JSON response from Nova Pro model"""
        try:
            # Clean the response text
            cleaned_text = generated_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]  # Remove ```json
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]  # Remove ```
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]  # Remove trailing ```
            
            cleaned_text = cleaned_text.strip()
            
            # Find JSON in the response
            json_start = cleaned_text.find('{')
            json_end = cleaned_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = cleaned_text[json_start:json_end]
                recommendation = json.loads(json_str)
                return recommendation
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse JSON from Nova Pro response: {e}")
            logger.error(f"Raw response: {generated_text}")
            
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse JSON response from Nova Pro model: {str(e)}. Raw response: {generated_text[:200]}..."
            )
    

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
            "environment": chicken_info.environment,
            "purpose": chicken_info.purpose,
            "season_used": season
        }
        
        return recommendation
    
    def _create_feed_calculation_prompt(self, feed_recommendation: Dict[str, Any], chicken_info: ChickenInfo) -> str:
        """Create prompt for detailed feed calculation based on existing recommendation"""
        total_daily_feed = feed_recommendation.get("total_daily_feed_kg", 0)
        per_bird_feed = feed_recommendation.get("daily_feed_amount_per_bird_kg", 0)
        
        return f"""You are a poultry nutrition expert. Based on the following nutritional feed recommendation, please provide detailed feeding calculations and practical feeding guidance:

Chicken Details:
- Number of birds: {chicken_info.count}
- Breed: {chicken_info.breed}
- Average weight: {chicken_info.average_weight_kg} kg per bird
- Age: {chicken_info.age_weeks} weeks
- Environment: {chicken_info.environment}
- Purpose: {chicken_info.purpose}

Current Feed Recommendation:
- Total daily feed needed: {total_daily_feed} kg
- Feed per bird per day: {per_bird_feed} kg ({per_bird_feed * 1000} grams)

Please provide a practical feeding calculation in JSON format with the following structure. Return ONLY valid JSON without any markdown formatting or code blocks:
{{
    "feed_calculation": {{
        "total_quantity_per_day_kg": {total_daily_feed},
        "quantity_per_chicken_g": {per_bird_feed * 1000},
        "quantity_per_meal_g": <amount per meal in grams>,
        "meals_per_day": <recommended number of meals>,
        "feeding_schedule": [
            "<time 1 (e.g., 7:00 AM)>",
            "<time 2 (e.g., 4:00 PM)>"
        ],
        "storage_recommendations": [
            "<storage tip 1>",
            "<storage tip 2>",
            "<storage tip 3>"
        ]
    }}
}}

Consider the following guidelines based on environment and purpose:

Environment-specific feeding:
- Free range: May need fewer meals as birds forage, but ensure adequate nutrition
- Barn: Standard 2-3 meals per day, consistent schedule
- Battery cage: More frequent smaller meals, optimized for confined space
- Organic: Must follow organic feeding protocols, natural feeding times

Purpose-specific considerations:
- Eggs: Consistent morning and evening feedings for optimal egg production
- Breeding: Balanced feeding schedule to support reproductive health
- Meat production: Frequent feeding for rapid growth, energy-dense meals

General guidelines:
- Most chickens do well with 2-3 meals per day
- Morning and evening feedings are typically optimal
- Young chickens may need more frequent feeding
- Provide practical storage advice to maintain feed quality
- Consider the breed characteristics, age, environment, and purpose for meal frequency

Focus on practical implementation: How should the farmer divide the daily feed amount across meals? What times work best for this environment and purpose? How should they store the feed?"""

    def generate_feed_calculation(self, chicken_info: ChickenInfo) -> Dict[str, Any]:
        """Generate detailed feed calculations based on existing nutritional recommendation"""
        
        # First get the base nutritional recommendation
        base_recommendation = self.generate_feed_recommendation(chicken_info)
        
        logger.info(f"Generating feed calculations for {chicken_info.count} {chicken_info.breed} chickens")
        
        # Create specific prompt for feed calculations
        prompt = self._create_feed_calculation_prompt(base_recommendation, chicken_info)
        
        # Call Nova Pro for feed calculations
        calculation_result = self._call_nova_pro(prompt)
        
        # Combine results with nutritional context
        response = {
            "feed_calculation": calculation_result.get("feed_calculation", {}),
            "nutritional_context": {
                "feed_composition": base_recommendation.get("feed_composition", {}),
                "seasonal_adjustments": base_recommendation.get("seasonal_adjustments", {}),
                "additional_recommendations": base_recommendation.get("additional_recommendations", [])
            },
            "request_info": base_recommendation.get("request_info", {})
        }
        
        return response
    
    def _create_weekly_recipe_prompt(self, feed_calculation: Dict[str, Any], chicken_info: ChickenInfo) -> str:
        """Create prompt for generating weekly feed recipes based on feed calculation"""
        feed_calc = feed_calculation.get("feed_calculation", {})
        nutritional_context = feed_calculation.get("nutritional_context", {})
        feed_composition = nutritional_context.get("feed_composition", {})
        
        return f"""Create a weekly feed recipe calendar for {chicken_info.count} {chicken_info.breed} chickens in {chicken_info.environment} environment for {chicken_info.purpose}.

Daily feed: {feed_calc.get('total_quantity_per_day_kg', 0)} kg, Per meal: {feed_calc.get('quantity_per_meal_g', 0)} g, Meals: {feed_calc.get('meals_per_day', 2)} times daily
Feeding times: {feed_calc.get('feeding_schedule', [])}

Nutrition: Protein {feed_composition.get('crude_protein_percent', 'N/A')}%, Energy {feed_composition.get('metabolizable_energy_kcal_per_kg', 'N/A')} kcal/kg, Calcium {feed_composition.get('calcium_percent', 'N/A')}%

Return ONLY valid JSON without markdown formatting:

{{
    "weekly_calendar": {{
        "week_start_date": "2024-01-15",
        "total_weekly_kg": {feed_calc.get('total_quantity_per_day_kg', 0) * 7},
        "daily_recipes": [
            {{
                "day": "Monday",
                "feeding_recipes": [
                    {{
                        "feeding_time": "{feed_calc.get('feeding_schedule', ['7:00 AM'])[0] if feed_calc.get('feeding_schedule') else '7:00 AM'}",
                        "recipe": "Corn 40%, Soybean meal 25%, Wheat 15%, Calcium carbonate 8%, Salt 2%, Vitamins 10%",
                        "quantity_kg": {feed_calc.get('quantity_per_meal_g', 0) / 1000},
                        "quantity_grams": {feed_calc.get('quantity_per_meal_g', 0)},
                        "nutritional_focus": "High energy for morning activity",
                        "ingredient_breakdown": [
                            {{"ingredient_name": "Corn", "percentage": 40.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.4}, "nutritional_contribution": "Primary energy source"}},
                            {{"ingredient_name": "Soybean meal", "percentage": 25.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.25}, "nutritional_contribution": "High-quality protein"}},
                            {{"ingredient_name": "Wheat", "percentage": 15.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.15}, "nutritional_contribution": "Additional energy"}},
                            {{"ingredient_name": "Calcium carbonate", "percentage": 8.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.08}, "nutritional_contribution": "Bone health"}},
                            {{"ingredient_name": "Salt", "percentage": 2.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.02}, "nutritional_contribution": "Electrolyte balance"}},
                            {{"ingredient_name": "Vitamins", "percentage": 10.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.10}, "nutritional_contribution": "Essential nutrients"}}
                        ]
                    }},
                    {{
                        "feeding_time": "{feed_calc.get('feeding_schedule', ['4:00 PM'])[1] if len(feed_calc.get('feeding_schedule', [])) > 1 else '4:00 PM'}",
                        "recipe": "Barley 35%, Fish meal 20%, Oats 15%, Corn 15%, Oyster shell 8%, Salt 2%, Vitamins 5%",
                        "quantity_kg": {feed_calc.get('quantity_per_meal_g', 0) / 1000},
                        "quantity_grams": {feed_calc.get('quantity_per_meal_g', 0)},
                        "nutritional_focus": "Calcium-rich for evening egg formation",
                        "ingredient_breakdown": [
                            {{"ingredient_name": "Barley", "percentage": 35.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.35}, "nutritional_contribution": "Energy source"}},
                            {{"ingredient_name": "Fish meal", "percentage": 20.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.20}, "nutritional_contribution": "High protein"}},
                            {{"ingredient_name": "Oats", "percentage": 15.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.15}, "nutritional_contribution": "Fiber and energy"}},
                            {{"ingredient_name": "Corn", "percentage": 15.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.15}, "nutritional_contribution": "Carbohydrates"}},
                            {{"ingredient_name": "Oyster shell", "percentage": 8.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.08}, "nutritional_contribution": "Calcium for eggshells"}},
                            {{"ingredient_name": "Salt", "percentage": 2.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.02}, "nutritional_contribution": "Electrolytes"}},
                            {{"ingredient_name": "Vitamins", "percentage": 5.0, "grams": {feed_calc.get('quantity_per_meal_g', 0) * 0.05}, "nutritional_contribution": "Essential nutrients"}}
                        ]
                    }}
                ],
                "total_daily_kg": {feed_calc.get('total_quantity_per_day_kg', 0)},
                "nutritional_notes": "Balanced nutrition for {chicken_info.purpose}",
                "special_considerations": ["Monitor water intake", "Check egg quality"]
            }}
        ],
        "weekly_nutritional_goals": ["Optimize {chicken_info.purpose}", "Maintain bone health", "Support immune function"],
        "preparation_notes": ["Mix ingredients thoroughly", "Store in dry place", "Use within 30 days"],
        "seasonal_adjustments": ["Adjust for cooler weather", "Increase energy content"]
    }}
}}

Create 7 days (Monday-Sunday) with similar structure. Vary ingredients between days while maintaining nutritional balance. Ensure all calculations are accurate."""

    def generate_weekly_recipes(self, chicken_info: ChickenInfo) -> Dict[str, Any]:
        """Generate weekly feed recipes based on feed calculation"""
        
        # First get the feed calculation
        feed_calculation = self.generate_feed_calculation(chicken_info)
        
        logger.info(f"Generating weekly recipes for {chicken_info.count} {chicken_info.breed} chickens")
        
        # Create specific prompt for weekly recipes
        prompt = self._create_weekly_recipe_prompt(feed_calculation, chicken_info)
        
        # Call Nova Pro for weekly recipes
        recipe_result = self._call_nova_pro(prompt)
        
        # Combine results with feed calculation and nutritional context
        response = {
            "weekly_calendar": recipe_result.get("weekly_calendar", {}),
            "feed_calculation": feed_calculation.get("feed_calculation", {}),
            "nutritional_context": feed_calculation.get("nutritional_context", {}),
            "request_info": feed_calculation.get("request_info", {})
        }
        
        return response
    
    def validate_credentials(self) -> bool:
        """Validate current AWS credentials"""
        return self.auth_service.validate_credentials()
