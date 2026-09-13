const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    await fs.mkdir('coverage/blaster', { recursive: true });
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => sessionStorage.setItem('mfa-gate-intro-seen', 'true'));
      await page.goto('http://127.0.0.1:5177/');
      await page.locator('.hero-scene-3d canvas').waitFor();
      const target = { x: Math.round(width * 0.8), y: width > 600 ? 270 : 155 };
      await page.mouse.move(target.x, target.y);
      await page.evaluate(async () => {
        const url = performance.getEntriesByType('resource').find(e => e.name.includes('@react-three_fiber.js')).name;
        const { _roots } = await import(url);
        while (!_roots.has(document.querySelector('.hero-scene-3d canvas'))) await new Promise(requestAnimationFrame);
        window.robotState = _roots.get(document.querySelector('.hero-scene-3d canvas')).store.getState;
        window.shots = [];
        let wasVisible = false;
        const watch = () => {
          const state = window.robotState();
          const bolt = state.scene.getObjectByName('robot-bolt');
          const impact = state.scene.getObjectByName('robot-impact');
          if (bolt?.visible && !wasVisible) {
            const point = impact.position.clone().project(state.camera);
            const rect = state.gl.domElement.getBoundingClientRect();
            window.shots.push({ time: performance.now(), x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 });
          }
          wasVisible = !!bolt?.visible;
          window.shotWatch = requestAnimationFrame(watch);
        };
        watch();
      });
      await page.waitForFunction(() => window.robotState().scene.getObjectByName('robot-right-elbow'));
      await page.waitForTimeout(300);
      const standby = await page.evaluate(() => window.robotState().scene.getObjectByName('robot-right-elbow').rotation.x);
      await page.waitForFunction(() => window.shots.length >= 2, null, { timeout: 20000 });
      const shots = await page.evaluate(() => window.shots);
      assert(Math.abs(shots[1].time - shots[0].time - 5000) < 700, 'Shots are not five seconds apart');
      for (const shot of shots) assert(Math.hypot(shot.x - target.x, shot.y - target.y) < 2, 'Shot misses last stationary cursor');
      await page.waitForFunction(() => window.robotState().scene.getObjectByName('robot-impact').visible);
      const firing = await page.evaluate(() => {
        const scene = window.robotState().scene;
        let red = false;
        scene.traverse(obj => { if (obj.material?.name === 'robot-eyes') red = obj.material.color.r > 0.9 && obj.material.color.g < 0.1; });
        return { elbow: scene.getObjectByName('robot-right-elbow').rotation.x, red };
      });
      assert(Math.abs(firing.elbow - standby) > 0.15, 'Elbow does not move into firing pose');
      assert(firing.red, 'Eyes do not turn red during firing');
      await page.evaluate(() => window.robotState().setFrameloop('demand'));
      await page.screenshot({ path: `coverage/blaster/${width}-impact.png` });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(400);
      assert(await page.evaluate(() => !window.robotState().scene.getObjectByName('robot-bolt').visible && !window.robotState().scene.getObjectByName('robot-impact').visible));
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: 5s cadence, cursor target, articulated elbow, red eyes, reduced motion`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
