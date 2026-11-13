const test = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('Chromium rejects a scene device crossing a wall in all three run modes', () => {
  execFileSync(process.execPath, [path.join(__dirname, '../notes/scripts/check_device_sweep_browser.cjs')],
    { cwd: path.join(__dirname, '..'), stdio: 'inherit', timeout: 120000 });
});
