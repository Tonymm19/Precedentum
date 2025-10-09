import { useCallback } from 'react';

import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const normalizedBase = API_BASE_URL.replace(/\/$/, '');
      const normalizedEndpoint = endpoint.startsWith('http')
        ? endpoint
        : `${normalizedBase}/${endpoint.replace(/^\//, '')}`;

      const headers = new Headers(options.headers ?? {});

      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }

      if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(normalizedEndpoint, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    },
    [token, logout],
  );

  return { apiFetch };
};
