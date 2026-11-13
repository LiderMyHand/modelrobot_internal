const { spawn, spawnSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { unzipSync, zipSync, strToU8, strFromU8 } = require('fflate');

const root = path.resolve(__dirname, '../..');
const artifacts = path.join(root, 'notes/artifacts');
const near = (actual, expected, tolerance, label) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `${label}: ${actual} versus ${expected}, tolerance ${tolerance}`);
const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const built = spawnSync(process.execPath, ['notes/scripts/build_four_bar_project.cjs'],
    { cwd: root, encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr || built.stdout);
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))],
    { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode != null) throw new Error(`Test server exited with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-workcell').click();
    await page.locator('#workcell-four-bar-demo').click();
    try {
      await page.waitForFunction(() => App.workcellUI?.activeRobotName === 'four_bar' && App.workcellUI.closedLoopModel &&
        document.getElementById('workcell-status')?.textContent?.includes('Closed four-bar loaded in top view'), undefined, { timeout: 10000 });
    } catch (error) {
      const state = await page.evaluate(() => ({ robot: App.workcellUI?.activeRobotName,
        closed: !!App.workcellUI?.closedLoopModel,
        status: document.getElementById('workcell-status')?.textContent }));
      throw new Error(`Four-bar example did not load: ${JSON.stringify({ state, errors })}; ${error.message}`);
    }
    assert.equal(await page.locator('#standard-view').inputValue(), 'top');
    const visualCounts = await page.evaluate(() => Object.fromEntries(['base', 'input_link', 'coupler_link']
      .map(name => [name, window.robotlinkcollection.findWhere({ name }).get('link').children.length])));
    assert.ok(visualCounts.base >= 3 && visualCounts.input_link >= 2 && visualCounts.coupler_link >= 2,
      `Expected visual hinge pins on the four-bar: ${JSON.stringify(visualCounts)}`);
    await page.screenshot({ path: path.join(artifacts, 'four_bar_loaded_top.png'), fullPage: true });
    await page.evaluate(() => { App.setStandardView('iso'); App.workcellUI.fitWorkcell(); });
    await page.screenshot({ path: path.join(artifacts, 'four_bar_loaded_iso.png'), fullPage: true });
    await page.locator('#project-file').setInputFiles(path.join(artifacts, 'four_bar_fixture.workcell.zip'));
    await page.waitForFunction(() => App.workcellUI?.activeRobotName === 'four_bar' && App.workcellUI.closedLoopModel);
    await page.locator('#tab-program').click();
    await page.locator('#standard-view').selectOption('top');
    await page.evaluate(() => {
      window.fourBarCapture = () => {
        const ui = App.workcellUI;
        window.robot.updateMatrixWorld(true);
        const link = name => window.robotlinkcollection.findWhere({ name }).get('link').getWorldPosition(new THREE.Vector3()).toArray();
        const left = link('C_left'), right = link('C_right');
        return { theta: window.robotjointcollection.findWhere({ name: 'input' }).theta,
          coupler: window.robotjointcollection.findWhere({ name: 'coupler' }).theta,
          output: window.robotjointcollection.findWhere({ name: 'output' }).theta,
          left, right, residual: Math.hypot(...left.map((value, index) => value - right[index])),
          time: ui.player?.time ?? null, plan: !!ui.plan };
      };
    });
    const initial = await page.evaluate(() => fourBarCapture());
    near(initial.theta, .6, 1e-9, 'saved input');
    assert.ok(initial.residual < 1e-7, JSON.stringify(initial));
    const planned = await page.evaluate(async () => {
      const ui = App.workcellUI;
      await ui.planCurrentProgram();
      if (!ui.plan) return { error: document.getElementById('program-status').textContent,
        diagnostics: [...document.querySelectorAll('#program-diagnostics li')].map(item => item.textContent) };
      return { names: ui.plan.model.jointNames, sampleCount: ui.plan.samples.length,
        first: ui.plan.samples[0], last: ui.plan.samples.at(-1), duration: ui.plan.duration };
    });
    assert.ok(!planned.error, JSON.stringify(planned));
    assert.deepEqual(planned.names, ['input']);
    assert.ok(planned.sampleCount > 3);
    const midpoint = await page.evaluate(() => {
      const ui = App.workcellUI, samples = ui.plan.samples;
      const index = Math.max(0, Math.floor(samples.length / 3));
      const time = (samples[index].time + samples[index + 1].time) / 2;
      ui.player.seek(time);
      return { ...fourBarCapture(), isSample: samples.some(sample => Math.abs(sample.time - time) < 1e-12) };
    });
    assert.equal(midpoint.isSample, false);
    assert.ok(midpoint.residual < 1e-7, JSON.stringify(midpoint));
    await page.screenshot({ path: path.join(artifacts, 'four_bar_midpoint.png'), fullPage: true });
    const finished = await page.evaluate(() => { const ui = App.workcellUI; ui.player.seek(ui.plan.duration); return fourBarCapture(); });
    assert.ok(finished.residual < 1e-7, JSON.stringify(finished));
    const reset = await page.evaluate(() => { App.workcellUI.player.reset(); return fourBarCapture(); });
    near(reset.theta, .6, 1e-9, 'reset input');
    assert.ok(reset.residual < 1e-7);

    // Exercise the same input event a user produces at the rendered slider.
    const driverSlider = page.locator('input.joint-slider[aria-label="input"]');
    await driverSlider.evaluate(slider => { slider.value = '0.7'; slider.dispatchEvent(new Event('input', { bubbles: true })); });
    const manual = await page.evaluate(() => fourBarCapture());
    near(manual.theta, .7, 1e-8, 'manual input');
    assert.ok(manual.residual < 1e-7);
    assert.equal(manual.plan, false, 'manual change must invalidate the old plan');
    const passive = await page.evaluate(() => {
      const names = ['coupler', 'output'];
      return names.map(name => ({ name, disabled: document.querySelector(`input.joint-slider[aria-label="${name}"]`)?.disabled,
        value: window.robotjointcollection.findWhere({ name }).theta }));
    });
    assert.ok(passive.every(item => item.disabled === true), JSON.stringify(passive));
    const programBefore = await page.evaluate(() => App.workcellUI.programSource.value);
    await page.locator('#tab-workcell').click();
    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).then(value => value, error => error);
    await page.locator('#project-export').click();
    const download = await downloadPromise;
    if (download instanceof Error) {
      const status = await page.evaluate(() => document.getElementById('workcell-status')?.textContent ||
        document.getElementById('program-status')?.textContent || 'No status');
      throw new Error(`Project download did not start: ${status}; ${download.message}`);
    }
    const exportedPath = path.join(artifacts, 'four_bar_exported.zip');
    await download.saveAs(exportedPath);
    await page.locator('#project-file').setInputFiles(exportedPath);
    await page.waitForFunction(() => document.getElementById('workcell-status')?.textContent === 'Opened project four_bar_lesson.');
    await page.waitForFunction(() => App.workcellUI?.activeRobotName === 'four_bar' &&
      App.workcellUI.closedLoopModel && Math.abs(window.robotjointcollection.findWhere({ name: 'input' }).theta - .7) < 1e-8);
    const reopened = await page.evaluate(() => ({ ...fourBarCapture(),
      branch: App.workcellUI.kinematicConstraints.mechanisms[0].branch,
      savedNames: App.workcellUI.closedLoopModel.jointNames,
      program: App.workcellUI.programSource.value }));
    assert.ok(reopened.residual < 1e-7, JSON.stringify(reopened));
    near(reopened.theta, .7, 1e-8, 'ZIP reopened input');
    assert.equal(reopened.branch, 1);
    assert.deepEqual(reopened.savedNames, ['input']);
    assert.equal(reopened.program, programBefore);
    const invalidEntries = unzipSync(readFileSync(exportedPath));
    const robotPath = 'robots/four_bar.urdf';
    const invalidUrdf = strFromU8(invalidEntries[robotPath]).replace('xyz="0.48 0 0"', 'xyz="0.48 0 0.01"');
    assert.notEqual(invalidUrdf, strFromU8(invalidEntries[robotPath]));
    invalidEntries[robotPath] = strToU8(invalidUrdf);
    const invalidPath = path.join(artifacts, 'four_bar_invalid.zip');
    writeFileSync(invalidPath, zipSync(invalidEntries));
    await page.locator('#project-file').setInputFiles(invalidPath);
    await page.waitForFunction(() => /XY translation/.test(document.getElementById('workcell-status')?.textContent || ''));
    const rejected = await page.evaluate(() => ({ ...fourBarCapture(),
      status: document.getElementById('workcell-status').textContent,
      branch: App.workcellUI.kinematicConstraints.mechanisms[0].branch,
      program: App.workcellUI.programSource.value }));
    near(rejected.theta, reopened.theta, 1e-12, 'preflight nonmutation input');
    near(rejected.residual, reopened.residual, 1e-12, 'preflight nonmutation closure');
    assert.deepEqual(rejected.left, reopened.left);
    assert.deepEqual(rejected.right, reopened.right);
    assert.equal(rejected.branch, reopened.branch);
    assert.equal(rejected.program, reopened.program);
    assert.deepEqual(errors, []);
    const trace = { status: 'passed', initial, planned, midpoint, finished, reset, manual, passive, reopened, rejected, errors };
    writeFileSync(path.join(artifacts, 'four_bar_browser.json'), JSON.stringify(trace, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', maxResidual: Math.max(initial.residual, midpoint.residual,
      finished.residual, reset.residual, manual.residual, reopened.residual), sampleCount: planned.sampleCount,
      duration: planned.duration, exportedPath, screenshot: path.join(artifacts, 'four_bar_midpoint.png') }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
