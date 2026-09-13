const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] });
  await fs.mkdir('coverage/gate', { recursive: true });
  try {
    for (const [width, height, reducedMotion] of [[1440, 900, 'no-preference'], [390, 844, 'no-preference'], [844, 390, 'no-preference'], [390, 844, 'reduce']]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.gateOpenedAt = null;
        const observer = new MutationObserver(() => {
          const gate = document.querySelector('.site-intro.is-opening');
          if (gate) window.gateOpenedAt = Number(gate.querySelector('[role=progressbar]').getAttribute('aria-valuenow'));
        });
        observer.observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
      });
      await page.goto(process.env.ROBOT_QA_URL || 'http://127.0.0.1:5177/');
      await page.locator('.site-intro').waitFor();
      assert(await page.locator('#main-content').evaluate(el => el.inert), 'Background is not inert');
      if (reducedMotion !== 'reduce') {
        await page.waitForFunction(() => Number(document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow')) >= 25);
        assert(await page.locator('.site-intro').evaluate(el => !el.classList.contains('is-opening')), 'Gate opened early');
        await page.screenshot({ path: `coverage/gate/${width}-loading.png` });
        await page.waitForFunction(() => document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') === '100');
        await page.screenshot({ path: `coverage/gate/${width}-100.png` });
        await page.locator('.site-intro.is-opening').waitFor();
        await page.waitForTimeout(520);
        await page.screenshot({ path: `coverage/gate/${width}-opening.png` });
      }
      await page.locator('.site-intro').waitFor({ state: 'detached', timeout: 15000 });
      assert.equal(await page.evaluate(() => window.gateOpenedAt), 100, 'Gate must open at 100%');
      assert.equal(await page.locator('#main-content').evaluate(el => el.inert), false, 'Background remains inert');
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Scroll stays locked');
      assert.equal(await page.evaluate(() => sessionStorage.getItem('mfa-gate-intro-seen')), 'true');
      await page.reload();
      assert.equal(await page.locator('.site-intro').count(), 0, 'Intro repeated in same session');
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}x${height} ${reducedMotion}: opens at 100%, unlocks page, session persistence`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
