// External API configuration
const API_CONFIG = {
  // API base URL (can be changed via environment variable)
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // Bedrock API base URL for AI services
  BEDROCK_API_BASE_URL: import.meta.env.VITE_BEDROCK_API_BASE_URL,
  
  // Authentication settings
  AUTH: {
    // Authentication type (bearer, basic, api-key, etc.)
    TYPE: 'bearer',
    // Header name for token (ex: 'Authorization', 'X-API-Key')
    HEADER_NAME: 'Authorization',
    // Token prefix (ex: 'Bearer ', 'Token ')
    TOKEN_PREFIX: 'Bearer ',
    // Endpoint to check if user exists
    CHECK_USER_ENDPOINT: '/users/check-username',
    // Login endpoint
    LOGIN_ENDPOINT: '/users/login',
    // Refresh token endpoint
    REFRESH_ENDPOINT: '/auth/refresh',
    // Logout endpoint
    LOGOUT_ENDPOINT: '/auth/logout',
    // Register new user endpoint
    REGISTER_ENDPOINT: '/users/register',
  },
  
  // Timeout settings
  TIMEOUT: {
    // Request timeout in ms
    REQUEST: 10000,
    // File upload timeout in ms
    UPLOAD: 30000,
  },
  
  // Retry settings
  RETRY: {
    // Maximum number of attempts
    MAX_ATTEMPTS: 3,
    // Delay between attempts in ms
    DELAY: 1000,
    // Status codes that should be retried
    RETRY_ON: [408, 429, 500, 502, 503, 504],
  },
  
  // Application specific endpoints
  ENDPOINTS: {
    // Example endpoints for your chicken project
    CHICKENS: '/chickens',
    FEEDS: '/feeds',
    REPORTS: '/reports',
    PROFILES: '/chicken-profiles',
    ANALYTICS: '/analytics',
  },
  
  // Bedrock AI API endpoints
  BEDROCK_ENDPOINTS: {
    // AI model endpoints
    CHAT_COMPLETION: '/chat/completions',
    TEXT_GENERATION: '/text/generation',
    EMBEDDINGS: '/embeddings',
    IMAGE_GENERATION: '/image/generation',
    
    // Chicken Feed Advisor API endpoints
    RECOMMEND_FEED: '/recommend-feed',
    CALCULATE_FEED: '/calculate-feed',
    WEEKLY_RECIPES: '/weekly-recipes',
    HEALTH_CHECK: '/health',
    AUTH_INFO: '/auth/info',
    AUTH_VALIDATE: '/auth/validate',
    SEASONS: '/seasons',
    
    // Legacy AI services for chicken farming
    FEED_RECOMMENDATION: '/ai/feed-recommendation',
    HEALTH_ANALYSIS: '/ai/health-analysis',
    GROWTH_PREDICTION: '/ai/growth-prediction',
    DISEASE_DETECTION: '/ai/disease-detection',
    OPTIMAL_FORMULATION: '/ai/optimal-formulation',
  },
  
  // Cache settings
  CACHE: {
    // Cache time in ms (5 minutes by default)
    TTL: 5 * 60 * 1000,
    // Cache keys
    KEYS: {
      USER_PROFILE: 'user_profile',
      CHICKEN_DATA: 'chicken_data',
      FEED_RECOMMENDATIONS: 'feed_recommendations',
    }
  }
};

// Function to get the complete URL of an endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Function to get authentication settings
export const getAuthConfig = () => API_CONFIG.AUTH;

// Function to get timeout settings
export const getTimeoutConfig = () => API_CONFIG.TIMEOUT;

// Function to get retry settings
export const getRetryConfig = () => API_CONFIG.RETRY;

// Function to get endpoints
export const getEndpoints = () => API_CONFIG.ENDPOINTS;

// Function to get cache settings
export const getCacheConfig = () => API_CONFIG.CACHE;

// Function to get Bedrock API base URL
export const getBedrockBaseUrl = () => API_CONFIG.BEDROCK_API_BASE_URL;

// Function to get Bedrock endpoints
export const getBedrockEndpoints = () => API_CONFIG.BEDROCK_ENDPOINTS;

// Function to get complete Bedrock API URL for an endpoint
export const getBedrockApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BEDROCK_API_BASE_URL?.replace(/\/$/, '') || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Function to check if Bedrock API is configured
export const isBedrockConfigured = () => {
  return !!API_CONFIG.BEDROCK_API_BASE_URL;
};

export default API_CONFIG;
