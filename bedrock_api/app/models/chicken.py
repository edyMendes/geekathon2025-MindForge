"""
Pydantic models for chicken-related data structures
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from app.core.config import settings

class ChickenInfo(BaseModel):
    """Model for chicken information input"""
    count: int = Field(
        ..., 
        ge=settings.MIN_CHICKEN_COUNT, 
        le=settings.MAX_CHICKEN_COUNT,
        description="Number of chickens"
    )
    breed: str = Field(..., min_length=1, description="Breed of chickens (e.g., 'laying hen')")
    average_weight_kg: float = Field(
        ..., 
        ge=settings.MIN_WEIGHT_KG, 
        le=settings.MAX_WEIGHT_KG,
        description="Average weight in kilograms"
    )
    age_weeks: int = Field(
        ..., 
        ge=settings.MIN_AGE_WEEKS, 
        le=settings.MAX_AGE_WEEKS,
        description="Age in weeks"
    )
    environment: str = Field(
        ..., 
        description="Environment where chickens are raised"
    )
    purpose: str = Field(
        ..., 
        description="Purpose of the chicken group"
    )
    season: Optional[str] = Field(
        None, 
        description="Season (will auto-detect if not provided)"
    )
    
    @field_validator('season')
    @classmethod
    def validate_season(cls, v):
        if v is not None:
            valid_seasons = ['spring', 'summer', 'autumn', 'winter']
            if v.lower() not in valid_seasons:
                raise ValueError(f'Season must be one of: {", ".join(valid_seasons)}')
            return v.lower()
        return v
    
    @field_validator('breed')
    @classmethod
    def validate_breed(cls, v):
        return v.strip().lower()
    
    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v):
        valid_environments = ['free range', 'barn', 'battery cage', 'organic']
        if v.lower() not in valid_environments:
            raise ValueError(f'Environment must be one of: {", ".join(valid_environments)}')
        return v.lower()
    
    @field_validator('purpose')
    @classmethod
    def validate_purpose(cls, v):
        valid_purposes = ['eggs', 'breeding', 'meat production']
        if v.lower() not in valid_purposes:
            raise ValueError(f'Purpose must be one of: {", ".join(valid_purposes)}')
        return v.lower()

class VitaminComposition(BaseModel):
    """Model for vitamin composition"""
    vitamin_a_iu_per_kg: float = Field(..., ge=0)
    vitamin_d3_iu_per_kg: float = Field(..., ge=0)
    vitamin_e_iu_per_kg: float = Field(..., ge=0)

class MineralComposition(BaseModel):
    """Model for mineral composition"""
    sodium_percent: float = Field(..., ge=0, le=100)
    chloride_percent: float = Field(..., ge=0, le=100)
    magnesium_percent: float = Field(..., ge=0, le=100)

class FeedComposition(BaseModel):
    """Model for feed composition details"""
    crude_protein_percent: float = Field(..., ge=0, le=100)
    metabolizable_energy_kcal_per_kg: float = Field(..., ge=0)
    crude_fat_percent: float = Field(..., ge=0, le=100)
    crude_fiber_percent: float = Field(..., ge=0, le=100)
    calcium_percent: float = Field(..., ge=0, le=100)
    phosphorus_percent: float = Field(..., ge=0, le=100)
    lysine_percent: float = Field(..., ge=0, le=100)
    methionine_percent: float = Field(..., ge=0, le=100)
    vitamins: VitaminComposition
    minerals: MineralComposition

class SeasonalAdjustments(BaseModel):
    """Model for seasonal adjustments"""
    energy_adjustment: str
    protein_adjustment: str
    water_considerations: str

class RequestInfo(BaseModel):
    """Model for request metadata"""
    processed_at: str
    chicken_count: int
    breed: str
    average_weight_kg: float
    age_weeks: int
    environment: str
    purpose: str
    season_used: str

class NutritionalRecommendation(BaseModel):
    """Model for complete nutritional recommendation response"""
    feed_composition: FeedComposition
    daily_feed_amount_per_bird_kg: float = Field(..., ge=0)
    total_daily_feed_kg: float = Field(..., ge=0)
    seasonal_adjustments: SeasonalAdjustments
    additional_recommendations: List[str]
    request_info: RequestInfo

class FeedCalculation(BaseModel):
    """Model for feed calculation details"""
    total_quantity_per_day_kg: float = Field(..., ge=0, description="Total feed quantity per day in kg")
    quantity_per_chicken_g: float = Field(..., ge=0, description="Feed quantity per chicken in grams")
    quantity_per_meal_g: float = Field(..., ge=0, description="Feed quantity per meal in grams")
    meals_per_day: int = Field(..., ge=1, description="Number of meals per day")
    feeding_schedule: List[str] = Field(..., description="Recommended feeding times")
    storage_recommendations: List[str] = Field(..., description="Feed storage recommendations")
    
class FeedCalculationResponse(BaseModel):
    """Model for complete feed calculation response"""
    feed_calculation: FeedCalculation
    nutritional_context: Dict[str, Any] = Field(..., description="Context from the original feed recommendation")
    request_info: RequestInfo
