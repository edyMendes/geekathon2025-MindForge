# Chicken Feeding Management System API

A comprehensive FastAPI application for managing chicken feeding operations with user authentication, growth tracking, and performance analytics.

## Features

### User Management
- **User Registration & Authentication**: Secure user accounts with password hashing
- **User Settings**: Customizable preferences (language, timezone, currency, notifications)
- **Data Isolation**: Each user manages their own chicken groups independently

### Chicken Management
- **Growth Stages**: Define feeding phases (chick, grower, layer, etc.)
- **Chicken Groups**: Manage flocks by batch with quantities and weights
- **Breed Tracking**: Monitor different chicken breeds and their performance

### Feed Management
- **Food Types**: Catalog of feed ingredients with nutritional profiles
- **Feed Formulations**: Complete feed recipes for each growth stage
- **Cost Tracking**: Monitor feed costs and calculate cost per kg weight gain

### Analytics & Tracking
- **Growth Tracking**: Monitor weight progression and health metrics
- **Performance Metrics**: Calculate FCR, mortality rates, and efficiency
- **Feeding Records**: Historical feeding data with cost analysis
- **Inventory Consumption**: Track feed usage and consumption patterns

## Installation

1. Navigate to the API directory:
   ```bash
   cd /root/geekathon2025-MindForge/api
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

```bash
python main.py
```

The API will be available at `http://localhost:8001`

## API Documentation

Once the server is running, visit:
- Interactive API docs: `http://localhost:8001/docs`
- Alternative docs: `http://localhost:8001/redoc`

## Database Schema

The system uses SQLite with 14 tables:
- **User Management**: `users`, `user_settings`
- **Core Tables**: `growth_stages`, `chicken_groups`, `food_types`, `nutrition_facts`
- **Configuration**: `stage_nutrition_requirements`, `feed_formulations`, `formulation_ingredients`, `group_feeding_schedule_templates`
- **Tracking**: `group_feeding_records`, `group_growth_tracking`, `group_inventory_consumption`, `group_performance_metrics`

## API Endpoints

### User Management
- `POST /users/register` - Register new user
- `POST /users/login` - User authentication
- `GET /users/{user_id}` - Get user details
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
- `GET /groups/{group_id}/daily-schedule/{schedule_date}` - Get daily feeding schedule
- `GET /groups/{group_id}/optimal-formulation` - Get optimal feed formulation
- `POST /groups/{group_id}/update-mortality` - Update mortality count
- `POST /groups/{group_id}/calculate-performance` - Calculate performance metrics

### Tracking
- `POST /feeding-records/` - Create feeding record
- `GET /feeding-records/` - List feeding records
- `POST /growth-tracking/` - Create growth tracking
- `GET /growth-tracking/` - List growth tracking
- `GET /performance-metrics/` - List performance metrics

## Example Usage

### Register a new user:
```json
POST /users/register
{
  "username": "farmer_john",
  "email": "john@farm.com",
  "password": "securepassword123",
  "full_name": "John Farmer"
}
```

### Create a chicken group:
```json
POST /chicken-groups/
{
  "user_id": 1,
  "batch_number": "BATCH-001",
  "breed": "Rhode Island Red",
  "quantity": 100,
  "avg_weight_kg": 0.5,
  "start_date": "2024-01-15",
  "current_stage_id": 1
}
```

### Get daily feeding schedule:
```json
GET /groups/1/daily-schedule/2024-01-20
```

### Update mortality:
```json
POST /groups/1/update-mortality
{
  "new_deaths": 2,
  "death_date": "2024-01-20"
}
```

## Key Features

### Security
- Password hashing using bcrypt
- User authentication system
- Data isolation between users
- Input validation and error handling

### Performance Analytics
- Feed Conversion Ratio (FCR) calculation
- Cost per kg weight gain analysis
- Mortality rate tracking
- Average daily gain monitoring

### Flexible Configuration
- Customizable growth stages
- Multiple feed formulations per stage
- Nutritional requirements per stage
- Feeding schedule templates

## Dependencies

- FastAPI 0.116.1
- SQLAlchemy 2.0.43
- Uvicorn 0.35.0
- Passlib[bcrypt] 1.7.4
- Email-validator 2.1.0

## Database File

- **File**: `chicken_feeding.db`
- **Type**: SQLite
- **Location**: `/root/geekathon2025-MindForge/api/`

## Getting Started

1. Start the API server
2. Register a new user account
3. Create growth stages for your chicken breeds
4. Add food types and their nutritional profiles
5. Create chicken groups and start tracking their growth
6. Monitor performance metrics and optimize feeding strategies

For detailed database schema information, see `DATABASE_SETUP.md`.