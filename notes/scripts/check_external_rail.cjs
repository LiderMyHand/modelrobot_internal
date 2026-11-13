const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const near = (actual, expected, tolerance = 1e-4) => assert.ok(Math.abs(actual - expected) < tolerance,
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
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/external_rail/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'rail_arm');
    await page.locator('#tab-program').click();
    await page.locator('#standard-view').selectOption('top');
    const source = readFileSync(path.join(root, 'testowe/external_rail/program.robot'), 'utf8');
    const result = await page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program;
      await ui.planCurrentProgram();
      const plan = ui.plan;
      if (!plan) return { status: 'error', diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      const names = plan.model.jointNames, end = plan.samples.at(-1), first = plan.samples[0];
      const farTime = plan.plans[0].endTime;
      const far = plan.samples.find(sample => Math.abs(sample.time - farTime) < 1e-9);
      const midpoint = plan.duration / 2;
      ui.player.seek(midpoint);
      const middleRail = window.robotjointcollection.findWhere({ name: 'rail_slide' }).theta;
      const carriage = window.robotlinkcollection.findWhere({ name: 'carriage' }).get('link');
      const carriageX = carriage.getWorldPosition(new THREE.Vector3()).x;
      ui.player.seek(plan.duration);
      const finalJointValues = names.map(name => window.robotjointcollection.findWhere({ name }).theta);
      const tip = window.robotlinkcollection.findWhere({ name: 'tcp_link' }).get('link');
      const tipPosition = tip.getWorldPosition(new THREE.Vector3()).toArray();
      const ros = plan.trajectory;
      const stamps = ros.points.map(item => item.time_from_start.sec * 1e9 + item.time_from_start.nanosec);
      return { status: 'planned', names, initial: first.q, far: far.q, final: end.q,
        duration: plan.duration, middleRail, carriageX, finalJointValues, tipPosition,
        rosNames: ros.joint_names, limitDetails: plan.limitDetails,
        strictlyIncreasingTime: stamps.every((stamp, i) => i === 0 || stamp > stamps[i - 1]),
        maxRailVelocity: Math.max(...plan.samples.map(sample => Math.abs(sample.velocity[0]))),
        maxRailAcceleration: Math.max(...plan.samples.map(sample => Math.abs(sample.acceleration[0]))),
        label: document.getElementById('program-status').textContent };
    }, source);
    assert.equal(result.status, 'planned', JSON.stringify(result));
    assert.deepEqual(result.names, ['rail_slide', 'shoulder', 'elbow']);
    assert.deepEqual(result.rosNames, result.names);
    assert.equal(result.limitDetails[0].velocitySource, 'URDF');
    near(result.limitDetails[0].velocity, .25, 1e-12);
    assert.ok(result.far[0] > .3 && result.far[0] < .6, 'Rail must be used to reach beyond arm-only reach.');
    near(result.final[0], .45, 1e-8); near(result.final[1], .4, 1e-8); near(result.final[2], -.4, 1e-8);
    assert.ok(result.middleRail > 0 && result.middleRail < result.final[0]);
    near(result.carriageX, result.middleRail, 1e-8);
    result.final.forEach((value, i) => near(result.finalJointValues[i], value, 1e-8));
    near(result.tipPosition[0], .45 + .25 * Math.cos(.4) + .25, 2e-4);
    near(result.tipPosition[1], .25 * Math.sin(.4), 2e-4); near(result.tipPosition[2], .1, 2e-4);
    assert.ok(result.maxRailVelocity <= .25 + 1e-8);
    assert.ok(result.maxRailAcceleration <= .5 + 1e-8);
    assert.equal(result.strictlyIncreasingTime, true);
    assert.deepEqual(pageErrors, []);
    await page.screenshot({ path: path.join(root, 'notes/artifacts/external_rail_reached.png'), fullPage: true });
    const unreachable = await page.evaluate(async () => {
      const ui = App.workcellUI;
      ui.player.reset();
      ui.programSource.value = 'ROBOT rail_arm\nTOOL tcp_link\nPOSE beyond world 1.4 0 0.1 Q 0 0 0 1\nMOVEJ beyond';
      await ui.planCurrentProgram();
      return { hasPlan: !!ui.plan, diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
    });
    assert.equal(unreachable.hasPlan, false);
    assert.match(unreachable.diagnostics.join(' '), /unreachable|No joint configuration/i);
    writeFileSync(path.join(root, 'notes/artifacts/external_rail_browser.json'), JSON.stringify({ result, unreachable, pageErrors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', railAtPose: result.far[0], railAtEnd: result.final[0], duration: result.duration, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
