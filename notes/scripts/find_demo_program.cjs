const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { chromium } = require('@playwright/test');
const path = require('node:path');
const assert = require('node:assert/strict');
const net = require('node:net');

const root = path.resolve(__dirname, '../..');
const checkOnly = process.argv.includes('--check');
const program = readFileSync(path.join(root, 'testowe/workcell/program.txt'), 'utf8');

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
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const source = readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port));
  const server = spawn('python3', ['-c', source], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    let available = false;
    for (let i = 0; i < 80; i++) {
      if (server.exitCode != null) throw new Error(`Local server stopped with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) { available = true; break; } }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    if (!available) throw new Error('Local browser server did not start.');
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(120000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/workcell/arm.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#sdf-file').setInputFiles(path.join(root, 'testowe/workcell/world.sdf'));
    await page.waitForFunction(() => App.workcellUI.sceneModel.models.size === 4);
    const result = await page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program;
      await ui.planCurrentProgram();
      const plan = ui.plan;
      const planStatus = document.getElementById('program-status').textContent;
      let playback = null;
      if (plan) {
        const box = () => ui.sceneModel.getObject('pick_box').getWorldPosition(new THREE.Vector3()).toArray();
        const initial = box();
        ui.player.seek(plan.events[0].time + 0.01);
        const tcp = ui.sceneModel.getFrame('robot/classroom_six_axis_arm/link/tcp_link').getWorldPosition(new THREE.Vector3()).toArray();
        const graspBox = box();
        const graspSurfaceDistance = Math.hypot(...tcp.map((coordinate, index) => Math.max(Math.abs(coordinate - graspBox[index]) - 0.04, 0)));
        const afterGrab = { box: graspBox, tcp, graspSurfaceDistance, attachments: ui.sceneModel.attachmentRecords() };
        ui.player.seek(plan.duration);
        const atEnd = { box: box(), attachments: ui.sceneModel.attachmentRecords(), state: ui.player.state };
        ui.player.reset();
        playback = { initial, afterGrab, atEnd, reset: box() };
      }
      return { status: document.getElementById('program-status').textContent, planStatus,
        workcellStatus: document.getElementById('workcell-status').textContent,
        plans: plan?.plans.map(item => ({ line: item.line, type: item.type, duration: item.duration, internalStops: item.internalStops })) || null,
        events: plan?.events || null, duration: plan?.duration || null,
        sampleCount: plan?.samples.length || null, playback,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(node => node.textContent) };
    }, program);
    result.pageErrors = errors;
    const checkProximityRejection = () => page.evaluate(async program => {
      const ui = App.workcellUI;
      ui.programSource.value = program.replace('MOVEJ pick\n', '');
      await ui.planCurrentProgram();
      return { status: document.getElementById('program-status').textContent,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(node => node.textContent) };
    }, program);
    if (checkOnly) {
      result.proximityRejection = await checkProximityRejection();
      assert.deepEqual(result.plans?.map(item => item.type), ['PTP', 'CIRC', 'LIN']);
      assert.deepEqual(result.events?.map(item => item.kind), ['GRAB', 'RELEASE']);
      assert.deepEqual(result.diagnostics, []);
      assert.deepEqual(result.pageErrors, []);
      assert.ok(result.playback.afterGrab.graspSurfaceDistance < 0.04);
      assert.match(result.proximityRejection.status, /within 0\.040 m of its collision surface/);
      assert.ok(result.proximityRejection.diagnostics.some(message => message.includes('GRAB pick_box')));
      assert.equal(result.playback.atEnd.state, 'finished');
      assert.deepEqual(result.playback.atEnd.attachments, []);
      const near = (actual, expected, tolerance = 0.002) => actual.every((value, i) => Math.abs(value - expected[i]) < tolerance);
      assert.ok(near(result.playback.atEnd.box, [0.84, -0.16, 0.785]));
      assert.ok(near(result.playback.reset, [0.42, 0.16, 0.765], 1e-10));
    } else {
      await page.locator('#tab-program').click();
      if (result.plans) {
        await page.evaluate(() => App.workcellUI.player.seek(App.workcellUI.plan.duration));
        await page.screenshot({ path: path.join(root, 'notes/artifacts/demo_program_placed.png'), fullPage: true });
        await page.evaluate(() => App.workcellUI.player.reset());
      }
      await page.screenshot({ path: path.join(root, 'notes/artifacts/demo_program_search.png'), fullPage: true });
      result.proximityRejection = await checkProximityRejection();
      writeFileSync(path.join(root, 'notes/artifacts/demo_program_search.json'), JSON.stringify(result, null, 2) + '\n');
    }
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } finally { await browser?.close(); server.kill(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
