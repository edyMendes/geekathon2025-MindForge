// External API configuration
const API_CONFIG = {
  // API base URL (can be changed via environment variable)
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
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

export default API_CONFIG;
