import { useState } from 'react';
import { askAuditor } from '../api/audits.ts';
import { toErrorMessage } from '../api/client.ts';

export interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
}

/** Chat-style Q&A over audit context; stubbed to mock backend until LLM lands. */
export function useAskAuditor(defaultContext?: { auditId?: string; findingId?: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(question: string, ctx?: { auditId?: string; findingId?: string; context?: string }) {
    const q = question.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    setError(null);
    try {
      const res = await askAuditor({
        question: q,
        auditId: ctx?.auditId ?? defaultContext?.auditId,
        findingId: ctx?.findingId ?? defaultContext?.findingId,
        context: ctx?.context,
      });
      setMessages((m) => [...m, { role: 'assistant', text: res.answer }]);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { messages, loading, error, ask };
}
