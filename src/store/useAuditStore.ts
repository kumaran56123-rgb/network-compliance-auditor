import { create } from 'zustand';
import type { AuditRun, Device, DeviceScore, Finding } from '../types/index.ts';

interface AuditState {
  devices: Device[];
  standards: string[];
  excludedRuleIds: string[];
  audit: AuditRun | null;
  findings: Finding[];
  scores: DeviceScore[];
  overallCompliancePct: number;
  status: 'idle' | 'uploading' | 'ready' | 'auditing' | 'completed' | 'error';
  error: string | null;
  setDevices: (d: Device[]) => void;
  setStandards: (s: string[]) => void;
  setExcluded: (ids: string[]) => void;
  setAuditResult: (r: {
    audit: AuditRun;
    findings: Finding[];
    scores: DeviceScore[];
    overallCompliancePct?: number;
  }) => void;
  setStatus: (s: AuditState['status'], error?: string | null) => void;
  reset: () => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  devices: [],
  standards: ['CIS v8'],
  excludedRuleIds: [],
  audit: null,
  findings: [],
  scores: [],
  overallCompliancePct: 0,
  status: 'idle',
  error: null,
  setDevices: (devices) => set({ devices, status: devices.length ? 'ready' : 'idle' }),
  setStandards: (standards) => set({ standards }),
  setExcluded: (excludedRuleIds) => set({ excludedRuleIds }),
  setAuditResult: (r) =>
    set({
      audit: r.audit,
      findings: r.findings,
      scores: r.scores,
      overallCompliancePct:
        r.overallCompliancePct ??
        (r.scores.length
          ? Math.round(r.scores.reduce((s, x) => s + x.compliancePct, 0) / r.scores.length)
          : 0),
      status: 'completed',
      error: null,
    }),
  setStatus: (status, error = null) => set({ status, error }),
  reset: () =>
    set({
      devices: [],
      audit: null,
      findings: [],
      scores: [],
      overallCompliancePct: 0,
      status: 'idle',
      error: null,
    }),
}));
