// Shared state: the trophy data, earned set, settings and selection, saved in localStorage.
const KEY = 'leonida-trophy-log/v1';

export const state = {
  trophies: [],
  stages: [],
  earned: new Set(),
  spoilerGuard: false,
  revealed: new Set(),
  selectedId: null,
  view: 'checklist',
  filters: { kind: 'all', grade: 'all', query: '' },
};

const listeners = [];
export function onChange(fn) { listeners.push(fn); }
export function notify() { for (const fn of listeners) fn(); }

export async function loadData() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  state.trophies = doc.trophies;
  state.stages = doc.stages || [];
  state.selectedId = state.trophies[0].id;
  readSaved();
}

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    applyProgress(saved);
  } catch { /* storage blocked or corrupt: start empty */ }
}

// Accepts the saved/exported object; ignores ids that are not real trophies.
export function applyProgress(saved) {
  const ids = new Set(state.trophies.map((t) => t.id));
  state.earned = new Set((saved.earned || []).filter((id) => ids.has(id)));
  state.spoilerGuard = Boolean(saved.spoilerGuard);
}

export function snapshot() {
  return { app: 'leonida-trophy-log', version: 1, earned: [...state.earned].sort((a, b) => a - b), spoilerGuard: state.spoilerGuard };
}

export function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(snapshot())); } catch { /* ignore */ }
}

export function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
  persist();
  notify();
}

export function byId(id) { return state.trophies.find((t) => t.id === id); }

// A story trophy is masked while the spoiler setting is on, until it is earned or revealed.
export function isMasked(t) {
  return state.spoilerGuard && t.kind === 'story' && !state.earned.has(t.id) && !state.revealed.has(t.id);
}
