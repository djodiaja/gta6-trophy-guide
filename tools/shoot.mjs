// Takes the README/dossier screenshots: starts headless Chrome, drives the running app (node serve.ts --port 8080)
// over the DevTools protocol and writes 1280x800 JPEGs to screenshots/. Standard library only.
// Usage: node tools/shoot.mjs [url]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:8080/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const out = new URL('../screenshots/', import.meta.url);
mkdirSync(out, { recursive: true });

const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, '--headless=new', '--hide-scrollbars', '--no-first-run',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shoot-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetSocket() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* chrome still starting */ }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await targetSocket());
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve) => {
  const n = ++id; pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params }));
});
const run = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true })).result?.result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

async function load(earned, spoilerGuard) {
  await send('Page.navigate', { url });
  await sleep(600);
  await run(`localStorage.setItem('leonida-trophy-log/v1', JSON.stringify({earned:${JSON.stringify(earned)},spoilerGuard:${spoilerGuard}}))`);
  await send('Page.navigate', { url });
  await sleep(900);
}
const click = (sel, text) => run(`[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>!${JSON.stringify(text ?? '')}||e.textContent.includes(${JSON.stringify(text ?? '')}))?.click()`);

async function shot(file) {
  await sleep(300);
  for (const q of [82, 70, 58, 46, 34]) {
    const { result } = await send('Page.captureScreenshot', { format: 'jpeg', quality: q });
    const buf = Buffer.from(result.data, 'base64');
    if (buf.length < 250 * 1024 || q === 34) { writeFileSync(new URL(file, out), buf); console.log(file, buf.length, 'bytes, q', q); return; }
  }
}

const progress = [1, 2, 3, 4, 5, 8, 9, 16, 20, 21, 28, 35, 39, 41, 44, 46, 52];

await load(progress, false);
await click('.row .nm', 'The Shootist');
await shot('1-checklist-guide.jpg');

await click('#tabs button', 'Roadmap');
await click('.row .nm', 'Sneakthief');
await shot('2-roadmap.jpg');

await click('#tabs button', 'Missables');
await click('.row .nm', 'Actions Speak Louder');
await shot('3-missables.jpg');

await load([2, 3, 4, 8, 9, 20, 21, 28, 35], true);
await click('.chip', 'Story');
await click('.row .nm', 'Hidden story trophy');
await shot('4-spoilers-story.jpg');

ws.close();
chrome.kill();
