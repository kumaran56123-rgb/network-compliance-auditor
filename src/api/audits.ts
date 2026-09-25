/**
 * Public API layer. Pages/hooks import only from here — never axios directly.
 *
 * Each function first checks mock mode (VITE_USE_MOCK) so the UI works
 * without a backend. Point VITE_API_BASE_URL at the real REST backend
 * and set VITE_USE_MOCK=false for production calls.
 */
import { apiClient, isMockMode } from './client.ts';
import { mockAskAuditor, mockRunAudit, mockUpload } from './mock.ts';
import type {
  AskAuditorRequest,
  AskAuditorResponse,
  ExportReportParams,
  GetAuditResultsResponse,
  RunAuditRequest,
  RunAuditResponse,
  UploadProgress,
} from './types.ts';
import type { Device } from '../types/index.ts';

/** Upload one or more device config files. Reports per-file progress. */
export async function uploadConfig(
  files: File[],
  vendorOverrides: Record<string, string>,
  onProgress?: (p: UploadProgress) => void,
): Promise<Device[]> {
  if (isMockMode()) {
    // Simulate progressive upload so progress bars animate.
    for (const f of files) {
      for (const pct of [25, 60, 100]) {
        await new Promise((r) => setTimeout(r, 120));
        onProgress?.({ filename: f.name, loadedPct: pct, vendorGuess: 'unknown' });
      }
    }
    return mockUpload(files).map((d) => ({
      ...d,
      vendor: ((vendorOverrides[d.filename] as Device['vendor']) ?? 'unknown'),
      vendorOverridden: Boolean(vendorOverrides[d.filename]),
    }));
  }

  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  form.append('vendorOverrides', JSON.stringify(vendorOverrides));

  const { data } = await apiClient.post('/api/configs/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
      files.forEach((f) => onProgress?.({ filename: f.name, loadedPct: pct, vendorGuess: 'unknown' }));
    },
  });
  return (data.devices ?? data) as Device[];
}

/** Start an audit run for the uploaded devices + selected standards. */
export async function runAudit(
  devices: Device[],
  req: RunAuditRequest,
): Promise<RunAuditResponse & Partial<GetAuditResultsResponse>> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 900));
    const full = mockRunAudit(devices, req);
    return { audit: full.audit, findings: full.findings, scores: full.scores };
  }
  const { data } = await apiClient.post('/api/audits', req);
  return data as RunAuditResponse;
}

/** Fetch completed results for an audit run (poll while status != completed). */
export async function getAuditResults(auditId: string): Promise<GetAuditResultsResponse> {
  if (isMockMode()) {
    throw new Error('Mock mode holds results in-memory; no fetch needed.');
  }
  const { data } = await apiClient.get(`/api/audits/${auditId}`);
  return data as GetAuditResultsResponse;
}

/**
 * Download a PDF/CSV report. In production the backend returns a file blob
 * (or a signed URL); here we normalize both shapes to a Blob download.
 */
export async function exportReport(params: ExportReportParams): Promise<void> {
  if (isMockMode()) {
    // Client-side CSV fallback so export is demoable without a backend.
    const rows = [
      ['device', 'rule', 'severity', 'category', 'remediation'],
      ['demo-router-1', 'CIS-logging-02', 'high', 'logging', 'Enable logging buffered'],
    ];
    const blob =
      params.format === 'csv'
        ? new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
        : new Blob(['%PDF-1.4 stub report — wire to backend PDF generator'], {
            type: 'application/pdf',
          });
    triggerDownload(blob, `audit-${Date.now()}.${params.format}`);
    return;
  }
  const { data } = await apiClient.get(`/api/audits/${params.auditId}/export`, {
    params: { format: params.format },
    responseType: 'blob',
  });
  triggerDownload(data as Blob, `audit-${params.auditId}.${params.format}`);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Chat-style Q&A over a finding + audit context (LLM-backed on the backend). */
export async function askAuditor(req: AskAuditorRequest): Promise<AskAuditorResponse> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 700));
    return mockAskAuditor(req);
  }
  const { data } = await apiClient.post('/api/auditor/ask', req);
  return data as AskAuditorResponse;
}
