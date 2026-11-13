import { stepMultiProgram } from './multi-program-scheduler.js';
import { copyTimedJointSamples, timedJointStateAt } from './timed-joints.js';

const EPS = 1e-10;
const reservedSignal = 'robot_done';

function validSamples(samples) {
  return Array.isArray(samples) && samples.length > 0 && samples[0].time === 0 &&
    Array.isArray(samples[0].q) && samples[0].q.length > 0 &&
    samples.every((sample, index) => Number.isFinite(sample.time) && sample.time >= 0 &&
      Array.isArray(sample.q) && sample.q.length === samples[0].q.length && sample.q.every(Number.isFinite) &&
      (index === 0 || sample.time > samples[index - 1].time));
}

function qAt(samples, timeSeconds) {
  return timedJointStateAt(samples, timeSeconds).q;
}

function touchedByRobot(events) {
  const names = new Set();
  for (const event of events) {
    if (event.kind === 'GRAB' || event.kind === 'RELEASE') names.add(event.object);
    if (event.kind === 'WELD_JOIN') { names.add(event.child); names.add(event.parent); }
  }
  return names;
}

/**
 * Share a simulation-time clock between an already planned robot trajectory and
 * concurrent signal/device programs. The robot plan starts at t=0. A device
 * may move only after that plan ends, because its collision snapshot is fixed.
 */
export function createSharedClock({ samples, schedulerState, robotEvents = [], tickSeconds = 0.1, maxTicks = 10000 }) {
  if (!validSamples(samples)) throw new Error('Shared clock needs strictly increasing finite robot samples from t=0.');
  if (!Number.isFinite(tickSeconds) || tickSeconds <= 0) throw new Error('tickSeconds must be a positive finite duration.');
  if (!Number.isSafeInteger(maxTicks) || maxTicks < 1) throw new Error('maxTicks must be a positive safe integer.');
  if (!schedulerState || !['running', 'finished'].includes(schedulerState.status) || schedulerState.tick !== 0 ||
      !Array.isArray(schedulerState.programs) || !schedulerState.signals || !schedulerState.devices)
    throw new Error('Shared clock needs an initial multi-program scheduler state at tick zero.');
  if (!Array.isArray(robotEvents)) throw new Error('robotEvents must be an array.');
  if (schedulerState.signals[reservedSignal] != null && schedulerState.signals[reservedSignal] !== 0)
    throw new Error(`${reservedSignal} is a reserved read-only signal and must start at zero.`);
  const touched = touchedByRobot(robotEvents);
  for (const program of schedulerState.programs) for (const command of program.commands) {
    if (command.kind === 'SET_SIGNAL' && command.signal === reservedSignal)
      throw new Error(`${program.name}${command.line ? ` line ${command.line}` : ''}: ${reservedSignal} is a reserved read-only signal.`);
    if (command.kind === 'MOVE_MODEL' && touched.has(command.model))
      throw new Error(`${program.name}${command.line ? ` line ${command.line}` : ''}: model ${command.model} is changed by the robot plan and cannot be driven by MOVE_MODEL in the same run.`);
  }
  const copiedSamples = copyTimedJointSamples(samples);
  const robotDuration = copiedSamples.at(-1).time;
  const programs = structuredClone(schedulerState);
  programs.signals[reservedSignal] = robotDuration === 0 ? 1 : 0;
  return { timeSeconds: 0, tickSeconds, maxTicks, robotDuration, samples: copiedSamples,
    schedulerState: programs, q: [...copiedSamples[0].q],
    status: robotDuration === 0 && programs.status === 'finished' ? 'finished' : 'running', diagnostics: [] };
}

/** Advance monotonically; scheduler commands commit at integer tick boundaries. */
export function advanceSharedClockTo(clock, targetSeconds) {
  if (!clock || !Number.isFinite(targetSeconds) || targetSeconds < clock.timeSeconds - EPS)
    throw new Error('Shared clock target must be finite and no earlier than the current time.');
  if (clock.status !== 'running') return { state: clock, events: [], diagnostics: [] };
  let state = clock, events = [];
  while (state.schedulerState.status === 'running') {
    const tick = state.schedulerState.tick;
    if (tick >= state.maxTicks) {
      const issue = { code: 'RUN_LIMIT', tick, message: `Shared program exceeded ${state.maxTicks} logical ticks.` };
      return { state: { ...state, status: 'limit', diagnostics: [...state.diagnostics, issue] }, events, diagnostics: [issue] };
    }
    const tickStart = tick * state.tickSeconds;
    const tickEnd = (tick + 1) * state.tickSeconds;
    if (tickEnd > targetSeconds + EPS) break;
    const robotFinished = tickStart >= state.robotDuration - EPS;
    const signalState = { ...state.schedulerState, signals: { ...state.schedulerState.signals, [reservedSignal]: robotFinished ? 1 : 0 } };
    const step = stepMultiProgram(signalState, { externalPendingSignals: robotFinished ? [] : [reservedSignal] });
    const moving = step.events.filter(event => event.kind === 'MOVE_MODEL' && event.outcome === 'move');
    if (moving.length && !robotFinished) {
      const first = moving[0];
      const issue = { code: 'UNSAFE_DEVICE_TIMING', tick, timeSeconds: tickStart,
        program: first.program, line: first.line, model: first.model,
        message: `${first.program}${first.line ? ` line ${first.line}` : ''}: MOVE_MODEL ${first.model} starts before the preplanned robot trajectory ends at ${state.robotDuration} s.` };
      return { state: { ...state, status: 'error', diagnostics: [...state.diagnostics, issue] }, events, diagnostics: [issue] };
    }
    const stamped = step.events.map(event => ({ ...event, timeSeconds: tickEnd }));
    events = [...events, ...stamped];
    state = { ...state, timeSeconds: tickEnd, q: qAt(state.samples, tickEnd),
      schedulerState: step.state };
    if (step.state.status !== 'running' && step.state.status !== 'finished') {
      return { state: { ...state, status: step.state.status, diagnostics: [...state.diagnostics, ...step.diagnostics] },
        events, diagnostics: step.diagnostics };
    }
  }
  const robotDoneTime = Math.ceil((state.robotDuration - EPS) / state.tickSeconds) * state.tickSeconds;
  const endTime = Math.max(robotDoneTime, state.schedulerState.tick * state.tickSeconds);
  const timeSeconds = state.schedulerState.status === 'finished' ? Math.min(targetSeconds, endTime) : targetSeconds;
  const doneBoundary = Math.floor((timeSeconds + EPS) / state.tickSeconds) * state.tickSeconds >= state.robotDuration - EPS;
  const schedulerState = doneBoundary && state.schedulerState.signals[reservedSignal] !== 1 ?
    { ...state.schedulerState, signals: { ...state.schedulerState.signals, [reservedSignal]: 1 } } : state.schedulerState;
  const status = doneBoundary && schedulerState.status === 'finished' ? 'finished' : 'running';
  return { state: { ...state, timeSeconds, q: qAt(state.samples, timeSeconds), schedulerState, status }, events, diagnostics: [] };
}

/** Advance exactly one logical tick, with a robot pose at that tick boundary. */
export function stepSharedClock(clock) {
  if (!clock) throw new Error('Shared clock is required.');
  return advanceSharedClockTo(clock, (Math.floor((clock.timeSeconds + EPS) / clock.tickSeconds) + 1) * clock.tickSeconds);
}
