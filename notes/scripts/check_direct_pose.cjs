const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const net = require('node:net');

const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync('tests/serve.py', 'utf8').replace('8765', String(port))], { stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 60; i++) { try { await fetch(url); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); } }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    const urdf = readFileSync('testowe/workcell/arm.urdf', 'utf8');
    const sdf = readFileSync('testowe/workcell/world.sdf', 'utf8');
    await page.evaluate(({ urdf, sdf }) => {
      App.localRobots.showURDF(urdf); App.workcellUI.sdfSource.value = sdf; App.workcellUI.applySDF();
    }, { urdf, sdf });
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-pose-details').open = true; });
    await page.locator('#pose-target-current').click();
    assert.equal(await page.locator('#pose-target-link').inputValue(), 'tcp_link');
    const start = await page.locator('#pose-target-x').inputValue();
    assert.ok(Math.abs(Number(start) - 0.94) < 1e-6);
    await page.locator('#pose-target-orientation-values').fill('0 0 0 0');
    await page.locator('#pose-target-orientation').selectOption('AA');
    assert.equal(await page.locator('#pose-target-orientation').inputValue(), 'Q', 'A failed conversion must keep the original representation.');
    await page.locator('#pose-target-orientation-values').fill('0 0 0 1');
    await page.locator('#pose-target-x').fill(String(0.94 * Math.cos(0.2)));
    await page.locator('#pose-target-y').fill(String(0.94 * Math.sin(0.2)));
    await page.locator('#pose-target-z').fill('0.95');
    await page.locator('#pose-target-orientation').selectOption('AA');
    await page.locator('#pose-target-orientation-values').fill('0 0 1 0.2');
    await page.locator('#pose-target-orientation').selectOption('Q');
    const quaternionValues = (await page.locator('#pose-target-orientation-values').inputValue()).split(/\s+/).map(Number);
    assert.ok(Math.abs(quaternionValues[2] - Math.sin(0.1)) < 1e-9);
    assert.ok(Math.abs(quaternionValues[3] - Math.cos(0.1)) < 1e-9);
    await page.locator('#pose-target-orientation').selectOption('AA');
    const angleAxisValues = (await page.locator('#pose-target-orientation-values').inputValue()).split(/\s+/).map(Number);
    assert.ok(Math.abs(angleAxisValues[2] - 1) < 1e-9);
    assert.ok(Math.abs(angleAxisValues[3] - 0.2) < 1e-9);
    await page.locator('#pose-target-plan').click();
    await page.waitForFunction(() => App.workcellUI.plan?.status === 'planned' || document.getElementById('program-status').classList.contains('text-danger'));
    const result = await page.evaluate(() => {
      const ui = App.workcellUI;
      if (!ui.plan) return { error: document.getElementById('program-status').textContent };
      const end = ui.plan.samples.at(-1).q;
      ui.player.seek(ui.plan.duration);
      return { source: ui.programSource.value, duration: ui.plan.duration, end, actualYaw: robotjointcollection.findWhere({ name: 'base_yaw' }).theta,
        status: document.getElementById('program-status').textContent };
    });
    assert.ok(!result.error, result.error);
    assert.match(result.source, /POSE goal_pose world .* AA 0 0 1 0.2/);
    assert.ok(Math.abs(result.end[0] - 0.2) < 1e-4);
    assert.ok(Math.abs(result.actualYaw - 0.2) < 1e-4);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: 'notes/artifacts/direct-pose.png' });
    const continuation = await page.evaluate(async () => {
      const ui = App.workcellUI;
      document.getElementById('pose-target-x').value = '0.94';
      document.getElementById('pose-target-y').value = '0';
      document.getElementById('pose-target-z').value = '0.95';
      document.getElementById('pose-target-orientation-values').value = '0 0 1 0';
      await ui.planPoseTarget();
      return { firstYaw: ui.plan?.samples[0].q[0], lastYaw: ui.plan?.samples.at(-1).q[0], status: document.getElementById('program-status').textContent };
    });
    assert.ok(Math.abs(continuation.firstYaw - 0.2) < 1e-4, 'Direct move should begin at the displayed pose.');
    assert.ok(Math.abs(continuation.lastYaw) < 1e-4);
    await page.evaluate(() => App.workcellUI.player.seek(App.workcellUI.plan.duration));
    await page.locator('#pose-target-frame').selectOption('tool');
    assert.equal(await page.locator('#pose-target-x').inputValue(), '0');
    assert.equal(await page.locator('#pose-target-y').inputValue(), '0');
    assert.equal(await page.locator('#pose-target-z').inputValue(), '0');
    assert.equal(await page.locator('#pose-target-orientation-values').inputValue(), '0 0 1 0');
    await page.locator('#pose-target-x').fill(String(0.94 * Math.cos(0.2) - 0.94));
    await page.locator('#pose-target-y').fill(String(0.94 * Math.sin(0.2)));
    await page.locator('#pose-target-orientation-values').fill('0 0 1 0.2');
    await page.locator('#pose-target-plan').click();
    await page.waitForFunction(() => App.workcellUI.plan?.status === 'planned' ||
      document.getElementById('program-status').classList.contains('text-danger'));
    const toolRelative = await page.evaluate(() => {
      const ui = App.workcellUI;
      if (!ui.plan) return { error: document.getElementById('program-status').textContent };
      const first = ui.plan.samples[0].q, end = ui.plan.samples.at(-1).q;
      ui.player.seek(ui.plan.duration);
      const tcp = ui.sceneModel.getFrame('robot/classroom_six_axis_arm/link/tcp_link');
      tcp.updateWorldMatrix(true, false);
      return { source: ui.programSource.value, firstYaw: first[0], endYaw: end[0],
        xyz: tcp.getWorldPosition(new THREE.Vector3()).toArray() };
    });
    assert.ok(!toolRelative.error, toolRelative.error);
    assert.match(toolRelative.source, /POSE goal_pose tool .* AA 0 0 1 0.2/);
    assert.ok(Math.abs(toolRelative.firstYaw) < 1e-4);
    assert.ok(Math.abs(toolRelative.endYaw - 0.2) < 1e-4);
    assert.ok(Math.hypot(toolRelative.xyz[0] - 0.94 * Math.cos(0.2),
      toolRelative.xyz[1] - 0.94 * Math.sin(0.2), toolRelative.xyz[2] - 0.95) < 1e-3);
    await page.screenshot({ path: 'notes/artifacts/direct-pose-tool.png' });
    writeFileSync('notes/artifacts/direct-pose.json', JSON.stringify({ ...result, continuation, toolRelative, errors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', duration: result.duration, end: result.end, continuation, toolRelative, errors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
