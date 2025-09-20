import { getApiUrl, getAuthConfig, getTimeoutConfig, getRetryConfig } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = getApiUrl('');
    this.authConfig = getAuthConfig();
    this.timeoutConfig = getTimeoutConfig();
    this.retryConfig = getRetryConfig();
    this.token = localStorage.getItem('api_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  // Method to set authentication token
  setToken(token, refreshToken = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('api_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Method to clear tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('api_token');
    localStorage.removeItem('refresh_token');
  }

  // Method to get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers[this.authConfig.HEADER_NAME] = `${this.authConfig.TOKEN_PREFIX}${this.token}`;
    }

    return headers;
  }

  // Method to make requests with retry
  async makeRequest(url, options = {}, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutConfig.REQUEST);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // If response is not ok and should be retried
      if (!response.ok && this.retryConfig.RETRY_ON.includes(response.status) && attempt < this.retryConfig.MAX_ATTEMPTS) {
        await this.delay(this.retryConfig.DELAY * attempt);
        return this.makeRequest(url, options, attempt + 1);
      }

      // If token expired, try refresh
      if (response.status === 401 && this.refreshToken && attempt === 1) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          return this.makeRequest(url, options, attempt + 1);
        }
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (attempt < this.retryConfig.MAX_ATTEMPTS) {
        await this.delay(this.retryConfig.DELAY * attempt);
        return this.makeRequest(url, options, attempt + 1);
      }
      
      throw error;
    }
  }

  // Method for delay between attempts
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to refresh token
  async refreshAuthToken() {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(getApiUrl(this.authConfig.REFRESH_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }

    this.clearTokens();
    return false;
  }

  // Method to check if user exists before login
  async checkUserExists(identifier) {
    try {
      const response = await fetch(getApiUrl(this.authConfig.CHECK_USER_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, exists: true, user: data.user };
      } else if (response.status === 404) {
        return { success: true, exists: false, user: null };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Error checking user' };
      }
    } catch (error) {
      return { success: false, error: 'Connection error while checking user' };
    }
  }

  // Method for login with user verification
  async login(credentials) {
    try {
      // First check if user exists
      const userCheck = await this.checkUserExists(credentials.username || credentials.email);
      
      if (!userCheck.success) {
        return { success: false, error: userCheck.error };
      }

      if (!userCheck.exists) {
        return { 
          success: false, 
          error: 'User not found',
          userNotFound: true 
        };
      }

      // If user exists, proceed with login
      const response = await fetch(getApiUrl(this.authConfig.LOGIN_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        // Generate a simple session token since our API doesn't provide JWT tokens
        const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.setToken(sessionToken);
        return { 
          success: true, 
          data: {
            ...data,
            user: userCheck.user,
            access_token: sessionToken
          }
        };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Invalid credentials',
          invalidCredentials: true 
        };
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  }

  // Method for logout
  async logout() {
    try {
      if (this.token) {
        await this.makeRequest(getApiUrl(this.authConfig.LOGOUT_ENDPOINT), {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Generic CRUD methods
  async get(endpoint, params = {}) {
    const url = new URL(getApiUrl(endpoint));
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await this.makeRequest(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async post(endpoint, data = {}) {
    const response = await this.makeRequest(getApiUrl(endpoint), {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async put(endpoint, data = {}) {
    const response = await this.makeRequest(getApiUrl(endpoint), {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint) {
    const response = await this.makeRequest(getApiUrl(endpoint), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
    }

    return response.json();
  }

  // Method for file upload
  async upload(endpoint, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutConfig.UPLOAD);

    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          [this.authConfig.HEADER_NAME]: `${this.authConfig.TOKEN_PREFIX}${this.token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Singleton service instance
const apiService = new ApiService();

export default apiService;
