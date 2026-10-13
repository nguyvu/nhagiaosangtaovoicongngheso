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
    // Isolate the scene from the fixed skip link when Chrome captures beyond the viewport.
    const skipVisibility = await evaluate(`(() => {
      const link = document.querySelector('.skip-link');
      const previous = link.style.visibility;
      link.style.visibility = 'hidden';
      return previous;
    })()`);
    try {
      return (await cdp('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true })).data;
    } finally {
      await evaluate(`document.querySelector('.skip-link').style.visibility = ${JSON.stringify(skipVisibility)}`);
    }
  }
  async function sceneScreenshot(name) {
    const data = await sceneImage();
    await mkdir(screenshotDir, { recursive: true });
    await writeFile(join(screenshotDir, name), Buffer.from(data, 'base64'));
    return data;
  }
  async function assertSceneEqual(actual, expected, label) {
    if (actual === expected) return;
    const difference = await evaluate(`(async () => {
      const decode = async data => {
        const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + data)).blob());
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };
      const a = await decode(${JSON.stringify(actual)}), b = await decode(${JSON.stringify(expected)});
      let changed = 0, sum = 0;
      for (let i = 0; i < a.length; i += 4) {
        const delta = [0, 1, 2].map(offset => Math.abs(a[i + offset] - b[i + offset]));
        sum += delta[0] + delta[1] + delta[2];
        if (Math.max(...delta) > 8) changed++;
      }
      return { fraction: changed / (a.length / 4), mean: sum / (a.length / 4 * 3) };
    })()`);
    if (difference.fraction >= .003 || difference.mean >= .25) {
      await writeFile('/tmp/geometry-scene-actual.png', Buffer.from(actual, 'base64'));
      await writeFile('/tmp/geometry-scene-expected.png', Buffer.from(expected, 'base64'));
    }
    assert.ok(difference.fraction < .003 && difference.mean < .25, `${label}: ${JSON.stringify(difference)}`);
  }
  async function scenePinkBounds(data, net = false) {
    return evaluate(`(async () => {
      const image = await createImageBitmap(await (await fetch('data:image/png;base64,${data}')).blob());
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, image.width, image.height).data;
      let left = image.width, top = image.height, right = 0, bottom = 0;
      for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
        const index = (y * image.width + x) * 4;
        const red = pixels[index], green = pixels[index + 1], blue = pixels[index + 2];
        if (${net} ? (red > 140 && green < 235 && blue > 90 && red - green > 28) || (green > 140 && green - red > 20) : red > 145 && green < 205 && blue > 90 && blue < 220 && red - green > 35) {
          left = Math.min(left, x); top = Math.min(top, y);
          right = Math.max(right, x); bottom = Math.max(bottom, y);
        }
      }
      return { left, top, right, bottom, width: right - left + 1, height: bottom - top + 1, imageWidth: image.width, imageHeight: image.height };
    })()`);
  }
  async function waitNetOpen() {
    await waitFor(() => evaluate(`document.querySelector('.scene').dataset.netState === 'open'`), '3D unfolding');
    await delay(120);
  }
  async function waitNetClosed() {
    await waitFor(() => evaluate(`document.querySelector('.scene').dataset.netState === 'closed'`), '3D folding');
    await delay(180);
  }
  async function checkNetFrame(label) {
    const bounds = await scenePinkBounds(await sceneImage(), true);
    assert.ok(bounds.left >= 10 && bounds.top >= 10 && bounds.right < bounds.imageWidth - 10 && bounds.bottom < bounds.imageHeight - 10, `${label}: net must fit the WebGL frame: ${JSON.stringify(bounds)}`);
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
  const greeting = await evaluate(`Array.from(document.querySelectorAll('.student-wave'), element => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: parseFloat(style.animationDuration), count: style.animationIterationCount };
  })`);
  assert.equal(greeting.length, 2, 'Both students have a greeting animation');
  assert.ok(greeting.every(item => item.name !== 'none' && item.duration === 5 && item.count === 'infinite'), 'Both students must wave every five seconds');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.student-bob, .student-wave')).every(element => getComputedStyle(element).animationName === 'none')`), true, 'Reduced motion disables all student animations');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await delay(5200);
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.student-wave')).every(element => {
    const animation = element.getAnimations()[0];
    return animation?.playState === 'running' && animation.currentTime >= 5000;
  })`), true, 'Both students must still wave after the first five-second cycle');
  checks.push('Both students wave again every five seconds; reduced motion disables the animation');
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
  await assertSceneEqual(await sceneImage(), before, 'Reset must restore the rendered image');
  await click('Xoay sang trái');
  assert.notEqual(await sceneImage(), before, 'Rotate must change the rendered image');
  await click('Góc nhìn ban đầu');
  checks.push('Zoom, rotate and reset change/restore actual WebGL output');
  const cube3 = await scenePinkBounds(await sceneScreenshot('cube-3cm.png'));
  await click('Kích thước'); await range(4);
  const cube4 = await scenePinkBounds(await sceneScreenshot('cube-4cm.png'));
  await range(10);
  const cube10 = await scenePinkBounds(await sceneScreenshot('cube-10cm.png'));
  assert.ok(cube3.width < cube4.width && cube4.width < cube10.width, `Cube must visibly grow at 3, 4 and 10 cm: ${JSON.stringify({ cube3, cube4, cube10 })}`);
  assert.ok(cube10.width >= cube4.width * 1.12, '10 cm cube must be visibly larger than 4 cm');
  assert.ok(cube10.left > 35 && cube10.top > 35 && cube10.right < cube10.imageWidth - 35 && cube10.bottom < cube10.imageHeight - 35, `10 cm cube must stay within the scene: ${JSON.stringify(cube10)}`);
  await checkLayout('Desktop: 10 cm cube');
  await range(3);
  checks.push('Cube 3, 4 and 10 cm: rendered scene snapshots retain a visible growth and frame margin');
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
  await click('Kích thước'); await range(3);
  await click('Kích thước');
  const cubeBeforeNet = await sceneImage();
  await click('Trải hình thành 6 mặt hình vuông');
  await includes('Ghép thành khối');
  assert.equal(await evaluate(`document.querySelectorAll('.net-lesson button').length`), 0, 'Box nets use one topic button only');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'opening');
  await delay(650);
  const cubeDuringNet = await sceneScreenshot('cube-unfolding.png');
  assert.notEqual(cubeDuringNet, cubeBeforeNet, 'Unfolding must change the real 3D mesh');
  await waitNetOpen();
  assert.notEqual(await sceneImage(), cubeDuringNet, 'Intermediate faces must keep moving to the flat net');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.shape-net')).every(overlay => overlay.getClientRects().length === 0)`), true, 'WebGL unfolding must not show an SVG overlay');
  assert.equal(await evaluate(`!!document.querySelector('.view-controls')`), false, 'Camera controls must stay hidden while the net covers the 3D cube');
  await includes('9 cm²'); await includes('54 cm²');
  await checkNetFrame('Cube net');
  await checkLayout('Desktop: unfolded cube');
  await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
  await screenshot('desktop-net.png');
  await evaluate(`document.querySelector('.topic-list [aria-expanded="true"]').focus()`);
  await pressKey('Enter', 'Enter', 13);
  assert.equal(await evaluate(`document.activeElement.textContent.includes('Ghép thành khối')`), true, 'Folding must retain keyboard focus');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closing', 'Cube faces must animate closed');
  await delay(650); await sceneScreenshot('cube-folding.png');
  await waitNetClosed();
  await assertSceneEqual(await sceneImage(), cubeBeforeNet, 'Folding must restore the solid and its original camera');
  assert.equal(await evaluate(`document.activeElement.textContent.includes('Trải hình thành 6 mặt hình vuông')`), true, 'After folding the same focused button returns to its unfold label');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0, 'Folding closes the active lesson');
  await click('Kích thước'); await range(5);
  await click('Trải hình thành 6 mặt hình vuông');
  await includes('25 cm²'); await includes('150 cm²');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await waitNetOpen();
  await click('Ghép thành khối');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closed', 'Reduced motion must fold instantly');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  checks.push('Cube: 3D hinged faces move through intermediate poses to a flat net; reverse folding restores mesh/camera; changed areas and reduced motion pass');
  await click('Hình hộp chữ nhật');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  const cuboidInitial = await scenePinkBounds(await sceneScreenshot('cuboid-initial.png'));
  assert.ok(cuboidInitial.width > 150 && cuboidInitial.left > 20 && cuboidInitial.right < cuboidInitial.imageWidth - 20, 'Initial cuboid must render brightly inside the frame');
  await click('Trải hình thành 6 mặt hình chữ nhật');
  await delay(650); await sceneScreenshot('cuboid-unfolding.png');
  await waitNetOpen(); await checkNetFrame('Cuboid net');
  await includes('62 cm²'); await includes('32 cm²');
  await checkLayout('Desktop: unfolded cuboid');
  await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
  await screenshot('desktop-cuboid-net.png');
  await click('Ghép thành khối');
  await waitNetClosed();
  await click('Kích thước'); await range(6, 0); await range(4, 1); await range(3, 2);
  await click('Trải hình thành 6 mặt hình chữ nhật');
  await includes('18 cm²'); await includes('12 cm²'); await includes('24 cm²'); await includes('108 cm²'); await includes('60 cm²');
  await click('Hình lập phương'); await click('Hình hộp chữ nhật');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closed', 'Changing shape cancels the cuboid animation');
  checks.push('Cuboid: three sized face pairs unfold in WebGL, update areas at 6×4×3, fold and cancel on shape change');
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
  await click('Hình trụ');
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  const cylinderInitial = await sceneScreenshot('cylinder-initial.png');
  const cylinderBounds = await scenePinkBounds(cylinderInitial);
  assert.ok(cylinderBounds.width > 150 && cylinderBounds.top > 25 && cylinderBounds.bottom < cylinderBounds.imageHeight - 25, 'Cylinder must render pink with margin');
  await click('Xoay sang trái');
  assert.notEqual(await sceneImage(), cylinderInitial, 'Cylinder shading and rim must respond to orbit');
  await click('Góc nhìn ban đầu');
  await assertSceneEqual(await sceneImage(), cylinderInitial, 'Cylinder reset restores the view');
  await click('Đặc điểm hình trụ'); await includes('0 đỉnh');
  await click('Xem đường tròn'); await includes('2 đường tròn đáy');
  await sceneScreenshot('cylinder-rims.png');
  await click('Xem mặt'); await includes('2 mặt đáy tròn');
  await click('Kích thước');
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('input[type="range"]'), input => input.value)`), ['2', '4']);
  await range(3); await range(5, 1);
  await includes('r = 3 cm'); await includes('h = 5 cm');
  assert.equal(await evaluate(`document.querySelectorAll('.topic-list button').length`), 4);
  assert.equal(await evaluate(`document.querySelector('.shape-card[data-shape="cylinder"]')?.dataset.tone || document.querySelector('[data-tone="pink"]')?.dataset.tone`), 'pink');
  assert.equal(await evaluate(`/Diện tích|Thể tích/.test(document.querySelector('.topic-list').textContent)`), false);
  await click('Kích thước');
  const cylinderBeforeNet = await sceneImage();
  await click('Trải mặt hình trụ');
  await includes('Ghép thành khối');
  assert.equal(await evaluate(`document.querySelectorAll('.net-lesson button').length`), 0, 'Cylinder net uses the topic button only');
  await delay(650);
  const cylinderDuringNet = await sceneScreenshot('cylinder-unfolding.png');
  assert.notEqual(cylinderDuringNet, cylinderBeforeNet, 'The curved side and caps must move in WebGL');
  await waitNetOpen(); await checkNetFrame('Cylinder net');
  assert.notEqual(await sceneImage(), cylinderDuringNet, 'The curved side must finish unrolling to a rectangle');
  await includes('Hình số 1'); await includes('Hình số 2–3');
  assert.equal(await evaluate(`/π|cm²|cm³|Diện tích|Thể tích/.test(document.querySelector('.knowledge-content').textContent)`), false);
  await checkLayout('Desktop: cylinder net');
  await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
  await screenshot('desktop-cylinder-net.png');
  await evaluate(`document.querySelector('.topic-list [aria-expanded="true"]').focus()`);
  await pressKey('Enter', 'Enter', 13);
  assert.equal(await evaluate(`document.activeElement.textContent.includes('Ghép thành khối')`), true, 'Cylinder folding retains keyboard focus');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closing');
  await delay(650); await sceneScreenshot('cylinder-folding.png');
  await waitNetClosed();
  await assertSceneEqual(await sceneImage(), cylinderBeforeNet, 'Cylinder folding must restore its original camera and mesh');
  assert.equal(await evaluate(`document.activeElement.textContent.includes('Trải mặt hình trụ')`), true);
  assert.equal(await evaluate(`document.querySelectorAll('[aria-expanded="true"]').length`), 0);
  await click('Trải mặt hình trụ');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await click('Ghép thành khối');
  assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closed', 'Reduced motion folds the cylinder immediately');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await click('Hình lập phương'); await click('Hình trụ');
  await click('Bài tập');
  await click('Kiểm tra đáp án'); await includes('Hãy nhập một số hợp lệ');
  await answer('1'); await click('Kiểm tra đáp án'); await includes('Chưa đúng');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await answer('2'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Bài tiếp theo');
  await answer('1'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Xem đáp án'); await includes('một mặt xung quanh cong');
  await click('Bài tiếp theo'); await answer('0'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  await click('Bài tiếp theo'); await answer('1'); await click('Kiểm tra đáp án'); await includes('Chính xác');
  await click('Làm lại');
  assert.equal(await evaluate(`document.querySelector('#answer').value`), '');
  await click('Hình hộp chữ nhật'); await click('Hình trụ');
  await click('Bài tập'); await includes('BÀI 1/4');
  assert.equal(await evaluate(`!!document.querySelector('.solution')`), false);
  await click('Kích thước');
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('input[type="range"]'), input => input.value)`), ['2', '4']);
  checks.push('Cylinder: pink card, recognition-only topics/exercises, bright WebGL, orbit/reset, dimensions, unfolding/folding and reduced motion pass');
  await click('Hình lập phương'); await click('Kích thước');
  // Real keyboard events verify native button and range behavior, including focus.
  await click('Kích thước');
  await evaluate(`document.querySelector('.topic-list button').focus()`);
  await pressKey('Tab', 'Tab', 9);
  assert.ok(await evaluate(`document.activeElement.textContent.includes('Trải hình thành 6 mặt hình vuông')`), 'Tab must move to the cube net topic');
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
    if (width === 390) {
      await click('Trải hình thành 6 mặt hình vuông'); await waitNetOpen();
      await checkLayout('390px: unfolded cube', true);
      await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
      await screenshot('mobile-net.png');
    }
    await click('Hình hộp chữ nhật');
    assert.equal(await evaluate(`document.querySelector('.scene').dataset.netState`), 'closed', `${width}px: switching shape must close the net`);
    if (width === 390) {
      await click('Trải hình thành 6 mặt hình chữ nhật'); await waitNetOpen();
      await checkLayout('390px: unfolded cuboid', true);
      await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
      await screenshot('mobile-cuboid-net.png');
      await click('Ghép thành khối'); await waitNetClosed();
    }
    if (width === 360) {
      await click('Kích thước'); await range(1, 0); await range(10, 1); await range(10, 2);
      await click('Trải hình thành 6 mặt hình chữ nhật'); await waitNetOpen();
      await checkLayout('360px: extreme cuboid net', true);
      await includes('240 cm²'); await includes('220 cm²');
      await checkNetFrame('360px: cuboid 1×10×10');
      await sceneScreenshot('cuboid-extreme-labels.png');
      await click('Hình lập phương'); await click('Hình hộp chữ nhật');
    }
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
    await click('Hình trụ');
    await checkLayout(`${width}px: cylinder initial`, width <= 1040);
    await click('Đặc điểm hình trụ'); await click('Xem mặt');
    await checkLayout(`${width}px: cylinder features`);
    await click('Kích thước');
    await checkLayout(`${width}px: cylinder dimensions`);
    assert.equal(await evaluate(`(() => {
      const scene = document.querySelector('.scene').getBoundingClientRect();
      return Array.from(document.querySelectorAll('.dimension-label')).every(label => {
        const rect = label.getBoundingClientRect();
        return rect.left >= scene.left && rect.right <= scene.right && rect.top >= scene.top && rect.bottom <= scene.bottom;
      });
    })()`), true, `${width}px: cylinder dimension labels stay inside the scene`);
    await click('Trải mặt hình trụ'); await waitNetOpen();
    await checkLayout(`${width}px: cylinder net`);
    if (width === 390) {
      await evaluate(`document.querySelector('.viewer-card').scrollIntoView({ block: 'start' })`);
      await screenshot('mobile-cylinder-net.png');
    }
    if (width === 360) {
      for (const [radius, height] of [[1, 10], [10, 1], [10, 10]]) {
        await click('Kích thước'); await range(radius); await range(height, 1);
        await click('Trải mặt hình trụ'); await waitNetOpen();
        await checkNetFrame(`360px: cylinder r=${radius}, h=${height}`);
      }
      await click('Ghép thành khối'); await waitNetClosed();
      const largeCylinder = await scenePinkBounds(await sceneScreenshot('cylinder-10cm-mobile.png'));
      assert.ok(largeCylinder.left > 15 && largeCylinder.top > 15 && largeCylinder.right < largeCylinder.imageWidth - 15 && largeCylinder.bottom < largeCylinder.imageHeight - 15, 'Largest cylinder must fit the mobile frame');
      await click('Thu nhỏ');
      const zoomedOut = await scenePinkBounds(await sceneImage());
      assert.ok(zoomedOut.width < largeCylinder.width * .9, 'Zoom out must still work for the largest cylinder on mobile');
      await click('Góc nhìn ban đầu');
    }
    await click('Bài tập'); await click('Bài tiếp theo'); await answer('1'); await click('Kiểm tra đáp án');
    await click('Xem đáp án'); await checkLayout(`${width}px: cylinder exercise solution`);
  }
  checks.push('Desktop 1280, tablet 1024/768, mobile 390/360 px: all topics, long formula and exercise states fit without clipping; extreme 1×10×10 cuboid net remains inside 360px scene; main text ≥18px, buttons ≥44px, visible camera labels');
  checks.push('Cylinder desktop/tablet/mobile: all topics, dimension labels and exercises fit; extreme radius/height combinations keep the net and largest mobile solid inside the scene');
  await cdp('Page.reload', { ignoreCache: true });
  await waitFor(() => evaluate(`!!document.querySelector('canvas') && document.querySelector('canvas').width > 0 && document.querySelectorAll('[aria-expanded="true"]').length === 0`), 'Reloaded Canvas', 30000);
  checks.push('Reload: Canvas rendered and topics reset');
  assert.deepEqual(runtimeErrors, [], 'No browser runtime errors');
  console.log(JSON.stringify({ url: pageUrl, checks, runtimeErrors, screenshots: screenshotDir }, null, 2));
} finally {
  socket?.close();
  for (const child of processes.reverse()) {
    child.kill('SIGTERM');
    // Chrome subprocesses can inherit these pipes and keep Node alive after the checks finish.
    child.stdout.destroy();
    child.stderr.destroy();
  }
  await delay(400);
  await rm(profile, { recursive: true, force: true });
}
