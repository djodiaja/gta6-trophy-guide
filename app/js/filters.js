// Filter model: kind chips, grade, status and a text search over the official name and description.
export const KIND_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'story', label: 'Story' },
  { key: 'missable', label: 'Missable' },
  { key: 'collectible', label: 'Collectibles' },
  { key: 'activity', label: 'Activities' },
  { key: 'online', label: 'Online' },
];

export const filters = { kind: 'all', grade: 'all', status: 'all', query: '' };

export function matches(t, earned, f = filters) {
  if (f.kind !== 'all') {
    // The missable chip flags by the missable boolean, so a story trophy that can be missed shows there too.
    if (f.kind === 'missable' ? !t.missable : t.kind !== f.kind) return false;
  }
  if (f.grade !== 'all' && t.grade !== f.grade) return false;
  if (f.status === 'done' && !earned.has(t.id)) return false;
  if (f.status === 'todo' && earned.has(t.id)) return false;
  const q = f.query.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description).toLowerCase().includes(q)) return false;
  return true;
}

export function countKind(trophies, key) {
  if (key === 'all') return trophies.length;
  if (key === 'missable') return trophies.filter((t) => t.missable).length;
  return trophies.filter((t) => t.kind === key).length;
}
