const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const fixture = name => readFileSync(path.join(root, `testowe/multi_program/${name}`), 'utf8');
const near = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `Expected ${actual} near ${expected} (±${tolerance}).`);
const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))],
    { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode != null) throw new Error(`Server exited with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    const state = () => page.evaluate(() => {
      const ui = App.workcellUI, clock = ui.triggerClock;
      return { tick: clock?.tick, time: clock?.timeSeconds, status: clock?.status,
        robot: clock?.robot.status, q: clock?.q, done: clock?.schedulerState.signals.robot_done,
        cycleDone: clock?.schedulerState.signals.cycle_done,
        trayX: ui.sceneModel.snapshotWorld().models.find(model => model.name === 'tray')?.pose[0],
        yaw: window.robotjointcollection.findWhere({ name: 'base_yaw' })?.theta,
        diagnostics: clock?.diagnostics, snapshots: window.__twoRequestSnapshots?.length || 0 };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.evaluate(() => {
      const NativeWorker = window.Worker;
      window.__twoRequestSnapshots = [];
      window.Worker = class extends NativeWorker {
        postMessage(message, ...rest) {
          if (message?.snapshot) window.__twoRequestSnapshots.push(message.snapshot);
          return super.postMessage(message, ...rest);
        }
      };
    });
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#trigger-two-example').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    assert.equal(await page.locator('#program-source').inputValue(), fixture('two_requests.robot'));
    assert.equal(await page.locator('#signal-program-source').inputValue(), fixture('two_requests.mprg'));
    const initial = await state();
    assert.equal(initial.status, 'running'); near(initial.trayX, 0.2); near(initial.yaw, 0);
    let firstPlan, between, secondPlan, secondMid, finished;
    for (let step = 0; step < 150; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      const current = await state();
      if (current.status === 'error' || current.status === 'timeout' || current.status === 'deadlock')
        throw new Error(`Two-request run failed: ${JSON.stringify(current.diagnostics)}`);
      if (!firstPlan && current.snapshots === 1 && current.robot === 'moving') {
        firstPlan = current;
        await page.evaluate(() => { window.__firstTriggeredPlayer = App.workcellUI.triggerPlayer; });
      }
      if (firstPlan && !between && current.trayX > 0.5 + 1e-6 && current.trayX < 0.65 - 1e-6) {
        between = current;
        await page.locator('#trigger-status').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(root, 'notes/artifacts/two_request_between.png'), fullPage: true });
      }
      if (firstPlan && !secondPlan && current.snapshots === 2 && current.robot === 'moving') {
        secondPlan = current;
        assert.equal(await page.evaluate(() => App.workcellUI.triggerPlayer !== window.__firstTriggeredPlayer), true,
          'The second plan needs a fresh player from the current scene.');
        near(await page.evaluate(() => App.workcellUI.triggerPlayer.initialWorld.models.find(model => model.name === 'tray').pose[0]), 0.65);
        await page.locator('#trigger-status').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(root, 'notes/artifacts/two_request_second_plan.png'), fullPage: true });
      }
      if (secondPlan && !secondMid && current.snapshots === 2 && current.robot === 'moving' && current.yaw < -0.02) {
        secondMid = current;
        await page.locator('#trigger-status').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(root, 'notes/artifacts/two_request_second_motion.png'), fullPage: true });
      }
      if (current.status === 'finished') { finished = current; break; }
    }
    assert.ok(firstPlan && between && secondPlan && secondMid && finished,
      'Both plans, second robot motion, and the intervening device move must execute.');
    near(firstPlan.trayX, 0.5); near(firstPlan.yaw, 0); assert.equal(firstPlan.done, 0);
    near(between.yaw, 0.05); assert.equal(between.done, 1);
    near(secondPlan.trayX, 0.65); near(secondPlan.yaw, 0.05); assert.equal(secondPlan.done, 0);
    near(secondMid.trayX, 0.65); assert.ok(secondMid.yaw < -0.02); assert.equal(secondMid.done, 0);
    near(finished.trayX, 0.65); near(finished.yaw, 0.05);
    assert.equal(finished.done, 1); assert.equal(finished.cycleDone, 1);
    const snapshots = await page.evaluate(() => window.__twoRequestSnapshots);
    assert.equal(snapshots.length, 2);
    const snap = snapshots.map(snapshot => ({ trayX: snapshot.scene.models.find(model => model.name === 'tray').world[12],
      yaw: snapshot.joints.find(joint => joint.name === 'base_yaw').theta }));
    near(snap[0].trayX, 0.5); near(snap[0].yaw, 0);
    near(snap[1].trayX, 0.65); near(snap[1].yaw, 0.05);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/two_request_finished.png'), fullPage: true });
    await page.locator('#trigger-reset').click();
    const reset = await state();
    assert.equal(reset.tick, 0); near(reset.trayX, 0.2); near(reset.yaw, 0);
    assert.deepEqual(pageErrors, []);
    const evidence = { initial, firstPlan, between, secondPlan, secondMid, finished, snapshots: snap, reset, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/two_request_browser.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', snapshots: snap, finalTick: finished.tick, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
