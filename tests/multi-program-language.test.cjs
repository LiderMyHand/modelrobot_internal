const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let compileMultiProgram, createMultiProgramState, runMultiProgram;
before(async () => {
  ({ compileMultiProgram } = await import('../frontend/multi-program-language.js'));
  ({ createMultiProgramState, runMultiProgram } = await import('../frontend/multi-program-scheduler.js'));
});

test('compiles all signal commands with source lines and logical-tick timeouts', () => {
  const result = compileMultiProgram(`# comment\nPROGRAM robot\nSET ready -1.25e+2 # inline comment\nWAIT_SET ready TIMEOUT 3\nWAIT_UNSET ready\nWAIT_VALUE count >= .5 TIMEOUT 9\nEND`);
  assert.equal(result.ok, true);
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.programs, [{ name: 'robot', commands: [
    { kind: 'SET_SIGNAL', signal: 'ready', value: -125, line: 3 },
    { kind: 'WAIT_SIGNAL_SET', signal: 'ready', timeoutTicks: 3, line: 4 },
    { kind: 'WAIT_SIGNAL_UNSET', signal: 'ready', line: 5 },
    { kind: 'WAIT_SIGNAL_VALUE', signal: 'count', operator: '>=', value: 0.5, timeoutTicks: 9, line: 6 },
  ] }]);
  assert.doesNotThrow(() => createMultiProgramState({ programs: result.programs }));
});

test('bundled robot/conveyor fixture completes reproducible signal handshake', () => {
  const source = fs.readFileSync(path.join(__dirname, '../testowe/multi_program/handshake.mprg'), 'utf8');
  const parsed = compileMultiProgram(source);
  assert.equal(parsed.ok, true);
  const first = runMultiProgram(createMultiProgramState({ programs: parsed.programs, signals: { rob_out: 0, conv_done: 0 } }));
  const reversed = runMultiProgram(createMultiProgramState({ programs: [...parsed.programs].reverse(), signals: { conv_done: 0, rob_out: 0 } }));
  assert.deepEqual(reversed, first);
  assert.equal(first.state.status, 'finished');
  assert.equal(first.state.tick, 6);
  assert.deepEqual(first.state.signals, { conv_done: 0, rob_out: 0 });
  assert.deepEqual(first.trace.filter(event => event.outcome === 'set').map(({ tick, program, signal, value, line }) => [tick, program, signal, value, line]),
    [[0, 'robot', 'rob_out', 1, 3], [2, 'conveyor', 'rob_out', 0, 10],
      [3, 'conveyor', 'conv_done', 1, 11], [5, 'robot', 'conv_done', 0, 5]]);
});

test('rejects malformed blocks and duplicate program names with source locations', () => {
  const source = `SET x 1\nPROGRAM robot\nPROGRAM nested\nEND\nEND\nPROGRAM robot\nEND\nPROGRAM open`;
  const parsed = compileMultiProgram(source);
  assert.equal(parsed.ok, false);
  assert.deepEqual(parsed.diagnostics.map(({ line, column, code }) => [line, column, code]), [
    [1, 1, 'COMMAND_OUTSIDE_PROGRAM'], [3, 1, 'PROGRAM_NESTED'],
    [5, 1, 'END_WITHOUT_PROGRAM'], [6, 1, 'PROGRAM_DUPLICATE'],
    [8, 1, 'PROGRAM_UNCLOSED'],
  ]);
});

test('rejects expressions, unsafe numeric values, timeout units, and unknown commands', () => {
  const source = `PROGRAM robot\nSET out globalThis.alert(1)\nSET out 1e400\nSET out 0x10\nWAIT_SET done TIMEOUT 0\nWAIT_UNSET done TIMEOUT 1.5\nWAIT_VALUE count => 3\nWAIT_VALUE count >= 3 TIMEOUT 99999999999999999999\nMOVEJ 1\nEND`;
  const parsed = compileMultiProgram(source);
  assert.equal(parsed.ok, false);
  assert.deepEqual(parsed.diagnostics.map(({ line, code }) => [line, code]), [
    [2, 'SET_SYNTAX'], [3, 'SET_SYNTAX'], [4, 'SET_SYNTAX'],
    [5, 'WAIT_SYNTAX'], [6, 'WAIT_SYNTAX'], [7, 'WAIT_VALUE_SYNTAX'],
    [8, 'WAIT_VALUE_SYNTAX'], [9, 'UNKNOWN_COMMAND'],
  ]);
  assert.deepEqual(parsed.programs, [{ name: 'robot', commands: [] }]);
});

