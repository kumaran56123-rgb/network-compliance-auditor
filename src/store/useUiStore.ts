import { create } from 'zustand';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  text: string;
}

interface UiState {
  toasts: Toast[];
  theme: 'light' | 'dark' | 'system';
  auditorOpen: boolean;
  pushToast: (kind: Toast['kind'], text: string) => void;
  dismissToast: (id: number) => void;
  setTheme: (t: UiState['theme']) => void;
  setAuditorOpen: (open: boolean) => void;
}

let nextId = 1;

function initialTheme(): UiState['theme'] {
  const saved = localStorage.getItem('nca_theme');
  return saved === 'dark' || saved === 'light' ? saved : 'system';
}

/** Global UI concerns: toasts, theme, and the floating Ask-the-Auditor drawer. */
export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  theme: initialTheme(),
  auditorOpen: false,
  pushToast: (kind, text) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setTheme: (theme) => {
    localStorage.setItem('nca_theme', theme);
    set({ theme });
  },
  setAuditorOpen: (auditorOpen) => set({ auditorOpen }),
}));

/** Apply theme to <html> — call once in main.tsx + on theme change. */
export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  const dark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
}
