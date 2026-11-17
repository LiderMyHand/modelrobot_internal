const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const baseSource = readFileSync(path.join(root, 'testowe/zone_multicorner/program.robot'), 'utf8');
const source = zone => baseSource.replace('ZONE 0.06\n', `ZONE ${zone}\n`);
const near = (a, b, tolerance = 2e-4) => assert.ok(Math.abs(a - b) <= tolerance,
  `Expected ${a} near ${b} (±${tolerance}).`);
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
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/zone_orientation/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'orientation_gantry');
    await page.locator('#sdf-file').setInputFiles(path.join(root, 'testowe/weld/world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 2);
    await page.locator('#tab-program').click();
    await page.locator('#standard-view').selectOption('top');

    const plan = async zone => page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.player.reset(); // Compare both zone settings from the same explicit start pose.
      ui.programSource.value = program;
      await ui.planCurrentProgram();
      const result = ui.plan;
      if (!result) return { status: 'error', diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      const boundaries = result.plans.slice(0, 2).map(plan => plan.endTime);
      const corners = boundaries.map(time => {
        const sample = result.samples.find(item => Math.abs(item.time - time) < 1e-8);
        ui.player.seek(time);
        const renderedQ = result.model.jointNames.map(name => window.robotjointcollection.findWhere({ name }).theta);
        return { time, sample, renderedQ };
      });
      const stamps = result.trajectory.points.map(point => point.time_from_start.sec * 1e9 + point.time_from_start.nanosec);
      return { status: 'planned', corners, blends: result.cartesianZoneBlends,
        planCount: result.plans.length, duration: result.duration, sampleCount: result.samples.length,
        strictStamps: stamps.every((stamp, i) => i === 0 || stamp > stamps[i - 1]),
        label: document.getElementById('program-status').textContent };
    }, source(zone));

    const stopped = await plan(0);
    assert.equal(stopped.status, 'planned', JSON.stringify(stopped));
    assert.equal(stopped.planCount, 3);
    assert.deepEqual(stopped.blends, []);
    near(stopped.corners[0].sample.q[0], 0.35); near(stopped.corners[0].sample.q[1], 0); near(stopped.corners[0].sample.q[2], 0.4, 5e-4);
    near(stopped.corners[1].sample.q[0], 0.35); near(stopped.corners[1].sample.q[1], 0.15); near(stopped.corners[1].sample.q[2], 0.8, 5e-4);
    assert.ok(stopped.corners.every(corner => corner.sample.velocity.every(value => Math.abs(value) < 1e-8)));
    assert.equal(stopped.strictStamps, true);
    await page.screenshot({ path: path.join(root, 'notes/artifacts/multicorner_stopped.png'), fullPage: true });

    const blended = await plan(0.06);
    assert.equal(blended.status, 'planned', JSON.stringify(blended));
    assert.equal(blended.planCount, 3);
    assert.equal(blended.blends.length, 2);
    assert.ok(blended.corners[0].time < blended.corners[1].time);
    assert.ok(blended.corners.every(corner => Math.hypot(...corner.sample.velocity) > 1e-4));
    assert.ok(blended.blends.every(blend => blend.maxWaypointDistance <= 0.06 + 1e-8));
    assert.ok(blended.blends.every(blend => blend.maxAngularSpeedBound <= 1 + 1e-8));
    assert.ok(blended.corners.some((corner, i) => Math.abs(corner.sample.q[2] - (i + 1) * 0.4) > 1e-4));
    for (const corner of blended.corners) for (let i = 0; i < corner.sample.q.length; i++)
      near(corner.renderedQ[i], corner.sample.q[i], 1e-8);
    assert.equal(blended.strictStamps, true);
    assert.deepEqual(pageErrors, []);
    await page.screenshot({ path: path.join(root, 'notes/artifacts/multicorner_blended.png'), fullPage: true });
    writeFileSync(path.join(root, 'notes/artifacts/multicorner_browser.json'), JSON.stringify({ stopped, blended, pageErrors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', stoppedTimes: stopped.corners.map(c => c.time),
      blendedTimes: blended.corners.map(c => c.time), boundarySpeeds: blended.corners.map(c => Math.hypot(...c.sample.velocity)), pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
