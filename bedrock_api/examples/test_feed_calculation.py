#!/usr/bin/env python3
"""
Test script for the new feed calculation functionality
"""
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_feed_calculation():
    """Test the new /calculate-feed endpoint"""
    
    # Sample chicken data
    chicken_data = {
        "count": 100,
        "breed": "laying hen",
        "average_weight_kg": 2.0,
        "age_weeks": 25,
        "environment": "free range",
        "purpose": "eggs",
        "season": "autumn"
    }
    
    try:
        # Call the new calculate-feed endpoint
        response = requests.post(
            f"{BASE_URL}/calculate-feed",
            json=chicken_data,
            headers={"Content-Type": "application/json"},
            timeout=30
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

if __name__ == "__main__":
    # Run the feed calculation test and output JSON
    test_feed_calculation()
    
    print("\n" + "="*60 + "\n")
    
    # Run the weekly recipes test
    test_weekly_recipes()
    
    print("\n" + "="*60 + "\n")
    
    # Run the disease recovery test
    test_disease_recovery()
    
    print("\n" + "="*60 + "\n")
    
    # Run the disease weekly recipes test
    test_disease_weekly_recipes()
