#!/usr/bin/env python3
"""
Test script for the disease recovery functionality
"""
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_disease_recovery():
    """Test the disease recovery endpoint"""
    
    disease_data = {
        "count": 25,
        "breed": "laying hen",
        "average_weight_kg": 2.0,
        "age_weeks": 30,
        "disease": "respiratory_infection"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/disease-recovery",
            json=disease_data,
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

def test_different_diseases():
    """Test different diseases and severities"""
    
    test_cases = [
        {
            "name": "Coccidiosis",
            "data": {
                "count": 50,
                "breed": "broiler",
                "average_weight_kg": 1.5,
                "age_weeks": 6,
                "disease": "coccidiosis"
            }
        },
        {
            "name": "Egg Binding",
            "data": {
                "count": 15,
                "breed": "rhode island red",
                "average_weight_kg": 2.5,
                "age_weeks": 45,
                "disease": "egg_binding"
            }
        },
        {
            "name": "Newcastle Disease",
            "data": {
                "count": 100,
                "breed": "leghorn",
                "average_weight_kg": 1.8,
                "age_weeks": 25,
                "disease": "newcastle_disease"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"Testing: {test_case['name']}")
        print("-" * 50)
        
        try:
            response = requests.post(
                f"{BASE_URL}/disease-recovery",
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
    print(f"Disease Recovery API Test - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test basic disease recovery
    test_disease_recovery()
    
    print("\n" + "="*60 + "\n")
    
    # Test different diseases
    test_different_diseases()
