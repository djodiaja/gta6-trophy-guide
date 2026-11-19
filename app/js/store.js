// Saved state: which trophies are earned and the spoiler setting, kept in localStorage.
const KEY = 'leonida-trophy-log-v1';

function readRaw() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') || {}; } catch { return {}; }
}

export function loadState() {
  const raw = readRaw();
  return {
    earned: new Set(Array.isArray(raw.earned) ? raw.earned : []),
    spoilers: raw.spoilers === true,
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), spoilers: state.spoilers }));
  } catch { /* storage may be blocked; the app still works for this session */ }
}

export function toggleEarned(state, id) {
  if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
  saveState(state);
}
