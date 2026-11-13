const { chromium } = require('@playwright/test');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '../..');

(async () => {
  const allowFile = process.argv.includes('--allow-file');
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    ...(allowFile ? ['--allow-file-access-from-files'] : [])] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [], consoleErrors = [], failed = [], externalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', request => failed.push({ url: request.url(), failure: request.failure()?.errorText }));
    page.on('request', request => { if (/^https?:\/\//.test(request.url())) externalRequests.push(request.url()); });
    await page.goto(pathToFileURL(path.join(root, 'standalone.html')).href);
    let loaded = false;
    try { await page.waitForFunction(() => App.workcellUI?.sceneModel && window.robotjointcollection?.length, null, { timeout: 8000 }); loaded = true; }
    catch {}
    let planning = null;
    let projectRoundTrip = null;
    if (loaded) {
      await page.locator('#tab-workcell').click();
      await page.locator('#workcell-demo').click();
      await page.waitForFunction(() => App.workcellUI.activeRobotName === 'classroom_six_axis_arm' &&
        App.workcellUI.sceneModel.models.size === 4 && App.workcellUI.programSource.value.includes('MOVEC'),
      null, { timeout: 8000 });
      planning = await page.evaluate(async () => {
        await App.workcellUI.planCurrentProgram();
        const ui = App.workcellUI;
        let interpolation = null;
        if (ui.plan) {
          for (let index = 0; index < ui.plan.samples.length - 1; index++) {
            const a = ui.plan.samples[index], b = ui.plan.samples[index + 1];
            const mid = (a.time + b.time) / 2;
            const planned = ui.player.qAt(mid)[0], linear = (a.q[0] + b.q[0]) / 2;
            const difference = Math.abs(planned - linear);
            if (!interpolation || difference > interpolation.difference)
              interpolation = { index, time: mid, planned, linear, difference };
          }
          ui.player.seek(interpolation.time);
          interpolation.rendered = window.robotjointcollection.findWhere({ name: ui.plan.model.jointNames[0] }).theta;
        }
        let playback = null;
        if (ui.plan) {
          const grab = ui.plan.events.find(event => event.kind === 'GRAB');
          const release = ui.plan.events.find(event => event.kind === 'RELEASE');
          const worldPosition = () => ui.sceneModel.getObject('pick_box')
            .getWorldPosition(new THREE.Vector3()).toArray();
          const start = worldPosition();
          ui.player.seek((grab.time + release.time) / 2);
          const carried = { attachments: ui.sceneModel.attachmentRecords(), position: worldPosition() };
          ui.player.seek(ui.plan.duration);
          const placed = { attachments: ui.sceneModel.attachmentRecords(), position: worldPosition() };
          ui.player.reset();
          const reset = { attachments: ui.sceneModel.attachmentRecords(), position: worldPosition() };
          playback = { start, carried, placed, reset };
        }
        return { status: document.getElementById('program-status').textContent,
          plan: ui.plan && { moves: ui.plan.plans.map(item => item.type),
            samples: ui.plan.samples.length, interpolation, playback } };
      });
      const [download] = await Promise.all([page.waitForEvent('download'),
        page.locator('#project-export').click()]);
      const projectPath = path.join(root, 'notes/artifacts/file_launch_export.zip');
      await download.saveAs(projectPath);
      await page.locator('#project-file').setInputFiles(projectPath);
      await page.waitForFunction(() => document.getElementById('workcell-status')?.textContent ===
        'Opened project pick_place_classroom.', null, { timeout: 8000 });
      projectRoundTrip = await page.evaluate(() => ({ robot: App.workcellUI.activeRobotName,
        objects: App.workcellUI.sceneModel.models.size,
        programHasCircle: App.workcellUI.programSource.value.includes('MOVEC') }));
    }
    const result = { url: page.url(), allowFile, loaded, planning, projectRoundTrip,
      errors, consoleErrors, failed, externalRequests };
    writeFileSync(path.join(root, `notes/artifacts/file_launch_${allowFile ? 'allow' : 'default'}.json`), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
