const { test } = require('node:test');
const assert = require('node:assert/strict');

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

test('quintic timed playback matches position, velocity and acceleration at every knot', async () => {
  const { copyTimedJointSamples, interpolateTimedJointSegment, timedJointStateAt } =
    await import('../frontend/timed-joints.js');
  const samples = copyTimedJointSamples([
    { time: 0, q: [0], velocity: [0], acceleration: [0] },
    { time: 1, q: [1], velocity: [1], acceleration: [0.3] },
    { time: 2, q: [2], velocity: [0], acceleration: [0] },
  ]);
  const midway = timedJointStateAt(samples, .5);
  assert.ok(Math.abs(midway.q[0] - .5) > .05, 'Replay must use derivatives, not linear position interpolation.');
  const left = interpolateTimedJointSegment(samples[0], samples[1], 1);
  const right = interpolateTimedJointSegment(samples[1], samples[2], 1);
  for (const state of [left, right, timedJointStateAt(samples, 1)]) {
    near(state.q[0], 1); near(state.velocity[0], 1); near(state.acceleration[0], .3);
  }
  for (const epsilon of [1e-6, 1e-7]) {
    const before = timedJointStateAt(samples, 1 - epsilon);
    const after = timedJointStateAt(samples, 1 + epsilon);
    near(before.q[0], after.q[0], 3 * epsilon);
    near(before.velocity[0], after.velocity[0], 3 * epsilon);
    near(before.acceleration[0], after.acceleration[0], 100 * epsilon);
  }
  assert.deepEqual(copyTimedJointSamples([{ time: 0, q: [0] }, { time: 1, q: [1] }])
    .map(sample => sample.q), [[0], [1]]);
  near(timedJointStateAt([{ time: 0, q: [0] }, { time: 1, q: [1] }], .5).q[0], .5);
  assert.throws(() => copyTimedJointSamples([
    { time: 0, q: [0], velocity: [0], acceleration: [0] }, { time: 1, q: [1] },
  ]), /derivatives/);
});

test('ProgramPlayer uses the planned quintic state at fractional display times', async () => {
  const { ProgramPlayer } = await import('../frontend/program-player.js');
  let rendered = null;
  const player = new ProgramPlayer({ sceneModel: { snapshotWorld: () => ({}) },
    applyJointState: q => { rendered = q; } });
  const samples = [
    { time: 0, q: [0], velocity: [0], acceleration: [0] },
    { time: 1, q: [1], velocity: [1], acceleration: [0] },
  ];
  player.load({ samples });
  player.seek(.5);
  near(rendered[0], .34375);
  near(player.qAt(.5)[0], rendered[0]);
});

test('shared and triggered clocks report the same derivative-aware robot state', async () => {
  const { createMultiProgramState } = await import('../frontend/multi-program-scheduler.js');
  const { createSharedClock, advanceSharedClockTo } = await import('../frontend/shared-clock.js');
  const { createTriggeredClock, stepTriggeredClock, acceptRobotPlan } = await import('../frontend/triggered-clock.js');
  const samples = [
    { time: 0, q: [0], velocity: [0], acceleration: [0] },
    { time: 1, q: [1], velocity: [1], acceleration: [0] },
  ];
  const shared = createSharedClock({ samples,
    schedulerState: createMultiProgramState({ programs: [{ name: 'waiter',
      commands: [{ kind: 'WAIT_SIGNAL_SET', signal: 'robot_done', line: 1 }] }] }), tickSeconds: .5 });
  near(advanceSharedClockTo(shared, .5).state.q[0], .34375);
  let triggered = createTriggeredClock({ schedulerState: createMultiProgramState({ programs: [{
    name: 'robot', commands: [{ kind: 'RUN_ROBOT', line: 1 }],
  }] }), initialQ: [0], tickSeconds: .5 });
  triggered = stepTriggeredClock(triggered).state;
  assert.equal(triggered.status, 'planning');
  triggered = acceptRobotPlan(triggered, { samples });
  triggered = stepTriggeredClock(triggered).state;
  near(triggered.q[0], .34375);
});
