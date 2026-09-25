import axios from 'axios';

/**
 * Shared axios instance. Base URL is injected from env so the same
 * build can target dev/staging/prod backends.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const apiClient = axios.create({
  baseURL: baseURL ?? 'http://localhost:8000',
  timeout: 30000,
});

// Attach (mocked) auth token when present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nca_token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export function isMockMode(): boolean {
  return (import.meta.env.VITE_USE_MOCK as string | undefined) !== 'false';
}

/** Normalize axios/backend errors into a human-readable message. */
export function toErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response) return `Request failed (${err.response.status})`;
    if (err.code === 'ECONNABORTED') return 'Request timed out. Try again.';
    return err.message || 'Network error. Is the backend running?';
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}
