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
    const state = () => page.evaluate(() => {
      const ui = App.workcellUI, tray = ui.sceneModel.snapshotWorld().models.find(model => model.name === 'tray');
      return { time: ui.sharedClock?.timeSeconds, status: ui.sharedClock?.status, tick: ui.sharedClock?.schedulerState.tick,
        q: ui.sharedClock?.q, signals: ui.sharedClock?.schedulerState.signals, tray: tray?.pose,
        robotTime: ui.player.time, planDuration: ui.plan?.duration, robotState: ui.player.state };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#shared-example').click();
    await page.waitForFunction(() => App.workcellUI.sharedClock && App.workcellUI.plan);
    const initial = await state();
    assert.equal(initial.status, 'running');
    assert.ok(initial.planDuration > 0.5 && initial.planDuration < 0.6);
    assert.ok(Math.abs(initial.tray[0] - 0.2) < 1e-10);
    for (let i = 0; i < 3; i++) await page.locator('#shared-step').click();
    const robotMiddle = await state();
    assert.ok(robotMiddle.q[0] < -0.001 && robotMiddle.q[0] > -0.15, `Robot did not advance: ${robotMiddle.q[0]}`);
    assert.ok(Math.abs(robotMiddle.tray[0] - 0.2) < 1e-10);
    await page.locator('#shared-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/shared_robot_mid.png'), fullPage: true });
    await page.locator('#shared-play').click();
    await page.waitForTimeout(60);
    await page.locator('#shared-pause').click();
    const paused = await state();
    await page.waitForTimeout(180);
    assert.equal((await state()).time, paused.time, 'Pause must freeze the shared clock.');
    let deviceMiddle;
    for (let i = 0; i < 30; i++) {
      await page.locator('#shared-step').click();
      const current = await state();
      if (current.tray[0] > 0.2 + 1e-10) { deviceMiddle = current; break; }
    }
    assert.ok(deviceMiddle, 'Device never began moving after robot_done.');
    assert.ok(deviceMiddle.time > initial.planDuration);
    assert.ok(Math.abs(deviceMiddle.tray[0] - 0.3125) < 1e-10);
    assert.ok(Math.abs(deviceMiddle.q[0] + 0.15) < 1e-10);
    await page.locator('#shared-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/shared_device_mid.png'), fullPage: true });
    await page.locator('#shared-play').click();
    await page.waitForFunction(() => App.workcellUI.sharedClock?.status === 'finished');
    const final = await state();
    assert.ok(Math.abs(final.tray[0] - 0.65) < 1e-10);
    assert.equal(final.signals.robot_done, 1);
    await page.locator('#shared-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/shared_final.png'), fullPage: true });
    await page.locator('#shared-reset').click();
    const reset = await state();
    assert.equal(reset.time, 0); assert.equal(reset.tick, 0);
    assert.ok(Math.abs(reset.tray[0] - 0.2) < 1e-10);
    assert.ok(Math.abs(reset.q[0]) < 1e-10);
    await page.locator('#shared-step').click();
    assert.ok((await state()).time > 0);
    await page.locator('#signal-run').click();
    const switched = await page.evaluate(() => ({ sharedClock: App.workcellUI.sharedClock, plan: App.workcellUI.plan,
      signalStatus: App.workcellUI.signalState?.status,
      tray: App.workcellUI.sceneModel.snapshotWorld().models.find(model => model.name === 'tray').pose }));
    assert.equal(switched.sharedClock, null, 'Ordinary signal controls take ownership away from shared playback.');
    assert.equal(switched.plan, null, 'Independent device commands invalidate the preplanned robot path.');
    assert.ok(Math.abs(switched.tray[0] - 0.2) < 1e-10);
    await page.locator('#shared-example').click();
    await page.waitForFunction(() => App.workcellUI.sharedClock && App.workcellUI.plan);
    await page.locator('#shared-step').click();
    await page.locator('#program-step').click();
    const robotHandoff = await page.evaluate(() => ({ sharedClock: App.workcellUI.sharedClock,
      signalState: App.workcellUI.signalState, plan: App.workcellUI.plan }));
    assert.equal(robotHandoff.sharedClock, null);
    assert.equal(robotHandoff.signalState, null, 'Ordinary robot control discards shared scheduler ownership.');
    assert.ok(robotHandoff.plan);
    await page.locator('#signal-run').click();
    assert.equal(await page.evaluate(() => App.workcellUI.plan), null,
      'A subsequent ordinary device program invalidates the robot plan.');
    await page.locator('#shared-example').click();
    await page.waitForFunction(() => App.workcellUI.sharedClock && App.workcellUI.plan);
    await page.locator('#shared-step').click();
    await page.locator('#signal-program-source').fill(readFileSync(path.join(root, 'testowe/multi_program/combined.mprg'), 'utf8') + '\n# edited');
    const edited = await page.evaluate(() => ({ sharedClock: App.workcellUI.sharedClock, signalState: App.workcellUI.signalState }));
    assert.equal(edited.sharedClock, null, 'Source edits stop the shared clock.');
    assert.equal(edited.signalState, null, 'Source edits discard compiled scheduler state.');
    await page.locator('#signal-program-source').fill('PROGRAM unsafe\nMOVE_MODEL tray X 0.65 TICKS 4\nEND');
    await page.locator('#shared-prepare').click();
    await page.locator('#shared-step').click();
    const unsafe = await state();
    assert.equal(unsafe.status, 'error');
    assert.equal(unsafe.time, 0);
    assert.ok(Math.abs(unsafe.tray[0] - 0.2) < 1e-10);
    assert.ok(Math.abs(unsafe.q[0]) < 1e-10);
    assert.match(await page.locator('#shared-status').textContent(), /MOVE_MODEL tray starts before/);
    await page.locator('#signal-program-source').fill(readFileSync(path.join(root, 'testowe/multi_program/combined.mprg'), 'utf8'));
    await page.locator('#shared-prepare').click();
    await page.locator('#shared-play').click();
    await page.waitForFunction(() => App.workcellUI.sharedClock?.status === 'finished');
    await page.locator('#tab-workcell').click();
    const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()]).then(([item]) => item);
    const zip = readFileSync(await download.path());
    await page.locator('#project-file').setInputFiles({ name: 'shared.zip', mimeType: 'application/zip', buffer: zip });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project'));
    const reopened = await page.evaluate(() => ({ tray: App.workcellUI.sceneModel.snapshotWorld().models.find(model => model.name === 'tray').pose,
      signalSource: App.workcellUI.signalProgramSource.value, robotSource: App.workcellUI.programSource.value,
      sharedClock: App.workcellUI.sharedClock }));
    assert.ok(Math.abs(reopened.tray[0] - 0.65) < 1e-10);
    assert.equal(reopened.signalSource, readFileSync(path.join(root, 'testowe/multi_program/combined.mprg'), 'utf8'));
    assert.equal(reopened.robotSource, readFileSync(path.join(root, 'testowe/multi_program/combined.robot'), 'utf8'));
    assert.equal(reopened.sharedClock, null);
    assert.deepEqual(pageErrors, []);
    const result = { initial, robotMiddle, paused, deviceMiddle, final, reset, switched, robotHandoff, edited, unsafe, reopened, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/shared_clock.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', time: { robotMiddle: robotMiddle.time, deviceMiddle: deviceMiddle.time, final: final.time }, tray: { initial: initial.tray[0], middle: deviceMiddle.tray[0], final: final.tray[0] }, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
