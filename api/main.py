from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, Table, DateTime, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
import uvicorn
from passlib.context import CryptContext

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./chicken_feeding.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Association table for many-to-many relationship between feed formulations and ingredients
formulation_ingredients = Table(
    'formulation_ingredients',
    Base.metadata,
    Column('formulation_id', Integer, ForeignKey('feed_formulations.id'), primary_key=True),
    Column('food_type_id', Integer, ForeignKey('food_types.id'), primary_key=True),
    Column('percentage', Float, nullable=False),
    Column('created_at', DateTime, default=datetime.utcnow)
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chicken_groups = relationship("ChickenGroup", back_populates="user")
    user_settings = relationship("UserSettings", back_populates="user", uselist=False)

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")
    currency = Column(String(3), default="USD")
    measurement_unit = Column(String(10), default="metric")  # metric or imperial
    notifications_enabled = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="user_settings")

class GrowthStage(Base):
    __tablename__ = "growth_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)  # e.g., "Chick", "Grower", "Layer"
    description = Column(Text, nullable=True)
    min_age_days = Column(Integer, nullable=False)
    max_age_days = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    nutrition_requirements = relationship("StageNutritionRequirement", back_populates="growth_stage")
    feed_formulations = relationship("FeedFormulation", back_populates="growth_stage")
    feeding_schedules = relationship("GroupFeedingScheduleTemplate", back_populates="growth_stage")
    groups = relationship("ChickenGroup", back_populates="current_stage")

