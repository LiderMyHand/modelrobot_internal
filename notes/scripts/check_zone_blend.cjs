const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const source = zone => `ROBOT seam_cartesian\nTOOL tcp_link\nJOINTS corner slide_x=0.4 slide_y=0\nJOINTS finish slide_x=0.4 slide_y=0.2\nZONE ${zone}\nMOVEJ corner\nMOVEJ finish`;

function freePort() {
  return new Promise((resolve, reject) => {
    const socket = net.createServer(); socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolve(port)); });
  });
}

async function main() {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const serverSource = readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port));
  const server = spawn('python3', ['-c', serverSource], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      try { if ((await fetch(url)).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('Local browser server did not start.');
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(120000);
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/weld/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'seam_cartesian');
    await page.locator('#sdf-file').setInputFiles(path.join(root, 'testowe/weld/world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 2);
    await page.locator('#tab-program').click();
    const plan = async text => page.evaluate(async program => {
      const ui = App.workcellUI; ui.programSource.value = program;
      await ui.planCurrentProgram();
      const result = ui.plan;
      if (!result) return { status: document.getElementById('program-status').textContent,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      const boundary = result.plans[0].endTime;
      const point = result.samples.find(sample => Math.abs(sample.time - boundary) < 1e-9);
      ui.player.seek(boundary);
      const actual = result.model.jointNames.map(name => window.robotjointcollection.findWhere({ name }).theta);
      const stamps = result.trajectory.points.map(item => item.time_from_start.sec * 1e9 + item.time_from_start.nanosec);
      return { status: document.getElementById('program-status').textContent, boundary, point,
        actual, zoneBlends: result.zoneBlends, sampleCount: result.samples.length,
        path: result.samples.map(sample => ({ time: sample.time, x: sample.q[0], y: sample.q[1] })),
        strictNanoseconds: stamps.every((stamp, i) => i === 0 || stamp > stamps[i - 1]) };
    }, text);
    const stopped = await plan(source(0));
    const blended = await plan(source(.07));
    await page.locator('#program-source').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/zone_ptp_corner.png'), fullPage: true });
    const result = { stopped, blended, pageErrors };
    assert.match(stopped.status, /^Planned 2 move\(s\)/);
    assert.match(blended.status, /^Planned 2 move\(s\)/);
    assert.deepEqual(stopped.zoneBlends, []);
    assert.equal(blended.zoneBlends.length, 1);
    assert.deepEqual(stopped.point.q, [.4, 0]);
    assert.ok(stopped.point.velocity.every(value => Math.abs(value) < 1e-9));
    assert.ok(blended.zoneBlends[0].cornerSpeedFraction > 1e-5);
    assert.ok(blended.zoneBlends[0].waypointDeviation > 1e-6);
    assert.ok(blended.zoneBlends[0].waypointDeviation <= .07 + 1e-8);
    assert.ok(blended.actual.every((value, i) => Math.abs(value - blended.point.q[i]) < 1e-8));
    assert.equal(blended.strictNanoseconds, true);
    assert.deepEqual(pageErrors, []);
    writeFileSync(path.join(root, 'notes/artifacts/zone_ptp_browser.json'), JSON.stringify(result, null, 2) + '\n');
    process.stdout.write(JSON.stringify({ stopped: { ...stopped, path: undefined },
      blended: { ...blended, path: undefined }, pageErrors }, null, 2) + '\n');
  } finally { await browser?.close(); server.kill(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
