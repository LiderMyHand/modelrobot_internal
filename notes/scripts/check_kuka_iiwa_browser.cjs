const { spawn, execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync, readdirSync } = require('node:fs');
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
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-files').click();
    const folder = 'testowe/imported_robots/kuka_iiwa';
    await page.locator('#local-files').setInputFiles([`${folder}/robot.urdf`, ...readdirSync(`${folder}/meshes`).map(name => `${folder}/meshes/${name}`)]);
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'lbr_iiwa');
    const names = Array.from({ length: 7 }, (_, i) => `lbr_iiwa_joint_${i + 1}`);
    await page.evaluate(({ names }) => {
      const ui = App.workcellUI;
      ui.sdfSource.value = '<sdf version="1.10"><world name="kuka_iiwa_teaching"/></sdf>'; ui.applySDF();
      ui.programSource.value = '# Real KUKA iiwa teaching exercise: teach A, jog to B, teach B, then Plan path and Play.\nROBOT lbr_iiwa\nTOOL lbr_iiwa_link_7\n';
      ui.applyNamedJointState(names, [0.2, 0.4, -0.2, -1.1, 0.3, 0.8, 0.2]);
      App.setStandardView('iso'); App.fitRobot();
    }, { names });
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-pendant-details').open = true; });
    await page.locator('#pose-target-link').selectOption('lbr_iiwa_link_7');
    await page.locator('#pendant-joint-speed').fill('2');
    const snapshot = () => page.evaluate(names => ({
      q: names.map(name => robotjointcollection.findWhere({ name }).theta),
      status: document.getElementById('pendant-status').textContent,
      health: App.workcellUI.currentJacobianHealth,
      jog: App.workcellUI.pendantLastJog,
      warnings: App.localRobots.messages,
      assets: [...App.localRobots.assets.keys()],
      tipMatrix: (() => {
        const tip = robotlinkcollection.findWhere({ name: 'lbr_iiwa_link_7' }).get('link');
        tip.updateWorldMatrix(true, false); robot.updateWorldMatrix(true, false);
        return robot.matrixWorld.clone().invert().multiply(tip.matrixWorld).toArray();
      })(),
    }), names);
    const initial = await snapshot();
    const reference = JSON.parse(execFileSync('python3', ['notes/scripts/kuka_fk_reference.py', JSON.stringify(initial.q)], { encoding: 'utf8' }));
    const fkMatrixError = Math.max(...initial.tipMatrix.map((value, i) => Math.abs(value - reference.matrix_column_major[i])));
    assert.ok(fkMatrixError < 1e-9, `URDF rendering must agree with independent XML FK, matrix error ${fkMatrixError}`);
    assert.equal(initial.assets.length, 8);
    assert.deepEqual(initial.warnings, []);
    if (initial.health) assert.equal(initial.health.rank, 6, JSON.stringify(initial.health));
    await page.locator('#pendant-frame').selectOption('joint');
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const joint = await snapshot();
    assert.match(joint.status, /jog applied/, joint.status);
    assert.ok(joint.q[0] > initial.q[0]);
    await page.locator('#pendant-axis-next').click();
    assert.match(await page.locator('[data-pendant-row="0"] strong').textContent(), /J7/);
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const seventh = await snapshot();
    assert.ok(seventh.q[6] > joint.q[6], 'next pendant page must jog the seventh KUKA joint');
    await page.locator('#pendant-axis-prev').click();
    await page.locator('#pendant-frame').selectOption('world');
    await page.locator('#pendant-linear-speed').fill('0.005');
    await page.locator('#pendant-angular-speed').fill('0.05');
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const world = await snapshot();
    assert.match(world.status, /World \+Z jog applied/, world.status);
    await page.locator('#pendant-frame').selectOption('tool');
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const tool = await snapshot();
    assert.match(tool.status, /Tool \+X jog applied/, tool.status);
    assert.ok(tool.q.some((q, i) => Math.abs(q - world.q[i]) > 1e-7));
    assert.equal(tool.jog.q.length, 7, 'redundant IK includes all seven joints');
    // Explicit teaching reset: use the same validated bent posture as A,
    // record both targets through the real pendant controls, then replay A→B.
    await page.evaluate(({ names, q }) => App.workcellUI.applyNamedJointState(names, q), { names, q: initial.q });
    await page.locator('#pendant-teach-joints').click();
    await page.locator('#pendant-frame').selectOption('joint');
    await page.locator('#pendant-axis-next').click();
    await page.locator('[data-pendant-axis="0"][data-pendant-sign="1"]').click();
    const taughtB = await snapshot();
    await page.locator('#pendant-teach-joints').click();
    const taughtSource = await page.locator('#program-source').inputValue();
    assert.match(taughtSource, /JOINTS taught_joints_1 /);
    assert.match(taughtSource, /JOINTS taught_joints_2 /);
    assert.equal((taughtSource.match(/MOVEJ taught_joints_/g) || []).length, 2);
    await page.evaluate(({ names, q }) => {
      App.workcellUI.applyNamedJointState(names, q);
      App.workcellUI.programStatus('Explicit teaching reset to recorded A before planning the two taught moves.');
    }, { names, q: initial.q });
    const planned = await page.evaluate(async () => {
      const ui = App.workcellUI;
      await ui.planCurrentProgram({ preserveCurrentState: true });
      return ui.plan ? { status: ui.plan.status, duration: ui.plan.duration, moves: ui.plan.plans.length,
        startQ: ui.plan.samples[0].q, endQ: ui.plan.samples.at(-1).q } :
        { error: document.getElementById('program-status').textContent };
    });
    assert.ok(!planned.error, planned.error);
    assert.equal(planned.moves, 2);
    assert.deepEqual(planned.startQ, initial.q);
    await page.locator('#program-play').click();
    await page.waitForFunction(() => App.workcellUI.player.state === 'finished');
    const replayed = await snapshot();
    assert.ok(replayed.q.every((q, i) => Math.abs(q - taughtB.q[i]) < 1e-9), 'playback must reach the taught B joint pose');
    await page.locator('#program-reset').click();
    const exportState = await snapshot();
    assert.deepEqual(exportState.q, initial.q, 'Reset before export must restore recorded A');
    const zip = await page.evaluate(() => Array.from(App.workcellUI.createProjectZip()));
    writeFileSync('notes/artifacts/kuka_iiwa_teaching.workcell.zip', Buffer.from(zip));
    await page.locator('#pendant-axis-prev').click();
    await page.locator('#pendant-frame').selectOption('tool');
    await page.locator('#pendant-detach').click();
    await page.screenshot({ path: 'notes/artifacts/kuka_iiwa_jog.png' });
    await page.locator('#pendant-frame').selectOption('world');
    await page.evaluate(names => { App.workcellUI.applyNamedJointState(names, Array(7).fill(0)); App.fitRobot(); }, names);
    const straight = await snapshot();
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const blocked = await snapshot();
    assert.deepEqual(blocked.q, straight.q, 'unachievable axial jog at the straight posture must not move the robot');
    assert.match(blocked.status, /unchanged|not applied|singular|independent motion/i);
    if (blocked.health) assert.equal(blocked.health.status, 'rank_deficient');
    await page.screenshot({ path: 'notes/artifacts/kuka_iiwa_singular.png' });
    await page.locator('#pendant-dock').click();
    await page.locator('#tab-workcell').click();
    await page.locator('#project-file').setInputFiles('notes/artifacts/kuka_iiwa_teaching.workcell.zip');
    await page.waitForFunction(() => Math.abs(robotjointcollection.findWhere({ name: 'lbr_iiwa_joint_4' })?.theta + 1.1) < 1e-10);
    const reopened = await snapshot();
    assert.deepEqual(reopened.q, initial.q, 'opening ZIP must restore the validated bent posture');
    assert.equal(reopened.assets.length, 8);
    assert.equal(await page.locator('#program-source').inputValue(), taughtSource, 'ZIP must retain the complete two-target taught program');
    await page.locator('#tab-program').click();
    await page.screenshot({ path: 'notes/artifacts/kuka_iiwa_ready.png' });
    assert.deepEqual(errors, []);
    writeFileSync('notes/artifacts/kuka_iiwa_browser.json', JSON.stringify({ status: 'passed', fkMatrixError, initial, joint, seventh, world, tool,
      taughtSource, taughtB, planned, replayed, exportState, straight, blocked, reopened, errors }, null, 2));
    console.log(JSON.stringify({ status: 'passed', robot: 'lbr_iiwa', assets: initial.assets.length,
      joint: joint.status, world: world.status, tool: tool.status }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
