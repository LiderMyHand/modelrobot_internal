const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('pick-and-place Program shows active robot, planning status, and a working World jog', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_pick_place_ui.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.equal(JSON.parse(run.stdout).status, 'passed');
});
