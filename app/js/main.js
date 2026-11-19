// Entry point: loads the trophy data, wires the controls and re-renders on every change.
import { loadState, saveState, toggleEarned } from './store.js';
import { filters } from './filters.js';
import { renderProgress, renderChips, renderRows } from './render.js';
import { renderDetail } from './detail.js';
import { renderRoadmap, renderMissables } from './roadmap.js';
import { exportProgress, importProgress } from './io.js';

const state = loadState();
let trophies = [];
let selectedId = null;
let view = 'checklist';

const $ = (id) => document.getElementById(id);

function refresh() {
  renderProgress(trophies, state);
  renderChips(trophies, (k) => { filters.kind = k; refresh(); });
  renderRows(trophies, state, selectedId, { toggle, select });
  renderDetail(trophies.find((t) => t.id === selectedId), state, toggle);
  if (view === 'roadmap') renderRoadmap(trophies, state, select);
  if (view === 'missables') renderMissables(trophies, state, select);
  $('spoiler').checked = state.spoilers;
}

function toggle(id) { toggleEarned(state, id); refresh(); }
function select(id) { selectedId = id; showView('checklist'); refresh(); }

function showView(v) {
  view = v;
  for (const name of ['checklist', 'roadmap', 'missables']) $('view-' + name).hidden = name !== v;
  for (const b of $('tabs').querySelectorAll('[data-view]')) b.classList.toggle('on', b.dataset.view === v);
  if (v === 'roadmap') renderRoadmap(trophies, state, select);
  if (v === 'missables') renderMissables(trophies, state, select);
}

async function start() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies;
  selectedId = trophies[0].id;

  $('tabs').onclick = (e) => { const b = e.target.closest('[data-view]'); if (b) showView(b.dataset.view); };
  $('grade').onchange = (e) => { filters.grade = e.target.value; refresh(); };
  $('status').onchange = (e) => { filters.status = e.target.value; refresh(); };
  $('search').oninput = (e) => { filters.query = e.target.value; refresh(); };
  $('spoiler').onchange = (e) => { state.spoilers = e.target.checked; saveState(state); refresh(); };
  $('export').onclick = () => exportProgress(state);
  $('import').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { await importProgress(file, state, trophies.length); saveState(state); refresh(); }
    catch (err) { $('result-note').textContent = 'Import failed: ' + err.message; }
    e.target.value = '';
  };
  const params = new URLSearchParams(location.search);
  if (params.has('demo')) applyDemo(params);
  refresh();
}

// Used by the screenshot tool: ?demo=1&view=roadmap&spoilers=1&sel=17&kind=collectible
function applyDemo(p) {
  if (p.get('earned')) { state.earned = new Set(p.get('earned').split(',').map(Number)); saveState(state); }
  if (p.has('spoilers')) { state.spoilers = p.get('spoilers') === '1'; saveState(state); }
  if (p.get('sel')) selectedId = Number(p.get('sel'));
  if (p.get('kind')) filters.kind = p.get('kind');
  if (p.get('grade')) { filters.grade = p.get('grade'); $('grade').value = filters.grade; }
  if (p.get('view')) showView(p.get('view'));
}

start();
