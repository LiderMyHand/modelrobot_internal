const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('manual joint control clears playback and browser planning stays offline', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_manual_handoff.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.status, 'passed');
  assert.equal(result.afterManual.playDisabled, true);
  assert.ok(Math.abs(result.replannedFrom[0] - result.halfway) < 1e-9);
  assert.equal(result.replannedFrom[5], 0.1);
  assert.deepEqual(result.externalRequests, []);
});
