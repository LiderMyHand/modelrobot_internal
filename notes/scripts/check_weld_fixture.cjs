const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const checkOnly = process.argv.includes('--check');

function freePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const port = listener.address().port;
      listener.close(() => resolve(port));
    });
  });
}

async function main() {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const source = readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port));
  const server = spawn('python3', ['-c', source], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (server.exitCode != null) throw new Error(`Server exited with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) { ready = true; break; } }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    if (!ready) throw new Error('Browser server did not start.');
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    page.setDefaultTimeout(120000);
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-workcell').click();
    await page.locator('#workcell-weld-demo').click();
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'seam_cartesian');
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.has('workpiece'));
    await page.locator('#tab-program').click();
    await page.locator('#program-plan').click();
    await page.waitForFunction(() => App.workcellUI.plan?.weld?.segments?.length === 2 || document.getElementById('program-status').classList.contains('text-danger'));
    const result = await page.evaluate(() => {
      const ui = App.workcellUI;
      const plan = ui.plan;
      return { status: document.getElementById('program-status').textContent,
        workcellStatus: document.getElementById('workcell-status').textContent,
        robotCollisionIssues: App.collisions.issues,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(node => node.textContent),
        plans: plan?.plans.map(move => ({ type: move.type, line: move.line, duration: move.duration })) || null,
        duration: plan?.duration ?? null, sampleCount: plan?.samples.length ?? null,
        weld: plan?.weld ?? null, processTrajectory: plan?.processTrajectory ?? null,
        preview: ui.weldPreviews?.map(line => {
          line.updateWorldMatrix(true, false);
          const attribute = line.geometry.getAttribute('position');
          const world = index => new THREE.Vector3().fromBufferAttribute(attribute, index).applyMatrix4(line.matrixWorld).toArray();
          return { parent: line.parent?.name, count: attribute?.count, color: line.material.color.getHexString(), visible: line.visible,
            first: world(0), middle: world(Math.floor(attribute.count / 2)), last: world(attribute.count - 1) };
        }) ?? null };
    });
    result.pageErrors = pageErrors;
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.robotCollisionIssues, []);
    assert.deepEqual(result.pageErrors, []);
    assert.deepEqual(result.plans?.map(move => move.type), ['PTP', 'CIRC', 'LIN']);
    assert.deepEqual(result.weld?.segments.map(segment => segment.type), ['CIRC', 'LIN']);
    assert.deepEqual(result.weld?.events.map(event => event.kind), ['WELD_ON', 'WELD_OFF']);
    assert.ok(result.weld.segments.every(segment => segment.object === 'workpiece'));
    const points = result.weld.segments.flatMap(segment => segment.samples);
    assert.ok(points.length > 20);
    assert.ok(points.every(point => Math.abs(point.position[2]) < 1e-5));
    const distances = points.map(({ position: [x, y, z] }) => Math.hypot(
      Math.max(0, Math.abs(x - 0.35) - 0.3),
      Math.max(0, Math.abs(y - 0.05) - 0.25),
      Math.max(0, Math.abs(z + 0.075) - 0.05)));
    result.seamSurfaceDistance = { min: Math.min(...distances), max: Math.max(...distances) };
    assert.ok(result.seamSurfaceDistance.max < 0.04);
    assert.ok(Math.abs(result.seamSurfaceDistance.min - 0.025) < 1e-4);
    const processDownload = await Promise.all([
      page.waitForEvent('download'), page.locator('#process-export').click(),
    ]).then(([download]) => download);
    const processPath = path.join(root, 'notes/artifacts/weld_path_download.json');
    await processDownload.saveAs(processPath);
    const downloaded = JSON.parse(readFileSync(processPath, 'utf8'));
    assert.deepEqual(downloaded.events.map(event => event.kind), ['WELD_ON', 'WELD_OFF']);
    assert.deepEqual(downloaded.segments.map(segment => segment.object), ['workpiece', 'workpiece']);
    const midTime = result.weld.segments[0].startTime + result.weld.segments[0].endTime;
    const processStatus = await page.evaluate(time => {
      App.workcellUI.player.seek(time / 2);
      return document.getElementById('program-time').textContent;
    }, midTime);
    assert.match(processStatus, /Welding workpiece/);
    const previewAfterReset = await page.evaluate(time => {
      const ui = App.workcellUI;
      ui.player.reset();
      const attached = ui.plan.weld.segments.every((segment, index) =>
        ui.weldPreviews[index]?.parent === ui.sceneModel.getObject(segment.object));
      ui.player.seek(time / 2);
      return attached;
    }, midTime);
    assert.equal(previewAfterReset, true, 'Weld preview should reattach after Reset replaces scene groups.');
    if (!checkOnly) {
      await page.screenshot({ path: path.join(root, 'notes/artifacts/weld_fixture.png'), fullPage: true });
      writeFileSync(path.join(root, 'notes/artifacts/weld_fixture.json'), JSON.stringify(result, null, 2) + '\n');
    }
    process.stdout.write(JSON.stringify({ status: result.status, workcellStatus: result.workcellStatus,
      plans: result.plans, duration: result.duration, sampleCount: result.sampleCount,
      weldSegments: result.weld.segments.map(segment => ({ object: segment.object, type: segment.type,
        line: segment.line, startTime: segment.startTime, endTime: segment.endTime, sampleCount: segment.samples.length })),
      seamSurfaceDistance: result.seamSurfaceDistance, processEvents: result.weld.events, preview: result.preview, processStatus, previewAfterReset,
      diagnostics: result.diagnostics, pageErrors }) + '\n');
  } finally { await browser?.close(); server.kill(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
