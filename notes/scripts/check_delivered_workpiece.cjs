const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const fixture = name => readFileSync(path.join(root, `testowe/multi_program/${name}`), 'utf8');
const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});
const near = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `Expected ${actual} near ${expected} (±${tolerance}).`);

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
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const state = () => page.evaluate(() => {
      const ui = App.workcellUI, clock = ui.triggerClock, box = ui.sceneModel.getObject('pick_box');
      ui.sceneModel.scene.updateMatrixWorld(true);
      const boxWorld = box.getWorldPosition(new THREE.Vector3()).toArray();
      const baseYaw = window.robotjointcollection.findWhere({ name: 'base_yaw' }).theta;
      return { tick: clock?.tick, timeSeconds: clock?.timeSeconds, status: clock?.status,
        robotStatus: clock?.robot.status, robotStart: clock?.robot.startTime, robotDuration: clock?.robot.duration,
        signals: clock?.schedulerState.signals, boxWorld, attachment: ui.sceneModel.attachmentRecords(),
        baseYaw, diagnostics: clock?.diagnostics, playerTime: ui.triggerPlayer?.time };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.evaluate(() => {
      const NativeWorker = window.Worker;
      window.__deliveredPlannerSnapshots = [];
      window.Worker = class extends NativeWorker {
        postMessage(message, ...rest) {
          if (message?.snapshot) window.__deliveredPlannerSnapshots.push(message.snapshot);
          return super.postMessage(message, ...rest);
        }
      };
    });
    await page.evaluate(urdf => App.localRobots.showURDF(urdf),
      readFileSync(path.join(root, 'testowe/workcell/arm.urdf'), 'utf8'));
    await page.locator('#tab-workcell').click();
    await page.locator('#sdf-source').fill(fixture('delivered_world.sdf'));
    await page.locator('#sdf-apply').click();
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#program-source').fill(fixture('delivered.robot'));
    await page.locator('#signal-program-source').fill(fixture('delivered.mprg'));
    await page.locator('#trigger-prepare').click();
    const initial = await state();
    assert.equal(initial.status, 'running');
    near(initial.boxWorld[0], 0.2);
    near(initial.baseYaw, 0);
    await page.locator('#trigger-step').click();
    const deliveryMid = await state();
    near(deliveryMid.boxWorld[0], 0.255);
    assert.equal(deliveryMid.robotStatus, 'idle');
    near(deliveryMid.baseYaw, 0);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/delivered_workpiece_mid.png'), fullPage: true });

    let planned;
    for (let step = 0; step < 20; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      const current = await state();
      if (current.status === 'error') throw new Error(`Triggered run failed before planning: ${JSON.stringify(current.diagnostics)}`);
      if (current.robotStatus === 'moving') { planned = current; break; }
    }
    assert.ok(planned, 'RUN_ROBOT did not produce a Worker plan.');
    near(planned.boxWorld[0], 0.42);
    near(planned.baseYaw, 0);
    assert.ok(planned.robotStart >= 0.4, 'Worker must plan after delivery.');
    const workerSnapshot = await page.evaluate(() => window.__deliveredPlannerSnapshots.at(-1));
    assert.ok(workerSnapshot, 'The Worker planning snapshot was not captured.');
    const boxSnapshot = workerSnapshot.scene.models.find(model => model.name === 'pick_box');
    near(boxSnapshot.world[12], 0.42);
    near(boxSnapshot.world[13], 0.16);
    near(boxSnapshot.world[14], 0.765);
    near(workerSnapshot.joints.find(joint => joint.name === 'base_yaw').theta, 0);
    const robotPlanEvents = await page.evaluate(() => App.workcellUI.triggerPlayer.events);
    assert.deepEqual(robotPlanEvents.map(event => [event.kind, event.object]),
      [['GRAB', 'pick_box'], ['RELEASE', 'pick_box']]);

    let grabbed;
    for (let step = 0; step < 500; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      const current = await state();
      if (current.status === 'error') throw new Error(`Triggered robot failed: ${JSON.stringify(current.diagnostics)}`);
      if (current.attachment.some(item => item.object === 'pick_box')) { grabbed = current; break; }
    }
    assert.ok(grabbed, 'The robot never attached the delivered workpiece.');
    assert.match(grabbed.attachment.find(item => item.object === 'pick_box').frame, /^robot\//);
    assert.ok(grabbed.playerTime > 0);
    assert.match(await page.locator('#workcell-objects').textContent(), /pick_box → robot\/classroom_six_axis_arm\/link\/tcp_link/);
    let carried;
    for (let step = 0; step < 200; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      const current = await state();
      if (current.status === 'error') throw new Error(`Triggered robot failed during carry: ${JSON.stringify(current.diagnostics)}`);
      if (current.attachment.some(item => item.object === 'pick_box') &&
          Math.hypot(current.boxWorld[0] - grabbed.boxWorld[0], current.boxWorld[1] - grabbed.boxWorld[1], current.boxWorld[2] - grabbed.boxWorld[2]) > 0.1) {
        carried = current; break;
      }
    }
    assert.ok(carried, 'The attached workpiece did not move with the robot.');
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/delivered_workpiece_carried.png'), fullPage: true });

    let finished;
    for (let step = 0; step < 500; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      const current = await state();
      if (current.status === 'error') throw new Error(`Triggered robot failed before release: ${JSON.stringify(current.diagnostics)}`);
      if (current.status === 'finished') { finished = current; break; }
    }
    assert.ok(finished, 'The triggered workcell did not finish.');
    assert.equal(finished.attachment.length, 0, 'RELEASE should leave the box detached.');
    assert.doesNotMatch(await page.locator('#workcell-objects').textContent(), /pick_box →/);
    assert.equal(finished.signals.robot_done, 1);
    assert.equal(finished.signals.cycle_done, 1);
    near(finished.boxWorld[0], 0.839917, 0.005);
    near(finished.boxWorld[1], -0.16, 0.005);
    near(finished.boxWorld[2], 0.785023, 0.005);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/delivered_workpiece_placed.png'), fullPage: true });

    await page.locator('#trigger-reset').click();
    const reset = await state();
    assert.equal(reset.tick, 0);
    assert.equal(reset.status, 'running');
    assert.equal(reset.attachment.length, 0);
    assert.doesNotMatch(await page.locator('#workcell-objects').textContent(), /pick_box →/);
    near(reset.boxWorld[0], 0.2);
    near(reset.boxWorld[1], 0.16);
    near(reset.baseYaw, 0);
    assert.deepEqual(pageErrors, []);
    const evidence = { initial, deliveryMid, planned, workerSnapshotBoxWorld: boxSnapshot.world,
      robotPlanEvents,
      grabbed, carried, finished, reset, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/delivered_workpiece.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', workerBoxX: boxSnapshot.world[12],
      grabbedAt: grabbed.timeSeconds, carriedBox: carried.boxWorld, placedBox: finished.boxWorld,
      resetBox: reset.boxWorld, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
