import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../store/useAuditStore.ts';
import { useRunAudit } from '../hooks/useRunAudit.ts';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { ErrorAlert, EmptyState } from '../components/ui/Feedback.tsx';

const STANDARDS = ['CIS v8', 'NIST 800-53', 'ISO 27001', 'SOC 2'];

// Representative rule catalogue; backend owns the canonical list.
const RULES = [
  { id: 'logging-01', title: 'Centralized logging enabled', standard: 'CIS v8' },
  { id: 'encrypt-01', title: 'Strong ciphers only (TLS 1.2+)', standard: 'CIS v8' },
  { id: 'auth-01', title: 'MFA on management plane', standard: 'NIST 800-53' },
  { id: 'acl-01', title: 'Default-deny ingress ACLs', standard: 'NIST 800-53' },
  { id: 'mgmt-01', title: 'Disable insecure services (telnet/http)', standard: 'ISO 27001' },
];

export function ConfigurePage() {
  const { devices, standards, setStandards, excludedRuleIds, setExcluded } = useAuditStore();
  const { start, running, error } = useRunAudit();
  const [localStandards, setLocalStandards] = useState<string[]>(standards);
  const navigate = useNavigate();

  function toggleStandard(s: string) {
    setLocalStandards((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  if (!devices.length) {
    return <EmptyState title="No devices uploaded" hint="Go to Upload first, then configure standards." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configure audit</h1>
        <p className="text-sm text-gray-500">{devices.length} device(s) · select standards, optionally exclude rules.</p>
      </div>
      {error && <ErrorAlert message={error} />}

      <Card title="Compliance standards" subtitle="One or more frameworks per run">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Compliance standards">
          {STANDARDS.map((s) => {
            const active = localStandards.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => toggleStandard(s)}
                onBlur={() => setStandards(localStandards)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Rule exclusions" subtitle="Uncheck rules to exclude them from this run">
        <ul className="space-y-2">
          {RULES.map((r) => {
            const excluded = excludedRuleIds.includes(r.id);
            return (
              <li key={r.id} className="flex items-start gap-3 rounded-md border p-3 dark:border-gray-700">
                <input
                  id={`rule-${r.id}`}
                  type="checkbox"
                  checked={!excluded}
                  onChange={() =>
                    setExcluded(excluded ? excludedRuleIds.filter((x) => x !== r.id) : [...excludedRuleIds, r.id])
                  }
                  className="mt-1 h-4 w-4"
                />
                <label htmlFor={`rule-${r.id}`} className="text-sm">
                  <span className="font-medium">{r.title}</span>{' '}
                  <span className="text-gray-500">
                    · {r.id} · {r.standard}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex gap-2">
        <Button
          loading={running}
          onClick={() => {
            setStandards(localStandards.length ? localStandards : ['CIS v8']);
            void start().then(() => navigate('/dashboard'));
          }}
        >
          Run audit
        </Button>
        <Button variant="secondary" onClick={() => navigate('/upload')}>
          Back
        </Button>
      </div>
    </div>
  );
}