// Header progress, the checklist with its filter bar, and the shared trophy row.
import { h } from './dom.js';
import { state, toggleEarned, notify, isMasked } from './store.js';
import { KIND_CHIPS, countFor, visibleTrophies } from './filters.js';

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

function bar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': done, 'aria-valuemax': total },
    h('span', { style: `width:${pct}%` }));
}

export function renderHeader() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const overall = document.getElementById('overall');
  overall.replaceChildren(
    h('div', { class: 'big' }, `${done}`, h('small', {}, ` / ${total} earned`)),
    bar(done, total),
  );
  const grades = document.getElementById('grades');
  grades.replaceChildren(...GRADES.map((g) => {
    const all = state.trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => state.earned.has(t.id)).length;
    return h('div', { class: `g ${g}` }, h('span', { class: 'gl' }, g), h('b', {}, `${got}/${all.length}`), bar(got, all.length));
  }));
}

export function trophyRow(t, { showStage = false } = {}) {
  const masked = isMasked(t);
  const earned = state.earned.has(t.id);
  const row = h('li', { class: `row${earned ? ' earned' : ''}${state.selectedId === t.id ? ' sel' : ''}`, 'data-id': t.id },
    h('input', {
      type: 'checkbox', checked: earned, 'aria-label': `Earned: ${masked ? 'hidden trophy' : t.name}`,
      onclick: (e) => e.stopPropagation(),
      onchange: () => toggleEarned(t.id),
    }),
    h('div', { class: 'info' },
      h('div', { class: 'nm' }, masked ? 'Hidden story trophy' : t.name,
        t.hidden && h('i', { class: 'tag hid', title: 'Hidden on PlayStation until earned' }, 'hidden'),
        t.missable && h('i', { class: 'tag mis' }, 'missable?'),
        showStage && h('i', { class: 'tag stg' }, `stage ${t.stage}`)),
      h('div', { class: 'ds' }, masked ? 'Description hidden by the spoiler setting.' : t.description)),
    h('span', { class: `badge ${t.grade}` }, t.grade),
  );
  row.addEventListener('click', () => { state.selectedId = t.id; notify(); });
  return row;
}

export function renderChecklist(pane) {
  const f = state.filters;
  const chips = h('div', { class: 'chips' }, KIND_CHIPS.map(([k, label]) =>
    h('button', { class: `chip${f.kind === k ? ' on' : ''}`, onclick: () => { f.kind = k; notify(); } }, label, h('em', {}, countFor(k)))));
  const grade = h('select', { 'aria-label': 'Grade filter', onchange: (e) => { f.grade = e.target.value; notify(); } },
    ['all', ...GRADES].map((g) => h('option', { value: g, selected: f.grade === g }, g === 'all' ? 'Any grade' : g)));
  const search = h('input', { type: 'search', placeholder: 'Search name or description', value: f.query, 'aria-label': 'Search',
    oninput: (e) => { f.query = e.target.value; notify(true); } });
  const list = visibleTrophies();
  const body = list.length
    ? h('ul', { class: 'rows' }, list.map((t) => trophyRow(t)))
    : h('p', { class: 'empty' }, f.kind === 'online'
      ? 'The official list has no online trophies: all 55 are earned in single player.'
      : 'No trophy matches these filters.');
  pane.replaceChildren(h('div', { class: 'filters' }, chips, h('div', { class: 'fl2' }, grade, search)),
    h('p', { class: 'count' }, `Showing ${list.length} of ${state.trophies.length}`), body);
  if (f.query) { const s = pane.querySelector('input[type=search]'); s.focus(); s.setSelectionRange(f.query.length, f.query.length); }
}
