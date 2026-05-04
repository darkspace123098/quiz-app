export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getApiUrl = (endpoint: string) => {
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return cleanBase ? `${cleanBase}${cleanEndpoint}` : cleanEndpoint;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);

  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};