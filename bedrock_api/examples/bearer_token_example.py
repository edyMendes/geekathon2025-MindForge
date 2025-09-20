#!/usr/bin/env python3
"""
Simple example showing how to use the API with AWS Bearer Token for Bedrock
"""
import os
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def setup_environment_variables():
    """Show how to set up the required environment variables"""
    print("🔑 Configuration Options")
    print("=" * 40)
    print("Method 1: Using .env file (Recommended)")
    print("1. cp env.example .env")
    print("2. Edit .env file with your bearer token")
    print("3. python main.py")
    print()
    print("Method 2: Using environment variables")
    print("export AWS_BEARER_TOKEN_BEDROCK='your_bearer_token_here'")
    print("export AWS_REGION='us-east-1'")
    print("export BEDROCK_MODEL_ID='amazon.nova-pro-v1:0'")
    print()
    print("Optional configuration:")
    print("export BEDROCK_CONNECT_TIMEOUT='60'      # default")
    print("export BEDROCK_READ_TIMEOUT='60'         # default") 
    print("export BEDROCK_MAX_ATTEMPTS='3'          # default")
    print("export MODEL_MAX_TOKENS='4000'           # default")
    print("export MODEL_TEMPERATURE='0.3'           # default")
    print("export MODEL_TOP_P='0.9'                 # default")
    print()

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking Environment Variables")
    print("-" * 30)
    
    required_vars = ['AWS_BEARER_TOKEN_BEDROCK', 'AWS_REGION']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'TOKEN' in var:
                print(f"✅ {var}: {value[:20]}...")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
            missing_vars.append(var)
    
    # Optional variables
    optional_vars = {
        'BEDROCK_MODEL_ID': 'amazon.nova-pro-v1:0',
        'BEDROCK_CONNECT_TIMEOUT': '60',
        'BEDROCK_READ_TIMEOUT': '60',
        'BEDROCK_MAX_ATTEMPTS': '3',
        'MODEL_MAX_TOKENS': '4000',
        'MODEL_TEMPERATURE': '0.3',
        'MODEL_TOP_P': '0.9'
    }
    
    print("\nOptional variables:")
    for var, default in optional_vars.items():
        value = os.getenv(var, default)
        print(f"📝 {var}: {value}")
    
    if missing_vars:
        print(f"\n❌ Missing required variables: {', '.join(missing_vars)}")
        return False
    else:
        print("\n✅ All required variables are set!")
        return True

