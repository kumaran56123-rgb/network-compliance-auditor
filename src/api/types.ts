/**
 * API request/response contract.
 *
 * Backend base URL comes from `VITE_API_BASE_URL`.
 * Frontend calls these shapes; backend/ML teams implement them.
 *
 * Endpoints:
 *  POST /api/configs/upload
 *  POST /api/audits
 *  GET  /api/audits/:id
 *  GET  /api/audits/:id/export?format=pdf|csv
 *  POST /api/auditor/ask
 */
import type { AuditRun, Device, DeviceScore, Finding, Vendor } from '../types/index.ts';

export interface UploadConfigResponse {
  devices: Device[];
}

export interface RunAuditRequest {
  deviceIds: string[];
  standards: string[];
  excludedRuleIds: string[];
}

export interface RunAuditResponse {
  audit: AuditRun;
}

export interface AuditHistoryEntry {
  date: string;
  event: string;
  compliance: number;
}

export interface GetAuditResultsResponse {
  audit: AuditRun;
  findings: Finding[];
  /** Per-device rollups for dashboard + comparison view */
  scores: DeviceScore[];
  overallCompliancePct: number;
  /** Optional audit history entries for the timeline chart */
  history?: AuditHistoryEntry[];
}

export interface ExportReportParams {
  auditId: string;
  format: 'pdf' | 'csv';
}

export interface AskAuditorRequest {
  question: string;
  auditId?: string;
  findingId?: string;
  /** Extra config/audit context sent to the LLM */
  context?: string;
}

export interface AskAuditorResponse {
  answer: string;
  citations?: string[];
}

export interface UploadProgress {
  filename: string;
  loadedPct: number;
  vendorGuess: Vendor;
}

export type { AuditRun, Device, DeviceScore, Finding };
