const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};