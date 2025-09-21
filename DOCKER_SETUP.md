# Docker Setup Guide

This guide explains how to run the Chicken Feeding Management System using Docker containers.

## Architecture

The system consists of three main services:

1. **API Service** (Port 8001) - Main FastAPI application with SQLite database
2. **Bedrock API Service** (Port 8000) - AWS Bedrock integration for AI recommendations
3. **Frontend Service** (Port 80) - React/Vite frontend served by Nginx

## Prerequisites

- Docker and Docker Compose installed
- AWS credentials (for Bedrock API functionality)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# AWS Bedrock Configuration
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# Optional
LOG_LEVEL=INFO
```

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/geekathon2025-MindForge
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

3. **Start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - API Documentation: http://localhost:8001/docs
   - Bedrock API Documentation: http://localhost:8000/docs

## Individual Service Commands

### Build and run all services:
```bash
docker-compose up --build
```

### Run in detached mode:
```bash
docker-compose up -d --build
```

### Stop all services:
```bash
docker-compose down
```

### View logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs bedrock-api
docker-compose logs frontend
```

### Rebuild specific service:
```bash
docker-compose up --build api
docker-compose up --build bedrock-api
docker-compose up --build frontend
```

## Service Details

### API Service
- **Port**: 8001
- **Technology**: FastAPI + SQLite
- **Features**: User management, chicken groups, feeding records, performance metrics
- **Health Check**: http://localhost:8001/docs

### Bedrock API Service
- **Port**: 8000
- **Technology**: FastAPI + AWS Bedrock
- **Features**: AI-powered feed recommendations, disease analysis
- **Health Check**: http://localhost:8000/health
- **Dependencies**: AWS credentials

### Frontend Service
- **Port**: 80
- **Technology**: React + Vite + Nginx
- **Features**: User interface for all system functionality
- **Health Check**: http://localhost/health

## Development

### Local Development with Docker
```bash
# Start services with volume mounting for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Database Persistence
- API service data is persisted in a Docker volume `api_data`
- Database files are stored in `/app/data` inside the container

### API Endpoints

#### Main API (Port 8001)
- `GET /users/` - List users
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /chicken-groups/` - List chicken groups
- `POST /chicken-groups/` - Create chicken group
- Full API docs: http://localhost:8001/docs

#### Bedrock API (Port 8000)
- `POST /feed-recommendation` - Get AI feed recommendations
- `POST /disease-analysis` - Analyze chicken diseases
- `POST /weekly-recipes` - Generate weekly feeding recipes
- Full API docs: http://localhost:8000/docs

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Ensure `AWS_BEARER_TOKEN_BEDROCK` is set in `.env`
   - Verify the token is valid and not expired
   - Check AWS region setting

2. **Port Conflicts**
   - Ensure ports 80, 8000, and 8001 are not in use
   - Modify port mappings in `docker-compose.yml` if needed

3. **Build Failures**
   - Check Docker has enough resources allocated
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

4. **Database Issues**
   - Remove volume and restart: `docker-compose down -v && docker-compose up --build`
   - Check database file permissions

### Health Checks

All services include health checks. Monitor service health:

```bash
# Check service status
docker-compose ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' chicken-feeding-api
docker inspect --format='{{.State.Health.Status}}' chicken-feeding-bedrock-api
docker inspect --format='{{.State.Health.Status}}' chicken-feeding-frontend
```

### Logs and Debugging

```bash
# Follow logs in real-time
docker-compose logs -f

# Check specific service logs
docker-compose logs -f api
docker-compose logs -f bedrock-api
docker-compose logs -f frontend

# Execute commands in running container
docker-compose exec api bash
docker-compose exec bedrock-api bash
docker-compose exec frontend sh
```

## Production Deployment

For production deployment:

1. **Security Considerations:**
   - Update CORS settings in each service
   - Use environment-specific configurations
   - Implement proper secrets management

2. **Performance:**
   - Use production-grade database (PostgreSQL/MySQL)
   - Configure Nginx for SSL termination
   - Set up monitoring and logging

3. **Scaling:**
   - Use Docker Swarm or Kubernetes for orchestration
   - Implement load balancing
   - Set up database clustering

## Support

For issues or questions:
1. Check the logs using the commands above
2. Verify environment variables are correctly set
3. Ensure all services are healthy and running
4. Check network connectivity between services

