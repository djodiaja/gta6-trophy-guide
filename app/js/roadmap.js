// The roadmap to platinum (stages from the official descriptions) and the missables view.
import { h } from './dom.js';
import { state } from './store.js';
import { trophyRow } from './render.js';

export function renderRoadmap(pane) {
  const parts = [h('p', { class: 'lead' },
    'Built from the official descriptions: story first, then the one-off trophies you should not leave to chance, then repeatable content. Order inside a stage is flexible.')];
  for (const s of state.stages) {
    const list = state.trophies.filter((t) => t.stage === s.n);
    const done = list.filter((t) => state.earned.has(t.id)).length;
    parts.push(h('section', { class: 'stage' },
      h('div', { class: 'sh' }, h('span', { class: 'sn' }, s.n), h('h3', {}, s.title), h('span', { class: 'sc' }, `${done}/${list.length}`)),
      h('p', { class: 'sd' }, s.detail),
      h('ul', { class: 'rows' }, list.map((t) => trophyRow(t)))));
  }
  pane.replaceChildren(...parts);
}

export function renderMissables(pane) {
  const list = state.trophies.filter((t) => t.missable);
  const open = list.filter((t) => !state.earned.has(t.id)).length;
  pane.replaceChildren(
    h('p', { class: 'lead' }, `${list.length} trophies flagged, ${open} still open. Flags come from the wording of the official descriptions (a choice, a second try, a partner, a contact's strand) and are cautions, not confirmed point-of-no-return facts.`),
    h('ul', { class: 'rows mis-list' }, list.map((t) => {
      const li = trophyRow(t, { showStage: true });
      li.querySelector('.info').append(h('div', { class: 'why' }, t.missableReason));
      return li;
    })));
}
