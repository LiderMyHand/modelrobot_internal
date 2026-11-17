const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '../..');
const fixture = path.join(root, 'notes/artifacts/official_ur5');
const freePort = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(url); await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    const stls = readdirSync(path.join(fixture, 'browser/meshes')).map(name => path.join(fixture, 'browser/meshes', name));
    await page.locator('#local-files').setInputFiles([path.join(fixture, 'expanded_vendor.urdf'), ...stls]);
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'official_ur5');
    const unadapted = await page.evaluate(() => ({ messages: App.localRobots.messages, localStatus: document.getElementById('local-status').textContent,
      collisions: App.collisions.issues, loadedAssets: App.localRobots.assets.size }));
    await page.locator('#local-files').setInputFiles([path.join(fixture, 'browser/robot.urdf'), ...stls]);
    await page.waitForFunction(() => App.localRobots.currentXml.includes('vendor_collision_surface'));
    const names = ['shoulder_pan_joint', 'shoulder_lift_joint', 'elbow_joint', 'wrist_1_joint', 'wrist_2_joint', 'wrist_3_joint'];
    const start = [-0.4, -1.0, 1.4, -1.5, -1.2, 0.3];
    await page.evaluate(({ names, start }) => {
      const ui = App.workcellUI;
      ui.sdfSource.value = '<sdf version="1.10"><world name="official_ur5_trial"/></sdf>'; ui.applySDF();
      ui.applyNamedJointState(names, start);
      document.getElementById('pose-target-link').value = 'tool0'; ui.refreshPendantJointOptions(); ui.refreshPendantFeedback();
      document.getElementById('program-pendant-details').open = true;
    }, { names, start });
    await page.locator('#tab-program').click();
    const model = await page.evaluate(() => ({ robot: App.workcellUI.activeRobotName, assets: App.localRobots.assets.size,
      warnings: App.localRobots.messages, issues: App.collisions.issues, tcp: document.getElementById('pose-target-link').value,
      normals: [...App.localRobots.geometries].map(([name, geometry]) => {
        const normal = geometry.getAttribute('normal'); let zero = 0, invalid = 0;
        for (let index = 0; index < normal.count; index++) {
          const length = Math.hypot(normal.getX(index), normal.getY(index), normal.getZ(index));
          if (!Number.isFinite(length)) invalid++; else if (length < 1e-10) zero++;
        }
        return { name, vertices: normal.count, zero, invalid };
      }),
      links: robotlinkcollection.map(link => ({ name: link.get('name'), visuals: link.meshvis_array?.length || 0 })) }));
    const trials = [];
    for (const [mode, axis] of [['joint', 0], ['world', 2], ['tool', 0]]) {
      await page.locator('#pendant-frame').selectOption(mode);
      const before = await page.evaluate(names => names.map(name => robotjointcollection.findWhere({ name }).theta), names);
      await page.locator(`[data-pendant-axis="${axis}"][data-pendant-sign="1"]`).click();
      trials.push(await page.evaluate(({ mode, before, names }) => ({ mode, before,
        after: names.map(name => robotjointcollection.findWhere({ name }).theta),
        status: document.getElementById('pendant-status').textContent, last: App.workcellUI.pendantLastJog }), { mode, before, names }));
    }
    await page.evaluate(() => { App.workcellUI.programSource.value = '# Official UR5, simplified vendor collision surfaces. Units: metres and radians.\nROBOT official_ur5\nTOOL tool0\n'; });
    const qA = await page.evaluate(names => names.map(name => robotjointcollection.findWhere({ name }).theta), names);
    await page.locator('#pendant-teach-joints').click();
    await page.locator('#pendant-frame').selectOption('joint');
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const qB = await page.evaluate(names => names.map(name => robotjointcollection.findWhere({ name }).theta), names);
    assert.ok(qB[0] > qA[0], 'Teaching B must follow a real joint jog from A.');
    await page.locator('#pendant-teach-joints').click();
    const teachingProgram = await page.locator('#program-source').inputValue();
    assert.match(teachingProgram, /MOVEJ taught_joints_1/); assert.match(teachingProgram, /MOVEJ taught_joints_2/);
    await page.evaluate(({ names, qA }) => App.workcellUI.applyNamedJointState(names, qA), { names, qA });
    await page.locator('#program-plan').click();
    await page.waitForFunction(() => App.workcellUI.plan || document.getElementById('program-status').classList.contains('text-danger'));
    const planned = await page.evaluate(() => ({ duration: App.workcellUI.plan?.duration,
      samples: App.workcellUI.plan?.samples.length, status: document.getElementById('program-status').textContent,
      start: App.workcellUI.plan?.samples[0].q, end: App.workcellUI.plan?.samples.at(-1).q }));
    assert.ok(planned.duration > 0, planned.status); assert.deepEqual(planned.start, qA);
    await page.locator('#program-play').click();
    await page.waitForFunction(() => App.workcellUI.player.state === 'finished');
    const finished = await page.evaluate(names => ({ state: App.workcellUI.player.state,
      joints: names.map(name => robotjointcollection.findWhere({ name }).theta) }), names);
    assert.ok(finished.joints.every((value, index) => Math.abs(value - qB[index]) < 1e-8));
    await page.locator('#program-reset').click();
    await page.locator('#pendant-detach').click();
    await page.screenshot({ path: path.join(fixture, 'ur5_browser.png') });
    const programming = { qA, qB, source: teachingProgram, planned, finished };
    const exported = await page.evaluate(names => {
      const ui = App.workcellUI;
      return { bytes: Array.from(ui.createProjectZip()), joints: names.map(name => robotjointcollection.findWhere({ name }).theta) };
    }, names);
    const archive = path.join(fixture, 'ur5_teaching.workcell.zip');
    writeFileSync(archive, Buffer.from(exported.bytes));
    await page.locator('#pendant-dock').click();
    await page.locator('#tab-workcell').click();
    await page.locator('#project-file').setInputFiles(archive);
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent === 'Opened project official_ur5_trial.');
    const reopened = await page.evaluate(names => ({ robot: App.workcellUI.activeRobotName,
      world: App.workcellUI.sceneModel.world.name, assets: App.localRobots.assets.size,
      joints: names.map(name => robotjointcollection.findWhere({ name }).theta),
      program: App.workcellUI.programSource.value, issues: App.collisions.issues }), names);
    assert.equal(reopened.robot, 'official_ur5'); assert.equal(reopened.assets, 7);
    assert.deepEqual(reopened.joints, exported.joints); assert.equal(reopened.program, teachingProgram);
    assert.deepEqual(reopened.issues, []);
    await page.screenshot({ path: path.join(fixture, 'ur5_project_reopened.png') });
    const evidence = { source: JSON.parse(readFileSync(path.join(fixture, 'provenance.json'), 'utf8')), unadapted, model, start, names, trials, programming,
      project: { file: 'ur5_teaching.workcell.zip', bytes: exported.bytes.length, reopened }, errors };
    writeFileSync(path.join(fixture, 'browser_trial.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
    assert.equal(model.assets, 7); assert.deepEqual(model.issues, []); assert.deepEqual(errors, []);
    assert.ok(model.normals.every(normal => normal.zero === 0 && normal.invalid === 0), 'Imported vendor meshes need valid normals for visible rendering.');
    assert.ok(trials.every(t => t.after.some((q, i) => Math.abs(q - t.before[i]) > 1e-7)), 'Each requested jog must move at least one joint.');
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
