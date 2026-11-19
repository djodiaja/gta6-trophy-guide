// Export progress to a JSON file and import it back.
import { snapshot, applyProgress, persist, notify } from './store.js';

export function exportProgress() {
  const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    applyProgress(Array.isArray(data) ? { earned: data } : data);
    persist();
    notify();
  } catch {
    alert('That file is not a progress export from this app.');
  }
}
