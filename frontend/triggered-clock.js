import { stepMultiProgram } from './multi-program-scheduler.js';
import { copyTimedJointSamples, timedJointStateAt } from './timed-joints.js';

const EPS = 1e-10;
const DONE = 'robot_done';
const finiteQ = q => Array.isArray(q) && q.length > 0 && q.every(Number.isFinite);

function validSamples(samples) {
  return Array.isArray(samples) && samples.length > 0 && samples[0].time === 0 && finiteQ(samples[0].q) &&
    samples.every((sample, index) => Number.isFinite(sample.time) && sample.time >= 0 &&
      finiteQ(sample.q) && sample.q.length === samples[0].q.length &&
      (index === 0 || sample.time > samples[index - 1].time));
}

function qAt(samples, time) {
  return timedJointStateAt(samples, time).q;
}

function touchedByRobot(events) {
  const names = new Set();
  for (const event of events) {
    if (event.kind === 'GRAB' || event.kind === 'RELEASE') names.add(event.object);
    if (event.kind === 'WELD_JOIN') { names.add(event.child); names.add(event.parent); }
  }
  return names;
}

function issue(clock, code, message, details = {}) {
  const diagnostic = { code, tick: clock.tick, timeSeconds: clock.timeSeconds, message, ...details };
  return { state: { ...clock, status: 'error', diagnostics: [...clock.diagnostics, diagnostic] },
    events: [], request: null, diagnostics: [diagnostic] };
}

/**
 * Deterministic command-time clock. RUN_ROBOT requests are sequential; each
 * accepted request starts a fresh trajectory from the current robot pose.
 * Planning is external: a request freezes the clock until acceptRobotPlan or
 * rejectRobotPlan is called. initialQ, when supplied, uses planned-sample joint
 * order; omit it if that order is unknown before planning.
 */
export function createTriggeredClock({ schedulerState, initialQ = null, tickSeconds = 0.1, maxTicks = 10000 }) {
  if (!schedulerState || schedulerState.tick !== 0 || !['running', 'finished'].includes(schedulerState.status) ||
      !Array.isArray(schedulerState.programs) || !schedulerState.signals || !schedulerState.devices)
    throw new Error('Triggered clock needs an initial multi-program state at tick zero.');
  if (initialQ !== null && !finiteQ(initialQ)) throw new Error('initialQ must be a finite joint vector or null.');
  if (!Number.isFinite(tickSeconds) || tickSeconds <= 0) throw new Error('tickSeconds must be a positive finite duration.');
  if (!Number.isSafeInteger(maxTicks) || maxTicks < 1) throw new Error('maxTicks must be a positive safe integer.');
  if (schedulerState.signals[DONE] != null && schedulerState.signals[DONE] !== 0)
    throw new Error(`${DONE} is a reserved read-only signal and must start at zero.`);
  const requests = schedulerState.programs.flatMap(program => program.commands
    .filter(command => command.kind === 'RUN_ROBOT').map(command => ({ program: program.name, line: command.line })));
  if (!requests.length) throw new Error('Triggered run needs at least one RUN_ROBOT command.');
  for (const program of schedulerState.programs) for (const command of program.commands) {
    if (command.kind === 'SET_SIGNAL' && command.signal === DONE)
      throw new Error(`${program.name}${command.line ? ` line ${command.line}` : ''}: ${DONE} is reserved and read-only.`);
  }
  const copied = structuredClone(schedulerState);
  copied.signals[DONE] = 0;
  return { timeSeconds: 0, tick: 0, tickSeconds, maxTicks, schedulerState: copied,
    q: initialQ && [...initialQ], robot: { status: 'idle', startTime: null, duration: null, samples: [], events: [], touchedModels: [] },
    request: null, requestCount: 0, status: 'running', diagnostics: [] };
}

