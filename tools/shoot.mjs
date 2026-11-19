// Takes the screenshots in shots.json with headless Chrome over the DevTools protocol (standard library only).
// Usage: node tools/shoot.mjs [baseUrl]   (serve the app first: node serve.ts --port 8080)
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:8080';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9333;
const shots = JSON.parse(readFileSync('shots.json', 'utf8'));
const MAX = 250 * 1024;
mkdirSync('screenshots', { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'shoot-'))}`,
  '--hide-scrollbars', '--no-first-run', '--disable-gpu', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocket() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* chrome still starting */ }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

try {
  const ws = await pageSocket();
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });

  for (const s of shots) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: base + s.path });
    await sleep(1200);
    if (s.scrollSelector) await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(s.scrollSelector)})?.scrollIntoView({block:'start'})` });
    await sleep(300);
    let q = 82, data;
    for (; q >= 40; q -= 6) {
      const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: q });
      data = Buffer.from(r.result.data, 'base64');
      if (data.length <= MAX) break;
    }
    writeFileSync(join('screenshots', s.file), data);
    console.log(s.file, data.length, 'bytes, quality', q);
  }
  ws.close();
} finally {
  chrome.kill();
}
