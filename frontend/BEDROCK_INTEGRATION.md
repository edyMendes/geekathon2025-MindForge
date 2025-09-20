# Bedrock API Integration

This document explains how the frontend integrates with the Bedrock API for feed calculations.

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```env
# Main API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Bedrock API Configuration
VITE_BEDROCK_API_BASE_URL=http://localhost:8001
VITE_BEDROCK_TOKEN=your_bedrock_token_here
```

### API Endpoints

The following Bedrock API endpoints are configured:

- `CALCULATE_FEED: '/calculate-feed'` - Detailed feed calculations
- `RECOMMEND_FEED: '/recommend-feed'` - Feed recommendations
- `WEEKLY_RECIPES: '/weekly-recipes'` - Weekly recipe calendar
- `HEALTH_CHECK: '/health'` - API health check
- `AUTH_INFO: '/auth/info'` - Authentication information
- `AUTH_VALIDATE: '/auth/validate'` - Validate credentials
- `SEASONS: '/seasons'` - Current season information

## How It Works

### 1. Feed Calculation Flow

1. User fills out the chicken form
2. Form data is transformed to Bedrock API format
3. Request is sent to `/calculate-feed` endpoint
4. Response is transformed back to frontend format
5. If Bedrock API fails, falls back to local calculations

### 2. Data Transformation

**Frontend to Bedrock:**
```javascript
{
  count: 50,
  breed: 'Rhode Island Red',
  average_weight_kg: 2.5,
  age_weeks: 20,
  environment: 'free range',
  purpose: 'eggs',
  season: 'spring'
}
```

**Bedrock to Frontend:**
```javascript
{
  form: originalFormData,
  perChicken: 120, // grams
  totalKg: 6.0,
  times: ['07:00', '17:00'],
  mealsPerDay: 2,
  quantityPerMeal: 60,
  storageRecommendations: [...],
  recommendations: {...},
  // ... other fields
}
```

### 3. Error Handling

- **Bedrock API unavailable**: Falls back to local calculations
- **Invalid response**: Shows error message to user
- **Network errors**: Displays user-friendly error message

## Usage Examples

### Basic Feed Calculation

```javascript
import bedrockApiService from '../services/bedrockApiService.js';

const chickenData = {
  breed: 'rhode_island',
  age: '20',
  weight: '2.5',
  quantity: '50',
  environment: 'free_range',
  season: 'spring',
  purpose: 'eggs'
};

try {
  const result = await bedrockApiService.calculateFeed(chickenData);
  console.log(result);
} catch (error) {
  console.error('Calculation failed:', error);
}
```

### Health Check

```javascript
try {
  const health = await bedrockApiService.healthCheck();
  console.log('Bedrock API status:', health.status);
} catch (error) {
  console.error('Health check failed:', error);
}
```

## Components Updated

### ChickenForm.jsx
- Added loading state during API calls
- Integrated Bedrock API with fallback to local calculations
- Added error handling and user feedback

### Recommendations.jsx
- Enhanced to display Bedrock-specific data
- Added storage recommendations section
- Improved meals per day calculation

### bedrockApiService.js
- New service for all Bedrock API interactions
- Data transformation between frontend and API formats
- Error handling and retry logic

## Testing

To test the integration:

1. Start the Bedrock API server
2. Set the environment variables
3. Fill out the chicken form
4. Click "Calculate Recommendations"
5. Verify the data comes from Bedrock API
6. Test fallback by stopping the Bedrock API server

## Troubleshooting

### Common Issues

1. **"Bedrock API is not configured"**
   - Set `VITE_BEDROCK_API_BASE_URL` environment variable

2. **"Bedrock API Error: 401"**
   - Check your `VITE_BEDROCK_TOKEN` or set token in localStorage

3. **"Bedrock API Error: 500"**
   - Check Bedrock API server logs
   - Verify the API is running and accessible

4. **Falling back to local calculations**
   - This is normal behavior when Bedrock API is unavailable
   - Check network connectivity and API server status