/** Advance one logical tick. The request event is emitted at the tick's end. */
export function stepTriggeredClock(clock) {
  if (!clock) throw new Error('Triggered clock is required.');
  if (clock.status !== 'running') return { state: clock, events: [], request: null, diagnostics: [] };
  if (clock.tick >= clock.maxTicks) {
    const diagnostic = { code: 'RUN_LIMIT', tick: clock.tick, timeSeconds: clock.timeSeconds,
      message: `Triggered run exceeded ${clock.maxTicks} logical ticks.` };
    return { state: { ...clock, status: 'limit', diagnostics: [...clock.diagnostics, diagnostic] },
      events: [], request: null, diagnostics: [diagnostic] };
  }
  const tickStart = clock.tick * clock.tickSeconds;
  const tickEnd = (clock.tick + 1) * clock.tickSeconds;
  const robotEnd = clock.robot.status === 'moving' ? clock.robot.startTime + clock.robot.duration : null;
  const robotActive = robotEnd !== null && tickStart < robotEnd - EPS;
  const robotDoneAtStart = clock.robot.status === 'done' || robotEnd !== null && !robotActive;
  const schedulerAtStart = { ...clock.schedulerState,
    signals: { ...clock.schedulerState.signals, [DONE]: robotDoneAtStart ? 1 : 0 } };
  const stepped = schedulerAtStart.status === 'running' ?
    stepMultiProgram(schedulerAtStart, { allowRobotRequest: true,
      externalPendingSignals: robotActive ? [DONE] : [] }) :
    { state: schedulerAtStart, events: [], diagnostics: [] };
  if (!['running', 'finished'].includes(stepped.state.status)) {
    const diagnostic = stepped.diagnostics[0] || { code: 'PROGRAM_ERROR', message: 'Concurrent program failed.' };
    return { state: { ...clock, status: stepped.state.status,
      diagnostics: [...clock.diagnostics, ...stepped.diagnostics] },
      events: [], request: null, diagnostics: [diagnostic] };
  }
  const moves = stepped.events.filter(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move');
  if (robotActive && moves.length) {
    const first = moves[0];
    return issue(clock, 'UNSAFE_DEVICE_TIMING',
      `${first.program}${first.line ? ` line ${first.line}` : ''}: MOVE_MODEL ${first.model} overlaps the active robot trajectory.`,
      { program: first.program, line: first.line, model: first.model });
  }
  const staleMove = moves.find(event => robotDoneAtStart && clock.robot.touchedModels.includes(event.model));
  if (staleMove) {
    return issue(clock, 'ROBOT_OBJECT_DEVICE_CONFLICT',
      `${staleMove.program}${staleMove.line ? ` line ${staleMove.line}` : ''}: MOVE_MODEL ${staleMove.model} needs a current scene-pose synchronization after robot handling.`,
      { program: staleMove.program, line: staleMove.line, model: staleMove.model });
  }
  const requests = stepped.events.filter(event => event.kind === 'RUN_ROBOT' && event.outcome === 'request');
  if (requests.length && robotActive) {
    const first = requests[0];
    return issue(clock, 'ROBOT_BUSY',
      `${first.program}${first.line ? ` line ${first.line}` : ''}: RUN_ROBOT cannot start while the previous robot trajectory is active.`,
      { program: first.program, line: first.line });
  }
  const requested = requests[0] ? { program: requests[0].program, line: requests[0].line,
    tick: clock.tick, timeSeconds: tickEnd } : null;
  const robotDoneAtEnd = clock.robot.status === 'done' || robotEnd !== null && tickEnd >= robotEnd - EPS;
  const robot = requested ? { ...clock.robot, status: 'planning' } :
    robotDoneAtEnd && clock.robot.status === 'moving' ? { ...clock.robot, status: 'done' } : clock.robot;
  const schedulerState = { ...stepped.state,
    signals: { ...stepped.state.signals, [DONE]: requested ? 0 : robotDoneAtEnd ? 1 : 0 } };
  const q = clock.robot.samples.length ? qAt(clock.robot.samples, tickEnd - clock.robot.startTime) : clock.q;
  const status = requested ? 'planning' : schedulerState.status === 'finished' && robot.status === 'done' ? 'finished' : 'running';
  const events = stepped.events.map(event => ({ ...event, timeSeconds: tickEnd }));
  return { state: { ...clock, tick: clock.tick + 1, timeSeconds: tickEnd, schedulerState,
      q, robot, request: requested, requestCount: clock.requestCount + (requested ? 1 : 0), status }, events, request: requested, diagnostics: [] };
}

/** Attach a Worker-planned trajectory at the frozen RUN_ROBOT boundary. */
export function acceptRobotPlan(clock, { samples, events = [] }) {
  if (!clock || clock.status !== 'planning' || !clock.request) throw new Error('A RUN_ROBOT planning request is required.');
  if (!validSamples(samples)) throw new Error('Robot plan needs strictly increasing finite samples from t=0.');
  if (!Array.isArray(events)) throw new Error('Robot plan events must be an array.');
  if (clock.q && (clock.q.length !== samples[0].q.length ||
      clock.q.some((value, index) => Math.abs(value - samples[0].q[index]) > 1e-6)))
    throw new Error('Planned robot start joints differ from the current joint state.');
  const touched = new Set([...(clock.robot.touchedModels || []), ...touchedByRobot(events)]);
  const copied = copyTimedJointSamples(samples);
  const duration = copied.at(-1).time;
  const robot = { status: duration === 0 ? 'done' : 'moving', startTime: clock.timeSeconds,
    duration, samples: copied, events: structuredClone(events), touchedModels: [...touched] };
  const schedulerState = duration === 0 ? { ...clock.schedulerState,
    signals: { ...clock.schedulerState.signals, [DONE]: 1 } } : clock.schedulerState;
  return { ...clock, robot, q: [...copied[0].q], schedulerState, request: null,
    status: duration === 0 && schedulerState.status === 'finished' ? 'finished' : 'running' };
}

/** Convert a Worker planning failure into a terminal, source-located result. */
export function rejectRobotPlan(clock, diagnostic) {
  if (!clock || clock.status !== 'planning' || !clock.request) throw new Error('A RUN_ROBOT planning request is required.');
  const issue = { code: diagnostic?.code || 'ROBOT_PLAN_FAILED', program: clock.request.program,
    line: clock.request.line, tick: clock.tick, timeSeconds: clock.timeSeconds,
    message: diagnostic?.message || 'Robot planning failed.' };
  return { ...clock, status: 'error', request: null, diagnostics: [...clock.diagnostics, issue] };
}

/** Rebase scheduler device origins from the rendered world after robot events. */
export function syncTriggeredDevices(clock, capturedDevices) {
  if (!clock || !['running', 'finished'].includes(clock.status) || clock.robot.status !== 'done' ||
      !capturedDevices || typeof capturedDevices !== 'object' || Array.isArray(capturedDevices))
    throw new Error('A completed robot plan and device-origin map are required.');
  const devices = Object.fromEntries(Object.entries(clock.schedulerState.devices).map(([name, xyz]) => [name, [...xyz]]));
  for (const [name, xyz] of Object.entries(capturedDevices)) {
    if (!Object.hasOwn(devices, name) || !Array.isArray(xyz) || xyz.length !== 3 || !xyz.every(Number.isFinite))
      throw new Error(`Device ${name} needs three finite world coordinates from the current scene.`);
    devices[name] = [...xyz];
  }
  const synchronized = new Set(Object.keys(capturedDevices));
  return { ...clock, robot: { ...clock.robot,
      touchedModels: clock.robot.touchedModels.filter(name => !synchronized.has(name)) },
    schedulerState: { ...clock.schedulerState, devices } };
}
