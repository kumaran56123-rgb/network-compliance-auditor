import { useMemo } from 'react';
import {
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
import { ComparisonChart } from '../components/ComparisonChart.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Table } from '../components/ui/Table.tsx';
import { EmptyState } from '../components/ui/Feedback.tsx';
import { VENDOR_LABELS } from '../utils/vendorDetect.ts';
import type { DeviceScore, Finding } from '../types/index.ts';

/** Stacked bar data: severity count per vendor. */
function buildSeverityChartData(scores: DeviceScore[], findings: Finding[]) {
  const vendorMap = new Map<string, { critical: number; high: number; medium: number; low: number; info: number; total: number }>();
  findings.forEach((f) => {
    const device = scores.find((s) => s.deviceId === f.deviceId);
    const vendor = device ? VENDOR_LABELS[device.vendor] : 'Unknown';
    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 });
    }
    const entry = vendorMap.get(vendor)!;
    entry[f.severity] += 1;
    entry.total += 1;
  });
  return Object.entries(vendorMap).map(([vendor, d]) => ({ vendor, ...d }));
}

export function ComparisonPage() {
  const scores = useAuditStore((s) => s.scores);
  const findings = useAuditStore((s) => s.findings);

  if (!scores.length) {
    return <EmptyState title="No comparison data" hint="Run an audit with 2+ devices to compare vendors." />;
  }

  // Best/worst per category
  const categories = scores[0]?.byCategory.map((c) => c.category) ?? [];
  const categoryComparison = useMemo(
    () =>
      categories.map((cat) => {
        const entries = scores.map((s) => {
          const entry = s.byCategory.find((c) => c.category === cat);
          return { hostname: s.hostname, vendor: s.vendor, score: entry?.score ?? 0, passed: entry?.passed ?? 0 };
        });
        const best = Math.max(...entries.map((e) => e.score));
        const worst = Math.min(...entries.map((e) => e.score));
        return { category: cat.replace('-', ' '), entries, best, worst };
      }),
    [categories, scores],
  );

  // Memoize severity chart data so it doesn't recompute on every render.
  const severityChartData = useMemo(
    () => buildSeverityChartData(scores, findings),
    [scores, findings],
  );

  // Vendor averages
  const vendorAverages = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    scores.forEach((s) => {
      const v = VENDOR_LABELS[s.vendor];
      if (!grouped[v]) grouped[v] = [];
      grouped[v].push(s.compliancePct);
    });
    return Object.entries(grouped).map(([vendor, vals]) => ({
      vendor,
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      min: Math.min(...vals),
      max: Math.max(...vals),
    }));
  }, [scores]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Multi-vendor comparison</h1>
        <p className="text-sm text-gray-500">
          {scores.length} devices across {new Set(scores.map((s) => s.vendor)).size} vendors — side-by-side compliance scoring.
        </p>
      </div>

      <ComparisonChart scores={scores} />

      {/* Vendor averages */}
      <Card title="Vendor averages">
        <Table headers={['Vendor', 'Avg Score', 'Min', 'Max', 'Devices']} caption="Average compliance per vendor">
          {vendorAverages.map((v) => {
            const deviceCount = scores.filter((s) => VENDOR_LABELS[s.vendor] === v.vendor).length;
            return (
              <tr key={v.vendor}>
                <td className="px-4 py-3 font-medium">{v.vendor}</td>
                <td className="px-4 py-3">{v.avg}%</td>
                <td className="px-4 py-3">{v.min}%</td>
                <td className="px-4 py-3">{v.max}%</td>
                <td className="px-4 py-3">{deviceCount}</td>
              </tr>
            );
          })}
        </Table>
      </Card>

      {/* Severity distribution per vendor */}
      <Card title="Severity distribution by vendor">
        {severityChartData.length === 0 ? (
          <p className="text-sm text-gray-500">No findings data to display. Run an audit first.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="critical" name="Critical" fill="#dc2626" />
                <Bar dataKey="high" name="High" fill="#ea580c" />
                <Bar dataKey="medium" name="Medium" fill="#ca8a04" />
                <Bar dataKey="low" name="Low" fill="#2563eb" />
                <Bar dataKey="info" name="Info" fill="#6b7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category-by-category pass/fail matrix */}
      <Card title="Category pass/fail matrix">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800" aria-label="Category pass/fail matrix">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>
                {scores.map((s) => (
                  <th key={s.deviceId} scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {s.hostname}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Best
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Worst
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {categoryComparison.map(({ category, entries, best, worst }) => (
                <tr key={category}>
                  <td className="px-4 py-3 capitalize font-medium">{category}</td>
                  {entries.map((e) => (
                    <td key={e.hostname} className="px-4 py-3 text-center">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${e.passed ? 'bg-green-500' : 'bg-red-500'}`}
                        aria-label={e.passed ? 'Passed' : 'Failed'}
                        title={`${e.hostname}: ${e.score}%`}
                      />
                      <span className="block text-xs text-gray-500 mt-0.5">{e.score}%</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-green-600 font-bold">{best}%</td>
                  <td className="px-4 py-3 text-center text-red-600 font-bold">{worst}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed device comparison table */}
      <Card title="Detailed device comparison">
        <Table headers={['Device', 'Vendor', 'Compliance', 'Critical', 'High', 'Medium', 'Low', 'Total', 'Status']} caption="All devices ranked by compliance">
          {[...scores].sort((a, b) => b.compliancePct - a.compliancePct).map((s) => (
            <tr key={s.deviceId}>
              <td className="px-4 py-3 font-medium">{s.hostname}</td>
              <td className="px-4 py-3 capitalize">{s.vendor}</td>
              <td className="px-4 py-3">
                <span className={`font-bold ${s.compliancePct >= 70 ? 'text-green-600' : s.compliancePct >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {s.compliancePct}%
                </span>
              </td>
              <td className="px-4 py-3">{s.criticalCount}</td>
              <td className="px-4 py-3">{s.highCount}</td>
              <td className="px-4 py-3">{s.totalFindings}</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3 font-medium">{s.totalFindings}</td>
              <td className="px-4 py-3">
                <Badge tone={s.compliancePct >= 70 ? 'bg-green-100 text-green-800' : s.compliancePct >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                  {s.compliancePct >= 70 ? 'Pass' : s.compliancePct >= 40 ? 'Warning' : 'Fail'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
