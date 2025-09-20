#!/usr/bin/env python3
"""
Quick start example for the Chicken Feed API with Bearer Token
"""
import os
import requests
import json

def main():
    print("🐔 Chicken Feed API - Quick Start")
    print("=" * 40)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            info = response.json()
            print(f"✅ Server is running!")
            print(f"   Status: {info.get('status')}")
            print(f"   Region: {info.get('aws_region')}")
            print(f"   Model: {info.get('model_id')}")
            
            if info.get('status') == 'missing_credentials':
                print(f"\n⚠️  Missing credentials!")
                print(f"   Missing: {', '.join(info.get('missing_environment_variables', []))}")
                print(f"\n🔧 To fix this:")
                for step, instruction in info.get('setup_instructions', {}).items():
                    print(f"   {step}. {instruction}")
                return
                
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return
            
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running!")
        print("\n🚀 To start the server:")
        print("   1. Set your bearer token:")
        print("      export AWS_BEARER_TOKEN_BEDROCK=your_token_here")
        print("   2. Set your region:")
        print("      export AWS_REGION=us-east-1")
        print("   3. Start the server:")
        print("      python main.py")
        return
    
    # Test the API with sample chicken data
    print(f"\n🧪 Testing API with sample data...")
    
    chicken_data = {
        "count": 150,
        "breed": "laying hen",
        "average_weight_kg": 2.5,
        "age_weeks": 10
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/recommend-feed",
            json=chicken_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            
            if "error" in result:
                print(f"⚠️  Model error: {result['error']}")
                print("   This is likely due to invalid bearer token")
                print("   But the API structure is working!")
            else:
                print("🎉 Full recommendation generated!")
            
            # Show key info
            if "feed_composition" in result:
                feed = result["feed_composition"]
                print(f"\n📊 Sample Results:")
                print(f"   Protein: {feed.get('crude_protein_percent')}%")
                print(f"   Energy: {feed.get('metabolizable_energy_kcal_per_kg')} kcal/kg")
                print(f"   Daily feed per bird: {result.get('daily_feed_amount_per_bird_kg')} kg")
            
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error calling API: {e}")
    
    print(f"\n📚 Next Steps:")
    print(f"   • Visit http://localhost:8000/docs for full API documentation")
    print(f"   • Run python examples/bearer_token_example.py for detailed testing")
    print(f"   • Check http://localhost:8000/auth/info for authentication status")

if __name__ == "__main__":
    main()
