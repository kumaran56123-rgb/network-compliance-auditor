/**
 * In-browser mock backend. Used when VITE_USE_MOCK != "false" so the UI
 * is fully demoable before the real REST backend exists.
 * Swap to real HTTP calls in `audits.ts` without touching pages.
 */
import type {
  AskAuditorRequest,
  AskAuditorResponse,
  GetAuditResultsResponse,
  RunAuditRequest,
} from './types.ts';
import type { Device, Finding } from '../types/index.ts';

const CATEGORIES = [
  'access-control',
  'logging',
  'encryption',
  'authentication',
  'network-services',
  'management-plane',
] as const;

function seedFindings(devices: Device[], standards: string[]): Finding[] {
  const findings: Finding[] = [];
  devices.forEach((d, di) => {
    CATEGORIES.forEach((cat, ci) => {
      if ((di + ci) % 3 === 2) return; // some categories pass
      const severity =
        (di + ci) % 4 === 0 ? 'critical' : (di + ci) % 4 === 1 ? 'high' : (di + ci) % 4 === 2 ? 'medium' : 'low';
      findings.push({
        id: `${d.id}-${cat}`,
        deviceId: d.id,
        ruleId: `${standards[0] ?? 'CIS'}-${cat}-0${ci + 1}`,
        ruleTitle: `${cat} baseline enforced`,
        description: `Device ${d.hostname} does not meet the ${cat} baseline in ${standards[0] ?? 'CIS'}.`,
        category: cat,
        severity,
        violatedSnippet:
          cat === 'logging'
            ? '! no logging buffered\nlogging trap informational'
            : cat === 'encryption'
              ? 'ip http server\n! weak cipher enabled'
              : `! missing ${cat} hardening\nno ${cat}-secure-default`,
        remediation: `Enable ${cat} hardening on ${d.hostname}:\n1. Apply the ${standards[0] ?? 'CIS'} ${cat} baseline.\n2. Verify with "show run | include ${cat}".\n3. Re-run the audit.`,
        standard: standards[0] ?? 'CIS v8',
      });
    });
  });
  return findings;
}

export function mockUpload(files: File[]): Device[] {
  return files.map((f, i) => ({
    id: `dev-${Date.now()}-${i}`,
    hostname: f.name.replace(/\.(cfg|txt|conf)$/i, '') || `device-${i + 1}`,
    vendor: 'unknown',
    filename: f.name,
    uploadedAt: new Date().toISOString(),
  }));
}

export function mockRunAudit(devices: Device[], req: RunAuditRequest): GetAuditResultsResponse {
  const findings = seedFindings(devices, req.standards);
  const scores = devices.map((d, i) => {
    const devFindings = findings.filter((f) => f.deviceId === d.id);
    const total = CATEGORIES.length;
    const failedCats = new Set(devFindings.map((f) => f.category)).size;
    const compliancePct = Math.round(((total - failedCats) / total) * 100);
    return {
      deviceId: d.id,
      hostname: d.hostname,
      vendor: d.vendor,
      compliancePct: Math.max(28, compliancePct - i * 3),
      criticalCount: devFindings.filter((f) => f.severity === 'critical').length,
      highCount: devFindings.filter((f) => f.severity === 'high').length,
      totalFindings: devFindings.length,
      byCategory: CATEGORIES.map((c, ci) => {
        const failed = devFindings.some((f) => f.category === c);
        // Each category gets a unique score so radar/treemap are meaningful
        const score = failed ? Math.round(30 + (ci * 13 + i * 7) % 50) : Math.round(88 + (ci * 3 + i) % 12);
        return {
          category: c,
          score,
          passed: score >= 70 ? 1 : 0,
          total: 1,
        };
      }),
    };
  });
  const overall = scores.length
    ? Math.round(scores.reduce((s, x) => s + x.compliancePct, 0) / scores.length)
    : 0;
  // Build audit history entries for the timeline chart.
  const history: Array<{ date: string; event: string; compliance: number }> = [];
  const now = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    history.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      event: d === 0 ? 'Audit completed' : d === 1 ? 'Findings reviewed' : `Day ${7 - d} check-in`,
      compliance: Math.round(overall + (Math.random() * 20 - 10)),
    });
  }
  return {
    audit: {
      id: `audit-${Date.now()}`,
      standards: req.standards,
      excludedRuleIds: req.excludedRuleIds,
      status: 'completed',
      createdAt: new Date().toISOString(),
      deviceIds: req.deviceIds,
    },
    findings,
    scores,
    overallCompliancePct: overall,
    history,
  };
}

export function mockAskAuditor(req: AskAuditorRequest): AskAuditorResponse {
  return {
    answer:
      `Based on the current audit context${req.findingId ? ` for finding ${req.findingId}` : ''}: ` +
      `"${req.question}" likely relates to a misconfigured baseline. ` +
      `Check the violated snippet, apply the suggested remediation, then re-run the audit to verify. ` +
      `(Stubbed response — wire POST /api/auditor/ask to your LLM service.)`,
    citations: req.findingId ? [req.findingId] : [],
  };
}
