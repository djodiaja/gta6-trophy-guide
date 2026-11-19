// Boot: load data, wire the tabs and controls, and re-render when state changes.
import { state, loadData, onChange, persist, notify } from './store.js';
import { renderHeader, renderChecklist } from './render.js';
import { renderDetail } from './detail.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { exportProgress, importProgress } from './io.js';

await loadData();

const pane = document.getElementById('listPane');
const detail = document.getElementById('detail');
const spoiler = document.getElementById('spoiler');
spoiler.checked = state.spoilerGuard;

function draw() {
  renderHeader();
  const views = { checklist: renderChecklist, roadmap: renderRoadmap, missables: renderMissables };
  const keepScroll = pane.scrollTop;
  views[state.view](pane);
  pane.scrollTop = keepScroll;
  renderDetail(detail);
  document.querySelectorAll('#tabs [data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === state.view));
}

onChange(draw);
document.getElementById('tabs').addEventListener('click', (e) => {
  const v = e.target.dataset?.view;
  if (v) { state.view = v; notify(); }
});
spoiler.addEventListener('change', () => { state.spoilerGuard = spoiler.checked; persist(); notify(); });
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', async (e) => {
  if (e.target.files[0]) await importProgress(e.target.files[0]);
  spoiler.checked = state.spoilerGuard;
  e.target.value = '';
});
draw();
