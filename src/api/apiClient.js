// src/api/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || 'http://127.0.0.1:8000';
export const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL || (import.meta.env.DEV ? 'http://localhost:5173' : '');

export const getAuthToken = () => {
  return localStorage.getItem('lbi_admin_token') || localStorage.getItem('lbi_auth_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('lbi_admin_token', token);
    localStorage.setItem('lbi_auth_token', token);
  } else {
    localStorage.removeItem('lbi_admin_token');
    localStorage.removeItem('lbi_auth_token');
  }
};

export const resolveImageUrl = (path, fallback = '') => {
  if (!path || typeof path !== 'string' || path.trim() === '') return fallback;
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) return clean;
  if (clean.startsWith('/')) return `${STORAGE_BASE_URL}${clean}`;
  return `${STORAGE_BASE_URL}/${clean}`;
};

export async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        setAuthToken(null);
        localStorage.removeItem('lbi_current_user');
      }
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[apiClient] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}
