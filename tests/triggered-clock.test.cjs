const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let createMultiProgramState, createTriggeredClock, stepTriggeredClock, acceptRobotPlan, rejectRobotPlan, syncTriggeredDevices;
before(async () => {
  ({ createMultiProgramState } = await import('../frontend/multi-program-scheduler.js'));
  ({ createTriggeredClock, stepTriggeredClock, acceptRobotPlan, rejectRobotPlan, syncTriggeredDevices } =
    await import('../frontend/triggered-clock.js'));
});
const move = (position, ticks = 2, line = 2) => ({ kind: 'MOVE_MODEL', model: 'tray', axis: 'X', position, durationTicks: ticks, line });
const wait = (signal, line = 3) => ({ kind: 'WAIT_SIGNAL_SET', signal, line });
const set = (signal, value, line = 4) => ({ kind: 'SET_SIGNAL', signal, value, line });
const run = line => ({ kind: 'RUN_ROBOT', line });
const programs = commands => [{ name: 'workcell', commands }];
const start = (commands, options = {}) => createTriggeredClock({
  schedulerState: createMultiProgramState({ programs: programs(commands), devices: { tray: [0.2, 0, 0] } }),
  initialQ: [0], tickSeconds: 0.1, ...options,
});

test('device-first sequence freezes at RUN_ROBOT, then exposes completion to a later WAIT tick', () => {
  let clock = start([move(0.6, 2), run(3), wait('robot_done', 4), set('ready', 1, 5)]);
  const original = structuredClone(clock);
  let result = stepTriggeredClock(clock); clock = result.state;
  assert.equal(clock.timeSeconds, 0.1); assert.equal(clock.schedulerState.devices.tray[0], 0.4);
  result = stepTriggeredClock(clock); clock = result.state;
  assert.equal(clock.schedulerState.devices.tray[0], 0.6);
  result = stepTriggeredClock(clock); clock = result.state;
  assert.equal(clock.status, 'planning'); assert.equal(clock.timeSeconds, 0.30000000000000004);
  assert.deepEqual(result.request, { program: 'workcell', line: 3, tick: 2, timeSeconds: clock.timeSeconds });
  assert.equal(stepTriggeredClock(clock).state, clock, 'Planning does not advance simulation time.');
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 0.25, q: [1] }] });
  assert.equal(clock.robot.startTime, 0.30000000000000004);
  assert.equal(clock.status, 'running');
  clock = stepTriggeredClock(clock).state;
  assert.ok(Math.abs(clock.q[0] - 0.4) < 1e-12, 'Robot q is interpolated at the first timed tick.');
  for (let i = 0; i < 2; i++) clock = stepTriggeredClock(clock).state;
  assert.equal(clock.timeSeconds, 0.6000000000000001);
  assert.equal(clock.q[0], 1);
  assert.equal(clock.schedulerState.signals.robot_done, 1);
  assert.equal(clock.schedulerState.signals.ready, undefined);
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.schedulerState.programs[0].pc, 3, 'WAIT observes completion at the next tick start.');
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.status, 'finished');
  assert.equal(clock.schedulerState.signals.ready, 1);
  assert.equal(original.schedulerState.devices.tray[0], 0.2, 'Input states remain immutable.');
});

test('a model change and robot request in the same tick are committed before planning', () => {
  const clock = createTriggeredClock({ schedulerState: createMultiProgramState({
    programs: [
      { name: 'device', commands: [move(0.6, 1, 2)] },
      { name: 'robot', commands: [run(5)] },
    ], devices: { tray: [0.2, 0, 0] },
  }), initialQ: [0] });
  const result = stepTriggeredClock(clock);
  assert.equal(result.state.status, 'planning');
  assert.equal(result.state.schedulerState.devices.tray[0], 0.6);
  assert.ok(result.events.some(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move'));
  assert.equal(result.request.program, 'robot');
});

test('device move during robot motion fails atomically with source location', () => {
  let clock = start([run(2), move(0.6, 2, 3)]);
  clock = stepTriggeredClock(clock).state;
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 1, q: [1] }] });
  const before = structuredClone(clock);
  const result = stepTriggeredClock(clock);
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'UNSAFE_DEVICE_TIMING');
  assert.equal(result.diagnostics[0].line, 3);
  assert.equal(result.state.timeSeconds, before.timeSeconds);
  assert.equal(result.state.schedulerState.devices.tray[0], before.schedulerState.devices.tray[0]);
  assert.deepEqual(clock, before);
});

