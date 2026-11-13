const test = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('Chromium carries a robot on a separately programmed SDF model and replans from the moved base', () => {
  execFileSync(process.execPath, [path.join(__dirname, '../notes/scripts/check_external_carrier_browser.cjs')],
    { cwd: path.join(__dirname, '..'), stdio: 'inherit', timeout: 120000 });
});
