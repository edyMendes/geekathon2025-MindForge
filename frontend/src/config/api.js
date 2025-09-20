// Configuração da API externa
const API_CONFIG = {
  // URL base da API (pode ser alterada via variável de ambiente)
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // Configurações de autenticação
  AUTH: {
    // Tipo de autenticação (bearer, basic, api-key, etc.)
    TYPE: 'bearer',
    // Nome do header para o token (ex: 'Authorization', 'X-API-Key')
    HEADER_NAME: 'Authorization',
    // Prefixo do token (ex: 'Bearer ', 'Token ')
    TOKEN_PREFIX: 'Bearer ',
    // Endpoint para verificar se usuário existe
    CHECK_USER_ENDPOINT: '/auth/check-user',
    // Endpoint para login
    LOGIN_ENDPOINT: '/auth/login',
    // Endpoint para refresh token
    REFRESH_ENDPOINT: '/auth/refresh',
    // Endpoint para logout
    LOGOUT_ENDPOINT: '/auth/logout',
    // Endpoint para registrar novo usuário
    REGISTER_ENDPOINT: '/auth/register',
  },
  
  // Configurações de timeout
  TIMEOUT: {
    // Timeout para requisições em ms
    REQUEST: 10000,
    // Timeout para upload de arquivos em ms
    UPLOAD: 30000,
  },
  
  // Configurações de retry
  RETRY: {
    // Número máximo de tentativas
    MAX_ATTEMPTS: 3,
    // Delay entre tentativas em ms
    DELAY: 1000,
    // Status codes que devem ser retentados
    RETRY_ON: [408, 429, 500, 502, 503, 504],
  },
  
  // Endpoints específicos da aplicação
  ENDPOINTS: {
    // Exemplo de endpoints para o seu projeto de galinhas
    CHICKENS: '/chickens',
    FEEDS: '/feeds',
    REPORTS: '/reports',
    PROFILES: '/profiles',
    ANALYTICS: '/analytics',
  },
  
  // Configurações de cache
  CACHE: {
    // Tempo de cache em ms (5 minutos por padrão)
    TTL: 5 * 60 * 1000,
    // Chaves para cache
    KEYS: {
      USER_PROFILE: 'user_profile',
      CHICKEN_DATA: 'chicken_data',
      FEED_RECOMMENDATIONS: 'feed_recommendations',
    }
  }
};

// Função para obter a URL completa de um endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove barra final
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Função para obter configurações de autenticação
export const getAuthConfig = () => API_CONFIG.AUTH;

// Função para obter configurações de timeout
export const getTimeoutConfig = () => API_CONFIG.TIMEOUT;

// Função para obter configurações de retry
export const getRetryConfig = () => API_CONFIG.RETRY;

// Função para obter endpoints
export const getEndpoints = () => API_CONFIG.ENDPOINTS;

// Função para obter configurações de cache
export const getCacheConfig = () => API_CONFIG.CACHE;

export default API_CONFIG;
