const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('official UR5 imports, jogs in all frames, teaches and replays two targets, and reopens its project', { timeout: 120000 }, () => {
  const result = spawnSync(process.execPath, ['notes/scripts/check_official_ur5_browser.cjs'],
    { encoding: 'utf8', timeout: 120000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const evidence = JSON.parse(result.stdout);
  assert.equal(evidence.source.commit, '3852128295499b52f38f82171f5ff3f21ecdfa22');
  assert.equal(evidence.unadapted.messages.filter(message => message.includes('Unsupported mesh:')).length, 7);
  assert.deepEqual(evidence.trials.map(trial => trial.mode), ['joint', 'world', 'tool']);
  assert.equal(evidence.programming.finished.state, 'finished');
  assert.ok(evidence.programming.planned.duration > 0);
  assert.equal(evidence.project.reopened.program, evidence.programming.source);
});
