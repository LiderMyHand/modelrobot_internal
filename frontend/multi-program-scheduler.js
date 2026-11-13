// A logical-tick scheduler for numeric signals, kinematic scene-model translation, and robot requests.
const namePattern = /^[A-Za-z_][A-Za-z0-9_.:-]*$/;
const waitKinds = new Set(['WAIT_SIGNAL_SET', 'WAIT_SIGNAL_UNSET', 'WAIT_SIGNAL_VALUE']);
const operators = new Set(['==', '!=', '<', '<=', '>', '>=']);
const axisIndex = { X: 0, Y: 1, Z: 2 };
const validName = name => typeof name === 'string' && namePattern.test(name);
const compareNames = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function normalizeCommand(command, program, pc) {
  const prefix = `${program} command ${pc}`;
  if (!command || typeof command !== 'object' || Array.isArray(command)) throw new Error(`${prefix} must be an object.`);
  if (command.line != null && (!Number.isInteger(command.line) || command.line < 1)) throw new Error(`${prefix} line must be a positive integer.`);
  if (command.kind === 'RUN_ROBOT') return { kind: 'RUN_ROBOT', ...(command.line == null ? {} : { line: command.line }) };
  if (command.kind === 'MOVE_MODEL') {
    if (!validName(command.model) || !Object.hasOwn(axisIndex, command.axis) ||
        !Number.isFinite(command.position) || !Number.isSafeInteger(command.durationTicks) || command.durationTicks < 1)
      throw new Error(`${prefix} MOVE_MODEL needs a named model, X/Y/Z axis, finite absolute coordinate, and positive safe durationTicks.`);
    return { kind: command.kind, model: command.model, axis: command.axis,
      position: command.position, durationTicks: command.durationTicks,
      ...(command.line == null ? {} : { line: command.line }) };
  }
  if (!validName(command.signal)) throw new Error(`${prefix} needs a named signal.`);
  const result = { kind: command.kind, signal: command.signal };
  if (command.line != null) result.line = command.line;
  if (command.kind === 'SET_SIGNAL') {
    if (!Number.isFinite(command.value)) throw new Error(`${prefix} SET_SIGNAL needs a finite numeric value.`);
    result.value = command.value;
  } else if (waitKinds.has(command.kind)) {
    if (command.timeoutTicks != null) {
      if (!Number.isInteger(command.timeoutTicks) || command.timeoutTicks < 1) throw new Error(`${prefix} timeoutTicks must be a positive logical-tick count.`);
      result.timeoutTicks = command.timeoutTicks;
    }
    if (command.kind === 'WAIT_SIGNAL_VALUE') {
      if (!operators.has(command.operator) || !Number.isFinite(command.value)) throw new Error(`${prefix} WAIT_SIGNAL_VALUE needs a numeric value and comparator.`);
      result.operator = command.operator; result.value = command.value;
    }
  } else throw new Error(`${prefix} has unsupported kind ${command.kind}.`);
  return result;
}

function ready(command, value) {
  if (command.kind === 'WAIT_SIGNAL_SET') return value > 0.5;
  if (command.kind === 'WAIT_SIGNAL_UNSET') return value <= 0.5;
  switch (command.operator) {
    case '==': return value === command.value;
    case '!=': return value !== command.value;
    case '<': return value < command.value;
    case '<=': return value <= command.value;
    case '>': return value > command.value;
    case '>=': return value >= command.value;
    default: throw new Error(`Unsupported signal comparison ${command.operator}.`);
  }
}

/** Create a serializable state. Device coordinates are world-frame XYZ metres. */
export function createMultiProgramState({ programs, signals = {}, devices = {} }) {
  if (!Array.isArray(programs)) throw new Error('Programs must be an array.');
  if (!signals || typeof signals !== 'object' || Array.isArray(signals)) throw new Error('Signals must be a numeric name-to-value object.');
  if (!devices || typeof devices !== 'object' || Array.isArray(devices)) throw new Error('Devices must be a model-name-to-XYZ object.');
  const names = new Set();
  const normalized = programs.map(program => {
    if (!validName(program?.name) || names.has(program.name) || !Array.isArray(program.commands)) throw new Error('Each program needs a unique name and command array.');
    names.add(program.name);
    const commands = program.commands.map((command, pc) => normalizeCommand(command, program.name, pc));
    return { name: program.name, commands, pc: 0, waitTicks: 0, status: commands.length ? 'running' : 'finished' };
  }).sort((a, b) => compareNames(a.name, b.name));
  const initialSignals = Object.fromEntries(Object.entries(signals).sort(([a], [b]) => compareNames(a, b)).map(([name, value]) => {
    if (!validName(name) || !Number.isFinite(value)) throw new Error(`Signal ${name} needs a finite numeric initial value.`);
    return [name, value];
  }));
  const initialDevices = Object.fromEntries(Object.entries(devices).sort(([a], [b]) => compareNames(a, b)).map(([name, xyz]) => {
    if (!validName(name) || !Array.isArray(xyz) || xyz.length !== 3 || !xyz.every(Number.isFinite))
      throw new Error(`Device ${name} needs three finite world coordinates.`);
    return [name, [...xyz]];
  }));
  for (const program of normalized) for (const command of program.commands) {
    if (command.kind === 'MOVE_MODEL' && !Object.hasOwn(initialDevices, command.model))
      throw new Error(`${program.name}${command.line ? ` line ${command.line}` : ''}: model ${command.model} is unavailable for kinematic motion; it must exist, have static=false, and be detached.`);
  }
  return { tick: 0, signals: initialSignals, devices: initialDevices, programs: normalized,
    status: normalized.every(program => program.status === 'finished') ? 'finished' : 'running', diagnostics: [] };
}

