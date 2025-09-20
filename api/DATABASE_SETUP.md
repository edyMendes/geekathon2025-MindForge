# Chicken Feeding Management Database

## Database Overview
The database contains 12 tables designed for comprehensive chicken feeding management:

### Core Tables
- **growth_stages** - Define feeding phases (chick, grower, layer, etc.)
- **chicken_groups** - Manage flocks by batch with quantities and weights
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
- **Location**: `/root/Eco-Bite/backend/api/`

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

### Growth Stages
- `POST /growth-stages/` - Create growth stage
- `GET /growth-stages/` - List all growth stages

### Chicken Groups
- `POST /chicken-groups/` - Create chicken group
- `GET /chicken-groups/` - List all chicken groups

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
cd /root/Eco-Bite/backend/api
python3 main.py
```

The server will start on `http://localhost:8001`

## Database Verification
The database has been verified and contains all 12 required tables with proper relationships and constraints.
