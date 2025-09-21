# Chicken Feeding Management System - Docker Commands

.PHONY: help build up down logs clean dev prod status

# Default target
help:
	@echo "Chicken Feeding Management System - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start all services"
	@echo "  down      - Stop all services"
	@echo "  logs      - Show logs for all services"
	@echo "  clean     - Remove containers, networks, and volumes"
	@echo "  dev       - Start in development mode with volume mounting"
	@echo "  prod      - Start in production mode"
	@echo "  status    - Show status of all services"
	@echo "  restart   - Restart all services"
	@echo "  rebuild   - Rebuild and start all services"
	@echo ""
	@echo "Individual services:"
	@echo "  api       - Manage API service"
	@echo "  bedrock   - Manage Bedrock API service"
	@echo "  frontend  - Manage Frontend service"

# Build all images
build:
	docker compose build

# Start all services
up:
	docker compose up -d

# Start all services with logs
up-logs:
	docker compose up

# Stop all services
down:
	docker compose down

# Show logs
logs:
	docker compose logs -f

# Show logs for specific service
logs-api:
	docker compose logs -f api

logs-bedrock:
	docker compose logs -f bedrock-api

logs-frontend:
	docker compose logs -f frontend

# Clean everything
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# Development mode
dev:	
	docker compose up --build

# Production mode
prod:
	docker compose up -d --build

# Show status
status:
	docker compose ps

# Restart all services
restart:
	docker compose restart

# Rebuild and start
rebuild:
	docker compose up --build -d

# API service commands
api-build:
	docker compose build api

api-up:
	docker compose up -d api

api-logs:
	docker compose logs -f api

api-shell:
	docker compose exec api bash

# Bedrock API service commands
bedrock-build:
	docker compose build bedrock-api

bedrock-up:
	docker compose up -d bedrock-api

bedrock-logs:
	docker compose logs -f bedrock-api

bedrock-shell:
	docker compose exec bedrock-api bash

# Frontend service commands
frontend-build:
	docker compose build frontend

frontend-up:
	docker compose up -d frontend

frontend-logs:
	docker compose logs -f frontend

frontend-shell:
	docker compose exec frontend sh

# Health checks
health:
	@echo "Checking service health..."
	@docker compose ps
	@echo ""
	@echo "API Health:"
	@curl -s -f http://localhost:8001/docs > /dev/null && echo "✅ API is healthy" || echo "❌ API is not responding"
	@echo "Bedrock API Health:"
	@curl -s -f http://localhost:8000/health > /dev/null && echo "✅ Bedrock API is healthy" || echo "❌ Bedrock API is not responding"
	@echo "Frontend Health:"
	@curl -s -f http://localhost/health > /dev/null && echo "✅ Frontend is healthy" || echo "❌ Frontend is not responding"

# Setup environment
setup:
	@echo "Setting up environment..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from example..."; \
		echo "AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here" > .env; \
		echo "AWS_REGION=us-east-1" >> .env; \
		echo "BEDROCK_MODEL_ID=amazon.nova-pro-v1:0" >> .env; \
		echo "LOG_LEVEL=INFO" >> .env; \
		echo "✅ .env file created. Please edit it with your AWS credentials."; \
	else \
		echo "✅ .env file already exists."; \
	fi

