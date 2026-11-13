const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const fixture = name => readFileSync(path.join(root, `testowe/multi_program/${name}`), 'utf8');
const near = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance,
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
      return { tick: clock?.tick, clockTime: clock?.timeSeconds, visualTime: ui.triggerVisualTime,
        status: clock?.status, robot: clock?.robot.status, playing: ui.triggerPlaying,
        playerTime: ui.triggerPlayer?.time, expectedYaw: ui.triggerPlayer?.qAt(ui.triggerPlayer.time)[0],
        yaw: window.robotjointcollection.findWhere({ name: 'base_yaw' })?.theta,
        attachments: ui.sceneModel.attachmentRecords(), signals: clock?.schedulerState.signals };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#trigger-tick-seconds').fill('1');
    await page.locator('#trigger-example').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    for (let step = 0; step < 20; step++) {
      await page.evaluate(() => App.workcellUI.advanceTriggeredTick());
      if ((await state()).robot === 'moving') break;
    }
    const atBoundary = await state();
    assert.equal(atBoundary.robot, 'moving');
    near(atBoundary.playerTime, 0);
    // Sample and pause in one browser task: under parallel browser load a
    // separate Playwright click can arrive after this short robot segment.
    await page.evaluate(async tick => {
      const ui = App.workcellUI;
      ui.playTriggeredRun();
      await new Promise((resolve, reject) => {
        const deadline = performance.now() + 5000;
        const observe = () => {
          if (ui.triggerClock.tick === tick && ui.triggerPlayer.time > 0.05 && ui.triggerPlayer.time < 0.5) {
            ui.pauseTriggeredRun(); resolve();
          } else if (performance.now() > deadline) reject(new Error('No first-run sub-tick motion observed.'));
          else requestAnimationFrame(observe);
        };
        requestAnimationFrame(observe);
      });
    }, atBoundary.tick);
    const paused = await state();
    assert.equal(paused.tick, atBoundary.tick, 'Visual robot motion must occur without a logical tick.');
    assert.ok(paused.playerTime > 0.05 && paused.playerTime < 0.5);
    assert.ok(paused.visualTime > paused.clockTime);
    assert.ok(paused.yaw < 0 && paused.yaw > -0.15);
    near(paused.yaw, paused.expectedYaw, 1e-9);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/subtick_robot_mid.png'), fullPage: true });
    await page.waitForTimeout(160);
    const held = await state();
    near(held.visualTime, paused.visualTime, 1e-12); near(held.yaw, paused.yaw, 1e-12);
    assert.equal(held.tick, paused.tick);
    await page.locator('#trigger-play').click();
    await page.waitForFunction(tick => App.workcellUI.triggerClock.tick > tick, atBoundary.tick);
    await page.locator('#trigger-pause').click();
    const resumed = await state();
    assert.ok(resumed.clockTime > atBoundary.clockTime);
    assert.ok(resumed.playerTime >= paused.playerTime);
    near(resumed.yaw, resumed.expectedYaw, 1e-9);
    await page.locator('#trigger-reset').click();
    const reset = await state();
    assert.equal(reset.tick, 0); near(reset.visualTime, 0); near(reset.yaw, 0);

    await page.locator('#trigger-tick-seconds').fill('0.1');
    await page.locator('#tab-workcell').click();
    await page.locator('#sdf-source').fill(fixture('delivered_world.sdf'));
    await page.locator('#sdf-apply').click();
    await page.locator('#tab-program').click();
    await page.locator('#program-source').fill(fixture('delivered.robot'));
    await page.locator('#signal-program-source').fill(fixture('delivered.mprg'));
    await page.locator('#trigger-prepare').click();
    const timing = await page.evaluate(async () => {
      const ui = App.workcellUI;
      for (let i = 0; i < 100; i++) {
        if (ui.triggerClock.status !== 'running') throw new Error(`Triggered run stopped: ${ui.triggerClock.status}`);
        const event = ui.triggerPlayer?.events.find(item => item.kind === 'GRAB');
        if (event && ui.triggerClock.timeSeconds < ui.triggerClock.robot.startTime + event.time &&
            ui.triggerClock.timeSeconds + ui.triggerClock.tickSeconds >= ui.triggerClock.robot.startTime + event.time) {
          return { grabGlobal: ui.triggerClock.robot.startTime + event.time,
            tick: ui.triggerClock.tick, clockTime: ui.triggerClock.timeSeconds };
        }
        await ui.advanceTriggeredTick();
      }
      throw new Error('Could not reach the tick containing GRAB.');
    });
    const beforeGrab = await state();
    assert.equal(beforeGrab.attachments.length, 0);
    await page.evaluate(time => App.workcellUI.renderTriggeredVisual(time), timing.grabGlobal + 0.002);
    const grabbed = await state();
    assert.equal(grabbed.tick, timing.tick);
    assert.ok(grabbed.visualTime > grabbed.clockTime);
    assert.equal(grabbed.attachments.find(item => item.object === 'pick_box')?.frame,
      'robot/classroom_six_axis_arm/link/tcp_link');
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/subtick_grab.png'), fullPage: true });
    await page.locator('#trigger-step').click();
    const afterGrabTick = await state();
    assert.equal(afterGrabTick.attachments.find(item => item.object === 'pick_box')?.frame,
      'robot/classroom_six_axis_arm/link/tcp_link');
    assert.ok(afterGrabTick.visualTime >= grabbed.visualTime);
    await page.locator('#trigger-reset').click();
    const finalReset = await state();
    assert.equal(finalReset.tick, 0); assert.equal(finalReset.attachments.length, 0);

    await page.locator('#trigger-tick-seconds').fill('1');
    await page.locator('#trigger-two-example').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    await page.evaluate(async () => {
      const ui = App.workcellUI;
      for (let i = 0; i < 30; i++) {
        if (ui.triggerClock.requestCount === 2 && ui.triggerClock.robot.status === 'moving') return;
        if (ui.triggerClock.status !== 'running') throw new Error(`Two-run cycle stopped: ${ui.triggerClock.status}`);
        await ui.advanceTriggeredTick();
      }
      throw new Error('Second RUN_ROBOT was not reached.');
    });
    await page.evaluate(async () => {
      const ui = App.workcellUI;
      ui.playTriggeredRun();
      await new Promise((resolve, reject) => {
        const deadline = performance.now() + 5000;
        const observe = () => {
          const clock = ui.triggerClock;
          if (clock?.requestCount === 2 && clock.robot.status === 'moving' &&
              ui.triggerPlayer?.time > 0.05 && ui.triggerPlayer.time < 0.85 &&
              ui.triggerVisualTime > clock.timeSeconds + 0.05) {
            ui.pauseTriggeredRun(); resolve();
          } else if (performance.now() > deadline) reject(new Error('No second-run sub-tick motion observed.'));
          else requestAnimationFrame(observe);
        };
        requestAnimationFrame(observe);
      });
    });
    const secondRunVisual = await state();
    assert.ok(secondRunVisual.visualTime > secondRunVisual.clockTime);
    assert.ok(secondRunVisual.playerTime > 0.05);
    near(secondRunVisual.yaw, secondRunVisual.expectedYaw, 1e-9);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/subtick_second_run.png'), fullPage: true });
    await page.waitForTimeout(130);
    const secondRunHeld = await state();
    near(secondRunHeld.visualTime, secondRunVisual.visualTime, 1e-12);
    near(secondRunHeld.yaw, secondRunVisual.yaw, 1e-12);
    await page.locator('#trigger-play').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'finished');
    const secondFinished = await state();
    near(secondFinished.yaw, 0.05, 1e-8);
    assert.equal(secondFinished.signals.robot_done, 1);
    assert.equal(secondFinished.signals.cycle_done, 1);
    await page.locator('#trigger-reset').click();
    const secondReset = await state();
    assert.equal(secondReset.tick, 0); near(secondReset.yaw, 0);
    assert.deepEqual(pageErrors, []);
    const evidence = { atBoundary, paused, held, resumed, reset, timing, beforeGrab, grabbed, afterGrabTick,
      finalReset, secondRunVisual, secondRunHeld, secondFinished, secondReset, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/subtick_playback.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', pausedPlayerTime: paused.playerTime,
      sameTick: paused.tick, grabVisualTime: grabbed.visualTime, grabClockTime: grabbed.clockTime, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
