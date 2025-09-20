# Chicken Feed Nutritional Advisor API

A FastAPI application that uses AWS Bedrock's Nova Pro model to generate nutritional feed recommendations for chickens based on their characteristics and seasonal requirements.

## 📁 Project Structure

```
geekathon2025-MindForge/
├── app/                          # Main application package
│   ├── api/                      # API routes
│   │   ├── __init__.py
│   │   └── routes.py             # FastAPI routes
│   ├── core/                     # Core functionality
│   │   ├── __init__.py
│   │   └── config.py             # Configuration settings
│   ├── models/                   # Pydantic models
│   │   ├── __init__.py
│   │   └── chicken.py            # Data models
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   └── bedrock_service.py    # AWS Bedrock integration
│   └── __init__.py
├── examples/                     # Usage examples
│   ├── __init__.py
│   └── test_api.py               # API testing script
├── tests/                        # Unit tests
│   ├── __init__.py
│   └── test_models.py            # Model tests
├── scripts/                      # Utility scripts
│   └── run_dev.py                # Development server runner
├── docs/                         # Documentation
├── main.py                       # Application entry point
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
└── README.md                     # This file
```

## Features

- **AI-Powered Recommendations**: Uses AWS Bedrock Nova Pro model for intelligent feed composition analysis
- **Seasonal Adjustments**: Automatically adjusts recommendations based on current season or specified season
- **Comprehensive Nutrition**: Provides detailed macro and micronutrient recommendations
- **Breed-Specific**: Takes into account different chicken breeds and their specific needs
- **Age & Weight Considerations**: Adjusts recommendations based on chicken age and average weight
- **Well-Organized Code**: Modular structure with proper separation of concerns
- **Comprehensive Testing**: Unit tests for models and API endpoints
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Prerequisites

1. **AWS Account**: You need an AWS account with access to Bedrock
2. **AWS Bearer Token**: You need an AWS Bearer Token for Bedrock access
3. **Bedrock Access**: Ensure you have access to the Nova Pro model in AWS Bedrock

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geekathon2025-MindForge
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

### AWS Bedrock Setup

1. Go to AWS Bedrock console
2. Navigate to "Model access" in the left sidebar
3. Request access to "Amazon Nova Pro" model
4. Wait for approval (usually takes a few minutes)

### AWS Configuration

Set your AWS bearer token using environment variables:

#### Required Variables
```bash
export AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
export AWS_REGION=us-east-1
```

#### Optional Variables
```bash
export BEDROCK_MODEL_ID=amazon.nova-pro-v1:0  # default
export BEDROCK_CONNECT_TIMEOUT=60             # default
export BEDROCK_READ_TIMEOUT=60                # default
export BEDROCK_MAX_ATTEMPTS=3                 # default
export MODEL_MAX_TOKENS=4000                  # default
export MODEL_TEMPERATURE=0.3                  # default
export MODEL_TOP_P=0.9                        # default
```

#### Using .env File
Create a `.env` file in the project root:
```bash
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

## Usage

### Start the Server

#### Option 1: Using the main script
```bash
python main.py
```

#### Option 2: Using the development runner
```bash
python scripts/run_dev.py
```

#### Option 3: Using uvicorn directly
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 4: Using Docker
```bash
docker-compose up
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

### Example Request

```bash
# First, set your AWS bearer token
export AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
export AWS_REGION=us-east-1

# Start the server
python main.py

# Make a request
curl -X POST "http://localhost:8000/recommend-feed" \
     -H "Content-Type: application/json" \
     -d '{
       "count": 150,
       "breed": "laying hen",
       "average_weight_kg": 2.5,
       "age_weeks": 10
     }'
```

### Example Response

```json
{
  "feed_composition": {
    "crude_protein_percent": 18.5,
    "metabolizable_energy_kcal_per_kg": 2800,
    "crude_fat_percent": 4.0,
    "crude_fiber_percent": 4.5,
    "calcium_percent": 3.8,
    "phosphorus_percent": 0.65,
    "lysine_percent": 0.95,
    "methionine_percent": 0.38,
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
    "energy_adjustment": "Increased energy content for winter to maintain body temperature",
    "protein_adjustment": "Standard protein levels for growing laying hens",
    "water_considerations": "Ensure water doesn't freeze; provide warm water if possible"
  },
  "additional_recommendations": [
    "Provide calcium supplements separately for laying hens",
    "Ensure adequate ventilation while preventing drafts",
    "Monitor feed consumption and adjust portions as needed"
  ],
  "request_info": {
    "processed_at": "2025-09-20T10:30:00.123456",
    "chicken_count": 150,
    "breed": "laying hen",
    "average_weight_kg": 2.5,
    "age_weeks": 10,
    "season_used": "winter"
  }
}
```

## API Endpoints

### POST /recommend-feed
Generate nutritional feed recommendations for chickens.

**Request Body:**
- `count` (int): Number of chickens (required)
- `breed` (str): Breed of chickens (required)
- `average_weight_kg` (float): Average weight in kg (required)
- `age_weeks` (int): Age in weeks (required)
- `season` (str, optional): Season override (spring/summer/autumn/winter)

### GET /seasons
Get the current season based on the date.

### GET /auth/info
Get authentication information for debugging and verification.

### GET /auth/validate
Validate current AWS credentials.

### GET /health
Health check endpoint.

### GET /
Root endpoint with API information.

## Error Handling

The API includes comprehensive error handling for:
- Invalid input parameters
- AWS Bedrock connectivity issues
- Model response parsing errors
- Authentication failures

## Troubleshooting

### Common Issues

1. **"Access denied" errors**: Ensure your AWS credentials have Bedrock permissions
2. **"Model not found" errors**: Make sure you have access to Nova Pro in Bedrock
3. **Region issues**: Nova Pro is available in `us-east-1` region

### AWS Permissions

Your AWS user/role needs these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0"
        }
    ]
}
```

## Development

### Running in Development Mode

```bash
python scripts/run_dev.py
```

### Testing

#### API Testing
You can test the API using:
- Interactive documentation at `/docs`
- Bearer token example: `python examples/bearer_token_example.py`
- The provided test script: `python examples/test_api.py`
- curl/Postman for manual testing

#### Authentication Testing
Test your authentication setup:
```bash
# Check authentication info
curl http://localhost:8000/auth/info

# Validate credentials
curl http://localhost:8000/auth/validate
```

#### Unit Testing
Run the unit tests with pytest:
```bash
pytest tests/
```

#### Test Coverage
Run tests with coverage:
```bash
pytest tests/ --cov=app --cov-report=html
```

## License

This project is licensed under the MIT License.