// Optional smoke test with an installed Chrome; no extra test dependency.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import viteConfig from '../vite.config.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pageUrl = process.env.QA_BASE_URL || `http://127.0.0.1:5183${viteConfig.base}`;
const screenshotDir = process.env.QA_SCREENSHOT_DIR || join(root, 'docs/screenshots');
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
  if (!process.env.QA_BASE_URL) {
    const mode = process.env.QA_PREVIEW === '1' ? ['preview'] : [];
    launch(process.execPath, ['node_modules/vite/bin/vite.js', ...mode, '--host', '127.0.0.1', '--port', '5183', '--strictPort']);
  }
  await waitFor(async () => (await fetch(pageUrl)).ok, 'Website');
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
  async function pressKey(key, code, keyCode) {
    const params = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
    const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : '';
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', ...params, text, unmodifiedText: text });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
    await delay(200);
  }
  async function checkLayout(label, stacked = false) {
    const result = await evaluate(`(() => {
      const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
      const describe = element => element.textContent.trim().slice(0, 70);
      const containers = [...document.querySelectorAll('.viewer-card, .explore-card, .knowledge-content, .formula, .exercise-panel, .choice-buttons, .view-controls')];
      const overflow = containers.filter(visible).filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.className);
      const text = [...document.querySelectorAll('.intro p, .shape-card strong, .viewer-hint, .panel-intro, .empty-panel p, .knowledge-content p, .knowledge-content h3, .knowledge-content label, .formula strong, .formula span, .dimension-row > span, .exercise-panel input, .solution strong, button')];
      const smallText = text.filter(visible).filter(element => parseFloat(getComputedStyle(element).fontSize) < 18).map(describe);
      const smallButtons = [...document.querySelectorAll('button')].filter(visible).filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).map(describe);
      const missingCameraLabels = [...document.querySelectorAll('.view-controls button')].filter(button => {
        const range = document.createRange();
        const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!/[a-zA-ZÀ-ỹ]/.test(node.textContent) || node.parentElement.closest('[aria-hidden="true"]')) continue;
          range.selectNodeContents(node);
          if ([...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0) && getComputedStyle(node.parentElement).visibility !== 'hidden') return false;
        }
        return true;
      }).map(button => button.getAttribute('aria-label') || describe(button));
      return {
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        overflow, smallText, smallButtons, missingCameraLabels,
        stacked: document.querySelector('.explore-card').getBoundingClientRect().top >= document.querySelector('.viewer-card').getBoundingClientRect().bottom,
      };
    })()`);
    assert.equal(result.pageOverflow, false, `${label}: page must not overflow horizontally`);
    assert.deepEqual(result.overflow, [], `${label}: content must not be clipped inside cards`);
    assert.deepEqual(result.smallText, [], `${label}: main text must be at least 18px`);
    assert.deepEqual(result.smallButtons, [], `${label}: buttons must provide a 44px target`);
    assert.deepEqual(result.missingCameraLabels, [], `${label}: camera labels must remain visible`);
    if (stacked) assert.ok(result.stacked, `${label}: learning panels must stack`);
  }
  async function screenshot(name) {
    const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await mkdir(screenshotDir, { recursive: true });
    await writeFile(join(screenshotDir, name), Buffer.from(result.data, 'base64'));
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
  await cdp('DOM.enable');
  await cdp('CSS.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: pageUrl });
  await waitFor(() => evaluate(`!!document.querySelector('canvas') && document.querySelector('canvas').width > 0`), 'Canvas', 30000);
  await evaluate('document.fonts.ready.then(() => true)');
  const { root: documentRoot } = await cdp('DOM.getDocument');
  for (const selector of ['.intro h1 em', '.intro p', '.shape-card strong']) {
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: documentRoot.nodeId, selector });
    const { fonts } = await cdp('CSS.getPlatformFontsForNode', { nodeId });
    assert.ok(fonts.length > 0 && fonts.every(font => font.isCustomFont && font.familyName.includes('Nunito')), `${selector}: Latin and Vietnamese text must use the bundled Nunito font without fallback: ${JSON.stringify(fonts)}`);
  }
  checks.push('Vietnamese typography: headline, body and shape labels use bundled Nunito for all glyphs');
  await delay(1200);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  await checkLayout('Desktop: initial view');
  await screenshot('desktop.png');
  checks.push('Desktop 1280 px: Canvas rendered; topics initially closed');
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
  // Real keyboard events verify native button and range behavior, including focus.
  await click('Kích thước');
  await evaluate(`document.querySelector('.topic-list button').focus()`);
  await pressKey('Tab', 'Tab', 9);
  assert.ok(await evaluate(`document.activeElement.textContent.includes('Kích thước')`), 'Tab must move to the next topic');
  assert.ok(await evaluate(`document.activeElement.matches(':focus-visible') && parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2`), 'Keyboard focus must be visible');
  await pressKey('Enter', 'Enter', 13);
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-expanded')`), 'true');
  await evaluate(`document.querySelector('input[type="range"]').focus()`);
  await pressKey('ArrowRight', 'ArrowRight', 39);
  assert.equal(await evaluate(`document.querySelector('input[type="range"]').value`), '4');
  await includes('4 cm');
  await evaluate(`document.querySelector('.topic-list [aria-expanded="true"]').focus()`);
  await pressKey(' ', 'Space', 32);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  checks.push('Keyboard: Tab and visible focus; Enter/Space open and close topics; ArrowRight changes dimensions');
  for (const [width, height] of [[1280, 1100], [1024, 900], [768, 1024], [390, 844], [360, 800]]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 390 });
    await delay(250);
    // Reset both shape state and exercise progress for each viewport.
    await click('Hình lập phương');
    await click('Hình hộp chữ nhật');
    await checkLayout(`${width}px: initial view`, width <= 1040);
    await evaluate('window.scrollTo(0, 0)');
    if (width === 390) await screenshot('mobile.png');
    if (width === 768) {
      await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
      await screenshot('tablet.png');
    }
    await click('Đỉnh, cạnh và mặt');
    await click('Xem mặt');
    await checkLayout(`${width}px: features`);
    await click('Kích thước');
    await checkLayout(`${width}px: dimensions`);
    if (width === 360) {
      await evaluate(`document.querySelector('.scene').scrollIntoView({ block: 'center' })`);
      await screenshot('mobile-dimensions.png');
      const clippedLabels = await evaluate(`(() => {
        const scene = document.querySelector('.scene').getBoundingClientRect();
        return [...document.querySelectorAll('.dimension-label')].flatMap(label => {
          const rect = label.getBoundingClientRect();
          if (rect.left >= scene.left && rect.right <= scene.right && rect.top >= scene.top && rect.bottom <= scene.bottom) return [];
          return [{ text: label.textContent, left: rect.left - scene.left, right: rect.right - scene.left, top: rect.top - scene.top, bottom: rect.bottom - scene.top, sceneWidth: scene.width, sceneHeight: scene.height }];
        });
      })()`);
      assert.deepEqual(clippedLabels, [], '360px: dimension labels must fit inside the scene at the initial camera angle');
      await click('Xoay sang trái');
      await screenshot('mobile-dimensions-rotated.png');
      await click('Phóng to');
      await screenshot('mobile-dimensions-zoomed.png');
      await click('Góc nhìn ban đầu');
    }
    await click('Diện tích');
    await click('Toàn phần');
    await includes('62 cm²');
    await checkLayout(`${width}px: cuboid total area`);
    if (width === 1280 || width === 390) {
      await evaluate(`document.querySelector('.knowledge-content').scrollIntoView({ block: 'center' })`);
      await screenshot(width === 1280 ? 'desktop-panel.png' : 'mobile-panel.png');
    }
    await click('Thể tích');
    await checkLayout(`${width}px: volume`);
    await click('Bài tập');
    await click('Bài tiếp theo');
    await click('Bài tiếp theo');
    await answer('0');
    await click('Kiểm tra đáp án');
    await includes('Chưa đúng');
    await checkLayout(`${width}px: exercise feedback`);
    await click('Xem đáp án');
    await checkLayout(`${width}px: exercise solution`);
    if (width === 390) {
      await evaluate(`document.querySelector('.exercise-panel').scrollIntoView({ block: 'center' })`);
      await screenshot('mobile-exercise.png');
    }
  }
  checks.push('Desktop 1280, tablet 1024/768, mobile 390/360 px: all topics, long formula and exercise states fit without clipping; main text ≥18px, buttons ≥44px, visible camera labels');
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(() => evaluate(`!!document.querySelector('canvas') && document.querySelector('canvas').width > 0 && document.querySelectorAll('[aria-expanded="true"]').length === 0`), 'Reloaded Canvas', 30000);
  checks.push('Reload: Canvas rendered and topics reset');
  assert.deepEqual(runtimeErrors, [], 'No browser runtime errors');
  console.log(JSON.stringify({ url: pageUrl, checks, runtimeErrors, screenshots: screenshotDir }, null, 2));
} finally {
  socket?.close();
  for (const child of processes.reverse()) child.kill('SIGTERM');
  await delay(400);
  await rm(profile, { recursive: true, force: true });
}
