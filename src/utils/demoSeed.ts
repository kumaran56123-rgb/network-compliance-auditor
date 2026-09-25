import { mockRunAudit } from '../api/mock.ts';
import { useAuditStore } from '../store/useAuditStore.ts';
import type { Device } from '../types/index.ts';

/**
 * Demo devices spanning 5 vendors so the dashboard, comparison,
 * and per-device pages are fully populated on first load.
 * Each device also ships a sample config in public/sample-configs/
 * so the Upload page can demo real file parsing + vendor detection.
 */
const DEMO_DEVICES: Device[] = [
  { id: 'demo-cisco-1', hostname: 'core-sw-01', vendor: 'cisco', filename: 'core-sw-01.cfg', uploadedAt: new Date().toISOString() },
  { id: 'demo-cisco-2', hostname: 'dist-sw-02', vendor: 'cisco', filename: 'dist-sw-02.cfg', uploadedAt: new Date().toISOString() },
  { id: 'demo-cisco-3', hostname: 'border-rtr-01', vendor: 'cisco', filename: 'border-rtr-01.cfg', uploadedAt: new Date().toISOString() },
  { id: 'demo-juniper-1', hostname: 'edge-jn-01', vendor: 'juniper', filename: 'edge-jn-01.conf', uploadedAt: new Date().toISOString() },
  { id: 'demo-juniper-2', hostname: 'ex-js-01', vendor: 'juniper', filename: 'ex-js-01.conf', uploadedAt: new Date().toISOString() },
  { id: 'demo-paloalto-1', hostname: 'fw-pa-01', vendor: 'paloalto', filename: 'fw-pa-01.txt', uploadedAt: new Date().toISOString() },
  { id: 'demo-paloalto-2', hostname: 'fw-pa-02', vendor: 'paloalto', filename: 'fw-pa-02.txt', uploadedAt: new Date().toISOString() },
  { id: 'demo-arista-1', hostname: 'spine-ar-01', vendor: 'arista', filename: 'spine-ar-01.cfg', uploadedAt: new Date().toISOString() },
];

/**
 * Seeds the session store with demo devices + a completed mock audit.
 * Used by "Load demo data" buttons so first-run is never blank.
 */
export function loadDemoData(): void {
  const store = useAuditStore.getState();
  const standards = store.standards.length ? store.standards : ['CIS v8'];
  const result = mockRunAudit(DEMO_DEVICES, {
    deviceIds: DEMO_DEVICES.map((d) => d.id),
    standards,
    excludedRuleIds: store.excludedRuleIds,
  });
  store.setDevices(DEMO_DEVICES);
  store.setAuditResult({
    audit: result.audit,
    findings: result.findings,
    scores: result.scores,
    overallCompliancePct: result.overallCompliancePct,
  });
}

/** Returns the path to the bundled sample config for a given device id. */
export function sampleConfigPath(deviceId: string): string | null {
  const map: Record<string, string> = {
    'demo-cisco-1': '/sample-configs/core-sw-01.cfg',
    'demo-cisco-2': '/sample-configs/core-sw-01.cfg',
    'demo-cisco-3': '/sample-configs/core-sw-01.cfg',
    'demo-juniper-1': '/sample-configs/edge-jn-01.conf',
    'demo-juniper-2': '/sample-configs/edge-jn-01.conf',
    'demo-paloalto-1': '/sample-configs/fw-pa-01.txt',
    'demo-paloalto-2': '/sample-configs/fw-pa-01.txt',
    'demo-arista-1': '/sample-configs/core-sw-01.cfg',
  };
  return map[deviceId] ?? null;
}
