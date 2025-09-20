import { useState, useCallback } from 'react';
import userService from '../services/userService.js';

// Hook para verificação de usuários
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
      const errorMessage = err.message || 'Erro ao verificar usuário';
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

// Hook para verificação de disponibilidade de email/username
export const useAvailabilityCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const checkEmail = useCallback(async (email) => {
    if (!userService.validateEmail(email)) {
      setError('Formato de email inválido');
      setEmailAvailable(false);
      return { available: false, error: 'Formato de email inválido' };
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
      const errorMessage = err.message || 'Erro ao verificar email';
      setError(errorMessage);
      setEmailAvailable(false);
      return { available: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUsername = useCallback(async (username) => {
    if (!userService.validateUsername(username)) {
      setError('Username deve ter 3-20 caracteres e conter apenas letras, números e _');
      setUsernameAvailable(false);
      return { available: false, error: 'Formato de username inválido' };
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
      const errorMessage = err.message || 'Erro ao verificar username';
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

// Hook para registro de usuários
export const useUserRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validar dados antes de enviar
    if (!userService.validateEmail(userData.email)) {
      setError('Email inválido');
      setLoading(false);
      return { success: false, error: 'Email inválido' };
    }

    if (!userService.validateUsername(userData.username)) {
      setError('Username inválido');
      setLoading(false);
      return { success: false, error: 'Username inválido' };
    }

    const passwordValidation = userService.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      setError('Senha não atende aos requisitos');
      setLoading(false);
      return { success: false, error: 'Senha não atende aos requisitos' };
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
      const errorMessage = err.message || 'Erro ao registrar usuário';
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

// Hook para validação de formulários
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((field, value) => {
    let error = null;

    switch (field) {
      case 'email':
        if (!value) {
          error = 'Email é obrigatório';
        } else if (!userService.validateEmail(value)) {
          error = 'Formato de email inválido';
        }
        break;

      case 'username':
        if (!value) {
          error = 'Username é obrigatório';
        } else if (!userService.validateUsername(value)) {
          error = 'Username deve ter 3-20 caracteres e conter apenas letras, números e _';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Senha é obrigatória';
        } else {
          const validation = userService.validatePassword(value);
          if (!validation.isValid) {
            error = 'Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números';
          }
        }
        break;

      case 'confirmPassword':
        // Este campo será validado em conjunto com password
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

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!userService.validateEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
      isValid = false;
    }

    // Validar username
    if (!formData.username) {
      newErrors.username = 'Username é obrigatório';
      isValid = false;
    } else if (!userService.validateUsername(formData.username)) {
      newErrors.username = 'Username deve ter 3-20 caracteres e conter apenas letras, números e _';
      isValid = false;
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else {
      const passwordValidation = userService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números';
        isValid = false;
      }
    }

    // Validar confirmação de senha
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
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
