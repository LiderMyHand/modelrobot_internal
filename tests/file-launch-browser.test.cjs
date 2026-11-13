const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('standalone file launch plans and replays smooth motion without a server or browser flags', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_file_launch.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.url.startsWith('file://'), true);
  assert.equal(result.loaded, true);
  assert.deepEqual(result.planning.plan.moves, ['PTP', 'CIRC', 'LIN']);
  assert.ok(result.planning.plan.samples > 100);
  const replay = result.planning.plan.interpolation;
  assert.ok(replay.difference > 1e-6, 'The planned smooth state should differ from linear interpolation.');
  assert.ok(Math.abs(replay.rendered - replay.planned) < 1e-8);
  const playback = result.planning.plan.playback;
  assert.equal(playback.carried.attachments[0].object, 'pick_box');
  assert.deepEqual(playback.placed.attachments, []);
  assert.deepEqual(playback.reset.attachments, []);
  assert.ok(Math.hypot(...playback.placed.position.map((value, index) => value - playback.start[index])) > .1);
  assert.ok(Math.hypot(...playback.reset.position.map((value, index) => value - playback.start[index])) < 1e-8);
  assert.deepEqual(result.projectRoundTrip,
    { robot: 'classroom_six_axis_arm', objects: 4, programHasCircle: true });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.consoleErrors, []);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.externalRequests, []);
});
