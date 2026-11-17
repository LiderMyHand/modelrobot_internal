const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
test('student teaches two poses, plans from an explicit start, and recovers from blocked Cartesian motion', { timeout: 120000 }, () => {
  const result = spawnSync(process.execPath, ['notes/scripts/check_learning_workflow.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
