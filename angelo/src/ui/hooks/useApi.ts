import { useCallback } from 'react';

const BASE = '';

export function useApi() {
  const getToken = useCallback(() => localStorage.getItem('angelo_token'), []);

  const api = useCallback(
    (url: string, options?: RequestInit) => {
      const token = getToken();
      const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string>),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (options?.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      return fetch(`${BASE}${url}`, { ...options, headers });
    },
    [getToken],
  );

  return api;
}
