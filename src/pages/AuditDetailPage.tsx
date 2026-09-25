import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuditStore } from '../store/useAuditStore.ts';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';
import { AskAuditorPanel } from '../components/AskAuditorPanel.tsx';
import { copyText, severityTone } from '../utils/format.ts';
import { VENDOR_LABELS } from '../utils/vendorDetect.ts';

/** Per-device drill-down: full findings with snippet + AI remediation + copy-fix. */
export function AuditDetailPage() {
  const { deviceId } = useParams();
  const [search] = useSearchParams();
  const focusedId = search.get('finding');
  const { devices, findings, audit } = useAuditStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const device = devices.find((d) => d.id === deviceId);
  const deviceFindings = useMemo(() => findings.filter((f) => f.deviceId === deviceId), [findings, deviceId]);

  async function copyFix(id: string, text: string) {
    const ok = await copyText(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  if (!device) return <EmptyState title="Device not found" hint="It may have been cleared from the session." />;

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="text-sm text-blue-600 underline">
        ← Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{device.hostname}</h1>
        <p className="text-sm text-gray-500">
          {VENDOR_LABELS[device.vendor]} · {device.filename} · {deviceFindings.length} finding(s)
        </p>
      </div>

      {deviceFindings.length === 0 && <EmptyState title="No findings for this device" hint="All checks passed." />}

      <div className="space-y-4">
        {deviceFindings.map((f) => (
          <Card
            key={f.id}
            title={`${f.ruleTitle} (${f.ruleId})`}
            subtitle={`${f.standard} · ${f.category}`}
            className={f.id === focusedId ? 'ring-2 ring-blue-500' : ''}
          >
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone={severityTone(f.severity)}>{f.severity}</Badge>
              <Badge>{f.category}</Badge>
            </div>
            <p className="text-sm">{f.description}</p>
            <h3 className="mt-3 text-sm font-semibold">Violated config</h3>
            <pre className="mt-1 overflow-x-auto rounded-md bg-gray-950 p-3 text-xs text-gray-100">{f.violatedSnippet}</pre>
            <h3 className="mt-3 text-sm font-semibold">AI remediation</h3>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md bg-green-50 p-3 text-xs text-green-900 dark:bg-green-950 dark:text-green-100">
              {f.remediation}
            </pre>
            <div className="mt-3">
              <Button variant="secondary" onClick={() => void copyFix(f.id, f.remediation)}>
                {copiedId === f.id ? 'Copied ✓' : 'Copy fix'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AskAuditorPanel
        auditId={audit?.id}
        findingId={focusedId ?? deviceFindings[0]?.id}
        context={deviceFindings.map((f) => `${f.ruleId}: ${f.description}`).join('\n').slice(0, 3000)}
      />
    </div>
  );
}