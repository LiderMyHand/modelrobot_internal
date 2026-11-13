const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('a URDF external rail participates in browser IK, planning, trajectory and rendering', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_external_rail.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, 'passed');
});
