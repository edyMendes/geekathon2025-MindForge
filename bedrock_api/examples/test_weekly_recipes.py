#!/usr/bin/env python3
"""
Test script for the weekly recipes functionality
"""
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_weekly_recipes():
    """Test the weekly recipes endpoint"""
    
    chicken_data = {
        "count": 25,
        "breed": "laying hen",
        "average_weight_kg": 2.0,
        "age_weeks": 25,
        "environment": "free range",
        "purpose": "eggs",
        "season": "autumn"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/weekly-recipes",
            json=chicken_data,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(json.dumps(result, indent=2))
        else:
            error_response = {
                "error": f"HTTP {response.status_code}",
                "message": response.text
            }
            print(json.dumps(error_response, indent=2))
            
    except requests.exceptions.RequestException as e:
        error_response = {
            "error": "Request failed",
            "message": str(e)
        }
        print(json.dumps(error_response, indent=2))
    except Exception as e:
        error_response = {
            "error": "Unexpected error",
            "message": str(e)
        }
        print(json.dumps(error_response, indent=2))

def test_different_environments():
    """Test weekly recipes for different environments and purposes"""
    
    test_cases = [
        {
            "name": "Battery Cage Egg Production",
            "data": {
                "count": 50,
                "breed": "leghorn",
                "average_weight_kg": 1.8,
                "age_weeks": 30,
                "environment": "battery cage",
                "purpose": "eggs",
                "season": "summer"
            }
        },
        {
            "name": "Organic Meat Production",
            "data": {
                "count": 20,
                "breed": "cornish cross",
                "average_weight_kg": 3.0,
                "age_weeks": 6,
                "environment": "organic",
                "purpose": "meat production",
                "season": "spring"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"Testing: {test_case['name']}")
        print("-" * 50)
        
        try:
            response = requests.post(
                f"{BASE_URL}/weekly-recipes",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(json.dumps(result, indent=2))
            else:
                error_response = {
                    "test_case": test_case["name"],
                    "error": f"HTTP {response.status_code}",
                    "message": response.text
                }
                print(json.dumps(error_response, indent=2))
                
        except Exception as e:
            error_response = {
                "test_case": test_case["name"],
                "error": str(e)
            }
            print(json.dumps(error_response, indent=2))
        
        print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    print(f"Weekly Recipes API Test - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test basic weekly recipes
    test_weekly_recipes()
    
    print("\n" + "="*60 + "\n")
    
    # Test different environments
    test_different_environments()
