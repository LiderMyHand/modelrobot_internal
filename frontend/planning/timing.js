import { forwardKinematics } from './robot-model.js';
import { poseResidual } from './ik-pose.js';
import { interpolateTimedJointSegment } from '../timed-joints.js';

const smooth = u => 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5;
const smoothPrime = u => 30 * u ** 2 * (1 - u) ** 2;
const smoothSecond = u => 60 * u * (1 - u) * (1 - 2 * u);
function inverseSmooth(s) {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  let low = 0, high = 1;
  for (let i = 0; i < 48; i++) { const middle = (low + high) / 2; if (smooth(middle) < s) low = middle; else high = middle; }
  return (low + high) / 2;
}
function sampleTimes(knots, uniformCount) {
  const times = Array.from({ length: uniformCount + 1 }, (_, i) => i / uniformCount);
  for (let i = 0; i < knots.length - 1; i++) {
    const left = knots[i].s, right = knots[i + 1].s;
    for (let k = 0; k <= 16; k++) times.push(inverseSmooth(left + (right - left) * k / 16));
  }
  times.sort((a, b) => a - b);
  return times.filter((value, i) => i === 0 || value - times[i - 1] > 1e-12);
}

function interpolant(knots, s, stopAtInternalNodes = false) {
  let i = 0;
  while (i < knots.length - 2 && s > knots[i + 1].s) i++;
  const a = knots[i], b = knots[i + 1], h = b.s - a.s;
  if (!(h > 0)) throw new Error('Path fractions must increase strictly.');
  const u = Math.max(0, Math.min(1, (s - a.s) / h));
  const tangent = (index, joint) => {
    if (stopAtInternalNodes && index > 0 && index < knots.length - 1) return 0;
    const left = knots[Math.max(0, index - 1)], right = knots[Math.min(knots.length - 1, index + 1)];
    return (right.q[joint] - left.q[joint]) / (right.s - left.s);
  };
  const q = [], d1 = [], d2 = [];
  for (let k = 0; k < a.q.length; k++) {
    const m0 = tangent(i, k), m1 = tangent(i + 1, k), q0 = a.q[k], q1 = b.q[k];
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    q.push(h00 * q0 + h10 * h * m0 + h01 * q1 + h11 * h * m1);
    d1.push(((6 * u ** 2 - 6 * u) * q0 + (3 * u ** 2 - 4 * u + 1) * h * m0 + (-6 * u ** 2 + 6 * u) * q1 + (3 * u ** 2 - 2 * u) * h * m1) / h);
    d2.push(((12 * u - 6) * q0 + (6 * u - 4) * h * m0 + (-12 * u + 6) * q1 + (6 * u - 2) * h * m1) / (h * h));
  }
  return { q, d1, d2 };
}

function validateKnots(jointPath, limits) {
  if (!Array.isArray(jointPath) || jointPath.length < 2 || jointPath[0].s !== 0 || jointPath.at(-1).s !== 1) return 'Path needs at least two knots from s=0 to s=1.';
  const n = jointPath[0].q?.length;
  if (!(n > 0) || !jointPath.every((knot, i) => Number.isFinite(knot.s) && (i === 0 || knot.s > jointPath[i - 1].s) && Array.isArray(knot.q) && knot.q.length === n && knot.q.every(Number.isFinite))) return 'Path knots must have increasing fractions and finite joint vectors.';
  if (!Array.isArray(limits?.velocity) || !Array.isArray(limits?.acceleration) || limits.velocity.length !== n || limits.acceleration.length !== n ||
      ![...limits.velocity, ...limits.acceleration].every(value => Number.isFinite(value) && value > 0)) return 'Each joint needs positive velocity and acceleration limits.';
  return null;
}

