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
    for (let attempt = 0; attempt < 60; attempt++) {
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.evaluate(urdf => {
      App.localRobots.showURDF(urdf);
      App.workcellUI.sdfSource.value = '<sdf version="1.10"><world name="pendant_lesson"/></sdf>';
      App.workcellUI.applySDF();
      App.workcellUI.applyNamedJointState(
        ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'],
        [0.2, -0.5, 0.8, 0.3, -0.4, 0.2]);
    }, readFileSync('testowe/workcell/arm.urdf', 'utf8'));
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-pendant-details').open = true; });
    assert.equal(await page.locator('#pose-target-link').inputValue(), 'tcp_link');
    assert.equal(await page.locator('#pendant-frame').inputValue(), 'joint');
    assert.match(await page.locator('[data-pendant-row="0"] strong').textContent(), /base_yaw/);
    assert.match(await page.locator('[data-pendant-row="5"] strong').textContent(), /wrist_final/);
    await page.evaluate(() => document.getElementById('teach-pendant').scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: 'notes/artifacts/teach_pendant_joint.png', fullPage: true });
    const jointBefore = await page.evaluate(() => robotjointcollection.findWhere({ name: 'base_yaw' }).theta);
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const jointAfter = await page.evaluate(() => ({ value: robotjointcollection.findWhere({ name: 'base_yaw' }).theta,
      status: document.getElementById('pendant-status').textContent }));
    assert.ok(jointAfter.value > jointBefore);
    assert.match(jointAfter.status, /Joint base_yaw \+ jog applied/);
    await page.locator('#pendant-coord').click();
    assert.equal(await page.locator('#pendant-frame').inputValue(), 'world');
    assert.equal(await page.locator('[data-pendant-row="0"] button[data-pendant-sign="1"]').textContent(), '+ X');
    const before = await page.evaluate(() => ({ feedback: document.getElementById('pendant-feedback').textContent,
      q: ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
        .map(name => robotjointcollection.findWhere({ name }).theta) }));
    assert.match(before.feedback, /TCP tcp_link world XYZ/);
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const world = await page.evaluate(() => ({ status: document.getElementById('pendant-status').textContent,
      last: App.workcellUI.pendantLastJog, feedback: document.getElementById('pendant-feedback').textContent }));
    assert.match(world.status, /World \+Z jog applied/, world.status);
    assert.equal(world.last.frame, 'world');
    assert.ok(world.last.q.some((value, index) => Math.abs(value - before.q[index]) > 1e-6));
    assert.ok(world.last.collisionSamples >= 2);
    await page.locator('#pendant-coord').click();
    assert.equal(await page.locator('#pendant-frame').inputValue(), 'tool');
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const tool = await page.evaluate(() => ({ status: document.getElementById('pendant-status').textContent,
      last: App.workcellUI.pendantLastJog, feedback: document.getElementById('pendant-feedback').textContent }));
    assert.match(tool.status, /Tool \+X jog applied/, tool.status);
    assert.equal(tool.last.frame, 'tool');
    assert.ok(tool.last.q.some((value, index) => Math.abs(value - world.last.q[index]) > 1e-6));
    await page.locator('#pendant-detach').click();
    assert.equal(await page.locator('#floating-pendant').isVisible(), true);
    assert.equal(await page.locator('#pendant-show').isVisible(), true);
    await page.locator('#tab-workcell').click();
    assert.equal(await page.locator('#floating-pendant').isVisible(), true, 'detached panel survives tab switch');
    await page.screenshot({ path: 'notes/artifacts/teach_pendant_detached.png', fullPage: true });
    const detachedBefore = await page.evaluate(() => App.workcellUI.pendantJogCount);
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    assert.equal(await page.evaluate(() => App.workcellUI.pendantJogCount), detachedBefore + 1,
      'the floating keypad must jog the robot');
    const beforeDrag = await page.locator('#floating-pendant').boundingBox();
    const handle = await page.locator('#pendant-panel-handle').boundingBox();
    await page.mouse.move(handle.x + 50, handle.y + 15);
    await page.mouse.down(); await page.mouse.move(handle.x + 20, handle.y + 65, { steps: 4 }); await page.mouse.up();
    const afterDrag = await page.locator('#floating-pendant').boundingBox();
    assert.ok(afterDrag.y > beforeDrag.y + 20, 'floating pendant should be draggable');
    await page.locator('#pendant-dock').click();
    assert.equal(await page.locator('#floating-pendant').isVisible(), false);
    assert.equal(await page.locator('#tab-program').getAttribute('aria-selected'), 'true');
    await page.locator('#pendant-linear-speed').fill('999');
    const beforeBlocked = await page.evaluate(() => App.workcellUI.pendantLastJog.q);
    await page.locator('[data-pendant-axis="1"][data-pendant-sign="1"]').click();
    const blocked = await page.evaluate(() => ({ status: document.getElementById('pendant-status').textContent,
      q: ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
        .map(name => robotjointcollection.findWhere({ name }).theta) }));
    assert.match(blocked.status, /Linear speed must be/);
    assert.deepEqual(blocked.q, beforeBlocked);
    await page.locator('#pendant-linear-speed').fill('0.03');
    const holdBefore = await page.evaluate(() => App.workcellUI.pendantJogCount);
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').hover();
    await page.mouse.down();
    await page.waitForTimeout(560);
    await page.mouse.up();
    const holdAfter = await page.evaluate(() => App.workcellUI.pendantJogCount);
    assert.ok(holdAfter - holdBefore >= 2, `Holding a jog button made ${holdAfter - holdBefore} step(s).`);
    await page.locator('#pendant-teach-pose').click();
    await page.locator('#pendant-teach-joints').click();
    await page.locator('#program-check').click();
    const taught = await page.evaluate(() => ({ source: App.workcellUI.programSource.value,
      status: document.getElementById('program-status').textContent }));
    assert.match(taught.source, /POSE taught_pose_1 world /);
    assert.match(taught.source, /JOINTS taught_joints_1 /);
    assert.match(taught.source, /MOVEJ taught_pose_1/);
    assert.match(taught.source, /MOVEJ taught_joints_1/);
    assert.match(taught.status, /Syntax valid/);
    const planned = await page.evaluate(async () => {
      const ui = App.workcellUI, names = ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'];
      const q = names.map(name => robotjointcollection.findWhere({ name }).theta);
      const target = q.map((value, index) => index === 0 ? value + 0.05 : value);
      ui.programSource.value = `ROBOT classroom_six_axis_arm\nTOOL tcp_link\nJOINTS ahead ${names.map((name, index) => `${name}=${target[index]}`).join(' ')}\nMOVEJ ahead\n`;
      await ui.planCurrentProgram({ preserveCurrentState: true });
      if (!ui.plan) return { error: document.getElementById('program-status').textContent };
      ui.player.seek(ui.plan.duration * 0.5);
      return { duration: ui.plan.duration, start: ui.plan.samples[0].q,
        midpoint: names.map(name => robotjointcollection.findWhere({ name }).theta) };
    });
    assert.ok(!planned.error, planned.error);
    assert.ok(planned.duration > 0);
    await page.locator('#pendant-frame').selectOption('world');
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const takeover = await page.evaluate(() => ({ status: document.getElementById('pendant-status').textContent,
      plan: !!App.workcellUI.plan, q: ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
        .map(name => robotjointcollection.findWhere({ name }).theta) }));
    assert.match(takeover.status, /World \+Z jog applied/, takeover.status);
    assert.equal(takeover.plan, false, 'manual jog must invalidate the old trajectory');
    assert.ok(Math.abs(takeover.q[0] - planned.midpoint[0]) < 0.01, 'jog started from the displayed midpoint');
    assert.ok(Math.abs(takeover.q[0] - planned.start[0]) > 0.01, 'jog did not reset to program start');

    const classroom = readFileSync('testowe/workcell/world.sdf', 'utf8');
    await page.evaluate(world => {
      App.workcellUI.applyNamedJointState(
        ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'],
        [2.0, -0.5, 0.8, 0.3, -0.4, 0.2]);
      App.workcellUI.sdfSource.value = world; App.workcellUI.applySDF();
    }, classroom);
    const clearStart = await page.evaluate(() => ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
      .map(name => robotjointcollection.findWhere({ name }).theta));
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const clearProbe = await page.evaluate(() => document.getElementById('pendant-status').textContent);
    assert.match(clearProbe, /World \+Z jog applied/, `Classroom scene starting pose should be clear: ${clearProbe}`);
    await page.evaluate(q => App.workcellUI.applyNamedJointState(
      ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final'], q), clearStart);
    const blockingWorld = await page.evaluate(() => {
      const tcp = App.workcellUI.sceneModel.getFrame('robot/classroom_six_axis_arm/link/tcp_link');
      tcp.updateWorldMatrix(true, false);
      const p = tcp.getWorldPosition(new THREE.Vector3());
      return { x: p.x, y: p.y, z: p.z + 0.045 };
    });
    const blocker = `<model name="jog_stop"><static>true</static><pose>${blockingWorld.x} ${blockingWorld.y} ${blockingWorld.z} 0 0 0</pose><link name="body"><visual name="v"><geometry><sphere><radius>0.003</radius></sphere></geometry></visual><collision name="c"><geometry><sphere><radius>0.003</radius></sphere></geometry></collision></link></model>`;
    await page.evaluate(world => { App.workcellUI.sdfSource.value = world; App.workcellUI.applySDF(); },
      classroom.replace('</world>', `${blocker}</world>`));
    const beforeCollision = await page.evaluate(() => ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
      .map(name => robotjointcollection.findWhere({ name }).theta));
    await page.locator('#pendant-linear-speed').fill('0.2');
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const collision = await page.evaluate(() => ({ status: document.getElementById('pendant-status').textContent,
      q: ['base_yaw', 'shoulder_pitch', 'elbow_pitch', 'wrist_roll', 'wrist_pitch', 'wrist_final']
        .map(name => robotjointcollection.findWhere({ name }).theta) }));
    assert.match(collision.status, /blocked by a robot or scene collision at sample [1-9]/);
    assert.deepEqual(collision.q, beforeCollision, 'blocked jog must not change any joint');
    assert.deepEqual(errors, []);
    await page.evaluate(() => document.getElementById('teach-pendant').scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: 'notes/artifacts/teach_pendant.png', fullPage: true });
    const trace = { status: 'passed', jointBefore, jointAfter, before, world, tool, blocked,
      detachedDragY: afterDrag.y - beforeDrag.y, holdSteps: holdAfter - holdBefore,
      taught, planned, takeover, collision, errors };
    writeFileSync('notes/artifacts/teach_pendant.json', JSON.stringify(trace, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', worldStatus: world.status, toolStatus: tool.status,
      taughtStatus: taught.status, screenshot: 'notes/artifacts/teach_pendant.png' }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
