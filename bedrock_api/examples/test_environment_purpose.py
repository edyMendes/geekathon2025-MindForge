#!/usr/bin/env python3
"""
Test script for the updated feed calculation functionality with environment and purpose fields
"""
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_environment_purpose_combinations():
    """Test different combinations of environment and purpose"""
    
    test_cases = [
        {
            "name": "Free Range Egg Production",
            "data": {
                "count": 50,
                "breed": "rhode island red",
                "average_weight_kg": 2.5,
                "age_weeks": 30,
                "environment": "free range",
                "purpose": "eggs",
                "season": "spring"
            }
        },
        {
            "name": "Battery Cage Egg Production",
            "data": {
                "count": 200,
                "breed": "leghorn",
                "average_weight_kg": 1.8,
                "age_weeks": 25,
                "environment": "battery cage",
                "purpose": "eggs",
                "season": "summer"
            }
        },
        {
            "name": "Organic Meat Production",
            "data": {
                "count": 100,
                "breed": "cornish cross",
                "average_weight_kg": 3.2,
                "age_weeks": 8,
                "environment": "organic",
                "purpose": "meat production",
                "season": "autumn"
            }
        },
        {
            "name": "Barn Breeding Stock",
            "data": {
                "count": 25,
                "breed": "sussex",
                "average_weight_kg": 2.8,
                "age_weeks": 40,
                "environment": "barn",
                "purpose": "breeding",
                "season": "winter"
            }
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"Testing: {test_case['name']}")
        print("-" * 50)
        
        try:
            response = requests.post(
                f"{BASE_URL}/calculate-feed",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                results.append({
                    "test_case": test_case["name"],
                    "input": test_case["data"],
                    "result": result
                })
                print(json.dumps(result, indent=2))
            else:
                error_result = {
                    "test_case": test_case["name"],
                    "error": f"HTTP {response.status_code}",
                    "message": response.text
                }
                results.append(error_result)
                print(json.dumps(error_result, indent=2))
                
        except Exception as e:
            error_result = {
                "test_case": test_case["name"],
                "error": str(e)
            }
            results.append(error_result)
            print(json.dumps(error_result, indent=2))
        
        print("\n" + "="*60 + "\n")
    
    return results

def test_validation_errors():
    """Test validation of environment and purpose fields"""
    
    print("Testing validation errors...")
    print("-" * 30)
    
    invalid_cases = [
        {
            "name": "Invalid Environment",
            "data": {
                "count": 10,
                "breed": "test",
                "average_weight_kg": 2.0,
                "age_weeks": 20,
                "environment": "invalid_env",
                "purpose": "eggs"
            }
        },
        {
            "name": "Invalid Purpose",
            "data": {
                "count": 10,
                "breed": "test",
                "average_weight_kg": 2.0,
                "age_weeks": 20,
                "environment": "free range",
                "purpose": "invalid_purpose"
            }
        },
        {
            "name": "Missing Required Fields",
            "data": {
                "count": 10,
                "breed": "test",
                "average_weight_kg": 2.0,
                "age_weeks": 20
                # Missing environment and purpose
            }
        }
    ]
    
    for test_case in invalid_cases:
        print(f"Testing: {test_case['name']}")
        try:
            response = requests.post(
                f"{BASE_URL}/calculate-feed",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {e}")
        print("-" * 30)

if __name__ == "__main__":
    print(f"Environment & Purpose API Test - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Test different combinations
    results = test_environment_purpose_combinations()
    
    # Test validation
    test_validation_errors()
    
    print("\nTest Summary:")
    print("=" * 20)
    successful_tests = [r for r in results if "error" not in r]
    failed_tests = [r for r in results if "error" in r]
    
    print(f"Successful tests: {len(successful_tests)}")
    print(f"Failed tests: {len(failed_tests)}")
    
    if failed_tests:
        print("\nFailed test cases:")
        for test in failed_tests:
            print(f"- {test['test_case']}: {test.get('error', 'Unknown error')}")
