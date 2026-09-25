import { useNavigate } from 'react-router-dom';
import { useUpload } from '../hooks/useUpload.ts';
import { UploadDropzone } from '../components/UploadDropzone.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Select, FieldLabel } from '../components/ui/Input.tsx';
import { ErrorAlert } from '../components/ui/Feedback.tsx';
import { VENDOR_LABELS, VENDOR_OPTIONS } from '../utils/vendorDetect.ts';
import { loadDemoData } from '../utils/demoSeed.ts';
import { useAuditStore } from '../store/useAuditStore.ts';

export function UploadPage() {
  const { previews, progress, vendorOverrides, setVendorOverrides, localError, selectFiles, removePreview, doUpload, uploading } =
    useUpload();
  const devices = useAuditStore((s) => s.devices);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload device configs</h1>
        <p className="text-sm text-gray-500">Drag & drop multi-file upload with vendor auto-detect + manual override.</p>
      </div>

      {localError && <ErrorAlert message={localError} />}

      <UploadDropzone onFiles={(f) => void selectFiles(f)} disabled={uploading} />
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>Just exploring?</span>
        <Button
          variant="secondary"
          onClick={() => {
            loadDemoData();
            navigate('/dashboard');
          }}
        >
          Load demo data (3 devices + audit)
        </Button>
        <Button variant="ghost" onClick={() => window.open('/sample-configs/core-sw-01.cfg', '_blank')}>
          Download sample .cfg
        </Button>
      </div>

      {previews.length > 0 && (
        <Card title={`${previews.length} file(s) staged`} subtitle="Confirm vendor, then upload">
          <ul className="space-y-3">
            {previews.map(({ file, vendorGuess }) => (
              <li key={file.name} className="flex flex-wrap items-center gap-3 rounded-md border p-3 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB · auto-detected: {VENDOR_LABELS[vendorGuess as keyof typeof VENDOR_LABELS] ?? vendorGuess}
                  </p>
                  {(progress[file.name] ?? 0) > 0 && (
                    <div
                      role="progressbar"
                      aria-valuenow={progress[file.name]}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Upload progress for ${file.name}`}
                      className="mt-2 h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700"
                    >
                      <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress[file.name]}%` }} />
                    </div>
                  )}
                </div>
                <div className="w-44">
                  <FieldLabel htmlFor={`vendor-${file.name}`}>Vendor</FieldLabel>
                  <Select
                    id={`vendor-${file.name}`}
                    value={vendorOverrides[file.name] ?? vendorGuess}
                    onChange={(e) => setVendorOverrides({ ...vendorOverrides, [file.name]: e.target.value })}
                  >
                    {VENDOR_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {VENDOR_LABELS[v]}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button variant="ghost" onClick={() => removePreview(file.name)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => void doUpload()} loading={uploading}>
              Upload {previews.length} file(s)
            </Button>
          </div>
        </Card>
      )}

      {devices.length > 0 && (
        <Card title="Uploaded devices" subtitle={`${devices.length} device(s) in session`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {devices.map((d) => (
              <li key={d.id} className="rounded-md border px-3 py-2 text-sm dark:border-gray-700">
                <span className="font-medium">{d.hostname}</span>{' '}
                <span className="text-gray-500">
                  · {VENDOR_LABELS[d.vendor]} · {d.filename}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button onClick={() => navigate('/configure')}>Continue to configuration →</Button>
          </div>
        </Card>
      )}
    </div>
  );
}