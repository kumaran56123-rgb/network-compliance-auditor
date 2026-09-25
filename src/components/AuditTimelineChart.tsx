import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from './ui/Card.tsx';
import type { AuditHistoryEntry } from '../api/types.ts';

/** Audit timeline chart showing compliance trend over a week of audit activity. */
export function AuditTimelineChart({ data }: { data: AuditHistoryEntry[] }) {
  if (data.length === 0) {
    return <Card title="Audit timeline"><p className="text-sm text-gray-500">No timeline data yet.</p></Card>;
  }
  return (
    <Card title="Audit timeline">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="compliance" name="Compliance %" stroke="#059669" fillOpacity={1} fill="url(#colorTimeline)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1">
        {data.map((d) => (
          <div key={d.date} className="flex items-center gap-2 text-xs">
            <span className="w-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="capitalize">{d.event}</span>
            <span className="ml-auto font-bold">{d.compliance}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
