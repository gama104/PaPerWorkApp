import { useState, useCallback } from 'react';
import type { ApiError } from '../types/ModalTypes';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await apiCall();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options?.successMessage) {
        setSuccess(options.successMessage);
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }

      return result;
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        status: (err as any)?.status || 500,
        details: err
      };

      setError(apiError.message);
      
      if (options?.onError) {
        options.onError(apiError);
      }

      // Auto-clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    execute,
    clearError,
    clearSuccess,
    clearMessages
  };
};

export default useApi;
