// The detail panel: official text, the guide, missable note and cited sources for the selected trophy.
import { el, gradeBadge, isHidden, KIND_LABEL } from './render.js';
import { STAGES } from './roadmap.js';

export function renderDetail(t, state, onToggle) {
  const box = document.getElementById('detail');
  box.replaceChildren();
  if (!t) {
    box.append(el('p', 'empty', 'Pick a trophy to read its guide and see where each fact comes from.'));
    return;
  }
  const hid = isHidden(t, state);
  const head = el('div', 'dhead');
  head.append(gradeBadge(t.grade), el('span', 'kindtag', KIND_LABEL[t.kind]));
  if (t.missable) head.append(el('span', 'flag', 'missable'));
  box.append(head);
  box.append(el('h2', hid ? 'redacted' : '', hid ? 'Hidden story trophy' : t.name));
  box.append(el('p', 'official' + (hid ? ' redacted' : ''), hid ? 'Spoiler setting is on. Mark it earned or turn the setting off to read this.' : t.description));
  const stage = STAGES.find((s) => s.id === t.stage);
  const meta = el('p', 'meta', 'Roadmap stage ' + t.stage + ': ' + (stage ? stage.title : '') + (t.count ? ' · count ' + t.count.toLocaleString('en-US') : ''));
  box.append(meta);
  if (hid) return;

  const done = state.earned.has(t.id);
  const btn = el('button', 'primary', done ? 'Earned (click to undo)' : 'Mark as earned');
  btn.type = 'button';
  btn.onclick = () => onToggle(t.id);
  box.append(btn);

  box.append(el('h3', '', 'Guide'));
  box.append(el('p', 'guide', t.guide));

  box.append(el('h3', '', t.missable ? 'Missable note' : 'Can it be missed?'));
  box.append(el('p', 'miss' + (t.missable ? ' warn' : ''), t.missable_reason));

  box.append(el('h3', '', 'Sources'));
  const ul = el('ul', 'sources');
  for (const s of t.sources) {
    const li = el('li');
    const a = el('a', '', s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a, el('small', '', ' ' + new URL(s.url).hostname));
    ul.append(li);
  }
  box.append(ul);
}
