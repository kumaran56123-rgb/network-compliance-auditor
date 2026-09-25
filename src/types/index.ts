/**
 * Shared domain types.
 *
 * These mirror the REST backend contract so frontend/backend/ML teams
 * stay in sync. Keep in sync with `src/api/types.ts`.
 */

export type Vendor = 'cisco' | 'juniper' | 'paloalto' | 'arista' | 'unknown';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RuleCategory =
  | 'access-control'
  | 'logging'
  | 'encryption'
  | 'authentication'
  | 'network-services'
  | 'management-plane';

export interface Device {
  id: string;
  hostname: string;
  vendor: Vendor;
  /** Original uploaded file name */
  filename: string;
  /** Set when user manually overrides auto-detected vendor */
  vendorOverridden?: boolean;
  uploadedAt: string;
}

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  standard: string;
}

export interface Finding {
  id: string;
  deviceId: string;
  ruleId: string;
  ruleTitle: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  /** The offending config lines, shown verbatim */
  violatedSnippet: string;
  /** AI-generated remediation (from ML service via backend) */
  remediation: string;
  standard: string;
}

export interface CategoryScore {
  category: RuleCategory;
  /** 0-100 */
  score: number;
  passed: number;
  total: number;
}

export interface DeviceScore {
  deviceId: string;
  hostname: string;
  vendor: Vendor;
  /** 0-100 */
  compliancePct: number;
  criticalCount: number;
  highCount: number;
  totalFindings: number;
  byCategory: CategoryScore[];
}

export interface AuditRun {
  id: string;
  standards: string[];
  excludedRuleIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  deviceIds: string[];
}

export interface AuditHistoryEntry {
  date: string;
  event: string;
  compliance: number;
}
