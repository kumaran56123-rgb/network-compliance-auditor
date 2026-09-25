import { useUiStore } from '../../store/useUiStore.ts';
import { clsx } from 'clsx';

/** Stacked toast notifications (success/error/info), auto-dismissing. */
export function Toaster() {
  const { toasts, dismissToast } = useUiStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === 'error' ? 'alert' : 'status'}
          className={clsx(
            'pointer-events-auto flex items-start justify-between gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
            t.kind === 'success' && 'border-green-200 bg-green-50 text-green-900',
            t.kind === 'error' && 'border-red-200 bg-red-50 text-red-900',
            t.kind === 'info' && 'border-blue-200 bg-blue-50 text-blue-900',
          )}
        >
          <span>{t.text}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="font-bold opacity-60 hover:opacity-100"
            onClick={() => dismissToast(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
