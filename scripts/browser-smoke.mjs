// Optional smoke test with an installed Chrome; no extra test dependency.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const chromePath = process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(join(tmpdir(), 'geometry-chrome-'));
const processes = [];
const errors = [];
const checks = [];
let socket;
let output = '';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function launch(bin, args) {
  const child = spawn(bin, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  child.on('error', error => errors.push(error.message));
  processes.push(child);
  return child;
}
async function waitFor(fn, label, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const result = await fn(); if (result) return result; } catch { /* retry startup */ }
    if (errors.length) throw new Error(errors.join('\n'));
    await delay(150);
  }
  throw new Error(`Timeout: ${label}\n${output.slice(-3000)}`);
}
try {
  launch(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5183', '--strictPort']);
  await waitFor(async () => (await fetch('http://127.0.0.1:5183/')).ok, 'Vite');
  launch(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--remote-debugging-port=9233', '--enable-unsafe-swiftshader', 'about:blank']);
  const pages = await waitFor(async () => {
    const list = await (await fetch('http://127.0.0.1:9233/json/list')).json();
    return list.find(page => page.type === 'page');
  }, 'Chrome');
  socket = new WebSocket(pages.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const item = pending.get(message.id);
      if (!item) return;
      clearTimeout(item.timer); pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      runtimeErrors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
    }
  };
  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  }
  async function click(label) {
    await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(b => b.textContent.includes(${JSON.stringify(label)}) || b.getAttribute('aria-label') === ${JSON.stringify(label)});
      if (!button) throw new Error('Missing button: ' + ${JSON.stringify(label)});
      button.click();
    })()`);
    await delay(180);
  }
  async function includes(text) {
    assert.ok(await evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`), `Missing text: ${text}`);
  }
  async function answer(value) {
    await evaluate(`(() => {
      const input = document.querySelector('#answer');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await delay(100);
  }
  async function range(value, index = 0) {
    await evaluate(`(() => {
      const input = document.querySelectorAll('input[type="range"]')[${index}];
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(String(value))});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await delay(200);
  }
  async function screenshot(name) {
    const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await mkdir(join(root, 'docs/screenshots'), { recursive: true });
    await writeFile(join(root, 'docs/screenshots', name), Buffer.from(result.data, 'base64'));
  }
  async function sceneImage() {
    const clip = await evaluate(`(() => {
      const rect = document.querySelector('canvas').getBoundingClientRect();
      return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height, scale: 1 };
    })()`);
    return (await cdp('Page.captureScreenshot', { format: 'png', clip })).data;
  }
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:5183/' });
  await waitFor(() => evaluate(`!!document.querySelector('canvas') && document.querySelector('canvas').width > 0`), 'Canvas', 30000);
  await delay(1200);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  await screenshot('desktop.png');
  checks.push('Desktop 1365 px: Canvas rendered; topics initially closed');
  // Compare actual renderer output, not just button events.
  const before = await sceneImage();
  await click('Phóng to');
  assert.notEqual(await sceneImage(), before, 'Zoom must change the rendered image');
  await click('Góc nhìn ban đầu');
  assert.equal(await sceneImage(), before, 'Reset must restore the rendered image');
  await click('Xoay sang trái');
  assert.notEqual(await sceneImage(), before, 'Rotate must change the rendered image');
  await click('Góc nhìn ban đầu');
  checks.push('Zoom, rotate and reset change/restore actual WebGL output');
  await click('Diện tích'); await includes('36 cm²');
  await click('Toàn phần'); await includes('54 cm²');
  await click('Thể tích'); await includes('27 cm³');
  await evaluate(`document.querySelector('input[type="checkbox"]').click()`); await delay(200);
  await includes('Có 27 khối đơn vị');
  await click('Kích thước'); await range(10);
  await includes('10 cm');
  await click('Thể tích'); await includes('1000 cm³');
  assert.equal(await evaluate(`document.querySelector('input[type="checkbox"]').disabled`), true);
  checks.push('Cube formulas, dimension update, 27 unit cubes and upper limit');
  await click('Hình hộp chữ nhật');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  await click('Diện tích'); await includes('32 cm²');
  await click('Toàn phần'); await includes('62 cm²');
  await click('Thể tích'); await includes('30 cm³');
  await click('Đỉnh, cạnh và mặt'); await includes('8 đỉnh');
  await click('Xem cạnh'); await includes('12 cạnh');
  await click('Xem mặt'); await includes('6 mặt');
  await click('Đỉnh, cạnh và mặt');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  checks.push('Cuboid formulas, 8/12/6 counts, topic toggling and shape reset');
  await click('Bài tập');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Kiểm tra đáp án'); await includes('Hãy nhập một số hợp lệ');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await answer('5'); await click('Kiểm tra đáp án'); await includes('Chưa đúng');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await answer('12'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Xem đáp án'); await includes('4 + 4 + 4 = 12 cạnh.');
  await click('Làm lại');
  assert.equal(await evaluate(`document.querySelector('#answer').value`), '');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Bài tiếp theo'); await includes('BÀI 2/4');
  await click('Xem đáp án'); await includes('Sxq = 2 × (5 + 3) × 2 = 32 cm².');
  await click('Bài tiếp theo'); await includes('BÀI 3/4');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Hình lập phương'); await click('Bài tập'); await includes('BÀI 1/4');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await answer('7'); await click('Kiểm tra đáp án'); await includes('Chưa đúng');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await answer('8'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Xem đáp án'); await includes('4 + 4 = 8 đỉnh.');
  await click('Kích thước'); await includes('3 cm');
  checks.push('Exercises: hidden solution, invalid/wrong/right answers, reset, next, shape reset');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(250);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Mobile must not overflow');
  assert.ok(await evaluate(`document.querySelector('.explore-card').getBoundingClientRect().top >= document.querySelector('.viewer-card').getBoundingClientRect().bottom`), 'Mobile panels must stack');
  await evaluate('window.scrollTo(0, 0)');
  await screenshot('mobile.png');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true });
  await delay(200);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), '360px must not overflow');
  checks.push('Mobile 390/360 px: no horizontal overflow; stacked panels');
  assert.deepEqual(runtimeErrors, [], 'No browser runtime errors');
  console.log(JSON.stringify({ checks, runtimeErrors, screenshots: 'docs/screenshots/' }, null, 2));
} finally {
  socket?.close();
  for (const child of processes.reverse()) child.kill('SIGTERM');
  await delay(400);
  await rm(profile, { recursive: true, force: true });
}
