import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Badge({ tone, children }: { tone?: string; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        tone ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
      )}
    >
      {children}
    </span>
  );
}