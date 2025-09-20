#!/usr/bin/env python3
"""
Script to help test Docker setup with bearer token
"""
import os
import subprocess
import requests
import time
import json

def check_docker_setup():
    """Check Docker setup and configuration"""
    print("🐳 Docker Setup Checker")
    print("=" * 40)
    
    # Check if .env file exists
    if os.path.exists('.env'):
        print("✅ .env file found")
        
        # Read .env file safely
        with open('.env', 'r') as f:
            lines = f.readlines()
        
        bearer_token_found = False
        region_found = False
        
        print("\n📄 .env file contents:")
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                if 'AWS_BEARER_TOKEN_BEDROCK' in line:
                    bearer_token_found = True
                    key, value = line.split('=', 1)
                    print(f"   {key}={value[:15]}..." if len(value) > 15 else f"   {line}")
                elif 'AWS_REGION' in line:
                    region_found = True
                    print(f"   {line}")
                else:
                    print(f"   {line}")
        
        if not bearer_token_found:
            print("❌ AWS_BEARER_TOKEN_BEDROCK not found in .env")
            return False
        if not region_found:
            print("❌ AWS_REGION not found in .env")
            return False
            
        print("✅ Required environment variables found in .env")
        
    else:
        print("❌ No .env file found")
        print("\n🔧 Create .env file:")
        print("   cp env.example .env")
        print("   # Edit .env with your bearer token")
        return False
    
    return True

def test_docker_build():
    """Test Docker build"""
    print("\n🔨 Testing Docker build...")
    try:
        result = subprocess.run(
            ["docker", "build", "-t", "chicken-feed-api", "."],
            capture_output=True,
            text=True,
            check=True
        )
        print("✅ Docker build successful")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Docker build failed: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ Docker not found. Please install Docker.")
        return False

def test_docker_run():
    """Test Docker container"""
    print("\n🚀 Testing Docker container...")
    
    # Stop any existing container
    subprocess.run(["docker", "stop", "chicken-feed-test"], capture_output=True)
    subprocess.run(["docker", "rm", "chicken-feed-test"], capture_output=True)
    
    try:
        # Start container
        cmd = [
            "docker", "run", "-d",
            "--name", "chicken-feed-test",
            "-p", "8001:8000",  # Use different port to avoid conflicts
            "--env-file", ".env",
            "chicken-feed-api"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Container started: {result.stdout.strip()}")
        
        # Wait for container to start
        print("⏳ Waiting for container to start...")
        time.sleep(5)
        
        # Test the API
        print("🧪 Testing API endpoints...")
        
        # Test root endpoint
        try:
            response = requests.get("http://localhost:8001/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Root endpoint: status = {data.get('status')}")
                
                if data.get('status') == 'ready':
                    print("🎉 Configuration loaded successfully!")
                elif data.get('status') == 'missing_credentials':
                    print("❌ Missing credentials in container")
                    missing = data.get('missing_environment_variables', [])
                    print(f"   Missing: {', '.join(missing)}")
                
            else:
                print(f"❌ Root endpoint failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to API: {e}")
        
        # Test auth endpoint
        try:
            response = requests.get("http://localhost:8001/auth/info", timeout=10)
            if response.status_code == 200:
                auth_data = response.json()
                auth_info = auth_data.get('auth_info', {})
                print(f"✅ Auth endpoint: bearer_token_set = {auth_info.get('bearer_token_set')}")
            else:
                print(f"❌ Auth endpoint failed: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Auth endpoint error: {e}")
        
        # Test feed recommendation (this might fail with model error, but should return fallback)
        try:
            test_data = {
                "count": 10,
                "breed": "test",
                "average_weight_kg": 2.0,
                "age_weeks": 8
            }
            
            response = requests.post(
                "http://localhost:8001/recommend-feed",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if "error" in result:
                    print(f"⚠️  Feed endpoint returned error: {result.get('error', 'Unknown')}")
                    print("   This might be due to invalid bearer token or AWS connectivity")
                else:
                    print("🎉 Feed endpoint working perfectly!")
            else:
                print(f"❌ Feed endpoint failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Feed endpoint error: {e}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start container: {e.stderr}")
        return False
    
    finally:
        # Clean up
        print("\n🧹 Cleaning up...")
        subprocess.run(["docker", "stop", "chicken-feed-test"], capture_output=True)
        subprocess.run(["docker", "rm", "chicken-feed-test"], capture_output=True)

def main():
    """Main test function"""
    print("🔍 Docker Configuration Test")
    print("=" * 50)
    
    if not check_docker_setup():
        return
    
    if not test_docker_build():
        return
    
    test_docker_run()
    
    print("\n" + "=" * 50)
    print("📚 Summary:")
    print("• If you see 'Configuration loaded successfully!' - Docker setup is perfect")
    print("• If you see 'Missing credentials' - check your .env file")
    print("• If you see model errors - check your AWS bearer token validity")
    print("• Use 'docker-compose up' for production deployment")

if __name__ == "__main__":
    main()
