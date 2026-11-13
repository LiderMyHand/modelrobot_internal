const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('browser project saves nested attachments and rejects cyclic ZIP without replacing the current scene', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/browser-project-store.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.status, 'passed');
  assert.deepEqual(result.afterRejectedImport.attachments, [{ object: 'pick_box', frame: 'model/table' }]);
  assert.deepEqual(result.errors, []);
});
