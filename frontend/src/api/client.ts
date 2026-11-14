import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanresq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
