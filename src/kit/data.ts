// Kaotic Chainz app kit: generated copy. Edit in app-portfolio/kit, then run scripts/sync-kit.sh.
// "Your data" controls: export everything as JSON, delete everything. Both are local because
// the data only lives on the device.
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { track } from './analytics';
import { kv } from './storage';
import { storedKeys, wipeAll } from './store';

export function buildExport(app: string, version: string): string {
  const data: Record<string, unknown> = {};
  for (const k of storedKeys(app)) {
    if (k.includes('.analytics.') || k.includes('.premium.')) continue;
    const raw = kv.get(k);
    try {
      data[k] = raw ? JSON.parse(raw) : null;
    } catch {
      data[k] = raw;
    }
  }
  return JSON.stringify({ app, version, exportedAt: new Date().toISOString(), data }, null, 2);
}

export async function exportData(app: string, version: string): Promise<{ ok: boolean; message: string }> {
  const json = buildExport(app, version);
  const name = `${app}-export-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const file = new File(Paths.cache, name);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      if (!(await Sharing.isAvailableAsync())) return { ok: false, message: "Sharing isn't available on this device." };
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export your data' });
    }
    track('data_exported');
    return { ok: true, message: 'Export ready.' };
  } catch {
    return { ok: false, message: "Couldn't export. Please try again." };
  }
}

export function deleteAllData(app: string) {
  track('data_deleted');
  wipeAll(app);
}
