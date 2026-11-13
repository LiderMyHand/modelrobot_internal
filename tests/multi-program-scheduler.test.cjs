const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let createMultiProgramState, stepMultiProgram, runMultiProgram;
before(async () => ({ createMultiProgramState, stepMultiProgram, runMultiProgram } = await import('../frontend/multi-program-scheduler.js')));
const set = (signal, value) => ({ kind: 'SET_SIGNAL', signal, value });
const waitSet = (signal, timeoutTicks) => ({ kind: 'WAIT_SIGNAL_SET', signal, ...(timeoutTicks == null ? {} : { timeoutTicks }) });

test('two programs handshake through shared numeric signals and independent program counters', () => {
  const programs = [
    { name: 'robot', commands: [set('rob_out', 1), waitSet('conv_done'), set('conv_done', 0)] },
    { name: 'conveyor', commands: [waitSet('rob_out'), set('rob_out', 0), set('conv_done', 1)] },
  ];
  const first = runMultiProgram(createMultiProgramState({ programs, signals: { rob_out: 0, conv_done: 0 } }));
  const reversed = runMultiProgram(createMultiProgramState({ programs: [...programs].reverse(), signals: { conv_done: 0, rob_out: 0 } }));
  assert.deepEqual(reversed, first, 'Input listing order must not change the logical trace.');
  assert.equal(first.state.status, 'finished');
  assert.equal(first.state.tick, 6);
  assert.deepEqual(first.state.signals, { conv_done: 0, rob_out: 0 });
  assert.deepEqual(first.state.programs.map(program => [program.name, program.pc]), [['conveyor', 3], ['robot', 3]]);
  assert.deepEqual(first.trace.filter(event => event.outcome === 'set').map(event => [event.tick, event.program, event.signal, event.value]),
    [[0, 'robot', 'rob_out', 1], [2, 'conveyor', 'rob_out', 0], [3, 'conveyor', 'conv_done', 1], [5, 'robot', 'conv_done', 0]]);
  assert.deepEqual(first.diagnostics, []);
});

test('waits read the tick-start snapshot; writes become visible next tick', () => {
  const initial = createMultiProgramState({ programs: [
    { name: 'waiter', commands: [waitSet('ready')] },
    { name: 'setter', commands: [set('ready', 1)] },
  ] });
  const untouched = structuredClone(initial);
  const one = stepMultiProgram(initial);
  assert.deepEqual(initial, untouched, 'Stepping must not mutate the previous state.');
  assert.equal(one.state.signals.ready, 1);
  assert.equal(one.state.programs.find(program => program.name === 'waiter').pc, 0);
  assert.equal(one.state.programs.find(program => program.name === 'waiter').waitTicks, 1);
  assert.deepEqual(one.events.map(event => [event.program, event.outcome]), [['setter', 'set'], ['waiter', 'blocked']]);
  const two = stepMultiProgram(one.state);
  assert.equal(two.state.status, 'finished');
  assert.equal(two.state.programs.find(program => program.name === 'waiter').pc, 1);
  assert.deepEqual(two.events.map(event => event.outcome), ['satisfied']);
});

test('conflicting same-tick writers fail atomically in stable name order', () => {
  const start = createMultiProgramState({ programs: [
    { name: 'zeta', commands: [set('shared', 2)] },
    { name: 'alpha', commands: [set('shared', 1)] },
  ], signals: { shared: 0 } });
  const result = stepMultiProgram(start);
  assert.equal(result.state.status, 'error');
  assert.equal(result.state.tick, 1);
  assert.equal(result.state.signals.shared, 0);
  assert.deepEqual(result.state.programs.map(program => program.pc), [0, 0]);
  assert.deepEqual(result.diagnostics.map(item => item.code), ['SIGNAL_WRITE_CONFLICT']);
  assert.deepEqual(result.diagnostics[0].programs, ['alpha', 'zeta']);
  assert.deepEqual(result.events, []);
});

