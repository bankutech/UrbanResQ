import axios from 'axios';
import { getMockResponseForUrl } from './mockData';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

export const api = axios.create({ 
  baseURL: apiBase,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanresq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Detect when static hosting rewrote an API request to index.html (SPA catch-all)
    if (
      typeof res.data === 'string' &&
      (res.data.includes('<!doctype') || res.data.includes('<html') || res.data.includes('<head'))
    ) {
      const url = res.config?.url || '';
      const method = res.config?.method || 'get';
      console.warn(`[UrbanResQ] Static host rewrite intercepted for ${url}. Serving simulated telemetry.`);
      localStorage.setItem('urbanresq_simulated_mode', 'true');
      const mockData = getMockResponseForUrl(url, method);
      return {
        ...res,
        data: mockData,
      };
    }
    return res;
  },
  (err) => {
    // Do not intercept legitimate request abortions
    if (
      err.name === 'CanceledError' || 
      err.code === 'ERR_CANCELED' || 
      err.message === 'canceled'
    ) {
      return Promise.reject(err);
    }

    const url = err.config?.url || '';
    const method = err.config?.method || 'get';
    const status = err.response?.status;

    // Check whether the live backend is unreachable or rejected by static hosting (e.g. Vercel)
    const isUnreachable =
      !err.response ||
      status === 400 ||
      status === 404 ||
      status === 405 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      err.code === 'ERR_NETWORK' ||
      err.code === 'ECONNABORTED';

    if (isUnreachable && !url.includes('/auth/logout')) {
      let payload = undefined;
      try {
        payload = typeof err.config?.data === 'string' ? JSON.parse(err.config.data) : err.config?.data;
      } catch {
        payload = err.config?.data;
      }

      console.warn(`[UrbanResQ] EOC gateway offline or static host detected (${status || err.code}). Serving simulated telemetry for ${url}`);
      localStorage.setItem('urbanresq_simulated_mode', 'true');

      const mockData = getMockResponseForUrl(url, method, payload);
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK (Simulated EOC Telemetry)',
        headers: {},
        config: err.config,
      });
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('urbanresq_token');
      localStorage.removeItem('urbanresq_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err: any): string {
  if (err?.response?.data?.error?.message) {
    return err.response.data.error.message;
  }
  if (!err?.response) {
    if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
      return 'Unable to reach the Emergency Operations Center gateway. Please verify network connectivity.';
    }
    return 'Unable to connect to the EOC server. Please verify your connection.';
  }
  if (err.response.status === 401) {
    return 'Invalid operator credentials. Please verify your email and password.';
  }
  if (err.response.status === 403) {
    return 'Access denied. You do not have permission to perform this operational action.';
  }
  if (err.response.status === 404) {
    return 'The requested disaster operational record was not found.';
  }
  if (err.response.status === 429) {
    return 'Too many requests. Terminal rate-limited for security.';
  }
  if (err.response.status >= 500) {
    return 'Operations database or backend service encountered an internal error. Please retry shortly.';
  }
  return 'An unexpected error occurred during request processing. Please try again.';
}
