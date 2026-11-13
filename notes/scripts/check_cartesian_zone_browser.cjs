const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const source = zone => `ROBOT seam_cartesian\nTOOL tcp_link\nPOSE corner world 0.4 0 0 Q 0 0 0 1\nPOSE finish world 0.4 0.2 0 Q 0 0 0 1\nZONE ${zone}\nMOVEL corner\nMOVEL finish\n`;
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
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/weld/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'seam_cartesian');
    await page.locator('#sdf-file').setInputFiles(path.join(root, 'testowe/weld/world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 2);
    await page.locator('#tab-program').click();
    await page.locator('#standard-view').selectOption('top');
    const plan = async zone => page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program;
      await ui.planCurrentProgram();
      const result = ui.plan;
      if (!result) return { status: 'error', diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      const boundary = result.plans[0].endTime;
      const sample = result.samples.find(item => Math.abs(item.time - boundary) < 1e-8);
      ui.player.seek(boundary);
      const actual = result.model.jointNames.map(name => window.robotjointcollection.findWhere({ name }).theta);
      const stamps = result.trajectory.points.map(item => item.time_from_start.sec * 1e9 + item.time_from_start.nanosec);
      return { status: 'planned', boundary, sample, actual,
        blends: result.cartesianZoneBlends, ptpBlends: result.zoneBlends,
        duration: result.duration, samples: result.samples.length,
        path: result.samples.map(item => ({ time: item.time, x: item.q[0], y: item.q[1] })),
        strictStamps: stamps.every((stamp, i) => i === 0 || stamp > stamps[i - 1]),
        label: document.getElementById('program-status').textContent };
    }, source(zone));
    const stopped = await plan(0);
    assert.equal(stopped.status, 'planned', JSON.stringify(stopped));
    near(stopped.sample.q[0], 0.4, 2e-5); near(stopped.sample.q[1], 0, 2e-5);
    assert.ok(stopped.sample.velocity.every(value => Math.abs(value) < 1e-8));
    assert.deepEqual(stopped.blends, []);
    await page.locator('#program-source').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/cartesian_zone_stopped.png'), fullPage: true });
    const blended = await plan(0.07);
    assert.equal(blended.status, 'planned', JSON.stringify(blended));
    assert.equal(blended.blends.length, 1);
    assert.deepEqual(blended.ptpBlends, []);
    assert.ok(Math.hypot(blended.sample.q[0] - 0.4, blended.sample.q[1]) > 1e-5,
      'Positive ZONE should pass near, not through, the nominal waypoint.');
    assert.ok(Math.hypot(...blended.sample.velocity) > 1e-4,
      'The logical command boundary must not force a stop.');
    assert.ok(blended.blends[0].maxWaypointDistance <= 0.07 + 1e-8);
    assert.ok(blended.blends[0].speedFraction > 1e-5);
    near(blended.actual[0], blended.sample.q[0], 1e-8); near(blended.actual[1], blended.sample.q[1], 1e-8);
    assert.equal(blended.strictStamps, true);
    assert.deepEqual(pageErrors, []);
    await page.locator('#program-source').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/cartesian_zone_blended.png'), fullPage: true });
    const evidence = { stopped, blended, pageErrors };
    writeFileSync(path.join(root, 'notes/artifacts/cartesian_zone_browser.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', stoppedBoundary: stopped.boundary,
      blendedBoundary: blended.boundary, blendedCorner: blended.sample.q,
      maxWaypointDistance: blended.blends[0].maxWaypointDistance, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