test('untimed blocked programs deadlock; a timed wait expires in logical ticks', () => {
  const deadlock = runMultiProgram(createMultiProgramState({ programs: [
    { name: 'robot', commands: [waitSet('conveyor_done')] },
    { name: 'conveyor', commands: [waitSet('robot_done')] },
  ] }));
  assert.equal(deadlock.state.status, 'deadlock');
  assert.equal(deadlock.state.tick, 1);
  assert.deepEqual(deadlock.diagnostics.map(item => item.code), ['DEADLOCK']);
  assert.deepEqual(deadlock.diagnostics[0].waiting.map(item => item.program), ['conveyor', 'robot']);

  const timeout = runMultiProgram(createMultiProgramState({ programs: [
    { name: 'robot', commands: [waitSet('missing', 3)] },
  ] }));
  assert.equal(timeout.state.status, 'timeout');
  assert.equal(timeout.state.tick, 3);
  assert.deepEqual(timeout.diagnostics.map(item => item.code), ['WAIT_TIMEOUT']);
  assert.equal(timeout.diagnostics[0].tick, 2);
  assert.equal(timeout.diagnostics[0].waitedTicks, 3);
  assert.equal(timeout.state.programs[0].pc, 0);
});

test('set/unset threshold and numeric comparison use finite shared values', () => {
  const state = createMultiProgramState({ programs: [
    { name: 'a', commands: [{ kind: 'WAIT_SIGNAL_UNSET', signal: 'edge' },
      { kind: 'WAIT_SIGNAL_VALUE', signal: 'count', operator: '>=', value: 3 }] },
    { name: 'b', commands: [set('edge', 0.5001), { kind: 'WAIT_SIGNAL_SET', signal: 'edge' }] },
  ], signals: { edge: 0.5, count: 3 } });
  const result = runMultiProgram(state);
  assert.equal(result.state.status, 'finished');
  assert.equal(result.state.tick, 2);
  assert.deepEqual(result.trace.filter(event => event.outcome === 'satisfied').map(event => [event.tick, event.program]),
    [[0, 'a'], [1, 'a'], [1, 'b']]);
  assert.deepEqual(result.diagnostics, []);
});

test('invalid definitions fail early and bounded runs report a limit', () => {
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'a', commands: [] }, { name: 'a', commands: [] }] }), /unique name/);
  assert.throws(() => createMultiProgramState({ programs: [], signals: { bad: Infinity } }), /finite numeric/);
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'a', commands: [set('s', NaN)] }] }), /finite numeric/);
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'a', commands: [waitSet('s', 0)] }] }), /logical-tick/);
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'a', commands: [{ kind: 'MOVEJ', signal: 's' }] }] }), /unsupported kind/);
  const limit = runMultiProgram(createMultiProgramState({ programs: [{ name: 'a', commands: [waitSet('never', 100)] }] }), { maxTicks: 2 });
  assert.equal(limit.state.status, 'limit');
  assert.deepEqual(limit.diagnostics.map(item => item.code), ['RUN_LIMIT']);
  assert.equal(limit.state.tick, 2);
});

test('model translation advances per tick, keeps other axes, and exposes line-located commands', () => {
  const programs = [{ name: 'conveyor', commands: [
    { kind: 'MOVE_MODEL', model: 'slider', axis: 'X', position: 1.2, durationTicks: 4, line: 2 },
    set('done', 1),
  ] }, { name: 'robot', commands: [waitSet('done')] }];
  const initial = createMultiProgramState({ programs, devices: { slider: [0.2, 0.3, 0.4] } });
  const untouched = structuredClone(initial);
  let state = initial;
  const positions = [];
  for (let i = 0; i < 4; i++) {
    const result = stepMultiProgram(state);
    positions.push(result.state.devices.slider[0]);
    assert.equal(result.events.find(event => event.outcome === 'move').line, 2);
    state = result.state;
  }
  assert.deepEqual(initial, untouched);
  assert.deepEqual(positions, [0.45, 0.7, 0.95, 1.2]);
  assert.deepEqual(state.devices.slider, [1.2, 0.3, 0.4]);
  assert.equal(state.programs.find(program => program.name === 'conveyor').pc, 1);
  const final = runMultiProgram(state);
  assert.equal(final.state.status, 'finished');
  assert.equal(final.state.tick, 6);
});

