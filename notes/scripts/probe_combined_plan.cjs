const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '../..');
const port = () => new Promise(resolve => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const value = server.address().port; server.close(() => resolve(value)); }); });
(async () => {
  const p = await port(), url = `http://127.0.0.1:${p}`;
  const server = spawn('python3', ['-c', readFileSync(path.join(root, 'tests/serve.py'), 'utf8').replace('8765', String(p))], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage(); await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#local-files').setInputFiles(path.join(root, 'testowe/workcell/arm.urdf'));
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-program').click();
    await page.evaluate(() => { document.getElementById('program-concurrent-details').open = true; });
    await page.locator('#signal-device-example').click();
    await page.waitForFunction(() => App.workcellUI.sceneModel.world.name === 'conveyor_classroom');
    await page.locator('#signal-run').click();
    await page.waitForFunction(() => App.workcellUI.signalState?.status === 'finished');
    await page.locator('#program-source').fill(readFileSync(path.join(root, 'testowe/multi_program/combined.robot'), 'utf8'));
    await page.locator('#program-plan').click();
    await page.waitForFunction(() => document.getElementById('program-status').textContent.startsWith('Planned') || document.getElementById('program-status').classList.contains('text-danger'));
    console.log(JSON.stringify(await page.evaluate(() => ({ status: document.getElementById('program-status').textContent, planDuration: App.workcellUI.plan?.duration, diagnostics: document.getElementById('program-diagnostics').textContent }))));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
