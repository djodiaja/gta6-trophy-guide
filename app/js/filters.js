// Filtering by kind, grade and search text, plus the counts shown on the filter chips.
import { state } from './store.js';

export const KIND_CHIPS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['online', 'Online'],
];

export function matchesKind(t, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return t.missable;
  return t.kind === kind;
}

export function visibleTrophies() {
  const { kind, grade, query } = state.filters;
  const q = query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (!matchesKind(t, kind)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function countFor(kind) {
  return state.trophies.filter((t) => matchesKind(t, kind)).length;
}
