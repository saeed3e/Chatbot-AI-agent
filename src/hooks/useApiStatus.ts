import { useState, useEffect } from 'react';
import { ApiService } from '../services/api.service';

export type ApiStatus = 'checking' | 'valid' | 'invalid';

interface UseApiStatusResult {
  status: ApiStatus;
  isVisible: boolean;
}

export const useApiStatus = (apiKey: string, onInvalidKey?: () => void): UseApiStatusResult => {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      setStatus('invalid');
      return;
    }

    const validateApiKey = async () => {
      const apiService = ApiService.getInstance();
      const isValid = await apiService.validateApiKey(apiKey);

      if (isValid) {
        setStatus('valid');
        setTimeout(() => setIsVisible(false), 5000);
      } else {
        setStatus('invalid');
        onInvalidKey?.();
      }
    };

    validateApiKey();
  }, [apiKey, onInvalidKey]);

  return { status, isVisible };
};
