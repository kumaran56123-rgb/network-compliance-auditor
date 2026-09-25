import { useState } from 'react';
import { runAudit } from '../api/audits.ts';
import { toErrorMessage } from '../api/client.ts';
import { useAuditStore } from '../store/useAuditStore.ts';

/** Starts an audit run and stores results in Zustand. */
export function useRunAudit() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const store = useAuditStore();

  async function start() {
    if (!store.devices.length) {
      setError('Upload at least one device config first.');
      return;
    }
    setRunning(true);
    setError(null);
    store.setStatus('auditing');
    try {
      const res = await runAudit(store.devices, {
        deviceIds: store.devices.map((d) => d.id),
        standards: store.standards,
        excludedRuleIds: store.excludedRuleIds,
      });
      if (res.findings && res.scores) {
        store.setAuditResult({
          audit: res.audit,
          findings: res.findings,
          scores: res.scores,
          overallCompliancePct: (res as { overallCompliancePct?: number }).overallCompliancePct,
        });
      } else {
        store.setStatus('ready');
      }
    } catch (err) {
      const msg = toErrorMessage(err);
      setError(msg);
      store.setStatus('error', msg);
    } finally {
      setRunning(false);
    }
  }

  return { start, running, error };
}
