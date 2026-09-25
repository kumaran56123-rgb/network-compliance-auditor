import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

/**
 * Mocked auth. Login stores a fake bearer token in localStorage so
 * apiClient can attach it; ProtectedRoute gates private pages.
 * Replace login() with a real POST /api/auth/login later.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('nca_token'),
  username: localStorage.getItem('nca_user'),
  login: (username) => {
    const token = `mock-token-${Date.now()}`;
    localStorage.setItem('nca_token', token);
    localStorage.setItem('nca_user', username);
    set({ token, username });
  },
  logout: () => {
    localStorage.removeItem('nca_token');
    localStorage.removeItem('nca_user');
    set({ token: null, username: null });
  },
}));
