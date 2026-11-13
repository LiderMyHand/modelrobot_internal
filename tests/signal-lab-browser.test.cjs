const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('Chromium runs and archives two signal programs through the workcell UI', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_signal_lab.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.status, 'passed');
  assert.equal(result.tick, 6);
  assert.deepEqual(result.signals, { conv_done: 0, rob_out: 0 });
  assert.deepEqual(result.pageErrors, []);
});
