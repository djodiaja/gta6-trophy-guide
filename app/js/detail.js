// The detail panel: the selected trophy's official text, own-words guide and cited sources.
import { h } from './dom.js';
import { state, byId, isMasked, toggleEarned, notify } from './store.js';

export function renderDetail(panel) {
  const t = byId(state.selectedId);
  if (!t) { panel.replaceChildren(h('p', { class: 'empty' }, 'Select a trophy.')); return; }
  if (isMasked(t)) {
    panel.replaceChildren(
      h('h2', {}, 'Story trophy hidden'),
      h('p', {}, 'The spoiler setting is on. Earn this trophy, or reveal it just for this session.'),
      h('button', { class: 'btn', onclick: () => { state.revealed.add(t.id); notify(); } }, 'Reveal this one'));
    return;
  }
  const earned = state.earned.has(t.id);
  const stage = state.stages.find((s) => s.n === t.stage);
  panel.replaceChildren(...[
    h('div', { class: 'dhead' }, h('span', { class: `badge ${t.grade}` }, t.grade),
      t.hidden && h('i', { class: 'tag hid' }, 'hidden on PlayStation'),
      h('i', { class: 'tag' }, t.kind)),
    h('h2', {}, t.name),
    h('p', { class: 'official' }, t.description),
    t.count && h('p', { class: 'meta' }, `Tracked count: ${t.count.toLocaleString()} ${t.countUnit || ''}`),
    h('label', { class: 'earn' }, h('input', { type: 'checkbox', checked: earned, onchange: () => toggleEarned(t.id) }), earned ? 'Earned' : 'Mark as earned'),
    h('h3', {}, 'Guide'),
    h('p', { class: 'guide' }, t.guide),
    h('div', { class: `miss ${t.missable ? 'yes' : 'no'}` },
      h('b', {}, t.missable ? 'Possibly missable' : 'Not missable'), ` ${t.missableReason}`),
    stage && h('p', { class: 'meta' }, `Roadmap stage ${stage.n}: ${stage.title}`),
    h('h3', {}, 'Sources'),
    h('ul', { class: 'src' }, t.sources.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.name)))),
    h('p', { class: 'fine' }, 'Links open only when you follow them; this app itself loads nothing from the network.'),
  ].filter(Boolean));
}
