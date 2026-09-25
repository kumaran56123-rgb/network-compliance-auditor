import type { Severity } from '../types/index.ts';

const ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export function compareSeverity(a: Severity, b: Severity): number {
  return ORDER[a] - ORDER[b];
}

export function formatPct(n: number): string {
  return `${Math.round(n)}%`;
}

export function severityTone(sev: Severity): string {
  switch (sev) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
  }
}

/** Build a CSV string from findings (used by Reports page fallback). */
export function findingsToCsv(rows: { device: string; rule: string; severity: string; category: string }[]): string {
  const head = 'device,rule,severity,category';
  return [head, ...rows.map((r) => [r.device, r.rule, r.severity, r.category].join(','))].join('\n');
}

/** Copy text to clipboard with graceful fallback (no-op on permission denial). */
export async function copyFix(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
export const copyText = copyFix;
