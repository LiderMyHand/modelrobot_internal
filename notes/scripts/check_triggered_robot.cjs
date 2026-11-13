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
    const readState = () => page.evaluate(() => {
      const ui = App.workcellUI, clock = ui.triggerClock;
      const tray = ui.sceneModel.snapshotWorld().models.find(model => model.name === 'tray');
      const base = window.robotjointcollection.findWhere({ name: 'base_yaw' });
      return { time: clock?.timeSeconds, tick: clock?.tick, status: clock?.status,
        robotPhase: clock?.robot.status, robotStart: clock?.robot.startTime, robotDuration: clock?.robot.duration,
        signals: clock?.schedulerState.signals, q: clock?.q, baseYaw: base?.theta,
        tray: tray?.pose, diagnostics: clock?.diagnostics, triggerPlayer: Boolean(ui.triggerPlayer) };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.evaluate(() => {
      const NativeWorker = window.Worker;
      window.__plannerSnapshots = [];
      window.__workerDelayMs = 0;
      window.Worker = class extends NativeWorker {
        postMessage(message, ...rest) {
          if (message?.snapshot) window.__plannerSnapshots.push(message.snapshot);
          return super.postMessage(message, ...rest);
        }
        set onmessage(handler) {
          this.addEventListener('message', event => {
            const delay = window.__workerDelayMs;
            if (delay) setTimeout(() => handler(event), delay); else handler(event);
          });
        }
      };
    });
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#trigger-example').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    const initial = await readState();
    assert.ok(Math.abs(initial.tray[0] - 0.2) < 1e-10);
    assert.ok(Math.abs(initial.baseYaw) < 1e-10);
    assert.ok(Math.abs(initial.q[0]) < 1e-10);
    await page.locator('#trigger-step').click();
    const deviceMiddle = await readState();
    assert.ok(Math.abs(deviceMiddle.tray[0] - 0.3125) < 1e-10);
    assert.ok(Math.abs(deviceMiddle.baseYaw) < 1e-10, 'Robot stays still while the device moves.');
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/trigger_device_mid.png'), fullPage: true });
    let planned;
    for (let i = 0; i < 20; i++) {
      await page.locator('#trigger-step').click();
      await page.waitForFunction(() => App.workcellUI.triggerClock?.status !== 'planning');
      const current = await readState();
      if (current.robotPhase === 'moving') { planned = current; break; }
    }
    assert.ok(planned, 'RUN_ROBOT never produced a plan.');
    assert.ok(Math.abs(planned.tray[0] - 0.65) < 1e-10);
    assert.ok(Math.abs(planned.baseYaw) < 1e-10);
    assert.ok(planned.robotStart > 0);
    const snapshot = await page.evaluate(() => window.__plannerSnapshots.at(-1));
    assert.ok(snapshot, 'Planning Worker request was not captured.');
    const trayWorld = snapshot.scene.models.find(model => model.name === 'tray').world;
    assert.ok(Math.abs(trayWorld[12] - 0.65) < 1e-10, `Worker planned from tray X=${trayWorld[12]}`);
    assert.ok(Math.abs(snapshot.joints.find(joint => joint.name === 'base_yaw').theta) < 1e-10);
    let robotMiddle;
    for (let i = 0; i < 8; i++) {
      await page.locator('#trigger-step').click();
      const current = await readState();
      if (current.baseYaw < -0.001) { robotMiddle = current; break; }
    }
    assert.ok(robotMiddle, 'Robot never moved after command-time planning.');
    assert.ok(Math.abs(robotMiddle.tray[0] - 0.65) < 1e-10);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/trigger_robot_mid.png'), fullPage: true });
    await page.locator('#trigger-play').click();
    await page.waitForTimeout(60);
    await page.locator('#trigger-pause').click();
    const paused = await readState();
    await page.waitForTimeout(180);
    assert.equal((await readState()).time, paused.time, 'Pause freezes triggered simulation time.');
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'finished');
    const final = await readState();
    assert.ok(Math.abs(final.baseYaw + 0.15) < 1e-10);
    assert.ok(Math.abs(final.tray[0] - 0.65) < 1e-10);
    assert.equal(final.signals.robot_done, 1);
    assert.equal(final.signals.cycle_done, 1);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/trigger_final.png'), fullPage: true });
    await page.locator('#trigger-reset').click();
    const reset = await readState();
    assert.equal(reset.tick, 0); assert.equal(reset.time, 0);
    assert.ok(Math.abs(reset.tray[0] - 0.2) < 1e-10);
    assert.ok(Math.abs(reset.baseYaw) < 1e-10);
    await page.evaluate(() => { window.robotjointcollection.findWhere({ name: 'base_yaw' }).movejoint(0.05); window.robot.updateMatrixWorld(true); });
    await page.locator('#trigger-prepare').click();
    assert.ok(Math.abs((await readState()).q[0] - 0.05) < 1e-10, 'Triggered clock captures the start joint vector.');
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'finished');
    const changedStartSnapshot = await page.evaluate(() => window.__plannerSnapshots.at(-1));
    assert.ok(Math.abs(changedStartSnapshot.joints.find(joint => joint.name === 'base_yaw').theta - 0.05) < 1e-10,
      'Worker must plan from the current joint state at RUN_ROBOT.');
    assert.ok(Math.abs((await readState()).baseYaw + 0.15) < 1e-10);
    await page.locator('#trigger-reset').click();
    assert.ok(Math.abs((await readState()).baseYaw - 0.05) < 1e-10);
    await page.evaluate(() => { window.robotjointcollection.findWhere({ name: 'base_yaw' }).movejoint(0); window.robot.updateMatrixWorld(true); });
    await page.locator('#trigger-prepare').click();
    await page.evaluate(() => { window.__workerDelayMs = 350; });
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'planning');
    await page.locator('#trigger-reset').click();
    const resetDuringPlanning = await readState();
    assert.equal(resetDuringPlanning.tick, 0);
    assert.ok(Math.abs(resetDuringPlanning.tray[0] - 0.2) < 1e-10);
    await page.waitForTimeout(450);
    const afterStaleWorker = await readState();
    assert.equal(afterStaleWorker.tick, 0, 'Aborted Worker result must not resume the reset cycle.');
    assert.ok(Math.abs(afterStaleWorker.baseYaw) < 1e-10);
    await page.evaluate(() => { window.__workerDelayMs = 0; });
    const validRobotSource = readFileSync(path.join(root, 'testowe/multi_program/combined.robot'), 'utf8');
    await page.locator('#program-source').fill(validRobotSource.replace('base_yaw=-0.15', 'base_yaw=99'));
    await page.locator('#trigger-prepare').click();
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'error');
    const planningFailure = await readState();
    assert.ok(Math.abs(planningFailure.tray[0] - 0.65) < 1e-10, 'Planning failure leaves the delivered tray in place.');
    assert.ok(Math.abs(planningFailure.baseYaw) < 1e-10, 'Planning failure does not move the arm.');
    assert.match(planningFailure.diagnostics.at(-1).message, /Movement line/);
    assert.match(await page.locator('#trigger-status').textContent(), /Concurrent line 9: Movement line/);
    await page.locator('#trigger-reset').click();
    await page.locator('#program-source').fill(validRobotSource);
    await page.locator('#trigger-prepare').click();
    await page.locator('#signal-program-source').fill('PROGRAM arm\nSET start 1\nRUN_ROBOT\nEND\nPROGRAM conveyor\nWAIT_SET start\nMOVE_MODEL tray X 0.65 TICKS 4\nEND');
    await page.locator('#trigger-prepare').click();
    for (let i = 0; i < 3; i++) {
      await page.locator('#trigger-step').click();
      await page.waitForFunction(() => App.workcellUI.triggerClock?.status !== 'planning');
    }
    const unsafe = await readState();
    assert.equal(unsafe.status, 'error');
    assert.equal(unsafe.diagnostics.at(-1).code, 'UNSAFE_DEVICE_TIMING');
    assert.ok(Math.abs(unsafe.tray[0] - 0.2) < 1e-10, 'Rejected tick does not move the device.');
    await page.locator('#trigger-reset').click();
    await page.locator('#signal-program-source').fill(readFileSync(path.join(root, 'testowe/multi_program/triggered.mprg'), 'utf8'));
    await page.locator('#trigger-prepare').click();
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'finished');
    await page.locator('#tab-workcell').click();
    const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()]).then(([item]) => item);
    const zip = readFileSync(await download.path());
    await page.locator('#project-file').setInputFiles({ name: 'triggered.zip', mimeType: 'application/zip', buffer: zip });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project'));
    const reopened = await page.evaluate(() => ({ tray: App.workcellUI.sceneModel.snapshotWorld().models.find(model => model.name === 'tray').pose,
      baseYaw: window.robotjointcollection.findWhere({ name: 'base_yaw' }).theta,
      robotSource: App.workcellUI.programSource.value, signalSource: App.workcellUI.signalProgramSource.value,
      triggerClock: App.workcellUI.triggerClock }));
    assert.ok(Math.abs(reopened.tray[0] - 0.65) < 1e-10);
    assert.ok(Math.abs(reopened.baseYaw + 0.15) < 1e-10);
    assert.equal(reopened.robotSource, readFileSync(path.join(root, 'testowe/multi_program/combined.robot'), 'utf8'));
    assert.equal(reopened.signalSource, readFileSync(path.join(root, 'testowe/multi_program/triggered.mprg'), 'utf8'));
    assert.equal(reopened.triggerClock, null);
    assert.deepEqual(pageErrors, []);
    const result = { initial, deviceMiddle, planned, robotMiddle, paused, final, reset, planningFailure, unsafe, reopened,
      workerSnapshotTrayX: trayWorld[12], changedStartQ: 0.05, resetDuringPlanning, afterStaleWorker, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/triggered_robot.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', workerSnapshotTrayX: trayWorld[12], robotStart: planned.robotStart,
      robotDuration: planned.robotDuration, finalBaseYaw: final.baseYaw, finalTrayX: final.tray[0], pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
