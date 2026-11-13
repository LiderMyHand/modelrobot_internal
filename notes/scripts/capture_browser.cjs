// Capture the browser viewer for visual review from the repository root.
// Usage: node notes/scripts/capture_browser.cjs [output.png]
const { spawn } = require('node:child_process');
const { mkdirSync, readFileSync } = require('node:fs');
const { dirname } = require('node:path');
const { chromium } = require('@playwright/test');

const output = process.argv[2] || 'notes/artifacts/browser_baseline.png';
const world = process.argv[3];
const robotFile = process.argv[4];
const url = 'http://127.0.0.1:8767/standalone.html';

async function main() {
  const server = spawn('python3', ['-m', 'http.server', '8767', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { const response = await fetch(url); ready = response.ok; if (ready) break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    if (!ready) throw new Error('Static server did not start.');
    browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => window.robotlinkcollection?.length > 0);
    if (robotFile) await page.evaluate(xml => App.localRobots.showURDF(xml), readFileSync(robotFile, 'utf8'));
    if (world) {
      await page.locator('#tab-workcell').click();
      await page.locator('#sdf-source').fill(readFileSync(world, 'utf8'));
      await page.locator('#sdf-apply').click();
    } else await page.locator('#tab-joints').click();
    await page.waitForTimeout(300);
    mkdirSync(dirname(output), { recursive: true });
    await page.screenshot({ path: output, fullPage: true });
    const state = await page.evaluate(() => ({ robot: window.robot?.name, links: window.robotlinkcollection?.length, joints: window.robotjointcollection?.length, renderer: window.THREE?.REVISION,
      workcellStatus: document.getElementById('workcell-status')?.textContent,
      objects: [...document.querySelectorAll('#workcell-objects li')].map(item => item.textContent) }));
    process.stdout.write(JSON.stringify({ output, state, errors }) + '\n');
    if (errors.length) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
