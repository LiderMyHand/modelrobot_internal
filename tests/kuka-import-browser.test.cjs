const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('real seven-axis KUKA imports, jogs, teaches and replays A→B, reopens its project, and blocks an infeasible jog', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_kuka_iiwa_browser.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, 'passed');
});
