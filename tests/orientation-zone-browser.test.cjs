const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('Chromium plans a Cartesian flyby with changing TCP yaw', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_orientation_zone_browser.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /"status":"passed"/);
});
