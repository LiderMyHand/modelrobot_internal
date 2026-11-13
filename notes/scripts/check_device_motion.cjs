const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 80; i++) {
      if (server.exitCode != null) throw new Error(`Server exited with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/workcell/arm.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#signal-device-example').click();
    await page.waitForFunction(() => App.workcellUI.sceneModel.world.name === 'conveyor_classroom');
    const getPose = () => page.evaluate(() => App.workcellUI.sceneModel.snapshotWorld().models.find(model => model.name === 'tray').pose);
    const initial = await getPose();
    assert.ok(Math.abs(initial[0] - 0.2) < 1e-12);
    await page.locator('#signal-check').click();
    assert.match(await page.locator('#signal-status').textContent(), /Syntax valid: 2 program/);
    for (let i = 0; i < 3; i++) await page.locator('#signal-step').click();
    const middle = await getPose();
    assert.ok(Math.abs(middle[0] - 0.3125) < 1e-10, `Expected first motion tick at x=0.3125, got ${middle[0]}`);
    await page.locator('#signal-status').scrollIntoViewIfNeeded();
    await page.evaluate(() => { const source = document.getElementById('signal-program-source'); source.scrollTop = source.scrollHeight; });
    await page.screenshot({ path: path.join(root, 'notes/artifacts/device_motion_mid.png'), fullPage: true });
    await page.locator('#signal-run').click();
    const final = await getPose();
    assert.ok(Math.abs(final[0] - 0.65) < 1e-10);
    assert.match(await page.locator('#signal-status').textContent(), /finished/);
    await page.screenshot({ path: path.join(root, 'notes/artifacts/device_motion_final.png'), fullPage: true });
    await page.locator('#signal-reset').click();
    const reset = await getPose();
    assert.ok(Math.abs(reset[0] - 0.2) < 1e-10);
    assert.match(await page.locator('#signal-status').textContent(), /Tick 0 · running/);
    await page.locator('#signal-run').click();
    await page.locator('#tab-workcell').click();
    const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()]).then(([item]) => item);
    const zip = readFileSync(await download.path());
    await page.locator('#project-file').setInputFiles({ name: 'device.zip', mimeType: 'application/zip', buffer: zip });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project'));
    const reopened = await getPose();
    assert.ok(Math.abs(reopened[0] - 0.65) < 1e-10);
    assert.equal(await page.locator('#signal-program-source').inputValue(), readFileSync(path.join(root, 'testowe/multi_program/conveyor.mprg'), 'utf8'));
    assert.equal(await page.evaluate(() => App.workcellUI.signalState), null);
    assert.deepEqual(pageErrors, []);
    const result = { initial, middle, final, reset, reopened, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/device_motion.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', x: { initial: initial[0], middle: middle[0], final: final[0], reset: reset[0], reopened: reopened[0] }, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