def test_api_bearer_token():
    """Test the API with bearer token setup"""
    print("\n🐔 Testing Chicken Feed API with Bearer Token")
    print("=" * 50)
    
    # Check if environment is set up
    if not check_environment():
        print("\n💡 Please set the required environment variables and try again.")
        return
    
    try:
        # Test authentication info
        print("\n1. Testing authentication...")
        response = requests.get(f"{BASE_URL}/auth/info")
        if response.status_code == 200:
            auth_data = response.json()
            auth_info = auth_data.get('auth_info', {})
            print("✅ Authentication successful")
            print(f"   Method: {auth_info.get('auth_method')}")
            print(f"   Region: {auth_info.get('region')}")
            print(f"   Model: {auth_info.get('model_id')}")
            print(f"   Bearer Token Set: {auth_info.get('bearer_token_set')}")
            print(f"   Connect Timeout: {auth_info.get('connect_timeout')}s")
            print(f"   Read Timeout: {auth_info.get('read_timeout')}s")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return
        
        # Test credential validation
        print("\n2. Validating bearer token...")
        response = requests.get(f"{BASE_URL}/auth/validate")
        if response.status_code == 200:
            validation = response.json()
            if validation.get('credentials_valid'):
                print("✅ Bearer token is valid")
            else:
                print("❌ Bearer token is invalid")
                print("   Make sure your AWS_BEARER_TOKEN_BEDROCK is correct")
                return
        else:
            print(f"❌ Validation failed: {response.status_code}")
            return
        
        # Test feed recommendation
        print("\n3. Testing feed recommendation...")
        chicken_data = {
            "count": 150,
            "breed": "laying hen",
            "average_weight_kg": 2.5,
            "age_weeks": 10
        }
        
        response = requests.post(
            f"{BASE_URL}/recommend-feed",
            json=chicken_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            recommendation = response.json()
            print("✅ Feed recommendation generated!")
            
            # Check if there was an error in the response
            if "error" in recommendation:
                print(f"⚠️  Model returned an error: {recommendation['error']}")
                print("   Using fallback recommendations")
            
            # Show key results
            if "feed_composition" in recommendation:
                feed_comp = recommendation["feed_composition"]
                print(f"\n📊 Key Nutritional Information:")
                print(f"   Protein: {feed_comp.get('crude_protein_percent')}%")
                print(f"   Energy: {feed_comp.get('metabolizable_energy_kcal_per_kg')} kcal/kg")
                print(f"   Calcium: {feed_comp.get('calcium_percent')}%")
            
            print(f"\n🍽️ Feeding Recommendations:")
            print(f"   Per bird daily: {recommendation.get('daily_feed_amount_per_bird_kg')} kg")
            print(f"   Total daily: {recommendation.get('total_daily_feed_kg')} kg")
            
            if "additional_recommendations" in recommendation:
                print(f"\n💡 Additional Recommendations:")
                for i, rec in enumerate(recommendation["additional_recommendations"][:3], 1):
                    print(f"   {i}. {rec}")
            
            # Save response
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"bearer_token_recommendation_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(recommendation, f, indent=2)
            print(f"\n💾 Full response saved to: {filename}")
        else:
            print(f"❌ Feed recommendation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running:")
        print("   python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def create_env_file():
    """Create a simple .env file template"""
    env_content = """# AWS Bearer Token - Required
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_REGION=us-east-1

# Bedrock Configuration - Optional
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
BEDROCK_CONNECT_TIMEOUT=60
BEDROCK_READ_TIMEOUT=60
BEDROCK_MAX_ATTEMPTS=3

# Model Configuration - Optional
MODEL_MAX_TOKENS=4000
MODEL_TEMPERATURE=0.3
MODEL_TOP_P=0.9

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
"""
    
    with open('.env.bearer_token', 'w') as f:
        f.write(env_content)
    
    print("📄 Created .env.bearer_token template file")
    print("   1. Copy it to .env: cp .env.bearer_token .env")
    print("   2. Edit .env and add your real AWS bearer token")

def show_usage_example():
    """Show code usage example like the provided example"""
    print("\n💻 Code Usage Example (like your provided code):")
    print("-" * 50)
    
    code_example = '''
import os
import boto3
from botocore.config import Config

# Set your bearer token
aws_bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
if aws_bearer_token:
    os.environ["AWS_BEARER_TOKEN_BEDROCK"] = aws_bearer_token
else:
    print("AWS_BEARER_TOKEN_BEDROCK environment variable is not set.")

def get_bedrock_client():
    """Create and return AWS Bedrock client"""
    return boto3.client(
        "bedrock-runtime",
        region_name="us-east-1",
        config=Config(
            connect_timeout=60,
            read_timeout=60,
            retries={"max_attempts": 3},
        ),
    )

# Use the client
client = get_bedrock_client()
# Make your API calls...
'''
    
    print(code_example)

if __name__ == "__main__":
    print("🔐 AWS Bearer Token for Bedrock Example")
    print("=" * 50)
    
    # Show setup instructions
    setup_environment_variables()
    
    # Create template file
    create_env_file()
    
    # Show code example
    show_usage_example()
    
    # Test the API
    test_api_bearer_token()
    
    print("\n" + "=" * 50)
    print("💡 Quick Setup Summary:")
    print("1. Set AWS_BEARER_TOKEN_BEDROCK and AWS_REGION")
    print("2. Start server: python main.py")
    print("3. Test API: python examples/bearer_token_example.py")
    print("4. Use the API with your chicken data!")
    print("\n🔗 This matches the pattern from your example code!")