class ChickenGroup(Base):
    __tablename__ = "chicken_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    batch_number = Column(String(50), index=True, nullable=False)  # Removed unique constraint to allow same batch number for different users
    breed = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    current_quantity = Column(Integer, nullable=False)  # Updated when mortality occurs
    avg_weight_kg = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    current_stage_id = Column(Integer, ForeignKey('growth_stages.id'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chicken_groups")
    current_stage = relationship("GrowthStage", back_populates="groups")
    feeding_records = relationship("GroupFeedingRecord", back_populates="chicken_group")
    growth_tracking = relationship("GroupGrowthTracking", back_populates="chicken_group")
    inventory_consumption = relationship("GroupInventoryConsumption", back_populates="chicken_group")
    performance_metrics = relationship("GroupPerformanceMetrics", back_populates="chicken_group")

class FoodType(Base):
    __tablename__ = "food_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)  # e.g., "grain", "protein", "vitamin", "mineral"
    cost_per_kg = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    supplier = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    nutrition_facts = relationship("NutritionFacts", back_populates="food_type")
    formulation_ingredients = relationship("FeedFormulation", secondary=formulation_ingredients, back_populates="ingredients")

class NutritionFacts(Base):
    __tablename__ = "nutrition_facts"
    
    id = Column(Integer, primary_key=True, index=True)
    food_type_id = Column(Integer, ForeignKey('food_types.id'), nullable=False)
    protein_percent = Column(Float, nullable=False)
    fat_percent = Column(Float, nullable=False)
    fiber_percent = Column(Float, nullable=False)
    ash_percent = Column(Float, nullable=False)
    moisture_percent = Column(Float, nullable=False)
    calcium_percent = Column(Float, nullable=False)
    phosphorus_percent = Column(Float, nullable=False)
    energy_kcal_per_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    food_type = relationship("FoodType", back_populates="nutrition_facts")

class StageNutritionRequirement(Base):
    __tablename__ = "stage_nutrition_requirements"
    
    id = Column(Integer, primary_key=True, index=True)
    growth_stage_id = Column(Integer, ForeignKey('growth_stages.id'), nullable=False)
    protein_percent = Column(Float, nullable=False)
    fat_percent = Column(Float, nullable=False)
    fiber_percent = Column(Float, nullable=False)
    calcium_percent = Column(Float, nullable=False)
    phosphorus_percent = Column(Float, nullable=False)
    energy_kcal_per_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    growth_stage = relationship("GrowthStage", back_populates="nutrition_requirements")

class FeedFormulation(Base):
    __tablename__ = "feed_formulations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    growth_stage_id = Column(Integer, ForeignKey('growth_stages.id'), nullable=False)
    description = Column(Text, nullable=True)
    total_cost_per_kg = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    growth_stage = relationship("GrowthStage", back_populates="feed_formulations")
    ingredients = relationship("FoodType", secondary=formulation_ingredients, back_populates="formulation_ingredients")
    feeding_schedules = relationship("GroupFeedingScheduleTemplate", back_populates="formulation")

class GroupFeedingScheduleTemplate(Base):
    __tablename__ = "group_feeding_schedule_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    growth_stage_id = Column(Integer, ForeignKey('growth_stages.id'), nullable=False)
    formulation_id = Column(Integer, ForeignKey('feed_formulations.id'), nullable=False)
    feed_percentage = Column(Float, nullable=False)  # Percentage of body weight
    feeding_frequency = Column(Integer, nullable=False)  # Times per day
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    growth_stage = relationship("GrowthStage", back_populates="feeding_schedules")
    formulation = relationship("FeedFormulation", back_populates="feeding_schedules")

class GroupFeedingRecord(Base):
    __tablename__ = "group_feeding_records"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('chicken_groups.id'), nullable=False)
    feeding_date = Column(Date, nullable=False)
    feed_quantity_kg = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chicken_group = relationship("ChickenGroup", back_populates="feeding_records")

class GroupGrowthTracking(Base):
    __tablename__ = "group_growth_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('chicken_groups.id'), nullable=False)
    tracking_date = Column(Date, nullable=False)
    avg_weight_kg = Column(Float, nullable=False)
    mortality_count = Column(Integer, default=0)
    health_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chicken_group = relationship("ChickenGroup", back_populates="growth_tracking")

class GroupInventoryConsumption(Base):
    __tablename__ = "group_inventory_consumption"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('chicken_groups.id'), nullable=False)
    food_type_id = Column(Integer, ForeignKey('food_types.id'), nullable=False)
    consumption_date = Column(Date, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chicken_group = relationship("ChickenGroup", back_populates="inventory_consumption")

class GroupPerformanceMetrics(Base):
    __tablename__ = "group_performance_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey('chicken_groups.id'), nullable=False)
    calculation_date = Column(Date, nullable=False)
    feed_conversion_ratio = Column(Float, nullable=False)  # FCR
    total_feed_cost = Column(Float, nullable=False)
    cost_per_kg_weight_gain = Column(Float, nullable=False)
    mortality_rate = Column(Float, nullable=False)
    avg_daily_gain = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chicken_group = relationship("ChickenGroup", back_populates="performance_metrics")

# Pydantic Models
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UsernameCheck(BaseModel):
    identifier: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserSettingsBase(BaseModel):
    language: str = "en"
    timezone: str = "UTC"
    currency: str = "USD"
    measurement_unit: str = "metric"
    notifications_enabled: bool = True
    email_notifications: bool = True

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsUpdate(BaseModel):
    language: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    measurement_unit: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_notifications: Optional[bool] = None

class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class GrowthStageBase(BaseModel):
    name: str
    description: Optional[str] = None
    min_age_days: int
    max_age_days: int

class GrowthStageCreate(GrowthStageBase):
    pass

class GrowthStageResponse(GrowthStageBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChickenGroupBase(BaseModel):
    user_id: int
    batch_number: str
    breed: str
    quantity: int
    avg_weight_kg: float
    start_date: date
    current_stage_id: int

class ChickenGroupCreate(ChickenGroupBase):
    pass

class ChickenGroupResponse(ChickenGroupBase):
    id: int
    current_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FoodTypeBase(BaseModel):
    name: str
    category: str
    cost_per_kg: float
    unit: str = "kg"
    supplier: Optional[str] = None

class FoodTypeCreate(FoodTypeBase):
    pass

class FoodTypeResponse(FoodTypeBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NutritionFactsBase(BaseModel):
    food_type_id: int
    protein_percent: float
    fat_percent: float
    fiber_percent: float
    ash_percent: float
    moisture_percent: float
    calcium_percent: float
    phosphorus_percent: float
    energy_kcal_per_kg: float

class NutritionFactsCreate(NutritionFactsBase):
    pass

class NutritionFactsResponse(NutritionFactsBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class StageNutritionRequirementBase(BaseModel):
    growth_stage_id: int
    protein_percent: float
    fat_percent: float
    fiber_percent: float
    calcium_percent: float
    phosphorus_percent: float
    energy_kcal_per_kg: float

class StageNutritionRequirementCreate(StageNutritionRequirementBase):
    pass

class StageNutritionRequirementResponse(StageNutritionRequirementBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedFormulationBase(BaseModel):
    name: str
    growth_stage_id: int
    description: Optional[str] = None

class FeedFormulationCreate(FeedFormulationBase):
    pass

class FeedFormulationResponse(FeedFormulationBase):
    id: int
    total_cost_per_kg: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupFeedingRecordBase(BaseModel):
    group_id: int
    feeding_date: date
    feed_quantity_kg: float
    total_cost: float
    notes: Optional[str] = None

class GroupFeedingRecordCreate(GroupFeedingRecordBase):
    pass

class GroupFeedingRecordResponse(GroupFeedingRecordBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupGrowthTrackingBase(BaseModel):
    group_id: int
    tracking_date: date
    avg_weight_kg: float
    mortality_count: int = 0
    health_notes: Optional[str] = None

class GroupGrowthTrackingCreate(GroupGrowthTrackingBase):
    pass

class GroupGrowthTrackingResponse(GroupGrowthTrackingBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupPerformanceMetricsBase(BaseModel):
    group_id: int
    calculation_date: date
    feed_conversion_ratio: float
    total_feed_cost: float
    cost_per_kg_weight_gain: float
    mortality_rate: float
    avg_daily_gain: float

class GroupPerformanceMetricsCreate(GroupPerformanceMetricsBase):
    pass

class GroupPerformanceMetricsResponse(GroupPerformanceMetricsBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="Chicken Feeding Management System", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user_settings(db: Session, user_id: int):
    """Create default user settings for a new user"""
    user_settings = UserSettings(user_id=user_id)
    db.add(user_settings)
    db.commit()
    db.refresh(user_settings)
    return user_settings

# Key Functions Implementation
def calculate_group_daily_feed_kg(quantity: int, avg_weight: float, feed_percentage: float) -> float:
    """Calculate daily feed requirements for a group"""
    return quantity * avg_weight * (feed_percentage / 100)

def generate_group_daily_schedule(group_id: int, schedule_date: date, db: Session):
    """Generate complete daily feeding schedule for a group"""
    group = db.query(ChickenGroup).filter(ChickenGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get feeding schedule template for current stage
    schedule_template = db.query(GroupFeedingScheduleTemplate).filter(
        GroupFeedingScheduleTemplate.growth_stage_id == group.current_stage_id,
        GroupFeedingScheduleTemplate.is_active == True
    ).first()
    
    if not schedule_template:
        raise HTTPException(status_code=404, detail="No feeding schedule found for current stage")
    
    # Calculate daily feed requirement
    daily_feed_kg = calculate_group_daily_feed_kg(
        group.current_quantity, 
        group.avg_weight_kg, 
        schedule_template.feed_percentage
    )
    
    return {
        "group_id": group_id,
        "date": schedule_date,
        "daily_feed_kg": daily_feed_kg,
        "feeding_frequency": schedule_template.feeding_frequency,
        "feed_per_meal_kg": daily_feed_kg / schedule_template.feeding_frequency,
        "formulation_id": schedule_template.formulation_id
    }

def get_group_optimal_formulation(group_id: int, db: Session):
    """Get optimal formulation for current stage of a group"""
    group = db.query(ChickenGroup).filter(ChickenGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    formulation = db.query(FeedFormulation).filter(
        FeedFormulation.growth_stage_id == group.current_stage_id,
        FeedFormulation.is_active == True
    ).first()
    
    if not formulation:
        raise HTTPException(status_code=404, detail="No formulation found for current stage")
    
    return formulation

def update_group_mortality(group_id: int, new_deaths: int, death_date: date, db: Session):
    """Update mortality and adjust quantities"""
    group = db.query(ChickenGroup).filter(ChickenGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Update current quantity
    group.current_quantity = max(0, group.current_quantity - new_deaths)
    group.updated_at = datetime.utcnow()
    
    # Create growth tracking record
    growth_record = GroupGrowthTracking(
        group_id=group_id,
        tracking_date=death_date,
        avg_weight_kg=group.avg_weight_kg,
        mortality_count=new_deaths,
        health_notes=f"Mortality update: {new_deaths} deaths"
    )
    db.add(growth_record)
    db.commit()
    
    return {"message": f"Updated mortality: {new_deaths} deaths recorded", "current_quantity": group.current_quantity}

def calculate_group_performance(group_id: int, calc_date: date, db: Session):
    """Calculate performance metrics for a group"""
    group = db.query(ChickenGroup).filter(ChickenGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get feeding records for the period
    feeding_records = db.query(GroupFeedingRecord).filter(
        GroupFeedingRecord.group_id == group_id,
        GroupFeedingRecord.feeding_date <= calc_date
    ).all()
    
    # Get growth tracking records
    growth_records = db.query(GroupGrowthTracking).filter(
        GroupGrowthTracking.group_id == group_id,
        GroupGrowthTracking.tracking_date <= calc_date
    ).order_by(GroupGrowthTracking.tracking_date).all()
    
    if not growth_records:
        raise HTTPException(status_code=404, detail="No growth data available")
    
    # Calculate metrics
    total_feed_kg = sum(record.feed_quantity_kg for record in feeding_records)
    total_feed_cost = sum(record.total_cost for record in feeding_records)
    
    initial_weight = growth_records[0].avg_weight_kg
    final_weight = growth_records[-1].avg_weight_kg
    weight_gain = final_weight - initial_weight
    
    total_mortality = sum(record.mortality_count for record in growth_records)
    mortality_rate = (total_mortality / group.quantity) * 100 if group.quantity > 0 else 0
    
    # Calculate FCR (Feed Conversion Ratio)
    fcr = total_feed_kg / (weight_gain * group.current_quantity) if weight_gain > 0 and group.current_quantity > 0 else 0
    
    # Calculate cost per kg weight gain
    cost_per_kg_gain = total_feed_cost / (weight_gain * group.current_quantity) if weight_gain > 0 and group.current_quantity > 0 else 0
    
    # Calculate average daily gain
    days = (calc_date - group.start_date).days
    avg_daily_gain = weight_gain / days if days > 0 else 0
    
    # Create performance metrics record
    performance_metrics = GroupPerformanceMetrics(
        group_id=group_id,
        calculation_date=calc_date,
        feed_conversion_ratio=fcr,
        total_feed_cost=total_feed_cost,
        cost_per_kg_weight_gain=cost_per_kg_gain,
        mortality_rate=mortality_rate,
        avg_daily_gain=avg_daily_gain
    )
    db.add(performance_metrics)
    db.commit()
    
    return performance_metrics

# API Endpoints

# User Management
@app.post("/users/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default user settings
    create_user_settings(db, db_user.id)
    
    return db_user

@app.post("/users/login")
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return {"message": "Login successful", "user_id": user.id, "username": user.username}

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/check-username")
def check_username(request: UsernameCheck, db: Session = Depends(get_db)):
    """Check if username is available for registration"""
    user = db.query(User).filter(User.username == request.identifier).first()
    if user:
        return {"available": False, "message": "Username already taken"}
    return {"available": True, "message": "Username is available"}


@app.get("/users/", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# User Settings
@app.get("/users/{user_id}/settings", response_model=UserSettingsResponse)
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not user_settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    return user_settings

@app.put("/users/{user_id}/settings", response_model=UserSettingsResponse)
def update_user_settings(user_id: int, settings_update: UserSettingsUpdate, db: Session = Depends(get_db)):
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not user_settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    
    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_settings, field, value)
    
    user_settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user_settings)
    return user_settings

# Growth Stages
@app.post("/growth-stages/", response_model=GrowthStageResponse)
def create_growth_stage(stage: GrowthStageCreate, db: Session = Depends(get_db)):
    db_stage = GrowthStage(**stage.dict())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage

@app.get("/growth-stages/", response_model=List[GrowthStageResponse])
def read_growth_stages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stages = db.query(GrowthStage).offset(skip).limit(limit).all()
    return stages

# Chicken Groups
@app.post("/chicken-groups/", response_model=ChickenGroupResponse)
def create_chicken_group(group: ChickenGroupCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = get_user(db, group.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_group = ChickenGroup(**group.dict())
    db_group.current_quantity = group.quantity  # Initialize current quantity
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.get("/chicken-groups/", response_model=List[ChickenGroupResponse])
def read_chicken_groups(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(ChickenGroup)
    if user_id:
        query = query.filter(ChickenGroup.user_id == user_id)
    groups = query.offset(skip).limit(limit).all()
    return groups

@app.get("/users/{user_id}/chicken-groups/", response_model=List[ChickenGroupResponse])
def read_user_chicken_groups(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Verify user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    groups = db.query(ChickenGroup).filter(ChickenGroup.user_id == user_id).offset(skip).limit(limit).all()
    return groups

# Food Types
@app.post("/food-types/", response_model=FoodTypeResponse)
def create_food_type(food_type: FoodTypeCreate, db: Session = Depends(get_db)):
    db_food_type = FoodType(**food_type.dict())
    db.add(db_food_type)
    db.commit()
    db.refresh(db_food_type)
    return db_food_type

@app.get("/food-types/", response_model=List[FoodTypeResponse])
def read_food_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    food_types = db.query(FoodType).offset(skip).limit(limit).all()
    return food_types

# Key Function Endpoints
@app.get("/groups/{group_id}/daily-schedule/{schedule_date}")
def get_group_daily_schedule(group_id: int, schedule_date: date, db: Session = Depends(get_db)):
    return generate_group_daily_schedule(group_id, schedule_date, db)

@app.get("/groups/{group_id}/optimal-formulation")
def get_group_optimal_formulation_endpoint(group_id: int, db: Session = Depends(get_db)):
    return get_group_optimal_formulation(group_id, db)

@app.post("/groups/{group_id}/update-mortality")
def update_group_mortality_endpoint(group_id: int, new_deaths: int, death_date: date, db: Session = Depends(get_db)):
    return update_group_mortality(group_id, new_deaths, death_date, db)

@app.post("/groups/{group_id}/calculate-performance")
def calculate_group_performance_endpoint(group_id: int, calc_date: date, db: Session = Depends(get_db)):
    return calculate_group_performance(group_id, calc_date, db)

# Feeding Records
@app.post("/feeding-records/", response_model=GroupFeedingRecordResponse)
def create_feeding_record(record: GroupFeedingRecordCreate, db: Session = Depends(get_db)):
    db_record = GroupFeedingRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@app.get("/feeding-records/", response_model=List[GroupFeedingRecordResponse])
def read_feeding_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(GroupFeedingRecord).offset(skip).limit(limit).all()
    return records

# Growth Tracking
@app.post("/growth-tracking/", response_model=GroupGrowthTrackingResponse)
def create_growth_tracking(tracking: GroupGrowthTrackingCreate, db: Session = Depends(get_db)):
    db_tracking = GroupGrowthTracking(**tracking.dict())
    db.add(db_tracking)
    db.commit()
    db.refresh(db_tracking)
    return db_tracking

@app.get("/growth-tracking/", response_model=List[GroupGrowthTrackingResponse])
def read_growth_tracking(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tracking = db.query(GroupGrowthTracking).offset(skip).limit(limit).all()
    return tracking

# Performance Metrics
@app.get("/performance-metrics/", response_model=List[GroupPerformanceMetricsResponse])
def read_performance_metrics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    metrics = db.query(GroupPerformanceMetrics).offset(skip).limit(limit).all()
    return metrics

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)