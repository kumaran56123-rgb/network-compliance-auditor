import { useState } from 'react';
import { exportReport } from '../api/audits.ts';
import { toErrorMessage } from '../api/client.ts';
import { useAuditStore } from '../store/useAuditStore.ts';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ErrorAlert } from '../components/ui/Feedback.tsx';
import { FieldLabel, Select } from '../components/ui/Input.tsx';

export function ReportsPage() {
  const audit = useAuditStore((s) => s.audit);
  const findings = useAuditStore((s) => s.findings);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function download() {
    if (!audit) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await exportReport({ auditId: audit.id, format });
      setDone(`Report downloaded as ${format.toUpperCase()} (audit ${audit.id}).`);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-gray-500">
          {audit ? `Audit ${audit.id} · ${audit.standards.join(', ')} · ${findings.length} findings` : 'No active audit run.'}
        </p>
      </div>
      {error && <ErrorAlert message={error} />}
      {done && (
        <div role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {done}
        </div>
      )}

      <Card title="Export compliance report" subtitle="Backend returns a file blob (or signed URL); mock mode generates CSV locally">
        <div className="flex max-w-md flex-col gap-4">
          <div>
            <FieldLabel htmlFor="rep-format">Format</FieldLabel>
            <Select id="rep-format" value={format} onChange={(e) => setFormat(e.target.value as 'pdf' | 'csv')}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </Select>
          </div>
          <Button onClick={() => void download()} loading={busy} disabled={!audit}>
            Download {format.toUpperCase()}
          </Button>
        </div>
      </Card>
    </div>
  );
}