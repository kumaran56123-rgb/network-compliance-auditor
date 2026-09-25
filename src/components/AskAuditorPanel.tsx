import { useState } from 'react';
import { useAskAuditor } from '../hooks/useAskAuditor.ts';
import { Button } from './ui/Button.tsx';
import { Input, FieldLabel } from './ui/Input.tsx';
import { Card } from './ui/Card.tsx';

/**
 * Chat-style "Ask the Auditor" panel. Sends { question, auditId,
 * findingId, context } to POST /api/auditor/ask; currently stubbed
 * via mock mode until the LLM service lands.
 */
export function AskAuditorPanel({
  auditId,
  findingId,
  context,
}: {
  auditId?: string;
  findingId?: string;
  context?: string;
}) {
  const { messages, loading, error, ask } = useAskAuditor({ auditId, findingId });
  const [draft, setDraft] = useState('');

  return (
    <Card title="Ask the Auditor" subtitle="AI explanations grounded in this audit's findings">
      <div
        aria-live="polite"
        className="mb-3 max-h-64 space-y-2 overflow-y-auto rounded-md bg-gray-50 p-3 dark:bg-gray-800/50"
      >
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            e.g. “Why is missing logging buffered critical?” or “How do I fix weak ciphers on this device?”
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-white dark:bg-gray-900 border dark:border-gray-700'}`}
          >
            <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">{m.role}</span>
            {m.text}
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Auditor is thinking…</p>}
      </div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft, { auditId, findingId, context });
          setDraft('');
        }}
        className="flex gap-2"
      >
        <div className="flex-1">
          <FieldLabel htmlFor="auditor-q">Your question</FieldLabel>
          <Input
            id="auditor-q"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about a finding, rule, or fix…"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" loading={loading}>
            Ask
          </Button>
        </div>
      </form>
    </Card>
  );
}
