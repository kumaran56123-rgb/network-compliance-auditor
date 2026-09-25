import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuditStore } from '../store/useAuditStore.ts';
import { useUiStore } from '../store/useUiStore.ts';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { severityTone } from '../utils/format.ts';

export function SummaryCards({
  totalDevices,
  compliancePct,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  infoCount,
  totalFindings,
}: {
  totalDevices: number;
  compliancePct: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  totalFindings: number;
}) {
  const status = useAuditStore((s) => s.status);
  const setAuditorOpen = useUiStore((s) => s.setAuditorOpen);
  const scores = useAuditStore((s) => s.scores);

  const trendData = useMemo(() => {
    return [
      { day: 'Mon', compliance: 62 },
      { day: 'Tue', compliance: 68 },
      { day: 'Wed', compliance: 71 },
      { day: 'Thu', compliance: 65 },
      { day: 'Fri', compliance: 74 },
      { day: 'Sat', compliance: 79 },
      { day: 'Sun', compliance: compliancePct },
    ];
  }, [compliancePct]);

  const vendorData = useMemo(() => {
    const grouped: Record<string, { critical: number; high: number; total: number }> = {};
    scores.forEach((s) => {
      const v = s.hostname.split('-')[0];
      if (!grouped[v]) grouped[v] = { critical: 0, high: 0, total: s.totalFindings };
      grouped[v].critical += s.criticalCount;
      grouped[v].high += s.highCount;
      grouped[v].total += s.totalFindings;
    });
    return Object.entries(grouped).map(([vendor, d]) => ({
      vendor,
      ...d,
      label: `${vendor} (${d.total})`,
    }));
  }, [scores]);

  const sev = [
    { label: 'Critical', count: criticalCount, tone: severityTone('critical') },
    { label: 'High', count: highCount, tone: severityTone('high') },
    { label: 'Medium', count: mediumCount, tone: severityTone('medium') },
    { label: 'Low', count: lowCount, tone: severityTone('low') },
    { label: 'Info', count: infoCount, tone: severityTone('info') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Audit summary">
        <Card className="!p-4" role="listitem">
          <p className="text-sm text-gray-500">Overall compliance</p>
          <p className="mt-1 text-3xl font-bold">{compliancePct}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded bg-blue-600 transition-all"
              style={{ width: `${compliancePct}%` }}
              role="progressbar"
              aria-valuenow={compliancePct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </Card>
        <Card className="!p-4" role="listitem">
          <p className="text-sm text-gray-500">Total devices</p>
          <p className="mt-1 text-3xl font-bold">{totalDevices}</p>
        </Card>
        <Card className="!p-4" role="listitem">
          <p className="text-sm text-gray-500">Total findings</p>
          <p className="mt-1 text-3xl font-bold">{totalFindings}</p>
        </Card>
        <Card className="!p-4" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="mt-1 text-3xl font-bold capitalize">{status}</p>
            </div>
            <Button onClick={() => setAuditorOpen(true)}>💬 Ask Auditor</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Severity breakdown" className="lg:col-span-1">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {sev.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: s.tone.includes('red') ? '#dc2626' : s.tone.includes('orange') ? '#ea580c' : s.tone.includes('yellow') ? '#ca8a04' : s.tone.includes('blue') ? '#2563eb' : '#6b7280' }} aria-hidden="true" />
                <span className="text-sm capitalize">{s.label}</span>
                <span className="ml-auto font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Compliance trend (7 days)" className="lg:col-span-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="compliance" name="Compliance %" stroke="#2563eb" fillOpacity={1} fill="url(#colorCompliance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Findings by vendor">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorData} key="vendor-chart">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" name="Critical" fill="#dc2626" />
              <Bar dataKey="high" name="High" fill="#ea580c" />
              <Bar dataKey="total" name="Total findings" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
