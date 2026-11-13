const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { unzipSync, zipSync, strToU8 } = require('fflate');

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
  const program = readFileSync(path.join(root, 'testowe/weld/join_program.txt'), 'utf8');
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
    page.on('dialog', dialog => dialog.accept());
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/weld/robot.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'seam_cartesian');
    await page.locator('#sdf-file').setInputFiles(path.join(root, 'testowe/weld/world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 2);
    const result = await page.evaluate(async source => {
      const ui = App.workcellUI;
      ui.programSource.value = source;
      await ui.planCurrentProgram();
      const plan = ui.plan;
      const capture = () => {
        const position = name => ui.sceneModel.getObject(name).getWorldPosition(new THREE.Vector3()).toArray();
        return { parent: position('workpiece'), child: position('extension_plate'),
          attachments: ui.sceneModel.attachmentRecords(),
          jointState: window.robotjointcollection.filter(joint => joint.type !== 'fixed' && !joint.mimic)
            .map(joint => ({ name: joint.name, value: joint.theta })),
          objectList: [...document.querySelectorAll('#workcell-objects li')].map(item => item.textContent),
          weldPreviewAttached: ui.weldPreviews?.every((preview, index) =>
            preview.parent === ui.sceneModel.getObject(plan.weld.segments[index].object)) ?? false };
      };
      let playback = null;
      if (plan) {
        const initial = capture();
        const [join, grab] = plan.events;
        ui.player.seek(join.time + 0.05);
        const afterJoin = capture();
        ui.player.seek(grab.time);
        const afterGrab = capture();
        ui.player.seek(plan.duration);
        const atEnd = capture();
        ui.player.reset();
        playback = { initial, afterJoin, afterGrab, atEnd, reset: capture() };
      }
      return { planStatus: document.getElementById('program-status').textContent,
        workcellStatus: document.getElementById('workcell-status').textContent,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent),
        robotCollisionIssues: App.collisions.issues,
        plans: plan?.plans.map(move => ({ type: move.type, line: move.line, duration: move.duration })) ?? null,
        duration: plan?.duration ?? null, samples: plan?.samples.length ?? null,
        events: plan?.events ?? null, processEvents: plan?.weld.events ?? null, playback };
    }, program);
    result.pageErrors = pageErrors;
    assert.deepEqual(result.diagnostics, []);
    assert.deepEqual(result.robotCollisionIssues, []);
    assert.deepEqual(result.pageErrors, []);
    assert.deepEqual(result.plans?.map(move => move.type), ['PTP', 'CIRC', 'LIN', 'LIN']);
    assert.deepEqual(result.events?.map(event => event.kind), ['WELD_JOIN', 'GRAB', 'RELEASE']);
    assert.deepEqual(result.processEvents?.map(event => event.kind), ['WELD_ON', 'WELD_OFF', 'WELD_JOIN']);
    const attached = (record, object, frame) => record.attachments.some(item => item.object === object && item.frame === frame);
    assert.ok(attached(result.playback.afterJoin, 'extension_plate', 'model/workpiece'));
    assert.equal(result.playback.afterJoin.attachments.length, 1);
    assert.ok(result.playback.afterJoin.objectList.includes('extension_plate → model/workpiece'));
    assert.ok(attached(result.playback.afterGrab, 'workpiece', 'robot/seam_cartesian/link/tcp_link'));
    assert.ok(attached(result.playback.atEnd, 'extension_plate', 'model/workpiece'));
    assert.equal(result.playback.atEnd.attachments.length, 1);
    const close = (actual, expected, tolerance = 1e-4) => actual.every((value, i) => Math.abs(value - expected[i]) < tolerance);
    const shift = result.playback.atEnd.parent.map((value, i) => value - result.playback.initial.parent[i]);
    assert.ok(shift.some(value => Math.abs(value) > 0.1));
    assert.ok(close(result.playback.atEnd.child, result.playback.initial.child.map((value, i) => value + shift[i])));
    assert.deepEqual(result.playback.reset.attachments, []);
    assert.equal(result.playback.reset.weldPreviewAttached, true);
    assert.ok(close(result.playback.reset.parent, result.playback.initial.parent, 1e-10));
    assert.ok(close(result.playback.reset.child, result.playback.initial.child, 1e-10));
    await page.locator('#tab-workcell').click();
    const captureScene = () => page.evaluate(() => {
      const ui = App.workcellUI;
      const position = name => ui.sceneModel.getObject(name).getWorldPosition(new THREE.Vector3()).toArray();
      return { parent: position('workpiece'), child: position('extension_plate'),
        attachments: ui.sceneModel.attachmentRecords(),
        jointState: window.robotjointcollection.filter(joint => joint.type !== 'fixed' && !joint.mimic)
          .map(joint => ({ name: joint.name, value: joint.theta })),
        objectList: [...document.querySelectorAll('#workcell-objects li')].map(item => item.textContent),
        program: ui.programSource.value };
    });
    const downloadZip = async () => {
      const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()])
        .then(([item]) => item);
      return readFileSync(await download.path());
    };
    if (!checkOnly) {
      await page.evaluate(() => App.workcellUI.player.seek(App.workcellUI.plan.events[0].time + 0.05));
      await page.screenshot({ path: path.join(root, 'notes/artifacts/weld_join_attached.png'), fullPage: true });
    }
    await page.evaluate(() => {
      const plan = App.workcellUI.plan;
      App.workcellUI.player.seek((plan.events[1].time + plan.events[2].time) / 2);
    });
    result.carriedBeforeZip = await captureScene();
    assert.deepEqual(result.carriedBeforeZip.attachments, [
      { object: 'extension_plate', frame: 'model/workpiece' },
      { object: 'workpiece', frame: 'robot/seam_cartesian/link/tcp_link' },
    ]);
    if (!checkOnly) await page.screenshot({ path: path.join(root, 'notes/artifacts/weld_join_carried.png'), fullPage: true });
    const carriedZipBytes = await downloadZip();
    await page.evaluate(() => App.workcellUI.player.seek(App.workcellUI.plan.duration));
    if (!checkOnly) await page.screenshot({ path: path.join(root, 'notes/artifacts/weld_join_released.png'), fullPage: true });
    const zipBytes = await downloadZip();
    await page.locator('#project-file').setInputFiles({ name: 'weld_join.zip', mimeType: 'application/zip', buffer: zipBytes });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project weld_classroom'));
    result.reopened = await captureScene();
    assert.deepEqual(result.reopened.attachments, [{ object: 'extension_plate', frame: 'model/workpiece' }]);
    assert.ok(close(result.reopened.parent, result.playback.atEnd.parent, 1e-8));
    assert.ok(close(result.reopened.child, result.playback.atEnd.child, 1e-8));
    assert.deepEqual(result.reopened.jointState, result.playback.atEnd.jointState);
    assert.ok(result.reopened.objectList.includes('extension_plate → model/workpiece'));
    assert.equal(result.reopened.program, program);
    await page.locator('#project-file').setInputFiles({ name: 'weld_join_carried.zip', mimeType: 'application/zip', buffer: carriedZipBytes });
    await page.waitForFunction(() => App.workcellUI.sceneModel.attachmentRecords().length === 2);
    result.reopenedCarried = await captureScene();
    assert.deepEqual(result.reopenedCarried.attachments, result.carriedBeforeZip.attachments);
    assert.ok(close(result.reopenedCarried.parent, result.carriedBeforeZip.parent, 1e-8));
    assert.ok(close(result.reopenedCarried.child, result.carriedBeforeZip.child, 1e-8));
    assert.deepEqual(result.reopenedCarried.jointState, result.carriedBeforeZip.jointState);
    assert.ok(result.reopenedCarried.objectList.includes('extension_plate → model/workpiece'));
    assert.equal(result.reopenedCarried.program, program);
    const beforeInvalid = await captureScene();
    const invalidEntries = unzipSync(carriedZipBytes);
    invalidEntries['robot-state.json'] = strToU8(JSON.stringify({ jointNames: ['slide_x', 'slide_y'], positions: [999, 0] }));
    const invalidZip = zipSync(invalidEntries);
    await page.locator('#project-file').setInputFiles({ name: 'invalid_joint.zip', mimeType: 'application/zip', buffer: Buffer.from(invalidZip) });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('outside'));
    result.invalidImportStatus = await page.locator('#workcell-status').textContent();
    result.afterInvalid = await captureScene();
    assert.deepEqual(result.afterInvalid, beforeInvalid);
    const legacyEntries = unzipSync(carriedZipBytes);
    const legacyManifest = JSON.parse(Buffer.from(legacyEntries['project.json']).toString('utf8'));
    delete legacyManifest.robotState;
    legacyEntries['project.json'] = strToU8(JSON.stringify(legacyManifest));
    delete legacyEntries['robot-state.json'];
    await page.locator('#project-file').setInputFiles({ name: 'legacy_weld_join.zip', mimeType: 'application/zip', buffer: Buffer.from(zipSync(legacyEntries)) });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project weld_classroom'));
    result.reopenedLegacy = await captureScene();
    assert.deepEqual(result.reopenedLegacy.attachments, result.carriedBeforeZip.attachments);
    assert.ok(result.reopenedLegacy.jointState.every(item => Math.abs(item.value) < 1e-10));
    assert.ok(close(result.reopenedLegacy.parent, result.carriedBeforeZip.parent, 1e-8));
    assert.ok(close(result.reopenedLegacy.child, result.carriedBeforeZip.child, 1e-8));
    assert.deepEqual(pageErrors, []);
    if (!checkOnly) writeFileSync(path.join(root, 'notes/artifacts/weld_join.json'), JSON.stringify(result, null, 2) + '\n');
    process.stdout.write(JSON.stringify(result) + '\n');
  } finally { await browser?.close(); server.kill(); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