test('simultaneous model drivers fail atomically with both source lines', () => {
  const state = createMultiProgramState({ programs: [
    { name: 'zeta', commands: [{ kind: 'MOVE_MODEL', model: 'slider', axis: 'Y', position: 2, durationTicks: 2, line: 7 }] },
    { name: 'alpha', commands: [{ kind: 'MOVE_MODEL', model: 'slider', axis: 'X', position: 1, durationTicks: 2, line: 2 }] },
  ], devices: { slider: [0, 0, 0] } });
  const result = stepMultiProgram(state);
  assert.equal(result.state.status, 'error');
  assert.deepEqual(result.state.devices.slider, [0, 0, 0]);
  assert.deepEqual(result.state.programs.map(program => program.pc), [0, 0]);
  assert.deepEqual(result.events, []);
  assert.equal(result.diagnostics[0].code, 'DEVICE_WRITE_CONFLICT');
  assert.deepEqual(result.diagnostics[0].locations.map(item => [item.program, item.line]), [['alpha', 2], ['zeta', 7]]);
});

test('model targets must be available and motion definitions finite', () => {
  const command = { kind: 'MOVE_MODEL', model: 'slider', axis: 'Z', position: 1, durationTicks: 2, line: 3 };
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'conveyor', commands: [command] }] }), /line 3.*unavailable/);
  assert.throws(() => createMultiProgramState({ programs: [{ name: 'conveyor', commands: [{ ...command, durationTicks: 0 }] }], devices: { slider: [0, 0, 0] } }), /positive safe/);
  assert.throws(() => createMultiProgramState({ programs: [], devices: { slider: [0, Infinity, 0] } }), /finite world/);
});

test('RUN_ROBOT requests an external plan exactly once and waits for robot_done', () => {
  const initial = createMultiProgramState({ programs: [{ name: 'arm', commands: [
    { kind: 'RUN_ROBOT', line: 2 }, waitSet('robot_done', 8),
  ] }] });
  const untouched = structuredClone(initial);
  const request = stepMultiProgram(initial, { allowRobotRequest: true });
  assert.deepEqual(initial, untouched);
  assert.equal(request.state.programs[0].pc, 1);
  assert.deepEqual(request.events.map(event => [event.kind, event.outcome, event.line]), [['RUN_ROBOT', 'request', 2]]);
  const pending = stepMultiProgram(request.state, { allowRobotRequest: true, externalPendingSignals: ['robot_done'] });
  assert.equal(pending.state.status, 'running');
  assert.equal(pending.state.programs[0].pc, 1);
  const completed = stepMultiProgram({ ...pending.state, signals: { ...pending.state.signals, robot_done: 1 } }, { allowRobotRequest: true });
  assert.equal(completed.state.status, 'finished');
  assert.equal(completed.state.programs[0].pc, 2);
});

test('RUN_ROBOT requires the timed runtime in standalone signal runs', () => {
  const initial = createMultiProgramState({ programs: [
    { name: 'alpha', commands: [set('side', 1)] },
    { name: 'robot', commands: [{ kind: 'RUN_ROBOT', line: 4 }] },
  ] });
  const result = stepMultiProgram(initial);
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'ROBOT_RUNTIME_REQUIRED');
  assert.equal(result.diagnostics[0].line, 4);
  assert.deepEqual(result.state.signals, {});
  assert.deepEqual(result.state.programs.map(program => program.pc), [0, 0]);
  assert.deepEqual(result.events, []);
});

test('same-tick RUN_ROBOT requests conflict atomically with both source lines', () => {
  const initial = createMultiProgramState({ programs: [
    { name: 'zeta', commands: [{ kind: 'RUN_ROBOT', line: 9 }] },
    { name: 'alpha', commands: [{ kind: 'RUN_ROBOT', line: 2 }] },
  ] });
  const result = stepMultiProgram(initial, { allowRobotRequest: true });
  assert.equal(result.state.status, 'error');
  assert.equal(result.diagnostics[0].code, 'ROBOT_REQUEST_CONFLICT');
  assert.deepEqual(result.diagnostics[0].locations.map(item => [item.program, item.line]), [['alpha', 2], ['zeta', 9]]);
  assert.deepEqual(result.state.programs.map(program => program.pc), [0, 0]);
  assert.deepEqual(result.events, []);
});
