/* Visual/behavior checks for the live motion layer. Requires playwright and sharp.
   Run against a local server: node tools/test-motion.cjs [origin] */
const { chromium } = require('playwright');
const sharp = require('sharp');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const origin = process.argv[2] || 'http://127.0.0.1:4179';
async function difference(a, b) {
  const raw = async buffer => sharp(buffer).resize(400, 300, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const [x, y] = await Promise.all([raw(a), raw(b)]);
  return x.reduce((sum, value, i) => sum + Math.abs(value - y[i]), 0) / x.length;
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await fs.mkdir('output/qa', { recursive: true });
    await page.goto(origin);
    const hero = page.locator('.hero-sculpture');
    await page.waitForFunction(() => document.querySelector('.hero-sculpture')?.dataset.motionState === 'playing');
    const first = await hero.screenshot();
    await page.waitForTimeout(1400);
    const moving = await difference(first, await hero.screenshot());
    assert(moving > .8, `Hero must actually move: ${moving}`);
    await page.locator('.motion-toggle').click();
    await page.waitForTimeout(150);
    const frozen = await hero.screenshot();
    await page.waitForTimeout(500);
    assert(await difference(frozen, await hero.screenshot()) < .05, 'Pause freezes the hero');
    await page.locator('.motion-toggle').click();
    await page.screenshot({ path: 'output/qa/motion-desktop.png' });
    const story = await page.locator('[data-assembly-story]').evaluate(el => ({ top: el.offsetTop, height: el.offsetHeight }));
    const seek = async progress => {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), story.top + (story.height - 900) * progress);
      await page.waitForFunction(() => document.querySelector('.assembly-view')?.dataset.modelState === 'ready');
      await page.waitForTimeout(1600);
    };
    await seek(.08);
    const intact = await page.locator('.assembly-view').screenshot();
    await seek(.5);
    const exploded = await page.locator('.assembly-view').screenshot();
    const assemblyDifference = await difference(intact, exploded);
    assert(assemblyDifference > 2, `Scroll must change the real assembly: ${assemblyDifference}`);
    assert.equal(await page.locator('[data-assembly-phase].is-active').innerText(), '02 Separate');
    await page.screenshot({ path: 'output/qa/motion-assembly.png' });
    await seek(1);
    assert.equal(await page.locator('[data-assembly-phase].is-active').innerText(), '03 Rebuild');
    await page.locator('.personal-art').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.personal-cube')?.dataset.motionState === 'playing');
    await page.waitForFunction(() => Number(document.querySelector('.personal-cube')?.dataset.twists) > 0);
    await page.screenshot({ path: 'output/qa/motion-cube.png' });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(origin);
      await page.waitForFunction(() => document.querySelector('.hero-sculpture')?.dataset.motionState === 'playing');
      await page.waitForTimeout(1400);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: no horizontal overflow`);
      await page.screenshot({ path: `output/qa/motion-mobile-${width}.png` });
      await page.locator('.assembly-story').evaluate(el => scrollTo({ top: el.offsetTop + innerHeight * .4, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.assembly-view')?.dataset.modelState === 'ready');
      await page.waitForTimeout(700);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: no scene overflow`);
      await page.screenshot({ path: `output/qa/motion-assembly-${width}.png` });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(origin + '/lab/');
    await page.locator('.lab-cube-stage').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.cube-motion-host')?.dataset.motionState === 'playing');
    await page.locator('.motion-toggle').click();
    const cubeBefore = Number(await page.locator('.cube-motion-host').getAttribute('data-twists'));
    // A layer already in flight is finished when paused; the next click is discrete.
    await page.locator('[data-cube-turn]').click();
    await page.waitForTimeout(150);
    const cubeAfter = Number(await page.locator('.cube-motion-host').getAttribute('data-twists'));
    assert(cubeAfter > cubeBefore, 'Manual layer turn works while paused');
    await page.screenshot({ path: 'output/qa/motion-lab.png' });
    for (const route of ['/work/decode/', '/work/3209/', '/work/fusion360/']) {
      await page.goto(origin + route);
      await page.locator('[data-model-viewer]').first().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('[data-model-viewer]')?.dataset.modelState === 'ready');
      assert(await page.evaluate(() => document.activeElement.tagName !== 'CANVAS'), 'Automatic loading must not steal focus');
      const model = page.locator('[data-model-viewer] canvas').first();
      const start = await model.screenshot();
      await page.waitForTimeout(750);
      assert(await difference(start, await model.screenshot()) > .1, `${route}: automatic model rotation`);
      await page.locator('[data-model-action="reset"]').first().click();
      const reset = await model.screenshot();
      await model.focus();
      await page.keyboard.press('ArrowRight');
      assert(await difference(reset, await model.screenshot()) > .1, `${route}: keyboard rotation`);
      await page.keyboard.press('Home');
      assert(await difference(reset, await model.screenshot()) < .1, `${route}: Home resets view`);
    }
    await page.route('**/optimized/robot.glb', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    await page.goto(origin + '/work/decode/');
    await page.locator('[data-model-viewer]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-model-viewer]')?.dataset.modelState === 'error');
    assert(await page.locator('[data-load-model]').isEnabled());
    assert(await page.locator('.model-poster').isVisible());
    await page.unroute('**/optimized/robot.glb');
    await page.locator('[data-load-model]').click();
    await page.waitForFunction(() => document.querySelector('[data-model-viewer]')?.dataset.modelState === 'ready');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(origin);
    await page.waitForFunction(() => document.querySelector('.hero-sculpture')?.dataset.motionState === 'paused');
    assert.equal(await page.locator('.assembly-view').getAttribute('data-model-state'), 'idle');
    assert(await page.locator('[data-load-model]').isVisible(), 'Reduced motion retains manual loading');
    await page.locator('[data-load-model]').click();
    await page.waitForFunction(() => document.querySelector('.assembly-view')?.dataset.modelState === 'ready');
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log(JSON.stringify({ heroPixelDifference: moving, assemblyPixelDifference: assemblyDifference, mobileWidths: [390, 320], pause: 'passed', manualCube: 'passed', reducedMotion: 'passed', pageErrors: errors }));
    await page.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
