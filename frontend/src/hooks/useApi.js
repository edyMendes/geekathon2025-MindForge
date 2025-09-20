import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService.js';

// Hook para gerenciar estado de carregamento e erro
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, execute, clearError };
};

// Hook para autenticação
export const useAuth = () => {
  const { loading, error, execute } = useApiState();
  const [isAuthenticated, setIsAuthenticated] = useState(!!apiService.token);

  const login = useCallback(async (credentials) => {
    const result = await execute(() => apiService.login(credentials));
    if (result.success) {
      setIsAuthenticated(true);
    }
    return result;
  }, [execute]);

  const logout = useCallback(async () => {
    await execute(() => apiService.logout());
    setIsAuthenticated(false);
  }, [execute]);

  useEffect(() => {
    setIsAuthenticated(!!apiService.token);
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
    loading,
    error,
  };
};

// Hook para dados com cache
export const useApiData = (endpoint, params = {}, options = {}) => {
  const { loading, error, execute } = useApiState();
  const [data, setData] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const {
    cacheKey = endpoint,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    autoFetch = true,
  } = options;

  const fetchData = useCallback(async () => {
    // Verificar cache
    if (lastFetch && Date.now() - lastFetch < cacheTTL) {
      return data;
    }

    const result = await execute(() => apiService.get(endpoint, params));
    setData(result);
    setLastFetch(Date.now());
    return result;
  }, [endpoint, params, execute, cacheTTL, lastFetch, data]);

  const refetch = useCallback(() => {
    setLastFetch(null);
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchData,
  };
};

// Hook para operações CRUD
export const useApiCrud = (endpoint) => {
  const { loading, error, execute } = useApiState();

  const create = useCallback(async (data) => {
    return execute(() => apiService.post(endpoint, data));
  }, [endpoint, execute]);

  const read = useCallback(async (id, params = {}) => {
    const url = id ? `${endpoint}/${id}` : endpoint;
    return execute(() => apiService.get(url, params));
  }, [endpoint, execute]);

  const update = useCallback(async (id, data) => {
    return execute(() => apiService.put(`${endpoint}/${id}`, data));
  }, [endpoint, execute]);

  const remove = useCallback(async (id) => {
    return execute(() => apiService.delete(`${endpoint}/${id}`));
  }, [endpoint, execute]);

  return {
    create,
    read,
    update,
    remove,
    loading,
    error,
  };
};

// Hook para upload de arquivos
export const useFileUpload = () => {
  const { loading, error, execute } = useApiState();
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (endpoint, file) => {
    setProgress(0);
    return execute(() => apiService.upload(endpoint, file, setProgress));
  }, [execute]);

  return {
    upload,
    loading,
    error,
    progress,
  };
};

// Hook para múltiplas requisições
export const useMultipleRequests = () => {
  const { loading, error, execute } = useApiState();
  const [results, setResults] = useState({});

  const executeMultiple = useCallback(async (requests) => {
    const promises = Object.keys(requests).map(async (key) => {
      try {
        const result = await requests[key]();
        return { key, result, error: null };
      } catch (err) {
        return { key, result: null, error: err.message };
      }
    });

    const responses = await Promise.all(promises);
    const newResults = {};
    
    responses.forEach(({ key, result, error }) => {
      newResults[key] = { data: result, error };
    });

    setResults(newResults);
    return newResults;
  }, []);

  return {
    executeMultiple,
    results,
    loading,
    error,
  };
};