test('failed Worker plan is terminal at the frozen request boundary', () => {
  let clock = start([run(7)]);
  clock = stepTriggeredClock(clock).state;
  const failed = rejectRobotPlan(clock, { code: 'UNREACHABLE', message: 'No collision-free pose.' });
  assert.equal(failed.status, 'error');
  assert.equal(failed.timeSeconds, 0.1);
  assert.equal(failed.diagnostics[0].line, 7);
  assert.equal(failed.diagnostics[0].code, 'UNREACHABLE');
  assert.equal(stepTriggeredClock(failed).state, failed);
});

test('robot completion reaches a tick boundary after scheduler finishes on RUN_ROBOT', () => {
  let clock = start([run(2)]);
  clock = acceptRobotPlan(stepTriggeredClock(clock).state,
    { samples: [{ time: 0, q: [0] }, { time: 0.25, q: [1] }] });
  for (let i = 0; i < 2; i++) clock = stepTriggeredClock(clock).state;
  assert.equal(clock.status, 'running'); assert.equal(clock.schedulerState.signals.robot_done, 0);
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.status, 'finished'); assert.equal(clock.schedulerState.signals.robot_done, 1);
  assert.equal(clock.q[0], 1);
});

test('zero-duration plan finishes immediately and rejects mismatched starting joints', () => {
  let clock = stepTriggeredClock(start([run(2)])).state;
  assert.throws(() => acceptRobotPlan(clock, { samples: [{ time: 0, q: [2] }] }), /start joints differ/);
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }] });
  assert.equal(clock.status, 'finished');
  assert.equal(clock.schedulerState.signals.robot_done, 1);
});

test('device delivery before a robot GRAB is allowed; a later device move needs a fresh pose sync', () => {
  let clock = start([move(0.6, 1, 2), run(3), wait('robot_done', 4), move(0.8, 1, 5)]);
  clock = stepTriggeredClock(clock).state;
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.schedulerState.devices.tray[0], 0.6);
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 0.1, q: [1] }],
    events: [{ time: 0.05, kind: 'GRAB', object: 'tray' }, { time: 0.1, kind: 'RELEASE', object: 'tray' }] });
  assert.deepEqual(clock.robot.touchedModels, ['tray']);
  clock = stepTriggeredClock(clock).state;
  clock = stepTriggeredClock(clock).state;
  const stale = stepTriggeredClock(clock);
  assert.equal(stale.state.status, 'error');
  assert.equal(stale.diagnostics[0].code, 'ROBOT_OBJECT_DEVICE_CONFLICT');
  assert.equal(stale.diagnostics[0].line, 5);
  assert.equal(stale.state.schedulerState.devices.tray[0], 0.6);
  const synchronized = syncTriggeredDevices(clock, { tray: [0.7, 0, 0] });
  assert.deepEqual(synchronized.robot.touchedModels, []);
  const accepted = stepTriggeredClock(synchronized);
  assert.equal(accepted.state.schedulerState.devices.tray[0], 0.8);
  assert.equal(clock.schedulerState.devices.tray[0], 0.6);
});

test('a touched model is blocked at the first completed boundary even if phase still says moving', () => {
  let clock = stepTriggeredClock(start([run(2), move(0.8, 1, 3)])).state;
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 5e-11, q: [0] }],
    events: [{ time: 0, kind: 'GRAB', object: 'tray' }] });
  assert.equal(clock.robot.status, 'moving');
  const result = stepTriggeredClock(clock);
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'ROBOT_OBJECT_DEVICE_CONFLICT');
  assert.equal(result.diagnostics[0].line, 3);
  assert.equal(result.state.schedulerState.devices.tray[0], 0.2);
});

test('the command-time setup reserves robot_done and requires a request', () => {
  assert.throws(() => start([set('robot_done', 1, 2), run(3)]), /read-only/);
  assert.throws(() => start([move(0.6)]), /at least one RUN_ROBOT/);
});

