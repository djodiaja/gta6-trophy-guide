// Rendering of the header progress, the checklist rows and the filter chips.
import { KIND_CHIPS, countKind, filters, matches } from './filters.js';

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const KIND_LABEL = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', online: 'Online', misc: 'Misc' };

export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

// Story trophies stay hidden while the spoiler setting is on and they are not yet earned.
export function isHidden(t, state) {
  return state.spoilers && t.kind === 'story' && !state.earned.has(t.id);
}

export function gradeBadge(grade) {
  return el('span', 'grade ' + grade, grade);
}

export function renderProgress(trophies, state) {
  document.getElementById('overall-count').textContent = state.earned.size;
  document.getElementById('overall-bar').style.width = (state.earned.size / trophies.length * 100) + '%';
  const box = document.getElementById('grade-bars');
  box.replaceChildren();
  for (const g of GRADES) {
    const all = trophies.filter((t) => t.grade === g);
    const done = all.filter((t) => state.earned.has(t.id)).length;
    const item = el('div', 'gbar ' + g);
    const head = el('div', 'ghead');
    head.append(el('span', '', g), el('b', '', done + '/' + all.length));
    const bar = el('div', 'bar');
    const fill = el('i');
    fill.style.width = (all.length ? done / all.length * 100 : 0) + '%';
    bar.append(fill);
    item.append(head, bar);
    box.append(item);
  }
}

export function renderChips(trophies, onPick) {
  const box = document.getElementById('kind-chips');
  box.replaceChildren();
  for (const c of KIND_CHIPS) {
    const b = el('button', 'chip' + (filters.kind === c.key ? ' on' : ''));
    b.type = 'button';
    b.append(c.label + ' ', el('small', '', String(countKind(trophies, c.key))));
    b.onclick = () => onPick(c.key);
    box.append(b);
  }
}

export function renderRows(trophies, state, selectedId, handlers) {
  const ul = document.getElementById('rows');
  ul.replaceChildren();
  const shown = trophies.filter((t) => matches(t, state.earned));
  document.getElementById('result-note').textContent = filters.kind === 'online' && !shown.length
    ? 'The official list has no online trophies, so there is nothing here.'
    : 'Showing ' + shown.length + ' of ' + trophies.length;
  for (const t of shown) {
    const done = state.earned.has(t.id);
    const hid = isHidden(t, state);
    const li = el('li', 'row ' + t.grade + (done ? ' done' : '') + (t.id === selectedId ? ' sel' : ''));
    const cb = el('input');
    cb.type = 'checkbox';
    cb.checked = done;
    cb.setAttribute('aria-label', 'Earned: ' + (hid ? 'hidden trophy ' + t.id : t.name));
    cb.onclick = (e) => { e.stopPropagation(); handlers.toggle(t.id); };
    const body = el('div', 'rbody');
    const title = el('div', 'rtitle');
    title.append(el('span', 'rname' + (hid ? ' redacted' : ''), hid ? 'Hidden story trophy' : t.name), gradeBadge(t.grade));
    if (t.missable) title.append(el('span', 'flag', 'missable'));
    body.append(title, el('div', 'rdesc' + (hid ? ' redacted' : ''), hid ? 'Earn it to reveal the name and description.' : t.description));
    li.append(cb, body, el('span', 'kindtag', KIND_LABEL[t.kind]));
    li.onclick = () => handlers.select(t.id);
    ul.append(li);
  }
}
