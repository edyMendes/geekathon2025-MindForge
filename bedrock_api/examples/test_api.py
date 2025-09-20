#!/usr/bin/env python3
"""
Example script demonstrating how to use the Chicken Feed Nutritional Advisor API
"""

import requests
import json
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    """Test the API with example chicken data"""
    
    print("🐔 Chicken Feed Nutritional Advisor API Test")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running at http://localhost:8000")
        print("   Run: python main.py")
        return
    
    # Test current season endpoint
    print("\n2. Testing current season endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/seasons")
        if response.status_code == 200:
            season_data = response.json()
            print("✅ Season endpoint working")
            print(f"   Current season: {season_data['current_season']}")
            print(f"   Date: {season_data['date']}")
        else:
            print(f"❌ Season endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Season endpoint error: {e}")
    
    # Test authentication endpoints
    print("\n3. Testing authentication endpoints...")
    try:
        # Test auth info
        response = requests.get(f"{BASE_URL}/auth/info")
        if response.status_code == 200:
            auth_data = response.json()
            print("✅ Authentication info retrieved")
            auth_info = auth_data.get('auth_info', {})
            print(f"   Auth method: {auth_info.get('auth_method', 'unknown')}")
            print(f"   Account: {auth_info.get('account', 'unknown')}")
            if 'arn' in auth_info:
                print(f"   User ARN: {auth_info['arn']}")
        else:
            print(f"❌ Auth info failed: {response.status_code}")
        
        # Test credential validation
        response = requests.get(f"{BASE_URL}/auth/validate")
        if response.status_code == 200:
            validation_data = response.json()
            is_valid = validation_data.get('credentials_valid', False)
            if is_valid:
                print("✅ AWS credentials are valid")
            else:
                print("⚠️  AWS credentials validation failed")
                print(f"   Error: {validation_data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Credential validation failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Authentication endpoint error: {e}")
    
    # Test feed recommendation endpoint
    print("\n4. Testing feed recommendation endpoint...")
    
    # Example chicken data as specified in the request
    chicken_data = {
        "count": 150,
        "breed": "laying hen",
        "average_weight_kg": 2.5,
        "age_weeks": 10
        # season will be auto-detected
    }
    
    print(f"   Input data: {json.dumps(chicken_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/recommend-feed",
            json=chicken_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Feed recommendation generated successfully!")
            recommendation = response.json()
            
            # Display key results
            print("\n📊 NUTRITIONAL RECOMMENDATION SUMMARY:")
            print("-" * 40)
            
            if "feed_composition" in recommendation:
                feed_comp = recommendation["feed_composition"]
                print(f"• Crude Protein: {feed_comp.get('crude_protein_percent', 'N/A')}%")
                print(f"• Energy: {feed_comp.get('metabolizable_energy_kcal_per_kg', 'N/A')} kcal/kg")
                print(f"• Calcium: {feed_comp.get('calcium_percent', 'N/A')}%")
                print(f"• Phosphorus: {feed_comp.get('phosphorus_percent', 'N/A')}%")
            
            print(f"\n🍽️ FEEDING AMOUNTS:")
            print(f"• Per bird daily: {recommendation.get('daily_feed_amount_per_bird_kg', 'N/A')} kg")
            print(f"• Total daily for {chicken_data['count']} birds: {recommendation.get('total_daily_feed_kg', 'N/A')} kg")
            
            if "seasonal_adjustments" in recommendation:
                print(f"\n🌤️ SEASONAL CONSIDERATIONS:")
                seasonal = recommendation["seasonal_adjustments"]
                for key, value in seasonal.items():
                    print(f"• {key.replace('_', ' ').title()}: {value}")
            
            if "additional_recommendations" in recommendation:
                print(f"\n💡 ADDITIONAL RECOMMENDATIONS:")
                for i, rec in enumerate(recommendation["additional_recommendations"], 1):
                    print(f"{i}. {rec}")
            
            # Save full response to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"feed_recommendation_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(recommendation, f, indent=2)
            print(f"\n💾 Full response saved to: {filename}")
            
        else:
            print(f"❌ Feed recommendation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Feed recommendation error: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed! 🎉")

def test_different_scenarios():
    """Test different chicken scenarios"""
    
    scenarios = [
        {
            "name": "Young Broilers",
            "data": {
                "count": 100,
                "breed": "broiler",
                "average_weight_kg": 1.0,
                "age_weeks": 4,
                "season": "summer"
            }
        },
        {
            "name": "Mature Layers",
            "data": {
                "count": 200,
                "breed": "Rhode Island Red",
                "average_weight_kg": 2.8,
                "age_weeks": 25,
                "season": "winter"
            }
        },
        {
            "name": "Heritage Breed",
            "data": {
                "count": 50,
                "breed": "Buff Orpington",
                "average_weight_kg": 3.2,
                "age_weeks": 15,
                "season": "spring"
            }
        }
    ]
    
    print("\n🧪 TESTING DIFFERENT SCENARIOS")
    print("=" * 50)
    
    for scenario in scenarios:
        print(f"\n📋 Testing: {scenario['name']}")
        print(f"   Data: {json.dumps(scenario['data'], indent=2)}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/recommend-feed",
                json=scenario['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(f"   Daily feed per bird: {result.get('daily_feed_amount_per_bird_kg', 'N/A')} kg")
                print(f"   Total daily feed: {result.get('total_daily_feed_kg', 'N/A')} kg")
                
                if "feed_composition" in result:
                    protein = result["feed_composition"].get("crude_protein_percent", "N/A")
                    energy = result["feed_composition"].get("metabolizable_energy_kcal_per_kg", "N/A")
                    print(f"   Protein: {protein}%, Energy: {energy} kcal/kg")
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Starting API tests...")
    test_api()
    
    # Uncomment to test different scenarios
    # test_different_scenarios()
