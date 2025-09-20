# 🐳 Docker Setup Guide

## Problem Diagnosis

You're getting this error because the Docker container doesn't have access to your AWS Bearer Token. The API is falling back to default values.

## 🔧 Fix Steps

### Step 1: Create .env File

```bash
# Copy the template
cp env.example .env

# Edit .env with your real bearer token
# Required:
AWS_BEARER_TOKEN_BEDROCK=your_actual_bearer_token_here
AWS_REGION=us-east-1
```

### Step 2: Updated Docker Configuration

I've updated the `docker-compose.yml` to use bearer token instead of the old AWS credentials:

```yaml
environment:
  - AWS_BEARER_TOKEN_BEDROCK=${AWS_BEARER_TOKEN_BEDROCK}
  - AWS_REGION=${AWS_REGION:-us-east-1}
  - BEDROCK_MODEL_ID=${BEDROCK_MODEL_ID:-amazon.nova-pro-v1:0}
volumes:
  - ./.env:/app/.env:ro  # Mount .env file into container
```

### Step 3: Build and Run

```bash
# Method 1: Using docker-compose (recommended)
docker-compose up --build

# Method 2: Manual Docker commands
docker build -t chicken-feed-api .
docker run -p 8000:8000 --env-file .env chicken-feed-api
```

### Step 4: Test the Setup

```bash
# Test the Docker setup
python scripts/docker_test.py

# Or test manually
curl http://localhost:8000/
curl http://localhost:8000/auth/info
```

## 🚨 Common Issues & Solutions

### Issue 1: "Missing credentials" in Docker
**Cause**: .env file not properly mounted or environment variables not set
**Solution**: 
```bash
# Ensure .env file exists and has correct values
ls -la .env
cat .env

# Rebuild container
docker-compose up --build
```

### Issue 2: "Error calling model: " (empty error)
**Cause**: Invalid or expired bearer token
**Solution**:
```bash
# Check if your bearer token is valid
# Update .env with a fresh token
# Restart container
```

### Issue 3: Network connectivity issues
**Cause**: Docker container can't reach AWS Bedrock
**Solution**:
```bash
# Test from inside container
docker exec -it <container_id> curl https://bedrock-runtime.us-east-1.amazonaws.com
```

## 🧪 Test Results

### ✅ Working Response (Container has valid token):
```json
{
  "status": "ready",
  "aws_region": "us-east-1",
  "model_id": "amazon.nova-pro-v1:0"
}
```

### ❌ Problem Response (Missing/invalid token):
```json
{
  "status": "missing_credentials",
  "missing_environment_variables": ["AWS_BEARER_TOKEN_BEDROCK"]
}
```

## 🔍 Debug Commands

```bash
# Check container environment
docker exec -it <container_id> env | grep AWS

# Check container logs
docker logs <container_id>

# Test API from inside container
docker exec -it <container_id> curl localhost:8000/auth/info
```

## 📋 Checklist

- [ ] .env file exists with valid AWS_BEARER_TOKEN_BEDROCK
- [ ] docker-compose.yml uses bearer token (not old AWS keys)
- [ ] Container can access .env file
- [ ] Bearer token is valid and not expired
- [ ] Container has network access to AWS Bedrock
- [ ] Using correct AWS region (us-east-1 for Nova Pro)

## 🚀 Production Deployment

For production, consider:

1. **Use secrets management** instead of .env files
2. **Set environment variables directly** in your deployment platform
3. **Use IAM roles** when possible (ECS, EKS, etc.)
4. **Monitor token expiration** and refresh automatically

```bash
# Example for production
docker run -p 8000:8000 \
  -e AWS_BEARER_TOKEN_BEDROCK=your_token \
  -e AWS_REGION=us-east-1 \
  chicken-feed-api
```