test('rejects malformed headers and non-text input', () => {
  assert.deepEqual(compileMultiProgram(null).diagnostics.map(({ line, code }) => [line, code]), [[1, 'SOURCE_TYPE']]);
  const parsed = compileMultiProgram('PROGRAM bad/name\nEND extra\nEND');
  assert.equal(parsed.ok, false);
  assert.deepEqual(parsed.diagnostics.map(({ line, code }) => [line, code]), [
    [1, 'PROGRAM_SYNTAX'], [2, 'END_SYNTAX'], [3, 'END_WITHOUT_PROGRAM'],
  ]);
});

test('runtime signal failures retain source lines from compiled programs', () => {
  const timed = compileMultiProgram('PROGRAM robot\nWAIT_SET ready TIMEOUT 2\nEND');
  const timeout = runMultiProgram(createMultiProgramState({ programs: timed.programs }));
  assert.equal(timeout.state.status, 'timeout');
  assert.equal(timeout.diagnostics[0].line, 2);

  const conflicting = compileMultiProgram('PROGRAM alpha\nSET shared 1\nEND\nPROGRAM beta\nSET shared 2\nEND');
  const conflict = runMultiProgram(createMultiProgramState({ programs: conflicting.programs }));
  assert.equal(conflict.state.status, 'error');
  assert.deepEqual(conflict.diagnostics[0].locations.map(item => [item.program, item.line]), [['alpha', 2], ['beta', 5]]);

  const blocked = compileMultiProgram('PROGRAM alpha\nWAIT_SET ready\nEND');
  const deadlock = runMultiProgram(createMultiProgramState({ programs: blocked.programs }));
  assert.equal(deadlock.state.status, 'deadlock');
  assert.equal(deadlock.diagnostics[0].waiting[0].line, 2);
});

test('compiles typed world-axis model moves and rejects malformed motion expressions', () => {
  const valid = compileMultiProgram('PROGRAM conveyor\nMOVE_MODEL slider X 0.25 TICKS 4\nMOVE_MODEL slider Y -0.1 TICKS 2\nEND');
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.programs[0].commands, [
    { kind: 'MOVE_MODEL', model: 'slider', axis: 'X', position: 0.25, durationTicks: 4, line: 2 },
    { kind: 'MOVE_MODEL', model: 'slider', axis: 'Y', position: -0.1, durationTicks: 2, line: 3 },
  ]);
  const bad = compileMultiProgram('PROGRAM conveyor\nMOVE_MODEL slider Q 1 TICKS 2\nMOVE_MODEL slider X window.alert(1) TICKS 2\nMOVE_MODEL slider X 1 TICKS 0\nEND');
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.diagnostics.map(issue => [issue.line, issue.code]), [
    [2, 'MOVE_MODEL_SYNTAX'], [3, 'MOVE_MODEL_SYNTAX'], [4, 'MOVE_MODEL_SYNTAX'],
  ]);
});

test('RUN_ROBOT compiles to a typed request and rejects arguments', () => {
  const valid = compileMultiProgram('PROGRAM arm\nRUN_ROBOT\nWAIT_SET robot_done TIMEOUT 12\nEND');
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.programs[0].commands, [
    { kind: 'RUN_ROBOT', line: 2 },
    { kind: 'WAIT_SIGNAL_SET', signal: 'robot_done', timeoutTicks: 12, line: 3 },
  ]);
  const bad = compileMultiProgram('PROGRAM arm\nRUN_ROBOT plan\nEND');
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.diagnostics.map(issue => [issue.line, issue.code]), [[2, 'RUN_ROBOT_SYNTAX']]);
});