/** Execute at most one command per program using a start-of-tick read snapshot. */
export function stepMultiProgram(state, { externalPendingSignals = [], allowRobotRequest = false } = {}) {
  if (state.status !== 'running') return { state, events: [], diagnostics: [] };
  if (!Array.isArray(externalPendingSignals) || !externalPendingSignals.every(validName))
    throw new Error('externalPendingSignals must be an array of signal names.');
  if (typeof allowRobotRequest !== 'boolean') throw new Error('allowRobotRequest must be a boolean.');
  const pendingSignals = new Set(externalPendingSignals);
  const programs = state.programs.map(program => ({ ...program, ...(program.motion ? { motion: { ...program.motion } } : {}) }));
  const writes = new Map(), deviceWrites = new Map(), events = [], diagnostics = [];
  let robotRequest = null;
  let progressed = false;
  for (const program of programs) {
    if (program.pc >= program.commands.length) { program.status = 'finished'; continue; }
    const command = program.commands[program.pc], value = Object.hasOwn(state.signals, command.signal) ? state.signals[command.signal] : 0;
    const base = { tick: state.tick, program: program.name, pc: program.pc, kind: command.kind };
    if (command.signal) base.signal = command.signal;
    if (command.line != null) base.line = command.line;
    if (command.kind === 'RUN_ROBOT') {
      if (!allowRobotRequest) {
        const issue = { code: 'ROBOT_RUNTIME_REQUIRED', tick: state.tick, program: program.name,
          pc: program.pc, line: command.line,
          message: `${program.name}${command.line ? ` line ${command.line}` : ''}: RUN_ROBOT needs the timed robot/device runtime.` };
        return { state: { ...state, tick: state.tick + 1, status: 'error', diagnostics: [...state.diagnostics, issue] },
          events: [], diagnostics: [issue] };
      }
      if (robotRequest) {
        const issue = { code: 'ROBOT_REQUEST_CONFLICT', tick: state.tick, programs: [robotRequest.program, program.name],
          line: command.line,
          locations: [{ program: robotRequest.program, pc: robotRequest.pc, line: robotRequest.line },
            { program: program.name, pc: program.pc, line: command.line }],
          message: `Programs ${robotRequest.program}${robotRequest.line ? ` (line ${robotRequest.line})` : ''} and ${program.name}${command.line ? ` (line ${command.line})` : ''} request RUN_ROBOT in the same tick.` };
        return { state: { ...state, tick: state.tick + 1, status: 'error', diagnostics: [...state.diagnostics, issue] },
          events: [], diagnostics: [issue] };
      }
      robotRequest = { program: program.name, pc: program.pc, line: command.line };
      events.push({ ...base, outcome: 'request' });
      program.pc++; program.waitTicks = 0; program.status = 'running'; progressed = true;
    } else if (command.kind === 'MOVE_MODEL') {
      const previous = deviceWrites.get(command.model);
      if (previous) {
        const issue = { code: 'DEVICE_WRITE_CONFLICT', tick: state.tick, model: command.model,
          programs: [previous.program, program.name], line: command.line,
          locations: [{ program: previous.program, pc: previous.pc, line: previous.line },
            { program: program.name, pc: program.pc, line: command.line }],
          message: `Programs ${previous.program}${previous.line ? ` (line ${previous.line})` : ''} and ${program.name}${command.line ? ` (line ${command.line})` : ''} move ${command.model} in the same tick.` };
        return { state: { ...state, tick: state.tick + 1, status: 'error', diagnostics: [...state.diagnostics, issue] },
          events: [], diagnostics: [issue] };
      }
      deviceWrites.set(command.model, { program: program.name, pc: program.pc, line: command.line });
      const index = axisIndex[command.axis];
      const motion = program.motion || { start: state.devices[command.model][index], elapsed: 0 };
      const elapsed = motion.elapsed + 1;
      const position = elapsed === command.durationTicks ? command.position :
        motion.start + (command.position - motion.start) * elapsed / command.durationTicks;
      events.push({ ...base, model: command.model, axis: command.axis, outcome: 'move', position,
        elapsedTicks: elapsed, durationTicks: command.durationTicks });
      program.motion = elapsed < command.durationTicks ? { start: motion.start, elapsed } : null;
      if (program.motion === null) program.pc++;
      program.waitTicks = 0; program.status = 'running'; progressed = true;
    } else if (command.kind === 'SET_SIGNAL') {
      const previous = writes.get(command.signal);
      if (previous) {
        const issue = { code: 'SIGNAL_WRITE_CONFLICT', tick: state.tick, signal: command.signal,
          programs: [previous.program, program.name], line: command.line,
          locations: [{ program: previous.program, pc: previous.pc, line: previous.line }, { program: program.name, pc: program.pc, line: command.line }],
          message: `Programs ${previous.program}${previous.line ? ` (line ${previous.line})` : ''} and ${program.name}${command.line ? ` (line ${command.line})` : ''} write ${command.signal} in the same tick.` };
        return { state: { ...state, tick: state.tick + 1, status: 'error', diagnostics: [...state.diagnostics, issue] },
          events: [], diagnostics: [issue] };
      }
      writes.set(command.signal, { program: program.name, pc: program.pc, line: command.line });
      events.push({ ...base, outcome: 'set', value: command.value });
      program.pc++; program.waitTicks = 0; program.status = 'running'; progressed = true;
    } else if (ready(command, value)) {
      events.push({ ...base, outcome: 'satisfied', observed: value });
      program.pc++; program.waitTicks = 0; program.status = 'running'; progressed = true;
    } else {
      program.waitTicks++; program.status = 'waiting';
      events.push({ ...base, outcome: 'blocked', observed: value, waitTicks: program.waitTicks });
      if (command.timeoutTicks != null && program.waitTicks >= command.timeoutTicks) {
        diagnostics.push({ code: 'WAIT_TIMEOUT', tick: state.tick, program: program.name, pc: program.pc, line: command.line,
          signal: command.signal, waitedTicks: program.waitTicks,
          message: `${program.name} waited ${program.waitTicks} logical ticks for ${command.signal}.` });
      }
    }
    if (program.pc >= program.commands.length) program.status = 'finished';
  }
  const committed = new Map(Object.entries(state.signals));
  for (const event of events) if (event.outcome === 'set') committed.set(event.signal, event.value);
  const nextSignals = Object.fromEntries([...committed].sort(([a], [b]) => compareNames(a, b)));
  const nextDevices = Object.fromEntries(Object.entries(state.devices || {}).map(([name, xyz]) => [name, [...xyz]]));
  for (const event of events) if (event.outcome === 'move') nextDevices[event.model][axisIndex[event.axis]] = event.position;
  const unfinished = programs.filter(program => program.status !== 'finished');
  if (!diagnostics.length && unfinished.length && !progressed &&
    unfinished.every(program => program.commands[program.pc].timeoutTicks == null) &&
    !unfinished.some(program => pendingSignals.has(program.commands[program.pc].signal))) {
    const waiting = unfinished.map(program => ({ program: program.name, pc: program.pc, line: program.commands[program.pc].line, signal: program.commands[program.pc].signal }));
    diagnostics.push({ code: 'DEADLOCK', tick: state.tick,
      waiting,
      message: `Every unfinished program is waiting and no program can change a signal: ${waiting.map(item => `${item.program}${item.line ? ` line ${item.line}` : ` command ${item.pc}` } on ${item.signal}`).join('; ')}.` });
  }
  const status = diagnostics.length ? diagnostics[0].code === 'WAIT_TIMEOUT' ? 'timeout' : 'deadlock'
    : unfinished.length ? 'running' : 'finished';
  return { state: { tick: state.tick + 1, signals: nextSignals, devices: nextDevices, programs, status,
    diagnostics: [...state.diagnostics, ...diagnostics] }, events, diagnostics };
}

/** Run a bounded number of logical ticks; returns the trace and immutable final state. */
export function runMultiProgram(initialState, { maxTicks = 1000 } = {}) {
  if (!Number.isInteger(maxTicks) || maxTicks < 1) throw new Error('maxTicks must be a positive logical-tick count.');
  let state = initialState;
  const trace = [];
  for (let count = 0; count < maxTicks && state.status === 'running'; count++) {
    const result = stepMultiProgram(state);
    state = result.state; trace.push(...result.events);
  }
  if (state.status === 'running') {
    const issue = { code: 'RUN_LIMIT', tick: state.tick, message: `Program run exceeded ${maxTicks} logical ticks.` };
    state = { ...state, status: 'limit', diagnostics: [...state.diagnostics, issue] };
  }
  return { state, trace, diagnostics: state.diagnostics };
}
