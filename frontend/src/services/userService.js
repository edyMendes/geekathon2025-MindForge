  import apiService from './apiService.js';
import { getApiUrl, getAuthConfig } from '../config/api.js';

// Service for user management
class UserService {
  constructor() {
    this.authConfig = getAuthConfig();
  }

  // Check if a user exists in the API
  async checkUserExists(identifier) {
    try {
      const response = await fetch(getApiUrl(this.authConfig.CHECK_USER_ENDPOINT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: identifier // can be email, username, or ID
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          exists: true, 
          user: data.user,
          message: data.message || 'User found'
        };
      } else if (response.status === 404) {
        return { 
          exists: false, 
          user: null,
          message: 'User not found'
        };
      } else {
        const error = await response.json();
        return { 
          exists: false, 
          user: null,
          error: error.message || 'Error checking user'
        };
      }
    } catch (error) {
      console.error('Error checking user:', error);
      return { 
        exists: false, 
        user: null,
        error: 'Connection error while checking user'
      };
    }
  }

  // Check if email is available for registration
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
          message: data.message || 'Email available'
        };
      } else {
        const error = await response.json();
        return { 
          available: false,
          error: error.message || 'Error checking email'
        };
      }
    } catch (error) {
      console.error('Error checking email:', error);
      return { 
        available: false,
        error: 'Connection error while checking email'
      };
    }
  }

  // Check if username is available for registration
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
          message: data.message || 'Username available'
        };
      } else {
        const error = await response.json();
        return { 
          available: false,
          error: error.message || 'Error checking username'
        };
      }
    } catch (error) {
      console.error('Error checking username:', error);
      return { 
        available: false,
        error: 'Connection error while checking username'
      };
    }
  }

  // Register new user
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
          message: data.message || 'User registered successfully'
        };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Error registering user'
        };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return { 
        success: false, 
        error: 'Connection error while registering user'
      };
    }
  }

  // Get user information by ID
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
        error: error.message || 'Error fetching user'
      };
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const response = await apiService.put(`/users/${userId}`, profileData);
      return { 
        success: true, 
        user: response,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Error updating profile'
      };
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      await apiService.delete(`/users/${userId}`);
      return { 
        success: true, 
        message: 'User deleted successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Error deleting user'
      };
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate username format
  validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Validate password strength
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

// Singleton instance
const userService = new UserService();

export default userService;