function onePass(jointPath, limits, options, stopAtInternalNodes) {
  const model = options.model;
  const gridTimes = sampleTimes(jointPath, 200);
  let duration = options.minimumDuration ?? 0.01;
  for (const u of gridTimes) {
    const s = smooth(u), { d1, d2 } = interpolant(jointPath, s, stopAtInternalNodes);
    const ds = smoothPrime(u), dds = smoothSecond(u);
    for (let j = 0; j < d1.length; j++) {
      duration = Math.max(duration, Math.abs(d1[j] * ds) / limits.velocity[j]);
      duration = Math.max(duration, Math.sqrt(Math.abs(d2[j] * ds * ds + d1[j] * dds) / limits.acceleration[j]));
    }
  }
  duration *= 1.02;
  for (let attempt = 0; attempt < 4; attempt++) {
    const count = Math.max(2, Math.ceil(duration / Math.min(options.dt ?? 0.02, 0.02)));
    if (count + jointPath.length * 17 > (options.maxPoints ?? 200000)) return { status: 'sample_budget', reason: 'Timed path would exceed the playback sample budget.' };
    const points = [];
    let ratio = 1;
    for (const u of sampleTimes(jointPath, count)) {
      const s = smooth(u), { q, d1, d2 } = interpolant(jointPath, s, stopAtInternalNodes);
      const ds = smoothPrime(u) / duration, dds = smoothSecond(u) / (duration * duration);
      const velocity = d1.map(value => value * ds), acceleration = d2.map((value, index) => value * ds * ds + d1[index] * dds);
      for (let j = 0; j < q.length; j++) ratio = Math.max(ratio, Math.abs(velocity[j]) / limits.velocity[j], Math.sqrt(Math.abs(acceleration[j]) / limits.acceleration[j]));
      if (options.isStateValid && !options.isStateValid(q)) return { status: 'collision', reason: 'Timed path intersects an obstacle.', at: s };
      if (model && q.some((value, j) => { const joint = model.joints[model.active[j]]; return joint.type !== 'continuous' && (value < joint.lower - 1e-9 || value > joint.upper + 1e-9); })) return { status: 'joint_limit', reason: 'Smoothed path crosses a joint limit.', at: s };
      if (model && options.cartesianPath) {
        const residual = poseResidual(forwardKinematics(model, q), options.cartesianPath.at(s));
        if (residual.positionError > (options.pathTolerance ?? 0.002) || residual.orientationError > (options.orientationPathTolerance ?? 0.02)) {
          return { status: 'geometry_deviation', reason: 'Timed joint interpolation deviates from the commanded TCP path.', at: s,
            positionError: residual.positionError, orientationError: residual.orientationError };
        }
      }
      points.push({ time: u * duration, q, velocity, acceleration, s });
    }
    // Browser replay uses these endpoint derivatives, so validate the same
    // quintic between stored samples rather than only its endpoint states.
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const states = [a];
      for (const fraction of [0.25, 0.5, 0.75]) {
        const at = a.time + (b.time - a.time) * fraction;
        const state = interpolateTimedJointSegment(a, b, at);
        const s = smooth(at / duration);
        for (let j = 0; j < state.q.length; j++) {
          ratio = Math.max(ratio, Math.abs(state.velocity[j]) / limits.velocity[j],
            Math.sqrt(Math.abs(state.acceleration[j]) / limits.acceleration[j]));
        }
        if (options.isStateValid && !options.isStateValid(state.q))
          return { status: 'collision', reason: 'Rendered trajectory intersects an obstacle between timed samples.', at: s };
        if (model && state.q.some((value, j) => { const joint = model.joints[model.active[j]];
          return joint.type !== 'continuous' && (value < joint.lower - 1e-9 || value > joint.upper + 1e-9); }))
          return { status: 'joint_limit', reason: 'Rendered trajectory crosses a joint limit between timed samples.', at: s };
        if (model && options.cartesianPath) {
          const residual = poseResidual(forwardKinematics(model, state.q), options.cartesianPath.at(s));
          if (residual.positionError > (options.pathTolerance ?? 0.002) ||
              residual.orientationError > (options.orientationPathTolerance ?? 0.02))
            return { status: 'geometry_deviation', reason: 'Rendered trajectory deviates from the commanded TCP path between timed samples.',
              at: s, positionError: residual.positionError, orientationError: residual.orientationError };
        }
        states.push(state);
      }
      states.push(b);
      if (options.isEdgeValid) for (let j = 1; j < states.length; j++) {
        if (!options.isEdgeValid(states[j - 1].q, states[j].q))
          return { status: 'collision', reason: 'Rendered trajectory crosses an obstacle between timed samples.',
            at: smooth((a.time + (b.time - a.time) * j / 4) / duration) };
      }
    }
    if (ratio <= 1 + 1e-9) return { status: 'timed', duration, points, internalStops: stopAtInternalNodes && jointPath.length > 2 };
    duration *= ratio * 1.02;
  }
  return { status: 'limit_violation', reason: 'Could not time-scale the path within velocity and acceleration limits.' };
}

/** Smooth and retime a verified geometric path. Returns sampled ROS-like joint trajectory points. */
export function timeParameterize(jointPath, limits, options = {}) {
  const issue = validateKnots(jointPath, limits);
  if (issue) return { status: 'invalid_target', reason: issue };
  if (!(options.dt == null || (Number.isFinite(options.dt) && options.dt > 0))) return { status: 'invalid_target', reason: 'Playback sample interval must be positive.' };
  if (!(options.minimumDuration == null || (Number.isFinite(options.minimumDuration) && options.minimumDuration > 0))) return { status: 'invalid_target', reason: 'Minimum duration must be positive.' };
  let result = onePass(jointPath, limits, options, false);
  if (['collision','joint_limit','geometry_deviation'].includes(result.status) && options.allowInternalStops && jointPath.length > 2) {
    const points = [], durations = [];
    let elapsed = 0, failed = null;
    for (let i = 0; i < jointPath.length - 1; i++) {
      const a = jointPath[i], b = jointPath[i + 1];
      const segment = onePass([{ s: 0, q: a.q }, { s: 1, q: b.q }], limits, {
        ...options,
        cartesianPath: options.cartesianPath ? { at: local => options.cartesianPath.at(a.s + (b.s - a.s) * local) } : null,
      }, false);
      if (segment.status !== 'timed') { failed = segment; break; }
      for (const point of segment.points.slice(i ? 1 : 0)) points.push({ ...point, time: point.time + elapsed, s: a.s + (b.s - a.s) * point.s });
      elapsed += segment.duration; durations.push(segment.duration);
    }
    if (!failed) result = { status: 'timed', duration: elapsed, points, internalStops: true, segmentDurations: durations };
  }
  return result;
}
