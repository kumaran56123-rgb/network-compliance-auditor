import { useState } from 'react';
import { uploadConfig } from '../api/audits.ts';
import { toErrorMessage } from '../api/client.ts';
import type { UploadProgress } from '../api/types.ts';
import { useAuditStore } from '../store/useAuditStore.ts';
import { detectVendor } from '../utils/vendorDetect.ts';

/** Handles file selection, vendor auto-detect, validation + upload progress. */
export function useUpload() {
  const { setDevices, setStatus } = useAuditStore();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [vendorOverrides, setVendorOverrides] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ file: File; vendorGuess: string }[]>([]);

  async function selectFiles(files: File[]) {
    setLocalError(null);
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        setLocalError(`"${f.name}" exceeds 5MB and was skipped.`);
        return false;
      }
      return true;
    });
    // Peek at first 4KB for vendor heuristics without blocking the UI.
    const withGuess = await Promise.all(
      valid.map(async (file) => {
        let text = '';
        try {
          text = (await file.slice(0, 4096).text()).slice(0, 2000);
        } catch {
          text = '';
        }
        return { file, vendorGuess: detectVendor(file.name, text) };
      }),
    );
    setPreviews((p) => [...p, ...withGuess]);
  }

  function removePreview(filename: string) {
    setPreviews((p) => p.filter((x) => x.file.name !== filename));
  }

  async function doUpload() {
    if (!previews.length) {
      setLocalError('Select at least one config file first.');
      return;
    }
    setStatus('uploading');
    setLocalError(null);
    try {
      const devices = await uploadConfig(
        previews.map((p) => p.file),
        vendorOverrides,
        (p: UploadProgress) => setProgress((prev) => ({ ...prev, [p.filename]: p.loadedPct })),
      );
      // Apply auto-detected vendor where the user did not override.
      const enriched = devices.map((d) => {
        const guess = previews.find((p) => p.file.name === d.filename)?.vendorGuess;
        if (d.vendor === 'unknown' && guess && guess !== 'unknown') {
          return { ...d, vendor: guess as typeof d.vendor };
        }
        return d;
      });
      setDevices(enriched);
      setPreviews([]);
      setProgress({});
    } catch (err) {
      const msg = toErrorMessage(err);
      setStatus('error', msg);
      setLocalError(msg);
    }
  }

  return {
    previews,
    progress,
    vendorOverrides,
    setVendorOverrides,
    localError,
    selectFiles,
    removePreview,
    doUpload,
    uploading: useAuditStore((s) => s.status) === 'uploading',
  };
}