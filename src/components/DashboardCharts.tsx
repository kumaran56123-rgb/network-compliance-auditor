/**
 * Additional analysis-type charts and patterns for the dashboard.
 * All Recharts components are already installed (treemap, radar, scatter, pie).
 */
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Treemap,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DeviceScore, Finding } from '../types/index.ts';
import { AuditTimelineChart } from './AuditTimelineChart.tsx';
import { severityTone } from '../utils/format.ts';
import { Card } from './ui/Card.tsx';
import { Badge } from './ui/Badge.tsx';

const COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#2563eb',
  info: '#6b7280',
};

/** Treemap node data shape — a flat array of leaf nodes for Recharts Treemap. */
interface TreemapNode {
  name: string;
  value: number;
  color: string;
}

/** Render a single treemap node with color-coded severity. */
function renderTreemapNode(content: any) {
  const { x, y, width, height, name, value, color } = content;
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} rx={4} />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold">
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="#fff" fontSize={10}>
            {value}
          </text>
        </>
      )}
    </g>
  );
}

/**
 * DashboardCharts — all additional analysis patterns beyond SummaryCards:
 * - Severity donut (pie)
 * - Category radar comparison
 * - Scatter (compliance vs findings)
 * - Severity×Category treemap
 * - Top violated rules table
 * - Device health matrix
 */
export function DashboardCharts({ scores, findings, history }: { scores: DeviceScore[]; findings: Finding[]; history?: any[] }) {
  // --- Pie: severity distribution ---
  const severityData = useMemo(
    () => [
      { name: 'Critical', value: findings.filter((f) => f.severity === 'critical').length, color: COLORS.critical },
      { name: 'High', value: findings.filter((f) => f.severity === 'high').length, color: COLORS.high },
      { name: 'Medium', value: findings.filter((f) => f.severity === 'medium').length, color: COLORS.medium },
      { name: 'Low', value: findings.filter((f) => f.severity === 'low').length, color: COLORS.low },
      { name: 'Info', value: findings.filter((f) => f.severity === 'info').length, color: COLORS.info },
    ],
    [findings],
  );

  // --- Radar: category scores averaged across devices ---
  const radarData = useMemo(() => {
    const categories = scores[0]?.byCategory.map((c) => c.category) ?? [];
    return categories.map((cat) => {
      const avg = scores.length
        ? Math.round(
            scores.reduce((sum, s) => sum + (s.byCategory.find((c) => c.category === cat)?.score ?? 0), 0) /
              scores.length,
          )
        : 0;
      return { category: cat.replace('-', ' '), avg };
    });
  }, [scores]);

  // --- Scatter: each device as (compliancePct, totalFindings) ---
  const scatterData = useMemo(
    () =>
      scores.map((s) => ({
        compliance: s.compliancePct,
        findings: s.totalFindings,
        name: s.hostname,
      })),
    [scores],
  );

  // --- Treemap: severity × category matrix (flat leaf nodes) ---
  const treemapData = useMemo(() => {
    const matrix: Record<string, TreemapNode> = {};
    findings.forEach((f) => {
      const key = `${f.severity}-${f.category}`;
      if (!matrix[key]) {
        matrix[key] = { name: `${f.severity} · ${f.category}`, value: 0, color: COLORS[f.severity as keyof typeof COLORS] ?? '#6b7280' };
      }
      matrix[key].value += 1;
    });
    return Object.values(matrix) as any;
  }, [findings]);

  // --- Top violated rules (deduplicated across devices) ---
  const topRules = useMemo(() => {
    const counts: Record<string, { rule: string; title: string; category: string; count: number; severity: string }> = {};
    findings.forEach((f) => {
      const key = f.ruleId;
      if (!counts[key]) counts[key] = { rule: f.ruleId, title: f.ruleTitle, category: f.category, count: 0, severity: f.severity };
      counts[key].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [findings]);

  // --- Device health matrix (pass/fail by category) ---
  const healthMatrix = useMemo(() => {
    const categories = scores[0]?.byCategory.map((c) => c.category) ?? [];
    return scores.map((s) => ({
      hostname: s.hostname,
      vendor: s.vendor,
      compliance: s.compliancePct,
      categories: categories.map((c) => {
        const entry = s.byCategory.find((x) => x.category === c);
        return { category: c, score: entry?.score ?? 0, passed: (entry?.score ?? 0) >= 70 };
      }),
    }));
  }, [scores]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Severity donut */}
        <Card title="Severity distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {severityData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category radar */}
        <Card title="Category scores (avg across devices)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <Radar dataKey="avg" name="Avg score" fill="#2563eb" fillOpacity={0.4} stroke="#2563eb" />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Scatter: compliance vs findings */}
        <Card title="Device health scatter (compliance vs findings)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="compliance" name="Compliance %" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="findings" name="Findings" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#2563eb">
                  {scatterData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.compliance >= 70 ? '#22c55e' : entry.compliance >= 40 ? '#ca8a04' : '#dc2626'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Treemap: severity × category */}
        <Card title="Findings matrix (severity × category)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={treemapData} dataKey="value" nameKey="name" content={renderTreemapNode as any} />
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top violated rules */}
      <Card title="Top violated rules">
        {topRules.length === 0 ? (
          <p className="text-sm text-gray-500">No rules violated in this audit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800" aria-label="Top violated rules">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rule
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Severity
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Violations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {topRules.map((r) => (
                  <tr key={r.rule}>
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3 capitalize">{r.category.replace('-', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge tone={severityTone(r.severity as any)}>{r.severity}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Device health matrix */}
      <Card title="Device health matrix">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800" aria-label="Device health matrix">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Device
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vendor
                </th>
                {healthMatrix[0]?.categories.map((c) => (
                  <th key={c.category} scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {c.category.replace('-', ' ')}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {healthMatrix.map((row) => (
                <tr key={row.hostname}>
                  <td className="px-4 py-3 font-medium">{row.hostname}</td>
                  <td className="px-4 py-3 capitalize">{row.vendor}</td>
                  {row.categories.map((c) => (
                    <td key={c.category} className="px-4 py-3 text-center">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${c.passed ? 'bg-green-500' : 'bg-red-500'}`}
                        aria-label={c.passed ? 'Passed' : 'Failed'}
                        title={`${c.category}: ${c.score}`}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 font-bold">{row.compliance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {history && history.length > 0 && <AuditTimelineChart data={history} />}
    </div>
  );
}
