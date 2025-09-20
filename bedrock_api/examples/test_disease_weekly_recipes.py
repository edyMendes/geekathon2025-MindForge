#!/usr/bin/env python3
"""
Test script for disease weekly recipes endpoint
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_disease_weekly_recipes():
    """Test the disease weekly recipes endpoint"""
    
    disease_data = {
        "count": 25,
        "breed": "laying hen",
        "average_weight_kg": 2.0,
        "age_weeks": 30,
        "disease": "respiratory_infection"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/disease-weekly-recipes",
            json=disease_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Disease Weekly Recipes Generated Successfully!")
            print("=" * 60)
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            try:
                error_response = response.json()
                print(json.dumps(error_response, indent=2))
            except:
                print(f"Raw response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_different_diseases():
    """Test different diseases for weekly recipes"""
    
    test_cases = [
        {
            "name": "Coccidiosis Recovery",
            "data": {
                "count": 50,
                "breed": "broiler",
                "average_weight_kg": 1.5,
                "age_weeks": 6,
                "disease": "coccidiosis"
            }
        },
        {
            "name": "Egg Binding Recovery",
            "data": {
                "count": 15,
                "breed": "rhode island red",
                "average_weight_kg": 2.5,
                "age_weeks": 45,
                "disease": "egg_binding"
            }
        },
        {
            "name": "Newcastle Disease Recovery",
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
                f"{BASE_URL}/disease-weekly-recipes",
                json=test_case['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Success!")
                
                # Show key information
                weekly_calendar = result.get("weekly_calendar", {})
                daily_recipes = weekly_calendar.get("daily_recipes", [])
                
                print(f"Weekly Goals: {weekly_calendar.get('weekly_recovery_goals', [])}")
                print(f"Total Weekly Feed: {weekly_calendar.get('total_weekly_kg', 0)} kg")
                print(f"Number of Days: {len(daily_recipes)}")
                
                if daily_recipes:
                    first_day = daily_recipes[0]
                    print(f"First Day: {first_day.get('day', 'N/A')}")
                    print(f"Daily Total: {first_day.get('total_daily_kg', 0)} kg")
                    print(f"Recovery Notes: {first_day.get('recovery_notes', 'N/A')}")
                
                print()
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                try:
                    error_response = response.json()
                    print(json.dumps(error_response, indent=2))
                except:
                    print(f"Raw response: {response.text}")
                print()
                
        except Exception as e:
            print(f"❌ Error: {e}")
            print()

if __name__ == "__main__":
    print("Testing Disease Weekly Recipes Endpoint")
    print("=" * 50)
    
    # Test basic functionality
    test_disease_weekly_recipes()
    
    print("\n" + "=" * 50)
    print("Testing Different Diseases")
    print("=" * 50)
    
    # Test different diseases
    test_different_diseases()
