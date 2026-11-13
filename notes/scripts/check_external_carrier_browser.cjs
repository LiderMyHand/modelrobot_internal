const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { unzipSync, strFromU8 } = require('fflate');

const root = path.resolve(__dirname, '../..');
const file = name => path.join(root, `testowe/external_carrier/${name}`);
const source = name => readFileSync(file(name), 'utf8');
const near = (actual, expected, tolerance = 2e-3) => assert.ok(Math.abs(actual - expected) <= tolerance,
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
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    const inspect = () => page.evaluate(() => {
      const ui = App.workcellUI;
      const root = window.robot, carrier = ui.sceneModel.getObject('carrier');
      root.updateWorldMatrix(true, false); carrier.updateWorldMatrix(true, false);
      const tip = window.robotlinkcollection.findWhere({ name: 'tcp_link' }).get('link');
      tip.updateWorldMatrix(true, false);
      return { rootId: root.id, carrierX: carrier.getWorldPosition(new THREE.Vector3()).x,
        baseX: root.getWorldPosition(new THREE.Vector3()).x,
        tcp: tip.getWorldPosition(new THREE.Vector3()).toArray(),
        q: ['slide_x', 'slide_y', 'wrist_yaw'].map(name => window.robotjointcollection.findWhere({ name }).theta),
        mount: ui.sceneModel.robotMountRecord(ui.activeRobotName),
        tick: ui.triggerClock?.tick, status: ui.triggerClock?.status,
        robotStatus: ui.triggerClock?.robot.status,
        diagnostic: ui.triggerClock?.diagnostics.at(-1),
        requestCount: ui.triggerClock?.requestCount,
        planBaseX: ui.triggerPlayer?.model.worldFromBase[12],
        signal: ui.triggerClock?.schedulerState.signals };
    });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/zone_orientation/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'orientation_gantry');
    await page.locator('#tab-workcell').click();
    await page.locator('#sdf-file').setInputFiles(file('world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.has('carrier'));
    await page.locator('#robot-base-frame').selectOption('model/carrier/link/deck');
    const mounted = await inspect();
    assert.equal(mounted.mount.frame, 'model/carrier/link/deck');
    near(mounted.baseX, 0, 1e-8); near(mounted.carrierX, 0, 1e-8);
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#standard-view').selectOption('iso');
    await page.evaluate(() => App.workcellUI.fitWorkcell());
    await page.locator('#program-source').fill(source('program.robot'));
    await page.locator('#signal-program-source').fill(source('cycle.mprg'));
    await page.locator('#trigger-prepare').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    await page.evaluate(async () => { await App.workcellUI.advanceTriggeredTick(); await App.workcellUI.advanceTriggeredTick(); });
    const midpoint = await inspect();
    near(midpoint.carrierX, 0.1, 1e-8); near(midpoint.baseX, 0.1, 1e-8);
    assert.ok(midpoint.q.every(value => Math.abs(value) < 1e-8));
    await page.locator('#trigger-status').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'notes/artifacts/external_carrier_mid.png'), fullPage: true });
    await page.evaluate(async () => {
      const ui = App.workcellUI;
      for (let i = 0; i < 30 && ui.triggerClock?.requestCount === 0 && ui.triggerClock?.status === 'running'; i++)
        await ui.advanceTriggeredTick();
    });
    const requested = await inspect();
    assert.equal(requested.status, 'running', JSON.stringify(requested));
    assert.equal(requested.requestCount, 1);
    near(requested.carrierX, 0.2, 1e-8); near(requested.baseX, 0.2, 1e-8);
    near(requested.planBaseX, 0.2, 1e-8);
    await page.evaluate(async () => {
      const ui = App.workcellUI;
      for (let i = 0; i < 200 && ui.triggerClock?.status === 'running'; i++) await ui.advanceTriggeredTick();
    });
    const finished = await inspect();
    assert.equal(finished.status, 'finished', JSON.stringify(finished));
    near(finished.q[0], 0.4, 2e-3); near(finished.q[1], 0.1, 2e-3); near(finished.q[2], 0.4, 2e-3);
    near(finished.tcp[0], 0.6, 2e-3); near(finished.tcp[1], 0.1, 2e-3);
    assert.equal(finished.signal.cycle_done, 1);
    await page.evaluate(() => App.workcellUI.fitWorkcell());
    await page.screenshot({ path: path.join(root, 'notes/artifacts/external_carrier_robot_done.png'), fullPage: true });
    await page.locator('#tab-workcell').click();
    const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()]).then(([item]) => item);
    const zip = readFileSync(await download.path());
    const entries = unzipSync(zip);
    const archivedMount = JSON.parse(strFromU8(entries['robot-mount.json']));
    assert.equal(archivedMount.frame, 'model/carrier/link/deck');
    await page.locator('#tab-program').click();
    await page.locator('#trigger-reset').click();
    const originalReset = await inspect();
    near(originalReset.carrierX, 0, 1e-8); near(originalReset.baseX, 0, 1e-8);
    assert.equal(originalReset.mount.frame, 'model/carrier/link/deck');
    await page.locator('#tab-workcell').click();
    await page.locator('#project-file').setInputFiles({ name: 'carrier.zip', mimeType: 'application/zip', buffer: zip });
    await page.waitForFunction(() => {
      const ui = App.workcellUI;
      ui.sceneModel.getObject('carrier').updateWorldMatrix(true, false);
      return ui.sceneModel.robotMountRecord('orientation_gantry')?.frame === 'model/carrier/link/deck' &&
        Math.abs(ui.sceneModel.getObject('carrier').getWorldPosition(new THREE.Vector3()).x - 0.2) < 1e-8;
    });
    const reopened = await inspect();
    near(reopened.carrierX, 0.2, 1e-8); near(reopened.baseX, 0.2, 1e-8);
    near(reopened.tcp[0], 0.6, 2e-3);
    await page.locator('#tab-program').click();
    await page.locator('#trigger-prepare').click();
    await page.waitForFunction(() => App.workcellUI.triggerClock?.status === 'running');
    await page.locator('#trigger-reset').click();
    const reset = await inspect();
    near(reset.carrierX, 0.2, 1e-8); near(reset.baseX, 0.2, 1e-8);
    assert.equal(reset.mount.frame, 'model/carrier/link/deck');
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/zone_orientation/robot.urdf'));
    await page.waitForFunction(previousId => window.robot.id !== previousId, reset.rootId);
    const reparsed = await inspect();
    near(reparsed.baseX, 0.2, 1e-8);
    assert.equal(reparsed.mount.frame, 'model/carrier/link/deck');
    await page.locator('#tab-workcell').click();
    await page.locator('#sdf-source').fill('<sdf version="1.10"><world name="empty"/></sdf>');
    await page.locator('#sdf-apply').click();
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 0);
    const unmounted = await page.evaluate(() => ({ mount: App.workcellUI.sceneModel.robotMountRecord('orientation_gantry'),
      baseX: window.robot.getWorldPosition(new THREE.Vector3()).x,
      parentIsScene: window.robot.parent === window.scene }));
    assert.equal(unmounted.mount, null); near(unmounted.baseX, 0.2, 1e-8);
    assert.equal(unmounted.parentIsScene, true);
    assert.deepEqual(pageErrors, []);
    writeFileSync(path.join(root, 'notes/artifacts/external_carrier_browser.json'),
      JSON.stringify({ mounted, midpoint, requested, finished, archivedMount, originalReset, reopened, reset, reparsed, unmounted, pageErrors }, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', midpointBaseX: midpoint.baseX,
      plannedBaseX: requested.planBaseX, finalJointX: finished.q[0], pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
