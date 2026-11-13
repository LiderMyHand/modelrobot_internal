const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const fixture = path.join(root, 'testowe/device_collision/world.sdf');
const robot = path.join(root, 'testowe/workcell/arm.urdf');
const robotProgram = readFileSync(path.join(root, 'testowe/multi_program/combined.robot'), 'utf8');
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
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel);
    await page.locator('#local-files').setInputFiles(robot);
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-workcell').click();
    await page.locator('#sdf-file').setInputFiles(fixture);
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 2);
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    const state = () => page.evaluate(() => {
      const ui = App.workcellUI;
      const tray = ui.sceneModel.getObject('tray');
      tray.updateWorldMatrix(true, false);
      return { x: tray.getWorldPosition(new THREE.Vector3()).x,
        signalStatus: ui.signalState?.status, signalTick: ui.signalState?.tick,
        signalDiagnostic: ui.signalState?.diagnostics.at(-1)?.message,
        sharedStatus: ui.sharedClock?.status, sharedTick: ui.sharedClock?.schedulerState.tick,
        sharedDiagnostic: ui.sharedClock?.diagnostics.at(-1)?.message,
        triggerStatus: ui.triggerClock?.status, triggerTick: ui.triggerClock?.tick,
        triggerDiagnostic: ui.triggerClock?.diagnostics.at(-1)?.message };
    });
    const signal = await page.evaluate(() => {
      const ui = App.workcellUI;
      ui.signalProgramSource.value = 'PROGRAM conveyor\nMOVE_MODEL tray X 1 TICKS 1\nEND\n';
      ui.resetSignalPrograms(); ui.stepSignalPrograms();
      return { status: ui.signalState?.status, diagnostic: ui.signalState?.diagnostics.at(-1) };
    });
    const afterSignal = await state();
    assert.equal(signal.status, 'error');
    assert.equal(signal.diagnostic.code, 'DEVICE_COLLISION');
    assert.equal(signal.diagnostic.line, 2);
    assert.match(signal.diagnostic.message, /line 2.*collides with.*wall/i);
    assert.equal(afterSignal.x, 0);
    await page.locator('#signal-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/device_sweep_signal_blocked.png'), fullPage: true });

    const shared = await page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program;
      await ui.planCurrentProgram();
      if (!ui.plan) return { status: 'plan_error', diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      ui.signalProgramSource.value = 'PROGRAM conveyor\nWAIT_SET robot_done TIMEOUT 100\nMOVE_MODEL tray X 1 TICKS 1\nEND\n';
      ui.prepareSharedRun();
      for (let i = 0; i < 100 && ui.sharedClock?.status === 'running'; i++) ui.stepSharedRun();
      return { status: ui.sharedClock?.status, diagnostic: ui.sharedClock?.diagnostics.at(-1), duration: ui.plan.duration };
    }, robotProgram);
    const afterShared = await state();
    assert.equal(shared.status, 'error', JSON.stringify(shared));
    assert.equal(shared.diagnostic.code, 'DEVICE_COLLISION');
    assert.match(shared.diagnostic.message, /line 3.*collides with.*wall/i);
    assert.equal(afterShared.x, 0);

    const triggered = await page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program;
      ui.signalProgramSource.value = 'PROGRAM conveyor\nMOVE_MODEL tray X 1 TICKS 1\nRUN_ROBOT\nEND\n';
      ui.prepareTriggeredRun();
      await ui.advanceTriggeredTick();
      return { status: ui.triggerClock?.status, diagnostic: ui.triggerClock?.diagnostics.at(-1) };
    }, robotProgram);
    const afterTriggered = await state();
    assert.equal(triggered.status, 'error', JSON.stringify(triggered));
    assert.equal(triggered.diagnostic.code, 'DEVICE_COLLISION');
    assert.match(triggered.diagnostic.message, /line 2.*collides with.*wall/i);
    assert.equal(afterTriggered.x, 0);
    assert.equal(afterTriggered.triggerTick, 0, 'Rejected tick must not commit.');
    assert.deepEqual(pageErrors, []);
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/device_sweep_triggered_blocked.png'), fullPage: true });
    writeFileSync(path.join(root, 'notes/artifacts/device_sweep_browser.json'),
      JSON.stringify({ signal, afterSignal, shared, afterShared, triggered, afterTriggered, pageErrors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', signal: signal.status, shared: shared.status,
      triggered: triggered.status, trayX: afterTriggered.x, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
