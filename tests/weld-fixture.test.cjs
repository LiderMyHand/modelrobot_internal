const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('bundled weld robot and SDF workpiece plan CIRC and LIN seams in Chromium Worker', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_weld_fixture.cjs', '--check'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.match(result.status, /^Planned 3 move\(s\)/);
  assert.ok(result.duration < 10);
  assert.ok(result.sampleCount < 3000);
  assert.deepEqual(result.weldSegments.map(segment => segment.type), ['CIRC', 'LIN']);
  assert.ok(result.seamSurfaceDistance.max < 0.04);
  assert.deepEqual(result.processEvents.map(event => event.kind), ['WELD_ON', 'WELD_OFF']);
});
