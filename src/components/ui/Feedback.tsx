import type { ReactNode } from 'react';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-gray-500">
      <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      {label}
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
      <div className="flex flex-col items-center gap-2">
        <p className="font-medium text-gray-800 dark:text-gray-100">{title}</p>
        {hint && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}