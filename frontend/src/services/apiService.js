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

  // Método para definir o token de autenticação
  setToken(token, refreshToken = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('api_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Método para limpar tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('api_token');
    localStorage.removeItem('refresh_token');
  }

  // Método para obter headers de autenticação
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers[this.authConfig.HEADER_NAME] = `${this.authConfig.TOKEN_PREFIX}${this.token}`;
    }

    return headers;
  }

  // Método para fazer requisições com retry
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

      // Se a resposta não é ok e deve ser retentada
      if (!response.ok && this.retryConfig.RETRY_ON.includes(response.status) && attempt < this.retryConfig.MAX_ATTEMPTS) {
        await this.delay(this.retryConfig.DELAY * attempt);
        return this.makeRequest(url, options, attempt + 1);
      }

      // Se token expirado, tentar refresh
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

  // Método para delay entre tentativas
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método para refresh do token
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
      console.error('Erro ao renovar token:', error);
    }

    this.clearTokens();
    return false;
  }

  // Método para verificar se usuário existe antes do login
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
        return { success: false, error: error.message || 'Erro ao verificar usuário' };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão ao verificar usuário' };
    }
  }

  // Método para login com verificação de usuário
  async login(credentials) {
    try {
      // Primeiro verificar se o usuário existe
      const userCheck = await this.checkUserExists(credentials.username || credentials.email);
      
      if (!userCheck.success) {
        return { success: false, error: userCheck.error };
      }

      if (!userCheck.exists) {
        return { 
          success: false, 
          error: 'Usuário não encontrado',
          userNotFound: true 
        };
      }

      // Se usuário existe, proceder com login
      const response = await fetch(getApiUrl(this.authConfig.LOGIN_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token, data.refresh_token);
        return { 
          success: true, 
          data: {
            ...data,
            user: userCheck.user
          }
        };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Credenciais inválidas',
          invalidCredentials: true 
        };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Método para logout
  async logout() {
    try {
      if (this.token) {
        await this.makeRequest(getApiUrl(this.authConfig.LOGOUT_ENDPOINT), {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Métodos CRUD genéricos
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

  // Método para upload de arquivos
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

// Instância singleton do serviço
const apiService = new ApiService();

export default apiService;
