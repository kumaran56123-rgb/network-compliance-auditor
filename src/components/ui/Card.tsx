import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Card({
  title,
  subtitle,
  children,
  className,
  role,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  role?: string;
}) {
  return (
    <section
      {...(role ? { role } : {})}
      className={clsx(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {title && <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>}
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
