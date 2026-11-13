const { spawn } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '../..');
const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(port))], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 80; i++) {
      if (server.exitCode != null) throw new Error(`Server exited with ${server.exitCode}.`);
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/workcell/arm.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    const source = readFileSync(path.join(root, 'testowe/multi_program/handshake.mprg'), 'utf8');
    await page.locator('#signal-example').click();
    await page.waitForFunction(() => document.getElementById('signal-program-source').value.includes('PROGRAM conveyor'));
    assert.equal(await page.locator('#signal-program-source').inputValue(), source);
    await page.locator('#signal-check').click();
    assert.match(await page.locator('#signal-status').textContent(), /Syntax valid: 2 program/);
    await page.locator('#signal-step').click();
    assert.match(await page.locator('#signal-status').textContent(), /Tick 1 · running/);
    assert.match(await page.locator('#signal-trace').textContent(), /Tick 0 · robot · SET_SIGNAL rob_out: set 1/);
    await page.locator('#signal-run').click();
    const finished = await page.evaluate(() => ({ state: App.workcellUI.signalState, trace: App.workcellUI.signalEvents,
      status: document.getElementById('signal-status').textContent }));
    assert.equal(finished.state.status, 'finished');
    assert.equal(finished.state.tick, 6);
    assert.deepEqual(finished.state.signals, { conv_done: 0, rob_out: 0 });
    assert.deepEqual(finished.state.diagnostics, []);
    assert.equal(finished.trace.filter(event => event.outcome === 'set').length, 4);
    await page.locator('#signal-status').scrollIntoViewIfNeeded();
    await page.evaluate(() => { document.getElementById('signal-program-source').scrollTop = 0; });
    await page.screenshot({ path: path.join(root, 'notes/artifacts/signal_lab.png'), fullPage: true });
    await page.locator('#tab-workcell').click();
    const download = await Promise.all([page.waitForEvent('download'), page.locator('#project-export').click()]).then(([item]) => item);
    const zip = readFileSync(await download.path());
    await page.locator('#project-file').setInputFiles({ name: 'signals.zip', mimeType: 'application/zip', buffer: zip });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('Opened project'));
    const reopened = await page.evaluate(() => ({ source: App.workcellUI.signalProgramSource.value,
      state: App.workcellUI.signalState, robot: App.workcellUI.activeRobotName }));
    assert.equal(reopened.source, source);
    assert.equal(reopened.state, null);
    assert.equal(reopened.robot, 'classroom_six_axis_arm');
    await page.locator('#tab-program').click();
    await page.locator('#signal-run').click();
    assert.match(await page.locator('#signal-status').textContent(), /Tick 6 · finished/);
    await page.locator('#signal-program-source').fill('PROGRAM bad\nSET x globalThis.alert(1)\nEND');
    await page.locator('#signal-check').click();
    assert.match(await page.locator('#signal-status').textContent(), /1 signal program error/);
    assert.match(await page.locator('#signal-diagnostics').textContent(), /Line 2: Expected SET/);
    assert.equal(await page.evaluate(() => App.workcellUI.signalState), null);
    await page.locator('#signal-program-source').fill('PROGRAM bad\nWAIT_SET never TIMEOUT 2\nEND');
    await page.locator('#signal-run').click();
    assert.match(await page.locator('#signal-status').textContent(), /Tick 2 · timeout/);
    assert.match(await page.locator('#signal-diagnostics').textContent(), /Line 2: bad waited 2 logical ticks/);
    assert.deepEqual(pageErrors, []);
    const result = { finished, reopened, pageErrors, timeoutStatus: await page.locator('#signal-status').textContent() };
    writeFileSync(path.join(root, 'notes/artifacts/signal_lab.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ status: 'passed', tick: finished.state.tick, signals: finished.state.signals, pageErrors }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
