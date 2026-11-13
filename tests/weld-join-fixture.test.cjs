const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

test('browser weld join carries an attached child with its parent and reset separates them', { timeout: 120000 }, () => {
  const run = spawnSync(process.execPath, ['notes/scripts/check_weld_join.cjs', '--check'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = JSON.parse(run.stdout);
  assert.deepEqual(result.events.map(event => event.kind), ['WELD_JOIN', 'GRAB', 'RELEASE']);
  assert.ok(result.playback.afterJoin.objectList.includes('extension_plate → model/workpiece'));
  assert.deepEqual(result.playback.reset.attachments, []);
  assert.deepEqual(result.reopened.attachments, [{ object: 'extension_plate', frame: 'model/workpiece' }]);
  assert.ok(result.reopened.objectList.includes('extension_plate → model/workpiece'));
  assert.deepEqual(result.reopenedCarried.attachments, [
    { object: 'extension_plate', frame: 'model/workpiece' },
    { object: 'workpiece', frame: 'robot/seam_cartesian/link/tcp_link' },
  ]);
  assert.deepEqual(result.reopenedCarried.jointState, result.carriedBeforeZip.jointState);
  assert.deepEqual(result.reopened.jointState, result.playback.atEnd.jointState);
  assert.match(result.invalidImportStatus, /outside/);
  assert.deepEqual(result.afterInvalid, result.reopenedCarried);
  assert.ok(result.reopenedLegacy.jointState.every(item => Math.abs(item.value) < 1e-10));
  assert.deepEqual(result.reopenedLegacy.attachments, result.carriedBeforeZip.attachments);
});
