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

class IngredientBreakdown(BaseModel):
    """Model for detailed ingredient breakdown"""
    ingredient_name: str = Field(..., description="Name of the ingredient")
    percentage: float = Field(..., ge=0, le=100, description="Percentage of total feed")
    grams: float = Field(..., ge=0, description="Amount in grams for this feeding")
    nutritional_contribution: str = Field(..., description="What this ingredient contributes nutritionally")

class FeedingRecipe(BaseModel):
    """Model for a single feeding recipe"""
    feeding_time: str = Field(..., description="Time of feeding (e.g., '7:00 AM', '4:00 PM')")
    recipe: str = Field(..., description="Detailed feed recipe with ingredients and proportions")
    quantity_kg: float = Field(..., ge=0, description="Feed quantity for this feeding in kg")
    quantity_grams: float = Field(..., ge=0, description="Feed quantity for this feeding in grams")
    nutritional_focus: str = Field(..., description="Nutritional focus for this feeding")
    ingredient_breakdown: List[IngredientBreakdown] = Field(..., description="Detailed breakdown of each ingredient with grams and percentages")

class DailyRecipe(BaseModel):
    """Model for daily feed recipe"""
    day: str = Field(..., description="Day of the week (Monday, Tuesday, etc.)")
    feeding_recipes: List[FeedingRecipe] = Field(..., description="Recipes for each feeding time")
    total_daily_kg: float = Field(..., ge=0, description="Total feed for the day in kg")
    nutritional_notes: str = Field(..., description="Nutritional notes for the day")
    special_considerations: List[str] = Field(..., description="Special feeding considerations")

class WeeklyFeedCalendar(BaseModel):
    """Model for weekly feed calendar"""
    week_start_date: str = Field(..., description="Start date of the week (YYYY-MM-DD)")
    total_weekly_kg: float = Field(..., ge=0, description="Total feed for the week in kg")
    daily_recipes: List[DailyRecipe] = Field(..., description="Daily recipes for the week")
    weekly_nutritional_goals: List[str] = Field(..., description="Weekly nutritional goals")
    preparation_notes: List[str] = Field(..., description="Feed preparation and storage notes")
    seasonal_adjustments: List[str] = Field(..., description="Seasonal adjustments for the week")

class WeeklyRecipeResponse(BaseModel):
    """Model for complete weekly recipe response"""
    weekly_calendar: WeeklyFeedCalendar
    feed_calculation: FeedCalculation
    nutritional_context: Dict[str, Any] = Field(..., description="Context from the original feed recommendation")
    request_info: RequestInfo

class ChickenDiseaseInfo(BaseModel):
    """Model for chicken disease information input"""
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
    disease: str = Field(
        ..., 
        description="Disease affecting the chickens"
    )
    
    @field_validator('breed')
    @classmethod
    def validate_breed(cls, v):
        return v.strip().lower()
    
    @field_validator('disease')
    @classmethod
    def validate_disease(cls, v):
        valid_diseases = ['respiratory_infection', 'coccidiosis', 'mites_lice', 'egg_binding', 'marek_disease', 'newcastle_disease']
        if v.lower() not in valid_diseases:
            raise ValueError(f'Disease must be one of: {", ".join(valid_diseases)}')
        return v.lower()

class ImmuneSupportNutrients(BaseModel):
    """Model for immune support nutrients"""
    vitamin_c_mg_per_kg: float = Field(..., ge=0, description="Vitamin C in mg per kg")
    zinc_mg_per_kg: float = Field(..., ge=0, description="Zinc in mg per kg")
    selenium_mg_per_kg: float = Field(..., ge=0, description="Selenium in mg per kg")
    probiotics_cfu_per_kg: float = Field(..., ge=0, description="Probiotics in CFU per kg")
    omega_3_fatty_acids_percent: float = Field(..., ge=0, le=100, description="Omega-3 fatty acids percentage")

class DiseaseTreatment(BaseModel):
    """Model for disease treatment information"""
    treatment_approach: str = Field(..., description="Overall treatment strategy")
    feed_modifications: List[str] = Field(..., description="Feed modifications needed")
    supplements: List[str] = Field(..., description="Supplements to add")
    environmental_changes: List[str] = Field(..., description="Environmental changes required")
    monitoring_points: List[str] = Field(..., description="Key monitoring points")
    recovery_timeline: str = Field(..., description="Expected recovery period")

class DiseaseRecoveryFeedComposition(BaseModel):
    """Model for disease recovery feed composition"""
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
    immune_support_nutrients: ImmuneSupportNutrients

class DiseaseRecoveryRecommendation(BaseModel):
    """Model for complete disease recovery recommendation response"""
    recovery_feed_composition: DiseaseRecoveryFeedComposition
    daily_feed_amount_per_bird_kg: float = Field(..., ge=0)
    total_daily_feed_kg: float = Field(..., ge=0)
    disease_treatment: DiseaseTreatment
    feeding_schedule: List[str] = Field(..., description="Recommended feeding schedule")
    special_considerations: List[str] = Field(..., description="Special considerations for recovery")
    request_info: RequestInfo
