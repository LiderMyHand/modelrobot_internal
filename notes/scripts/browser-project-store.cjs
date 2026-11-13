const { chromium } = require('../../node_modules/@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const net = require('node:net');

const freePort = () => new Promise((resolve, reject) => {
  const listener = net.createServer(); listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
});

(async () => {
  const port = await freePort();
  const server = spawn('python3', ['-c', fs.readFileSync('tests/serve.py', 'utf8').replaceAll('8765', String(port))], { stdio: 'ignore' });
  let browser;
  try {
    for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${port}`); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); } }
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`http://127.0.0.1:${port}`);
    await page.waitForFunction(() => window.robotlinkcollection?.length > 0);
    const urdf = fs.readFileSync('testowe/workcell/arm.urdf', 'utf8');
    const sdf = fs.readFileSync('testowe/workcell/world.sdf', 'utf8');
    await page.evaluate(({ urdf, sdf }) => {
      App.localRobots.showURDF(urdf);
      App.workcellUI.sdfSource.value = sdf;
      App.workcellUI.applySDF();
      App.workcellUI.sceneModel.attach('pick_box', 'model/table', { keepWorldPose: true });
      App.workcellUI.programSource.value = 'ROBOT classroom_six_axis_arm\nTOOL tcp_link\n';
    }, { urdf, sdf });
    await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm');
    await page.locator('#tab-workcell').click();
    await page.locator('#project-save-local').click();
    await page.waitForFunction(() => document.querySelector('#project-library').options.length === 2);
    const savedId = await page.locator('#project-library').inputValue();
    assert.ok(savedId);
    await page.evaluate(() => {
      App.workcellUI.sdfSource.value = '<sdf version="1.10"><world name="empty"/></sdf>';
      App.workcellUI.applySDF();
      App.workcellUI.programSource.value = '';
    });
    await page.locator('#project-open-local').click();
    await page.waitForFunction(() => App.workcellUI.sceneModel.world.name === 'pick_place_classroom');
    const result = await page.evaluate(() => ({
      objects: [...App.workcellUI.sceneModel.models.keys()],
      program: App.workcellUI.programSource.value,
      robot: App.workcellUI.activeRobotName,
      attachments: App.workcellUI.sceneModel.attachmentRecords(),
      selected: document.querySelector('#project-library').value,
    }));
    assert.deepEqual(result.objects, ['table', 'pick_box', 'obstacle', 'destination']);
    assert.equal(result.program, 'ROBOT classroom_six_axis_arm\nTOOL tcp_link\n');
    assert.equal(result.robot, 'classroom_six_axis_arm');
    assert.deepEqual(result.attachments, [{ object: 'pick_box', frame: 'model/table' }]);
    assert.equal(result.selected, savedId);
    const { packProject } = await import('../../frontend/project-bundle.js');
    const cycleZip = packProject({ name: 'bad-cycle', worldSdf: sdf,
      robots: [{ name: 'classroom_six_axis_arm', urdf }],
      attachments: [{ object: 'pick_box', frame: 'model/table' }, { object: 'table', frame: 'model/pick_box' }] });
    await page.locator('#project-file').setInputFiles({ name: 'bad-cycle.zip', mimeType: 'application/zip', buffer: Buffer.from(cycleZip) });
    await page.waitForFunction(() => document.getElementById('workcell-status').textContent.includes('attachment cycle'));
    const afterRejectedImport = await page.evaluate(() => ({
      world: App.workcellUI.sceneModel.world.name,
      robot: App.workcellUI.activeRobotName,
      attachments: App.workcellUI.sceneModel.attachmentRecords(),
    }));
    assert.equal(afterRejectedImport.world, 'pick_place_classroom');
    assert.equal(afterRejectedImport.robot, 'classroom_six_axis_arm');
    assert.deepEqual(afterRejectedImport.attachments, [{ object: 'pick_box', frame: 'model/table' }]);
    assert.deepEqual(errors, []);
    const report = { status: 'passed', ...result, afterRejectedImport, errors };
    fs.writeFileSync('notes/artifacts/browser-project-store.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
