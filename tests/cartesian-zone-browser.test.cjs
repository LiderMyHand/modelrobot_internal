const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('Chromium shows a bounded LIN-LIN ZONE flyby while ZONE 0 stops', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_cartesian_zone_browser.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /"status":"passed"/);
});
