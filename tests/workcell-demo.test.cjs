const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('bundled six-axis workcell plans and plays a pick, CIRC transfer, LIN place and release in Chromium', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/find_demo_program.cjs', '--check'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.match(result.planStatus, /^Planned 3 move\(s\)/);
  assert.ok(result.sampleCount > 100);
  assert.equal(result.playback.afterGrab.attachments[0].object, 'pick_box');
});
