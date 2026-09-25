import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Finding } from '../types/index.ts';
import { Table } from './ui/Table.tsx';
import { Select, Input, FieldLabel } from './ui/Input.tsx';
import { Badge } from './ui/Badge.tsx';
import { severityTone } from '../utils/format.ts';
import { VENDOR_LABELS } from '../utils/vendorDetect.ts';
import { useAuditStore } from '../store/useAuditStore.ts';

/**
 * Filterable/sortable findings table. Filters are plain selects/inputs
 * for keyboard + screen-reader friendliness.
 */
export function FindingsTable({ findings, total, page, setPage, perPage }: { findings: Finding[]; total: number; page: number; setPage: (p: number) => void; perPage: number }) {
  const devices = useAuditStore((s) => s.devices);
  const deviceById = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);

  const [sev, setSev] = useState('');
  const [vendor, setVendor] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const filtered = findings.filter((f) => {
      const d = deviceById.get(f.deviceId);
      if (sev && f.severity !== sev) return false;
      if (vendor && d?.vendor !== vendor) return false;
      if (cat && f.category !== cat) return false;
      if (q && !`${f.ruleTitle} ${f.description} ${d?.hostname ?? ''}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    return filtered;
  }, [findings, sev, vendor, cat, q, deviceById]);

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <FieldLabel htmlFor="f-sev">Severity</FieldLabel>
          <Select id="f-sev" value={sev} onChange={(e) => setSev(e.target.value)}>
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="f-vendor">Vendor</FieldLabel>
          <Select id="f-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)}>
            <option value="">All</option>
            <option value="cisco">Cisco</option>
            <option value="juniper">Juniper</option>
            <option value="paloalto">Palo Alto</option>
            <option value="arista">Arista</option>
            <option value="unknown">Unknown</option>
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="f-cat">Category</FieldLabel>
          <Select id="f-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All</option>
            <option value="access-control">Access control</option>
            <option value="logging">Logging</option>
            <option value="encryption">Encryption</option>
            <option value="authentication">Authentication</option>
            <option value="network-services">Network services</option>
            <option value="management-plane">Management plane</option>
          </Select>
        </div>
        <div>
          <FieldLabel htmlFor="f-q">Search</FieldLabel>
          <Input id="f-q" placeholder="hostname, rule…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <p className="mb-2 text-sm text-gray-500" aria-live="polite">
        {rows.length} of {findings.length} findings
      </p>
      <Table headers={['Severity', 'Device', 'Vendor', 'Rule', 'Category', 'Detail']} caption="Compliance findings">
        {rows.map((f) => {
          const d = deviceById.get(f.deviceId);
          return (
            <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <Badge tone={severityTone(f.severity)}>{f.severity}</Badge>
              </td>
              <td className="px-4 py-3 font-medium">{d?.hostname ?? f.deviceId}</td>
              <td className="px-4 py-3">{d ? VENDOR_LABELS[d.vendor] : '—'}</td>
              <td className="px-4 py-3">{f.ruleTitle}</td>
              <td className="px-4 py-3 capitalize">{f.category.replace('-', ' ')}</td>
              <td className="px-4 py-3">
                <Link className="text-blue-600 underline" to={`/audit/${f.deviceId}?finding=${f.id}`}>
                  View finding
                </Link>
              </td>
            </tr>
          );
        })}
      </Table>
      {rows.length === 0 && <p className="mt-4 text-sm text-gray-500">No findings match these filters.</p>}
      {total > 0 && (
        <nav aria-label="Findings pagination" className="mt-4 flex items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border px-3 py-1 disabled:opacity-40">← Prev</button>
          <span className="text-sm">Page {page} of {Math.ceil(total / perPage)}</span>
          <button type="button" disabled={page >= Math.ceil(total / perPage)} onClick={() => setPage(page + 1)} className="rounded-md border px-3 py-1 disabled:opacity-40">Next →</button>
        </nav>
      )}
    </div>
  );
}
