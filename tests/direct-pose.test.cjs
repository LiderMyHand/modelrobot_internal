const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('world-frame angle-axis TCP control plans and drives a six-dimensional pose in Chromium', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_direct_pose.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.status, 'passed');
  assert.ok(Math.abs(result.end[0] - 0.2) < 1e-4);
  assert.deepEqual(result.errors, []);
});
