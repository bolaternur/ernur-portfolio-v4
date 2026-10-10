/* Re-render genuine CAD previews with an isolated headless browser.
 * Requires playwright and sharp (set ERNUR_TOOL_MODULES to their node_modules directory).
 * Usage: node tools/render-model-previews.cjs
 */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const toolRequire = process.env.ERNUR_TOOL_MODULES
  ? createRequire(path.join(process.env.ERNUR_TOOL_MODULES, 'package.json'))
  : require;
const { chromium } = toolRequire('playwright');
const sharp = toolRequire('sharp');
const root = path.resolve(__dirname, '..');
const names = ['assembly', 'kicker', 'robot', 'study'];

function harness(name) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CAD preview</title>
    <style>html,body{margin:0;background:transparent} [data-model-viewer]{position:relative;width:1400px;height:1050px} canvas{width:100%;height:100%;display:block} canvas[hidden]{display:none} button,p{position:absolute;z-index:2;bottom:0} [data-model-status]{left:200px} .controls{position:absolute;top:0;left:0;display:flex;gap:20px}.controls button{position:static}</style></head>
    <body><div data-model-viewer><canvas data-model="${name}"></canvas><button data-load-model>Load 3D model</button><p data-model-status aria-live="polite"></p><div class="controls"><button data-model-action="rotate">Rotate</button><button data-model-action="explode">Explode</button><button data-model-action="reset">Reset</button></div></div><script type="module" src="/model-viewer.js"></script></body></html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/preview') {
      const name = url.searchParams.get('model');
      if (!names.includes(name)) throw new Error('Unknown model');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(harness(name));
      return;
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) throw new Error('Outside preview root');
    const body = await fs.readFile(file);
    const mime = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': body.length });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

(async () => {
  await new Promise((resolve) => server.listen(4188, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
    process.once('SIGINT', async () => { await browser.close(); server.close(); process.exit(); });
    const page = await browser.newPage({ viewport: { width: 1400, height: 1050 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    page.on('pageerror', (error) => { throw error; });
    await fs.mkdir(path.join(root, 'public/images'), { recursive: true });
    const results = [];
    for (const name of names) {
      const requests = [];
      const track = (req) => { if (/\.glb|three-viewer/.test(req.url())) requests.push(req.url()); };
      page.on('request', track);
      await page.goto(`http://127.0.0.1:4188/preview?model=${name}`);
      await page.waitForFunction(() => document.querySelector('[data-model-viewer]').dataset.modelState === 'idle');
      if (requests.length) throw new Error('Heavy assets requested before user activation');
      await page.locator('[data-load-model]').click();
      await page.waitForFunction(() => document.querySelector('[data-model-viewer]').dataset.modelState === 'ready', null, { timeout: 60000 });
      await page.locator('.controls').evaluate((element) => { element.style.display = 'none'; });
      await page.locator('[data-model-status]').evaluate((element) => { element.style.display = 'none'; });
      await page.evaluate(() => document.activeElement.blur());
      const source = await page.screenshot({ omitBackground: true });
      await sharp(source).trim().resize(1100, 860, { fit: 'contain', background: '#00000000' }).extend({ top: 70, bottom: 70, left: 50, right: 50, background: '#00000000' }).webp({ quality: 87, effort: 4 }).toFile(path.join(root, 'public/images', `${name}.webp`));
      // Check interactive canvas keyboard handlers change the view and Home rebuilds it.
      await page.locator('canvas').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Home');
      const dimensions = await sharp(path.join(root, 'public/images', `${name}.webp`)).metadata();
      const output = await fs.stat(path.join(root, 'public/images', `${name}.webp`));
      results.push({ model: name, width: dimensions.width, height: dimensions.height, bytes: output.size, deferred: true, requests: requests.length });
      console.log(`${name}: ${output.size} bytes; click-only model download verified.`);
      page.off('request', track);
    }
    // Exercise the failure path as well as a successful load: a static preview must
    // survive a failed request, and retry must restore real keyboard interaction.
    await page.route('**/optimized/assembly.glb', (route) => route.fulfill({ status: 503, body: 'Temporarily unavailable' }));
    await page.goto('http://127.0.0.1:4188/preview?model=assembly');
    await page.locator('[data-load-model]').click();
    await page.waitForFunction(() => document.querySelector('[data-model-viewer]').dataset.modelState === 'error');
    assert.equal(await page.locator('[data-load-model]').isEnabled(), true);
    assert.match(await page.locator('[data-model-status]').textContent(), /could not load/);
    await page.unroute('**/optimized/assembly.glb');
    await page.locator('[data-load-model]').click();
    await page.waitForFunction(() => document.querySelector('[data-model-viewer]').dataset.modelState === 'ready');
    await page.locator('.controls').evaluate((element) => { element.style.display = 'none'; });
    await page.locator('[data-model-status]').evaluate((element) => { element.style.display = 'none'; });
    await page.locator('canvas').focus();
    const original = await page.screenshot({ omitBackground: true });
    await page.keyboard.press('ArrowRight');
    const rotated = await page.screenshot({ omitBackground: true });
    assert.notDeepEqual(rotated, original, 'Arrow keys must visibly rotate the model');
    await page.keyboard.press('Home');
    assert.deepEqual(await page.screenshot({ omitBackground: true }), original, 'Home must restore the initial view');
    await page.locator('.controls').evaluate((element) => { element.style.display = 'flex'; });
    await page.locator('[data-model-action="rotate"]').click();
    assert.equal(await page.locator('[data-model-action="rotate"]').getAttribute('aria-pressed'), 'false', 'Reduced-motion rotation must use a single step');
    await page.locator('[data-model-action="explode"]').click();
    assert.equal(await page.locator('[data-model-action="explode"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-model-action="reset"]').click();
    assert.equal(await page.locator('[data-model-action="explode"]').getAttribute('aria-pressed'), 'false');
    await page.evaluate(async () => { const module = await import('/model-viewer.js'); module.disposeModels(); });
    assert.equal(await page.locator('[data-load-model]').isVisible(), true);
    assert.equal(await page.locator('canvas').isVisible(), false);
    console.log('Verified: failure/retry, keyboard rotation, exact reset, reduced motion, explode state, and disposal.');
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser?.close();
    server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.close(); });
