const test = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('Chromium renders two consecutive Cartesian ZONE flybys', () => {
  execFileSync(process.execPath, [path.join(__dirname, '../notes/scripts/check_multicorner_zone_browser.cjs')],
    { cwd: path.join(__dirname, '..'), stdio: 'inherit', timeout: 120000 });
});
