import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuditStore } from '../store/useAuditStore.ts';
import { useUiStore } from '../store/useUiStore.ts';
import { loadDemoData } from '../utils/demoSeed.ts';
import { SummaryCards } from '../components/SummaryCards.tsx';
import { DashboardCharts } from '../components/DashboardCharts.tsx';
import { FindingsTable } from '../components/FindingsTable.tsx';
import { AskAuditorPanel } from '../components/AskAuditorPanel.tsx';
import { EmptyState, Spinner } from '../components/ui/Feedback.tsx';
import { Button } from '../components/ui/Button.tsx';

export function DashboardPage() {
  const { devices, findings, scores, overallCompliancePct, status } = useAuditStore();
  const setAuditorOpen = useUiStore((s) => s.setAuditorOpen);
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const high = findings.filter((f) => f.severity === 'high').length;
  const medium = findings.filter((f) => f.severity === 'medium').length;
  const low = findings.filter((f) => f.severity === 'low').length;
  const info = findings.filter((f) => f.severity === 'info').length;

  const [page, setPage] = useState(1);
  const perPage = 8;
  const paged = findings.slice((page - 1) * perPage, page * perPage);

  if (status === 'auditing') return <Spinner label="Running audit across devices…" />;
  if (!devices.length) {
    return (
      <div className="space-y-4">
        <EmptyState title="No audit yet" hint="Upload configs and run an audit to see results." />
        <div className="flex flex-wrap gap-2">
          <Link to="/upload">
            <Button>Go to Upload</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              loadDemoData();
              window.location.href = '/dashboard';
            }}
          >
            Or load demo data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit dashboard</h1>
          <p className="text-sm text-gray-500">
            {devices.length} device(s) · {findings.length} findings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/compare">
            <Button variant="secondary">Compare vendors</Button>
          </Link>
          <Link to="/reports">
            <Button variant="secondary">Export report</Button>
          </Link>
          <Button onClick={() => setAuditorOpen(true)}>💬 Ask Auditor</Button>
        </div>
      </div>

      <SummaryCards
        totalDevices={devices.length}
        compliancePct={overallCompliancePct}
        criticalCount={critical}
        highCount={high}
        mediumCount={medium}
        lowCount={low}
        infoCount={info}
        totalFindings={findings.length}
      />

      {findings.length === 0 ? (
        <EmptyState title={status === 'completed' ? 'All checks passed 🎉' : 'Audit not run yet'} hint="Configure standards and run the audit." />
      ) : (
        <>
          <DashboardCharts scores={scores} findings={findings} />
          <FindingsTable findings={paged} total={findings.length} page={page} setPage={setPage} perPage={perPage} />
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-4 dark:border-gray-800">
          <h2 className="mb-2 text-base font-semibold">Per-device scores</h2>
          <ul className="space-y-2 text-sm">
            {scores.map((s) => (
              <li key={s.deviceId} className="flex items-center justify-between gap-2">
                <Link className="text-blue-600 underline" to={`/audit/${s.deviceId}`}>
                  {s.hostname}
                </Link>
                <span>
                  {s.compliancePct}% · {s.totalFindings} findings
                </span>
              </li>
            ))}
          </ul>
        </div>
        <AskAuditorPanel auditId={useAuditStore.getState().audit?.id} context={JSON.stringify(scores).slice(0, 2000)} />
      </div>
    </div>
  );
}