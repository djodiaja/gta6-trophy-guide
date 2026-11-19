// Roadmap to the platinum and the missables view, both built from the trophy data.
import { el, gradeBadge, isHidden } from './render.js';

export const STAGES = [
  { id: 1, title: 'Play the story', note: 'Chapters 1 to 4 and the named missions. Story order is fixed by the game.' },
  { id: 2, title: 'Contact lines and strangers', note: 'Final missions for Andy, Kenton, Billy, Randy and Tyrone, plus 8 stranger strands. Finish them before the last mission.' },
  { id: 3, title: 'Activities', note: 'Races, drone races, shooting range, fishing, arcade, hunting and trying every activity type.' },
  { id: 4, title: 'Collectibles and exploring', note: 'Stunts, meditation spots, cards, WAiNK locations, vehicles, challenges and map exploration.' },
  { id: 5, title: 'Crime and combat', note: 'Shops, jewelry, vaults, armored trucks, gang operations, Combat Focus and the airport.' },
  { id: 6, title: 'With your partner', note: 'Two trophies that need your partner beside you.' },
  { id: 7, title: 'Odd moments', note: 'Cryptic and one-off trophies. Read the missables view before you start.' },
  { id: 8, title: 'Money and properties, then the finale', note: 'Cash goals, garages and the final mission.' },
  { id: 9, title: 'Finish line', note: '100% completion, then the platinum pops.' },
];

function stageRow(t, state, onSelect) {
  const hid = isHidden(t, state);
  const li = el('li', 'sr' + (state.earned.has(t.id) ? ' done' : ''));
  li.append(el('span', 'tick', state.earned.has(t.id) ? '✓' : '○'));
  li.append(el('span', 'srname' + (hid ? ' redacted' : ''), hid ? 'Hidden story trophy' : t.name));
  if (t.count) li.append(el('span', 'count', '× ' + t.count.toLocaleString('en-US')));
  li.append(gradeBadge(t.grade));
  if (t.missable) li.append(el('span', 'flag', 'missable'));
  li.append(el('span', 'srdesc' + (hid ? ' redacted' : ''), hid ? '' : t.description));
  li.onclick = () => onSelect(t.id);
  return li;
}

export function renderRoadmap(trophies, state, onSelect) {
  const box = document.getElementById('view-roadmap');
  box.replaceChildren();
  box.append(el('h2', '', 'Roadmap to the platinum'));
  box.append(el('p', 'lead', 'The platinum needs the other 54 trophies, including the gold for 100% completion. Work through the stages in order; each is built from the official descriptions.'));
  const grid = el('div', 'stages');
  for (const s of STAGES) {
    const items = trophies.filter((t) => t.stage === s.id);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    const card = el('section', 'stage');
    const h = el('h3');
    h.append(el('span', 'snum', String(s.id)), s.title, el('small', '', done + '/' + items.length));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = (items.length ? done / items.length * 100 : 0) + '%';
    bar.append(fill);
    const ul = el('ul', 'srows');
    for (const t of items) ul.append(stageRow(t, state, onSelect));
    card.append(h, el('p', 'note', s.note), bar, ul);
    grid.append(card);
  }
  box.append(grid);
}

export function renderMissables(trophies, state, onSelect) {
  const box = document.getElementById('view-missables');
  box.replaceChildren();
  const list = trophies.filter((t) => t.missable);
  box.append(el('h2', '', 'Missables: ' + list.length + ' trophies flagged'));
  box.append(el('p', 'lead', 'Flags are inferred from the official descriptions (a one-off moment, a cryptic hint, a running tally or a point of no return). The public listings do not confirm any lock-out, so treat these as precautions: keep a save before the finale.'));
  const ul = el('ul', 'mlist');
  for (const t of list) {
    const hid = isHidden(t, state);
    const li = el('li', 'mrow' + (state.earned.has(t.id) ? ' done' : ''));
    const top = el('div', 'rtitle');
    top.append(el('span', 'rname' + (hid ? ' redacted' : ''), hid ? 'Hidden story trophy' : t.name), gradeBadge(t.grade), el('span', 'flag', 'missable'));
    if (state.earned.has(t.id)) top.append(el('span', 'earned', 'earned'));
    li.append(top, el('div', 'rdesc' + (hid ? ' redacted' : ''), hid ? '' : t.description), el('div', 'miss warn', t.missable_reason));
    li.onclick = () => onSelect(t.id);
    ul.append(li);
  }
  box.append(ul);
}
