const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const net = require('node:net');

function freePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer(); listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
  });
}

(async () => {
  const port = await freePort(), origin = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync('tests/serve.py', 'utf8').replace('8765', String(port))], { stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 60; i++) { try { await fetch(origin); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); } }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage();
    const externalRequests = [], errors = [];
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      externalRequests.push(route.request().url()); return route.abort();
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    const urdf = readFileSync('testowe/workcell/arm.urdf', 'utf8');
    const sdf = readFileSync('testowe/workcell/world.sdf', 'utf8');
    await page.evaluate(({ urdf, sdf }) => {
      App.localRobots.showURDF(urdf);
      App.workcellUI.sdfSource.value = sdf; App.workcellUI.applySDF();
      App.workcellUI.programSource.value = [
        'ROBOT classroom_six_axis_arm', 'TOOL tcp_link',
        'JOINTS near base_yaw=0.2 shoulder_pitch=0 elbow_pitch=0 wrist_roll=0 wrist_pitch=0 wrist_final=0',
        'MOVEJ near',
      ].join('\n');
    }, { urdf, sdf });
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    const result = await page.evaluate(async () => {
      const ui = App.workcellUI;
      await ui.planCurrentProgram();
      if (!ui.plan) return { error: document.getElementById('program-status').textContent };
      const duration = ui.plan.duration;
      ui.player.seek(duration / 2);
      const halfway = robotjointcollection.findWhere({ name: 'base_yaw' }).theta;
      App.robotjointmanipall.changejointval('wrist_final', 0.1);
      const afterManual = {
        baseYaw: robotjointcollection.findWhere({ name: 'base_yaw' }).theta,
        wristFinal: robotjointcollection.findWhere({ name: 'wrist_final' }).theta,
        planCleared: ui.plan === null,
        playDisabled: document.getElementById('program-play').disabled,
        status: document.getElementById('program-status').textContent,
      };
      await ui.planCurrentProgram();
      return { duration, halfway, afterManual, replannedFrom: ui.plan?.samples[0].q, replanStatus: document.getElementById('program-status').textContent };
    });
    assert.ok(!result.error, result.error);
    assert.ok(result.halfway > 0 && result.halfway < 0.2, 'Midpoint should move the robot.');
    assert.ok(Math.abs(result.afterManual.baseYaw - result.halfway) < 1e-9);
    assert.equal(result.afterManual.wristFinal, 0.1);
    assert.equal(result.afterManual.planCleared, true);
    assert.equal(result.afterManual.playDisabled, true);
    assert.match(result.afterManual.status, /Plan the program again/);
    assert.ok(result.replannedFrom, JSON.stringify(result));
    assert.ok(Math.abs(result.replannedFrom[0] - result.halfway) < 1e-9);
    assert.equal(result.replannedFrom[5], 0.1);
    assert.deepEqual(externalRequests, []);
    assert.deepEqual(errors, []);
    writeFileSync('notes/artifacts/manual-handoff.json', JSON.stringify({ ...result, externalRequests, errors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', ...result, externalRequests, errors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
