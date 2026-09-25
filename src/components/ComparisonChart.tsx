import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DeviceScore } from '../types/index.ts';
import { Card } from './ui/Card.tsx';

/**
 * Side-by-side vendor/device comparison: bar chart for overall scores
 * plus radar for category breakdown of the first device.
 */
export function ComparisonChart({ scores }: { scores: DeviceScore[] }) {
  const barData = scores.map((s) => ({ name: s.hostname, score: s.compliancePct, critical: s.criticalCount }));

  // Radar shows average per category across all devices.
  const categories = scores[0]?.byCategory.map((c) => c.category) ?? [];
  const radarData = categories.map((cat) => {
    const avg = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + (s.byCategory.find((c) => c.category === cat)?.score ?? 0), 0) / scores.length)
      : 0;
    return { category: cat.replace('-', ' '), avg };
  });

  if (!scores.length) return <p className="text-sm text-gray-500">No scores yet — run an audit first.</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Compliance by device" subtitle="Overall score (0–100) + critical count">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" name="Compliance %" fill="#2563eb" />
              <Bar dataKey="critical" name="Critical" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Category breakdown (avg)" subtitle="Access control, logging, encryption…">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
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
  );
}
