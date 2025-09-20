import apiService from './apiService.js';
import { getApiUrl, getAuthConfig } from '../config/api.js';

// Serviço para gerenciamento de usuários
class UserService {
  constructor() {
    this.authConfig = getAuthConfig();
  }

  // Verificar se um usuário existe na API
  async checkUserExists(identifier) {
    try {
      const response = await fetch(getApiUrl(this.authConfig.CHECK_USER_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: identifier // pode ser email, username, ou ID
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          exists: true, 
          user: data.user,
          message: data.message || 'Usuário encontrado'
        };
      } else if (response.status === 404) {
        return { 
          exists: false, 
          user: null,
          message: 'Usuário não encontrado'
        };
      } else {
        const error = await response.json();
        return { 
          exists: false, 
          user: null,
          error: error.message || 'Erro ao verificar usuário'
        };
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      return { 
        exists: false, 
        user: null,
        error: 'Erro de conexão ao verificar usuário'
      };
    }
  }

  // Verificar se email está disponível para registro
  async checkEmailAvailability(email) {
    try {
      const response = await fetch(getApiUrl(`${this.authConfig.CHECK_USER_ENDPOINT}/email`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          available: data.available,
          message: data.message || 'Email disponível'
        };
      } else {
        const error = await response.json();
        return { 
          available: false,
          error: error.message || 'Erro ao verificar email'
        };
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return { 
        available: false,
        error: 'Erro de conexão ao verificar email'
      };
    }
  }

  // Verificar se username está disponível para registro
  async checkUsernameAvailability(username) {
    try {
      const response = await fetch(getApiUrl(`${this.authConfig.CHECK_USER_ENDPOINT}/username`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          available: data.available,
          message: data.message || 'Username disponível'
        };
      } else {
        const error = await response.json();
        return { 
          available: false,
          error: error.message || 'Erro ao verificar username'
        };
      }
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return { 
        available: false,
        error: 'Erro de conexão ao verificar username'
      };
    }
  }

  // Registrar novo usuário
  async registerUser(userData) {
    try {
      const response = await fetch(getApiUrl(this.authConfig.REGISTER_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          user: data.user,
          message: data.message || 'Usuário registrado com sucesso'
        };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Erro ao registrar usuário'
        };
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { 
        success: false, 
        error: 'Erro de conexão ao registrar usuário'
      };
    }
  }

  // Buscar informações do usuário por ID
  async getUserById(userId) {
    try {
      const response = await apiService.get(`/users/${userId}`);
      return { 
        success: true, 
        user: response 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao buscar usuário'
      };
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiService.put(`/users/${userId}`, profileData);
      return { 
        success: true, 
        user: response,
        message: 'Perfil atualizado com sucesso'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao atualizar perfil'
      };
    }
  }

  // Deletar usuário
  async deleteUser(userId) {
    try {
      await apiService.delete(`/users/${userId}`);
      return { 
        success: true, 
        message: 'Usuário deletado com sucesso'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao deletar usuário'
      };
    }
  }

  // Validar formato de email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar formato de username
  validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Validar força da senha
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  }
}

// Instância singleton
const userService = new UserService();

export default userService;
