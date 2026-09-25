import type { Vendor } from '../types/index.ts';

/**
 * Heuristic vendor auto-detect from config text + filename.
 * Backend/ML can replace this with a classifier; the Upload page
 * already supports manual override per file.
 */
export function detectVendor(filename: string, previewText: string): Vendor {
  const hay = `${filename}\n${previewText}`.toLowerCase();
  if (/hostname|interface gigabit|ip ssh version|logging buffered/.test(hay)) return 'cisco';
  if (/set system host-name|set interfaces ge-|junos/.test(hay)) return 'juniper';
  if (/set deviceconfig|panorama|vsys/.test(hay)) return 'paloalto';
  if (/eos|arista|interface ethernet/.test(hay)) return 'arista';
  return 'unknown';
}

export const VENDOR_LABELS: Record<Vendor, string> = {
  cisco: 'Cisco',
  juniper: 'Juniper',
  paloalto: 'Palo Alto',
  arista: 'Arista',
  unknown: 'Unknown',
};

export const VENDOR_OPTIONS: Vendor[] = ['cisco', 'juniper', 'paloalto', 'arista', 'unknown'];