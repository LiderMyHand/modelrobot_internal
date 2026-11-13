const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('Chromium pendant jogs a six-axis arm in world and tool frames and teaches targets', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_teach_pendant.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, 'passed');
});
