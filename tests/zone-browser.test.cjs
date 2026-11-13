const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('Chromium replays a bounded PTP ZONE flyby while ZONE 0 stops at the waypoint', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_zone_blend.cjs'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.equal(result.blended.zoneBlends.length, 1);
  assert.ok(result.blended.zoneBlends[0].cornerSpeedFraction > 1e-5);
});
