import { Button } from '../components/ui/Button.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';

/** Fallback for unmatched routes; provides a clear path back to a valid page. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-6xl font-bold text-gray-300">404</h1>
      <EmptyState title="Page not found" hint="The URL you visited doesn't match any route in NetAudit.">
        <a href="/dashboard">
          <Button>Go to Dashboard</Button>
        </a>
      </EmptyState>
    </div>
  );
}