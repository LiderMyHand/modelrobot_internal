const { chromium } = require('@playwright/test');
const { readFileSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');

const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort(), url = `http://127.0.0.1:${port}/standalone.html`;
  const server = spawn('python3', ['-c', readFileSync('tests/serve.py', 'utf8').replace('8765', String(port))], { stdio: 'ignore' });
  let browser;
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      try { if ((await fetch(url)).ok) break; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url);
    await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length);
    await page.locator('#tab-workcell').click();
    await page.locator('#workcell-demo').click();
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.screenshot({ path: 'notes/artifacts/pick_place_workcell.png' });
    await page.locator('#tab-program').click();
    const before = await page.evaluate(() => ({ robot: App.workcellUI.activeRobotName,
      xmlRobot: new DOMParser().parseFromString(App.localRobots.currentXml, 'application/xml').documentElement.getAttribute('name'),
      baseHasCollision: !!new DOMParser().parseFromString(App.localRobots.currentXml, 'application/xml').querySelector('link[name="base_link"] > collision'),
      programStatus: document.getElementById('program-status').textContent,
      programStatusRect: document.getElementById('program-status').getBoundingClientRect().toJSON(),
      pendantStatusRect: document.getElementById('pendant-status').getBoundingClientRect().toJSON(),
      panelRect: document.getElementById('panel-program').getBoundingClientRect().toJSON() }));
    assert.equal(before.robot, 'classroom_six_axis_arm');
    assert.equal(before.xmlRobot, before.robot);
    assert.equal(before.baseHasCollision, true);
    assert.ok(before.programStatusRect.top >= before.panelRect.top && before.programStatusRect.bottom < before.panelRect.bottom,
      'planning status must be visible above the fold');
    assert.equal(await page.locator('#program-concurrent-details').getAttribute('open'), null);
    await page.screenshot({ path: 'notes/artifacts/pick_place_program_before.png' });
    await page.locator('#program-pendant-details summary').click();
    await page.locator('#pendant-frame').selectOption('world');
    await page.locator('[data-pendant-axis="2"][data-pendant-sign="1"]').click();
    const after = await page.evaluate(() => ({ pendantStatus: document.getElementById('pendant-status').textContent,
      planStatus: document.getElementById('program-status').textContent,
      activeRobot: App.workcellUI.activeRobotName,
      currentXmlName: new DOMParser().parseFromString(App.localRobots.currentXml, 'application/xml').documentElement.getAttribute('name') }));
    assert.match(after.pendantStatus, /World \+Z jog applied/);
    assert.equal(after.currentXmlName, 'classroom_six_axis_arm');
    await page.locator('#program-source').fill('INVALID_COMMAND');
    await page.locator('#program-check').click();
    const failure = await page.evaluate(() => ({ status: document.getElementById('program-status').textContent,
      context: document.getElementById('program-robot-context').textContent,
      rect: document.getElementById('program-status').getBoundingClientRect().toJSON(),
      panel: document.getElementById('panel-program').getBoundingClientRect().toJSON() }));
    assert.match(failure.status, /program error/i);
    assert.match(failure.context, /classroom_six_axis_arm/);
    assert.ok(failure.rect.top >= failure.panel.top && failure.rect.bottom < failure.panel.bottom,
      'error status must remain visible above the fold');
    await page.screenshot({ path: 'notes/artifacts/pick_place_program_error.png' });
    writeFileSync('notes/artifacts/pick_place_ui_probe.json', JSON.stringify({ before, after, failure }, null, 2));
    console.log(JSON.stringify({ status: 'passed', before, after, failure }));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
