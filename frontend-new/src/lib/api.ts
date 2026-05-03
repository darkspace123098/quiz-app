const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Ensure base URL doesn't have a trailing slash and endpoint has a leading slash
  const cleanBase = API_BASE_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = cleanBase ? `${cleanBase}${cleanEndpoint}` : cleanEndpoint;

  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};