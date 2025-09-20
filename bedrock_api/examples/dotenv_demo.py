#!/usr/bin/env python3
"""
Demo showing how .env file configuration works
"""
import os
import requests

def demo_dotenv_setup():
    print("🔧 .env File Configuration Demo")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"✅ Found {env_file} file")
        
        # Read and display (safely)
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        print("\n📄 Current .env configuration:")
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                if 'TOKEN' in line:
                    # Hide token value for security
                    key, value = line.split('=', 1)
                    print(f"   {key}={value[:10]}...")
                else:
                    print(f"   {line}")
    else:
        print(f"❌ No {env_file} file found")
        print("\n🔧 To create one:")
        print("   1. cp env.example .env")
        print("   2. Edit .env with your bearer token")
        return
    
    # Test if server is running
    print("\n🌐 Testing server connection...")
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Server is running!")
            print(f"   Status: {data.get('status')}")
            
            if data.get('status') == 'ready':
                print("🎉 Configuration loaded successfully from .env file!")
                
                # Test auth endpoint
                auth_response = requests.get("http://localhost:8000/auth/info")
                if auth_response.status_code == 200:
                    auth_data = auth_response.json()
                    auth_info = auth_data.get('auth_info', {})
                    print(f"   Bearer token set: {auth_info.get('bearer_token_set')}")
                    print(f"   Region: {auth_info.get('region')}")
                    print(f"   Model: {auth_info.get('model_id')}")
            else:
                print("⚠️  Server running but configuration incomplete")
        else:
            print(f"❌ Server error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Server not running")
        print("\n🚀 To start the server:")
        print("   python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("📚 Summary:")
    print("• .env files make configuration easy and secure")
    print("• No need to set environment variables manually")
    print("• Just edit one file and start the server")
    print("• Perfect for development and deployment")

if __name__ == "__main__":
    demo_dotenv_setup()
