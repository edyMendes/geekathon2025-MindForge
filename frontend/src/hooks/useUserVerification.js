import { useState, useCallback } from 'react';
import userService from '../services/userService.js';

// Hook for user verification
export const useUserVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(null);
  const [userData, setUserData] = useState(null);

  const checkUser = useCallback(async (identifier) => {
    setLoading(true);
    setError(null);
    setUserExists(null);
    setUserData(null);

    try {
      const result = await userService.checkUserExists(identifier);
      
      if (result.error) {
        setError(result.error);
        setUserExists(false);
        return { exists: false, error: result.error };
      }

      setUserExists(result.exists);
      setUserData(result.user);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error verifying user';
      setError(errorMessage);
      setUserExists(false);
      return { exists: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setUserExists(null);
    setUserData(null);
  }, []);

  return {
    loading,
    error,
    userExists,
    userData,
    checkUser,
    clearError,
    reset
  };
};

    // Hook for email/username availability check
export const useAvailabilityCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const checkEmail = useCallback(async (email) => {
    if (!userService.validateEmail(email)) {
      setError('Invalid email format');
      setEmailAvailable(false);
      return { available: false, error: 'Invalid email format' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userService.checkEmailAvailability(email);
      
      if (result.error) {
        setError(result.error);
        setEmailAvailable(false);
        return { available: false, error: result.error };
      }

      setEmailAvailable(result.available);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error verifying email';
      setError(errorMessage);
      setEmailAvailable(false);
      return { available: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUsername = useCallback(async (username) => {
    if (!userService.validateUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers and _');
      setUsernameAvailable(false);
      return { available: false, error: 'Invalid username format' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userService.checkUsernameAvailability(username);
      
      if (result.error) {
        setError(result.error);
        setUsernameAvailable(false);
        return { available: false, error: result.error };
      }

      setUsernameAvailable(result.available);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error verifying username';
      setError(errorMessage);
      setUsernameAvailable(false);
      return { available: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setEmailAvailable(null);
    setUsernameAvailable(null);
  }, []);

  return {
    loading,
    error,
    emailAvailable,
    usernameAvailable,
    checkEmail,
    checkUsername,
    clearError,
    reset
  };
};

// Hook for user registration
export const useUserRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate data before sendingß
    if (!userService.validateEmail(userData.email)) {
      setError('Invalid email');
      setLoading(false);
      return { success: false, error: 'Invalid email' };
    }

    if (!userService.validateUsername(userData.username)) {
      setError('Invalid username');
      setLoading(false);
      return { success: false, error: 'Invalid username' };
    }

    const passwordValidation = userService.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      setLoading(false);
      return { success: false, error: 'Password does not meet requirements' };
    }

    try {
      const result = await userService.registerUser(userData);
      
      if (result.success) {
        setSuccess(true);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMessage = err.message || 'Error registering user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    register,
    clearError,
    reset
  };
};

// Hook for form validation
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((field, value) => {
    let error = null;

    switch (field) {
      case 'email':
        if (!value) {
            error = 'Email is required';
        } else if (!userService.validateEmail(value)) {
          error = 'Invalid email format';
        }
        break;

      case 'username':
        if (!value) {
          error = 'Username is required';
        } else if (!userService.validateUsername(value)) {
          error = 'Username must be 3-20 characters and contain only letters, numbers and _';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else {
          const validation = userService.validatePassword(value);
          if (!validation.isValid) {
            error = 'Password must be at least 8 characters, including uppercase, lowercase and numbers';
          }
        }
        break;

      case 'confirmPassword':
        // This field will be validated together with passwordß
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  }, []);

  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let isValid = true;

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!userService.validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Validate username
    if (!formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!userService.validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers and _';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      const passwordValidation = userService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must be at least 8 characters, including uppercase, lowercase and numbers';
        isValid = false;
      }
    }

    // Validate confirm password
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, []);

  const clearError = useCallback((field) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError
  };
};
