const { chromium } = require('@playwright/test');
const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'notes/artifacts/starter_lab_pl');
const source = `# Exercise 3: straight segments and an arc, metres/radians.
ROBOT seam_cartesian
TOOL tcp_link
POSE a world 0.15 0 0 Q 0 0 0 1
POSE v world 0.35 0.14 0 Q 0 0 0 1
POSE b world 0.55 0 0 Q 0 0 0 1
MOVEJ a
MOVEL v
MOVEL b
MOVEL a
PAUSE 0.5
MOVEC v b
MOVEL a
`;
const freePort = () => new Promise((resolve, reject) => {
  const server = net.createServer(); server.once('error', reject);
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});
async function main() {
  mkdirSync(path.join(out, 'examples'), { recursive: true });
  writeFileSync(path.join(out, 'examples/03_paths.robot'), source);
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(120000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url); await page.waitForFunction(() => App.workcellUI?.activeRobotName);
    const loadWeld = async () => {
      await page.locator('#tab-workcell').click();
      await page.locator('#workcell-weld-demo').click();
      await page.waitForFunction(() => App.workcellUI.activeRobotName === 'seam_cartesian' && App.workcellUI.sceneModel.models.has('workpiece'));
      await page.locator('#tab-program').click();
      await page.locator('#program-source-details').evaluate(element => { element.open = true; });
    };
    const plan = async () => {
      await page.locator('#program-plan').click();
      await page.waitForFunction(() => !!App.workcellUI.plan || !App.workcellUI.planningController && document.getElementById('program-status').classList.contains('text-danger'));
      return page.evaluate(() => ({ status: document.getElementById('program-status').textContent,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(element => element.textContent),
        planned: !!App.workcellUI.plan, types: App.workcellUI.plan?.plans.map(p => p.type),
        duration: App.workcellUI.plan?.duration, samples: App.workcellUI.plan?.samples.length,
        q: robotjointcollection.filter(j => j.type !== 'fixed').map(j => j.theta) }));
    };
    const saveZip = async name => {
      const bytes = await page.evaluate(() => [...App.workcellUI.createProjectZip()]);
      writeFileSync(path.join(out, 'examples', name), Buffer.from(bytes));
    };
    await loadWeld();
    await page.locator('#program-source').fill(source);
    const clean = await plan();
    assert.equal(clean.planned, true, JSON.stringify(clean));
    assert.deepEqual(clean.diagnostics, []);
    assert.deepEqual(clean.types, ['PTP', 'LIN', 'LIN', 'LIN', 'CIRC', 'LIN']);
    assert.ok(clean.duration > 0 && clean.samples > 10);
    await saveZip('03_paths.workcell.zip');
    await page.locator('#standard-view').selectOption('top');
    await page.locator('#program-summary').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'paths_plan.png') });
    await page.locator('#program-play').click();
    await page.waitForFunction(() => App.workcellUI.player.state === 'finished');
    const played = await page.evaluate(() => ({ state: App.workcellUI.player.state, time: App.workcellUI.player.time,
      q: robotjointcollection.filter(j => j.type !== 'fixed').map(j => j.theta),
      named: Object.fromEntries(robotjointcollection.filter(j => j.type !== 'fixed').map(j => [j.name, j.theta])),
      status: document.getElementById('program-status').textContent }));
    assert.equal(played.state, 'finished');
    assert.ok(Math.abs(played.named.slide_x - 0.15) < 1e-5 && Math.abs(played.named.slide_y) < 1e-5, JSON.stringify(played));
    await loadWeld();
    const variantSource = source.replace('POSE v world 0.35 0.14 0', 'POSE v world 0.35 0.10 0');
    writeFileSync(path.join(out, 'examples/03_paths_v010.robot'), variantSource);
    await page.locator('#program-source').fill(variantSource);
    const variant = await plan();
    assert.equal(variant.planned, true, JSON.stringify(variant));
    assert.deepEqual(variant.diagnostics, []);
    await saveZip('03_paths_v010.workcell.zip');
    await page.locator('#standard-view').selectOption('top');
    await page.locator('#program-summary').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'paths_variant.png') });
    await page.locator('#program-play').click();
    await page.waitForFunction(() => App.workcellUI.player.state === 'finished');
    const variantPlayed = await page.evaluate(() => ({ state: App.workcellUI.player.state, time: App.workcellUI.player.time,
      named: Object.fromEntries(robotjointcollection.filter(j => j.type !== 'fixed').map(j => [j.name, j.theta])) }));
    assert.ok(Math.abs(variantPlayed.named.slide_x - 0.15) < 1e-5 && Math.abs(variantPlayed.named.slide_y) < 1e-5, JSON.stringify(variantPlayed));
    await loadWeld();
    const beforeBlocked = await page.evaluate(() => robotjointcollection.filter(j => j.type !== 'fixed').map(j => j.theta));
    const obstacle = `<model name="lab_obstacle"><static>true</static><pose>0.35 0.14 0 0 0 0</pose><link name="body"><visual name="visible"><geometry><box><size>0.05 0.05 0.10</size></box></geometry><material><diffuse>0.85 0.15 0.1 1</diffuse></material></visual><collision name="collision"><geometry><box><size>0.05 0.05 0.10</size></box></geometry></collision></link></model>`;
    const blockedWorld = readFileSync(path.join(root, 'testowe/weld/world.sdf'), 'utf8').replace('</world>', `${obstacle}\n</world>`);
    writeFileSync(path.join(out, 'examples/04_obstacle.world.sdf'), blockedWorld);
    await page.evaluate(world => { App.workcellUI.sdfSource.value = world; App.workcellUI.applySDF(); }, blockedWorld);
    await saveZip('04_collision.workcell.zip');
    const blocked = await plan();
    await page.locator('#program-summary').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'collision_blocked.png') });
    assert.equal(blocked.planned, false, JSON.stringify(blocked));
    assert.match(blocked.status, /collision/i);
    assert.deepEqual(blocked.q, beforeBlocked, 'failed plan must not move the robot');
    await loadWeld();
    assert.equal(await page.evaluate(() => App.workcellUI.sceneModel.models.has('lab_obstacle')), false);
    const restored = await plan();
    assert.equal(restored.planned, true, JSON.stringify(restored));
    const loadPick = async () => {
      await page.locator('#tab-workcell').click(); await page.locator('#workcell-demo').click();
      await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
      await page.locator('#tab-program').click();
      await page.locator('#program-source-details').evaluate(element => { element.open = true; });
    };
    await loadPick();
    const correctPickSource = await page.locator('#program-source').inputValue();
    const badGrabSource = correctPickSource.replace('MOVEJ pick\nGRAB pick_box', 'GRAB pick_box\nMOVEJ pick');
    assert.notEqual(badGrabSource, correctPickSource);
    writeFileSync(path.join(out, 'examples/05_grab_too_early.robot'), badGrabSource);
    writeFileSync(path.join(out, 'examples/05_pick_place_correct.robot'), correctPickSource);
    await page.locator('#program-source').fill(badGrabSource);
    await page.locator('#program-check').click();
    const grabSyntax = await page.locator('#program-status').textContent();
    assert.match(grabSyntax, /^Syntax valid/);
    const beforeGrab = await page.evaluate(() => robotjointcollection.filter(j => j.type !== 'fixed').map(j => j.theta));
    await saveZip('05_grab_too_early.workcell.zip');
    const badGrab = await plan();
    assert.equal(badGrab.planned, false);
    assert.match(badGrab.status, /GRAB pick_box.*within 0\.040 m/);
    assert.deepEqual(badGrab.q, beforeGrab);
    await page.locator('#program-summary').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, 'grab_too_early.png') });
    await loadPick();
    const pickRestored = await plan();
    assert.equal(pickRestored.planned, true, JSON.stringify(pickRestored));
    assert.deepEqual(errors, []);
    const evidence = { source, clean, played, variantSource, variant, variantPlayed, blocked, restored, grabSyntax, badGrab, pickRestored, errors };
    writeFileSync(path.join(out, 'paths_collision_validation.json'), JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify({ status: 'passed', clean, played, variant, variantPlayed, blocked, restored, grabSyntax, badGrab, pickRestored }));
  } finally { await browser?.close(); server.kill(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
