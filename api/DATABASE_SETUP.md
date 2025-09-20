# Chicken Feeding Management Database

## Database Overview
The database contains 14 tables designed for comprehensive chicken feeding management with user authentication and settings:

### User Management Tables
- **users** - User accounts with authentication (username, email, password)
- **user_settings** - User preferences (language, timezone, currency, notifications)

### Core Tables
- **growth_stages** - Define feeding phases (chick, grower, layer, etc.)
- **chicken_groups** - Manage flocks by batch with quantities and weights (now user-specific)
- **food_types** - Catalog of feed ingredients and costs
- **nutrition_facts** - Nutritional profiles for all ingredients

### Configuration Tables
- **stage_nutrition_requirements** - Required nutrients per growth stage
- **feed_formulations** - Complete feed recipes for each stage
- **formulation_ingredients** - Ingredients and percentages in each recipe
- **group_feeding_schedule_templates** - Daily feeding schedules by stage

### Tracking Tables
- **group_feeding_records** - Historical feeding data with costs
- **group_growth_tracking** - Weight progression and health metrics
- **group_inventory_consumption** - Feed usage tracking
- **group_performance_metrics** - FCR, costs, and efficiency data

## Database File
- **File**: `chicken_feeding.db`
- **Type**: SQLite
- **Location**: `/root/geekathon2025-MindForge/backend/api/`

## Key Functions Available

### 1. Calculate Daily Feed Requirements
```python
calculate_group_daily_feed_kg(quantity, avg_weight, feed_percentage)
```

### 2. Generate Daily Feeding Schedule
```python
generate_group_daily_schedule(group_id, date)
```

### 3. Get Optimal Formulation
```python
get_group_optimal_formulation(group_id)
```

### 4. Update Mortality
```python
update_group_mortality(group_id, new_deaths, date)
```

### 5. Calculate Performance Metrics
```python
calculate_group_performance(group_id, calc_date)
```

## API Endpoints

### User Management
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/{user_id}` - Get user by ID
- `GET /users/` - List all users
- `GET /users/{user_id}/settings` - Get user settings
- `PUT /users/{user_id}/settings` - Update user settings

### Growth Stages
- `POST /growth-stages/` - Create growth stage
- `GET /growth-stages/` - List all growth stages

### Chicken Groups
- `POST /chicken-groups/` - Create chicken group (requires user_id)
- `GET /chicken-groups/` - List chicken groups (optionally filter by user_id)
- `GET /users/{user_id}/chicken-groups/` - List user's chicken groups

### Food Types
- `POST /food-types/` - Create food type
- `GET /food-types/` - List all food types

### Key Functions
- `GET /groups/{group_id}/daily-schedule/{schedule_date}` - Get daily schedule
- `GET /groups/{group_id}/optimal-formulation` - Get optimal formulation
- `POST /groups/{group_id}/update-mortality` - Update mortality
- `POST /groups/{group_id}/calculate-performance` - Calculate performance

### Tracking
- `POST /feeding-records/` - Create feeding record
- `GET /feeding-records/` - List feeding records
- `POST /growth-tracking/` - Create growth tracking
- `GET /growth-tracking/` - List growth tracking
- `GET /performance-metrics/` - List performance metrics

## Starting the API Server
```bash
cd /root/geekathon2025-MindForge/backend/api
python3 main.py
```

The server will start on `http://localhost:8001`

## Database Verification
The database has been verified and contains all 14 required tables with proper relationships and constraints, including user authentication and settings management.

## User Authentication
- Users can register with username, email, and password
- Passwords are securely hashed using bcrypt
- Each user gets default settings upon registration
- Chicken groups are now user-specific and isolated per user
- User settings include language, timezone, currency, and notification preferences
