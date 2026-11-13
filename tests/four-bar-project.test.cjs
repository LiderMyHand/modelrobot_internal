const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('four-bar project descriptor validates cut-tree geometry and driver-only home before scene replacement', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_four_bar_descriptor.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, 'passed');
});
