const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let createMultiProgramState, createSharedClock, advanceSharedClockTo, stepSharedClock;
before(async () => {
  ({ createMultiProgramState } = await import('../frontend/multi-program-scheduler.js'));
  ({ createSharedClock, advanceSharedClockTo, stepSharedClock } = await import('../frontend/shared-clock.js'));
});

const samples = [{ time: 0, q: [0, 2] }, { time: 0.25, q: [1, 3] }];
const waitDone = { kind: 'WAIT_SIGNAL_SET', signal: 'robot_done', line: 2 };
const move = { kind: 'MOVE_MODEL', model: 'tray', axis: 'X', position: 1, durationTicks: 2, line: 3 };

test('robot_done releases a waiting device after the exact plan-end boundary', () => {
  const schedulerState = createMultiProgramState({ programs: [
    { name: 'conveyor', commands: [waitDone, move, { kind: 'SET_SIGNAL', signal: 'done', value: 1, line: 4 }] },
  ], devices: { tray: [0, 2, 3] } });
  const initial = createSharedClock({ samples, schedulerState, tickSeconds: 0.1 });
  const original = structuredClone(initial);
  let clock = initial;
  const trace = [];
  for (let index = 0; index < 7; index++) {
    const result = stepSharedClock(clock);
    clock = result.state; trace.push(...result.events);
  }
  assert.deepEqual(initial, original, 'Advancing must not mutate the input state.');
  assert.equal(clock.timeSeconds, 0.7000000000000001);
  assert.equal(clock.status, 'finished');
  assert.deepEqual(clock.q, [1, 3]);
  assert.equal(clock.schedulerState.signals.robot_done, 1);
  assert.equal(clock.schedulerState.signals.done, 1);
  assert.deepEqual(clock.schedulerState.devices.tray, [1, 2, 3]);
  assert.deepEqual(trace.filter(event => event.kind === 'WAIT_SIGNAL_SET').map(event => event.outcome),
    ['blocked', 'blocked', 'blocked', 'satisfied']);
  assert.deepEqual(trace.filter(event => event.kind === 'MOVE_MODEL').map(event => [event.position, event.timeSeconds]),
    [[0.5, 0.5], [1, 0.6000000000000001]]);
});

test('fractional seek interpolates q without prematurely advancing a signal tick', () => {
  const schedulerState = createMultiProgramState({ programs: [{ name: 'waiter', commands: [waitDone] }] });
  const first = createSharedClock({ samples, schedulerState, tickSeconds: 0.1 });
  const atHalfTick = advanceSharedClockTo(first, 0.05).state;
  assert.deepEqual(atHalfTick.q, [0.2, 2.2]);
  assert.equal(atHalfTick.schedulerState.tick, 0);
  const atPlanEnd = advanceSharedClockTo(atHalfTick, 0.25).state;
  assert.equal(atPlanEnd.schedulerState.tick, 2);
  assert.equal(atPlanEnd.schedulerState.signals.robot_done, 0);
  assert.deepEqual(atPlanEnd.q, [1, 3]);
  const atBoundary = advanceSharedClockTo(atPlanEnd, 0.3).state;
  assert.equal(atBoundary.schedulerState.tick, 3);
  assert.equal(atBoundary.schedulerState.signals.robot_done, 1);
  assert.equal(atBoundary.schedulerState.programs[0].pc, 0);
  assert.equal(stepSharedClock(atBoundary).state.schedulerState.status, 'finished');
});

test('early-finished programs keep the clock alive until robot_done reaches a tick boundary', () => {
  const schedulerState = createMultiProgramState({ programs: [{ name: 'one', commands: [
    { kind: 'SET_SIGNAL', signal: 'ready', value: 1 },
  ] }] });
  const first = createSharedClock({ samples, schedulerState, tickSeconds: 0.1 });
  const before = structuredClone(first);
  const early = advanceSharedClockTo(first, 0.25).state;
  assert.deepEqual(first, before);
  assert.equal(early.schedulerState.status, 'finished');
  assert.equal(early.timeSeconds, 0.25);
  assert.deepEqual(early.q, [1, 3]);
  assert.equal(early.schedulerState.signals.robot_done, 0);
  assert.equal(early.status, 'running');
  const boundary = advanceSharedClockTo(early, 0.3).state;
  assert.equal(boundary.timeSeconds, 0.3);
  assert.equal(boundary.schedulerState.signals.robot_done, 1);
  assert.equal(boundary.status, 'finished');
  assert.deepEqual(boundary.q, [1, 3]);
  assert.equal(advanceSharedClockTo(boundary, 1).state, boundary);
});

test('early device motion fails before commit and leaves prior clock untouched', () => {
  const schedulerState = createMultiProgramState({ programs: [{ name: 'conveyor', commands: [move] }],
    devices: { tray: [0, 2, 3] } });
  const initial = createSharedClock({ samples, schedulerState, tickSeconds: 0.1 });
  const beforeState = structuredClone(initial);
  const result = stepSharedClock(initial);
  assert.deepEqual(initial, beforeState);
  assert.equal(result.state.status, 'error');
  assert.equal(result.state.timeSeconds, 0);
  assert.equal(result.state.schedulerState.tick, 0);
  assert.deepEqual(result.state.schedulerState.devices.tray, [0, 2, 3]);
  assert.deepEqual(result.events, []);
  assert.equal(result.diagnostics[0].code, 'UNSAFE_DEVICE_TIMING');
  assert.equal(result.diagnostics[0].line, 3);
});

test('robot_done is read-only and robot-carried models cannot also be driven', () => {
  const setDone = createMultiProgramState({ programs: [{ name: 'bad', commands: [
    { kind: 'SET_SIGNAL', signal: 'robot_done', value: 1, line: 9 },
  ] }] });
  assert.throws(() => createSharedClock({ samples, schedulerState: setDone }), /bad line 9.*reserved read-only/);
  const device = createMultiProgramState({ programs: [{ name: 'conveyor', commands: [move] }], devices: { tray: [0, 0, 0] } });
  assert.throws(() => createSharedClock({ samples, schedulerState: device,
    robotEvents: [{ kind: 'GRAB', object: 'tray', time: 0.1 }] }), /conveyor line 3.*changed by the robot plan/);
});

test('stationary zero-duration robot plan releases robot_done on the first device tick', () => {
  const schedulerState = createMultiProgramState({ programs: [{ name: 'conveyor', commands: [waitDone, move] }],
    devices: { tray: [0, 0, 0] } });
  const initial = createSharedClock({ samples: [{ time: 0, q: [0] }], schedulerState, tickSeconds: 0.2 });
  assert.equal(initial.schedulerState.signals.robot_done, 1);
  const one = stepSharedClock(initial);
  assert.equal(one.state.schedulerState.programs[0].pc, 1);
  const two = stepSharedClock(one.state);
  assert.equal(two.state.schedulerState.devices.tray[0], 0.5);
});

test('invalid clock setup and backwards target fail visibly', () => {
  const schedulerState = createMultiProgramState({ programs: [] });
  assert.throws(() => createSharedClock({ samples: [{ time: 1, q: [0] }], schedulerState }), /t=0/);
  assert.throws(() => createSharedClock({ samples, schedulerState, tickSeconds: 0 }), /positive finite/);
  const clock = createSharedClock({ samples, schedulerState });
  const later = advanceSharedClockTo(clock, 0.2).state;
  assert.throws(() => advanceSharedClockTo(later, 0.1), /no earlier/);
});
