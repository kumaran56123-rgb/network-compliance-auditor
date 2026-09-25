import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useUiStore, applyTheme } from '../store/useUiStore.ts';
import { Button } from './ui/Button.tsx';

const links = [
  { to: '/upload', label: 'Upload' },
  { to: '/configure', label: 'Configure' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/compare', label: 'Compare' },
  { to: '/reports', label: 'Reports' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { theme, setTheme, auditorOpen, setAuditorOpen } = useUiStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const cycleTheme = () => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-white">
        Skip to content
      </a>
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-bold tracking-tight">
            🛡️ NetAudit <span className="font-normal text-gray-500">AI Compliance</span>
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  clsx(
                    'rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={`Theme: ${theme}. Click to cycle.`}
              title="Cycle theme"
              className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? '☀️ Light' : theme === 'dark' ? '🌙 Dark' : '💻 System'}
            </button>
            <span className="hidden text-xs text-gray-400 sm:inline">Mock backend</span>
            <Button
              variant="secondary"
              onClick={() => setAuditorOpen(!auditorOpen)}
              aria-expanded={auditorOpen}
              aria-controls="auditor-drawer"
            >
              💬 Ask Auditor
            </Button>
</div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 pb-20">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
        NetAudit AI Compliance Auditor · Frontend scaffold for backend/ML handoff ·{' '}
        <a href="https://github.com/example/nca" target="_blank" rel="noreferrer" className="underline">
          Contract docs
        </a>
      </footer>
    </div>
  );
}