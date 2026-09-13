const { chromium } = require('playwright');
const sharp = require('sharp');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge', args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ colorScheme: 'dark' });
  await page.addInitScript(() => sessionStorage.setItem('mfa-gate-intro-seen', 'true'));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const output = process.env.ROBOT_QA_DIR || 'coverage/robot';
  await fs.mkdir(output, { recursive: true });
  async function pixels() {
    const buffer = await page.locator('.hero-scene-3d canvas').screenshot();
    const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    let visible = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (Math.max(data[i], data[i + 1], data[i + 2]) > 65) visible++;
    }
    assert(visible > info.width * info.height * 0.015, 'Robot canvas is blank');
    return buffer;
  }
  for (const [width, height] of [[1440, 900], [1920, 1080], [768, 1024], [390, 844], [360, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(process.env.ROBOT_QA_URL || 'http://127.0.0.1:5175/');
    await page.locator('.hero-scene-3d canvas').waitFor();
    await page.waitForTimeout(2200);
    await pixels();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal overflow');
    await page.screenshot({ path: `${output}/${width}.png` });
    console.log(`PASS ${width}x${height}: nonblank canvas, no overflow`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(process.env.ROBOT_QA_URL || 'http://127.0.0.1:5175/');
  await page.waitForTimeout(1800);
  const before = await pixels();
  await page.mouse.move(1430, 100);
  await page.waitForTimeout(600);
  const after = await pixels();
  assert(!before.equals(after), 'Robot did not animate');
  const canvas = await page.locator('.hero-scene-3d canvas').elementHandle();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(700);
  assert(await canvas.evaluate(el => el.isConnected), 'Canvas was unmounted offscreen');
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await page.waitForTimeout(700);
  assert(await canvas.evaluate(el => el === document.querySelector('.hero-scene-3d canvas')), 'Canvas was recreated on reverse scroll');
  assert(await page.locator('.hero-scene-3d').evaluate(el => Number(getComputedStyle(el).opacity) === 1), 'Robot fades out inside the viewport');
  await page.screenshot({ path: `${output}/scroll.png` });
  await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.documentElement.classList.add('light'); });
  await page.waitForTimeout(700);
  await pixels();
  await page.screenshot({ path: `${output}/light.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(700);
  const still = await pixels();
  await page.mouse.move(50, 500);
  await page.waitForTimeout(500);
  assert(still.equals(await pixels()), 'Reduced motion is not static');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS animation, persistent canvas on reverse scroll, light theme, reduced motion, runtime errors');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
