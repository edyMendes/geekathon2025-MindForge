# 🐔 FeedPilot - AI-Powered Chicken Feeding Management System

[![Demo Video](https://img.shields.io/badge/📺-Watch%20Demo-red?style=for-the-badge)](https://youtu.be/T2wNJYG0xhc)
[![Live Website](https://img.shields.io/badge/🌐-Live%20Website-green?style=for-the-badge)](http://34.207.110.83/)
[![Repository](https://img.shields.io/badge/📁-Repository-blue?style=for-the-badge)](https://github.com/edyMendes/geekathon2025-MindForge.git)

## 🎯 The Problem

Modern poultry farming faces significant challenges in optimizing feed management, which directly impacts profitability and animal welfare. Traditional feeding methods often result in:

- **Inefficient Feed Usage**: 15-20% feed waste due to improper portioning and timing
- **Poor Growth Performance**: Suboptimal nutrition leading to reduced egg production and slower growth rates
- **High Operational Costs**: Manual calculations and guesswork in feed formulations
- **Limited Scalability**: Difficulty managing multiple flocks with different nutritional requirements
- **Seasonal Inefficiencies**: Lack of adaptive feeding strategies for different weather conditions
- **Disease Management**: Poor nutrition contributing to health issues and mortality

## 💡 Our Solution

**FeedPilot** is a comprehensive, AI-powered chicken feeding management system that revolutionizes poultry farming through intelligent automation and data-driven insights. Our solution combines cutting-edge artificial intelligence with practical farming needs to deliver:

### 🤖 AI-Powered Intelligence
- **AWS Bedrock Integration**: Advanced Nova Pro model for personalized feed recommendations
- **Seasonal Adaptations**: Automatic adjustments based on weather, temperature, and seasonal patterns
- **Breed-Specific Optimization**: Tailored nutrition plans for different chicken breeds and purposes
- **Smart Fallback System**: Local calculations ensure system reliability even when AI services are unavailable

### 📊 Comprehensive Management
- **Multi-User Support**: Secure, isolated data management for different farmers
- **Real-Time Analytics**: Track FCR (Feed Conversion Ratio), mortality rates, and cost efficiency
- **Growth Monitoring**: Visual charts and progress tracking for optimal flock management
- **Disease Prevention**: Integrated health monitoring and curative feed recommendations

### 🏗️ Modern Architecture
- **Microservices Design**: Scalable, maintainable architecture with independent services
- **Docker Containerization**: Easy deployment and consistent environments
- **RESTful APIs**: Well-documented, secure endpoints for all operations
- **Responsive Frontend**: Modern React interface optimized for all devices

## 🚀 Quick Start

#### Verify Installation
```bash
# Check Docker installation
docker --version
docker-compose --version

# Check available resources
docker system info
```

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/edyMendes/geekathon2025-MindForge.git
cd geekathon2025-MindForge

# Verify project structure
ls -la
```

### 2. Environment Configuration

```bash
# Create environment file from template
cp .env.example .env

# Edit environment variables (optional for basic functionality)
# For AI features, add your AWS credentials:
nano .env
```

**Environment Variables:**
```bash
# AWS Bedrock Configuration (Optional)
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# Optional Settings
LOG_LEVEL=INFO
```

### 3. Start the System

#### Option A: Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### Option B: Using Makefile
```bash
# Start all services
make up

# Start with logs visible
make up-logs

# Start in development mode
make dev
```

#### Option C: Individual Services
```bash
# Start only specific services
docker-compose up api bedrock-api
docker-compose up frontend
```

### 4. Verify Installation

```bash
# Check if all services are running
docker-compose ps

# Check service health
curl http://localhost:8001/health  # Main API
curl http://localhost:8000/health  # AI Service
curl http://localhost:5173         # Frontend
```

### 5. Access the Application

Once all services are running, access:

- **🌐 Frontend Dashboard**: http://localhost:5173
- **📚 Main API Documentation**: http://localhost:8001/docs
- **🤖 AI Service Documentation**: http://localhost:8000/docs
- **📊 Interactive API Explorer**: http://localhost:8001/redoc

#### 🔑 Test User Accounts

For quick testing, use these pre-configured accounts:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin` | Administrator | Full system access with all permissions |
| `meat` | `meat` | User | Standard user account for meat production focus |

**Login Instructions:**
1. Navigate to http://localhost:5173
2. Click "Login" in the navigation
3. Enter username and password from the table above
4. Click "Sign In" to access the dashboard

### 6. First Steps

1. **Login with a test account** or register a new account
2. **Create your first chicken group** with flock details
3. **Generate AI-powered feed recommendations**
4. **Explore the analytics dashboard**
5. **Test disease management features**

### 🛠️ Troubleshooting

#### Common Issues

**Port Already in Use:**
```bash
# Check what's using the ports
netstat -tulpn | grep :5173
netstat -tulpn | grep :8000
netstat -tulpn | grep :8001

# Stop conflicting services or change ports in docker-compose.yml
```

**Docker Build Fails:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Services Won't Start:**
```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart api
```

**Memory Issues:**
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or reduce resource usage
docker-compose down
docker system prune
```

## 🏛️ System Architecture

### Core Services

#### 1. **Main API Service** (Port 8001)
- **Technology**: FastAPI + SQLite
- **Features**: User management, chicken groups, feeding records, performance analytics
- **Database**: 14-table relational schema with user isolation

#### 2. **AI Service** (Port 8000)
- **Technology**: FastAPI + AWS Bedrock
- **Features**: Intelligent feed recommendations, seasonal adjustments, breed optimization
- **AI Model**: Amazon Nova Pro for advanced nutritional analysis

#### 3. **Frontend Service** (Port 5173)
- **Technology**: React + Vite + Tailwind CSS
- **Features**: Interactive dashboard, real-time analytics, responsive design
- **Deployment**: Nginx with optimized production build

### Key Features

#### 🍽️ **Smart Feed Calculation**
- Precise daily feed requirements based on breed, age, weight, and environment
- Seasonal adjustments for optimal nutrition
- Cost optimization and waste reduction

#### 📈 **Performance Analytics**
- Real-time FCR monitoring
- Growth tracking with visual charts
- Cost analysis and ROI calculations
- Mortality rate tracking

#### 🏥 **Health Management**
- Disease detection and prevention
- Curative feed recommendations
- Vaccination tracking
- Health calendar integration

#### 👥 **Multi-User Support**
- Secure authentication with JWT tokens
- Data isolation between users
- Customizable user preferences
- Profile management system

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Core AI-powered feed recommendations
- ✅ Multi-user authentication system
- ✅ Disease management features
- ✅ Docker containerization

### Phase 2: Enhanced Intelligence (Q2 2025)
- 🔄 **Advanced AI Models**: Integration with multiple AI providers (OpenAI, Anthropic)
- 🔄 **Predictive Analytics**: Machine learning models for better growth prediction
- 🔄 **Smart Notifications**: Real-time alerts for health issues and feed adjustments
- 🔄 **Mobile App**: Native iOS and Android applications

### Phase 3: Scalability & Enterprise (Q3 2025)
- 📋 **Multi-Farm Management**: Support for large-scale operations
- 📋 **Advanced Reporting**: Comprehensive business intelligence dashboard
- 📋 **API Marketplace**: Third-party integrations and extensions
- 📋 **White-Label Solutions**: Customizable branding for resellers


### 🎯 Key Focus Areas

#### **Technology Evolution**
- **AI/ML Advancement**: Continuous improvement of recommendation algorithms
- **Performance Optimization**: Sub-100ms response times for all operations
- **Scalability**: Support for 10,000+ concurrent users
- **Security**: Zero-trust architecture with end-to-end encryption