test('two sequential robot requests replan from the first endpoint with a device move between them', () => {
  let clock = start([run(2), wait('robot_done', 3), move(0.6, 1, 4),
    run(5), wait('robot_done', 6), set('all_done', 1, 7)]);
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.requestCount, 1); assert.equal(clock.status, 'planning');
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 0.15, q: [1] }] });
  for (let i = 0; i < 4; i++) clock = stepTriggeredClock(clock).state;
  assert.equal(clock.schedulerState.signals.robot_done, 1);
  assert.equal(clock.q[0], 1);
  assert.equal(clock.schedulerState.devices.tray[0], 0.6);
  const second = stepTriggeredClock(clock);
  clock = second.state;
  assert.equal(clock.status, 'planning');
  assert.equal(clock.requestCount, 2);
  assert.equal(clock.schedulerState.signals.robot_done, 0, 'A new request clears the previous completion signal.');
  assert.equal(second.request.line, 5);
  assert.equal(clock.q[0], 1);
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [1] }, { time: 0.2, q: [2] }] });
  assert.ok(Math.abs(clock.robot.startTime - 0.6) < 1e-12);
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.schedulerState.signals.robot_done, 0);
  assert.ok(clock.q[0] > 1 && clock.q[0] < 2);
  for (let i = 0; i < 3; i++) clock = stepTriggeredClock(clock).state;
  assert.equal(clock.schedulerState.signals.robot_done, 1);
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.status, 'finished');
  assert.equal(clock.q[0], 2);
  assert.equal(clock.schedulerState.signals.all_done, 1);
});

test('a second request during an active robot trajectory fails atomically with its line', () => {
  let clock = stepTriggeredClock(start([run(2), run(3)])).state;
  clock = acceptRobotPlan(clock, { samples: [{ time: 0, q: [0] }, { time: 1, q: [1] }] });
  const before = structuredClone(clock);
  const result = stepTriggeredClock(clock);
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'ROBOT_BUSY');
  assert.equal(result.diagnostics[0].line, 3);
  assert.equal(result.state.timeSeconds, before.timeSeconds);
  assert.equal(result.state.schedulerState.signals.robot_done, 0);
  assert.deepEqual(clock, before);
});

test('same-tick robot requests fail atomically before the first Worker request', () => {
  const clock = createTriggeredClock({ schedulerState: createMultiProgramState({
    programs: [{ name: 'a', commands: [run(2)] }, { name: 'b', commands: [run(5)] }], devices: {},
  }), initialQ: [0] });
  const result = stepTriggeredClock(clock);
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'ROBOT_REQUEST_CONFLICT');
  assert.equal(result.state.timeSeconds, 0);
  assert.equal(result.request, null);
});

test('planning failure is terminal, while a fresh reset state can request again', () => {
  const commands = [run(2), wait('robot_done', 3), run(4)];
  const pending = stepTriggeredClock(start(commands)).state;
  const failed = rejectRobotPlan(pending, { code: 'NO_PATH', message: 'No collision-free path.' });
  assert.equal(failed.status, 'error');
  assert.equal(stepTriggeredClock(failed).state, failed);
  const fresh = stepTriggeredClock(start(commands)).state;
  assert.equal(fresh.status, 'planning');
  assert.equal(fresh.requestCount, 1);
  assert.equal(fresh.schedulerState.signals.robot_done, 0);
});

test('device origins can be synchronized after robot completion without mutating old state', () => {
  let clock = start([run(2)]);
  clock = acceptRobotPlan(stepTriggeredClock(clock).state,
    { samples: [{ time: 0, q: [0] }, { time: 0.1, q: [1] }] });
  clock = stepTriggeredClock(clock).state;
  assert.equal(clock.robot.status, 'done');
  const rebound = syncTriggeredDevices(clock, { tray: [0.7, 0, 0] });
  assert.equal(rebound.schedulerState.devices.tray[0], 0.7);
  assert.equal(clock.schedulerState.devices.tray[0], 0.2);
  assert.throws(() => syncTriggeredDevices(clock, { tray: [Infinity, 0, 0] }), /finite world/);
});
