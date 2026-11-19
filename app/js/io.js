// Export progress to a JSON file and import it back.
export function exportProgress(state) {
  const body = JSON.stringify({ app: 'leonida-trophy-log', version: 1, earned: [...state.earned].sort((a, b) => a - b), spoilers: state.spoilers }, null, 1);
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgress(file, state, maxId) {
  const data = JSON.parse(await file.text());
  if (!data || !Array.isArray(data.earned)) throw new Error('This file has no "earned" list.');
  state.earned = new Set(data.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= maxId));
  if (typeof data.spoilers === 'boolean') state.spoilers = data.spoilers;
}
