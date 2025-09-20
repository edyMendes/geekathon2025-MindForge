# Chicken Feed Nutritional Advisor API - Makefile

.PHONY: help setup install dev test test-api clean docker-build docker-run

help:  ## Show this help message
	@echo "🐔 Chicken Feed Nutritional Advisor API"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup:  ## Run initial setup
	@python scripts/setup.py

install:  ## Install dependencies
	@pip install -r requirements.txt

dev:  ## Start development server
	@python scripts/run_dev.py

test:  ## Run unit tests
	@source venv/bin/activate && python -m pytest tests/ -v

test-api:  ## Test the API endpoints
	@python examples/test_api.py

test-bearer:  ## Test bearer token setup
	@python examples/bearer_token_example.py

test-coverage:  ## Run tests with coverage
	@pytest tests/ --cov=app --cov-report=html --cov-report=term

clean:  ## Clean up temporary files
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type f -name "*.log" -delete
	@find . -name "feed_recommendation_*.json" -delete
	@rm -rf htmlcov/
	@rm -rf .pytest_cache/
	@rm -rf .coverage

docker-build:  ## Build Docker image
	@docker build -t chicken-feed-api .

docker-run:  ## Run Docker container
	@docker-compose up

docker-stop:  ## Stop Docker container
	@docker-compose down

lint:  ## Run linting (if you have flake8 or black installed)
	@echo "Running basic Python syntax check..."
	@python -m py_compile main.py
	@python -m py_compile app/core/config.py
	@python -m py_compile app/models/chicken.py
	@python -m py_compile app/services/bedrock_service.py
	@python -m py_compile app/api/routes.py
	@echo "✅ All files compiled successfully"

format:  ## Format code (if you have black installed)
	@echo "Install black for code formatting: pip install black"
	@echo "Then run: black ."

# Default target
all: setup dev
