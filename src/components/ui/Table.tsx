import type { ReactNode } from 'react';

/** Accessible, responsive table primitive with sticky header + horizontal scroll. */
export function Table({
  headers,
  children,
  caption,
}: {
  headers: string[];
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="thin-scroll overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50 dark:bg-gray-800/60">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {children}
        </tbody>
      </table>
    </div>
  );
}
