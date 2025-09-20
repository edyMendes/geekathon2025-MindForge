#!/usr/bin/env python3
"""
Setup script for the Chicken Feed Nutritional Advisor API
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"   Error: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🐔 Chicken Feed Nutritional Advisor API Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("💡 Try using 'pip3' instead of 'pip' if you encounter issues")
        return
    
    # Check AWS CLI (optional)
    try:
        subprocess.run("aws --version", shell=True, check=True, capture_output=True)
        print("✅ AWS CLI detected")
    except subprocess.CalledProcessError:
        print("⚠️  AWS CLI not found. You'll need to configure AWS credentials manually")
        print("   Install with: pip install awscli")
        print("   Configure with: aws configure")
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Configure AWS credentials:")
    print("   aws configure")
    print("\n2. Ensure Bedrock access to Nova Pro model in AWS console")
    print("\n3. Start the development server:")
    print("   python scripts/run_dev.py")
    print("\n4. Test the API:")
    print("   python examples/test_api.py")
    print("\n5. View API documentation:")
    print("   http://localhost:8000/docs")

if __name__ == "__main__":
    main()
