const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('Chromium completes circular pick/place and exports ROS trajectory and project ZIP', { timeout: 120000 }, () => {
  const root = path.resolve(__dirname, '..');
  const run = spawnSync(process.execPath, ['notes/scripts/check_workcell_project.cjs'],
    { cwd: root, encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.workerRequested, true);
  assert.equal(result.trajectory.points, result.planned.plan.samples);
  assert.equal(result.after.status, 'Opened project pick_place_classroom.');
});
