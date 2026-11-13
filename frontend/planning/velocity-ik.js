import { Quaternion, Vector3 } from 'three';
import { forwardKinematics } from './robot-model.js';

const finite = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
const norm = values => Math.hypot(...values);

/**
 * Geometric TCP Jacobian in the world frame. Rows are [vx, vy, vz, wx, wy, wz]
 * and columns follow model.jointNames. Linear velocity is at the TCP origin.
 */
export function geometricJacobian(model, q) {
  const pose = forwardKinematics(model, q, { frames: true });
  const tip = new Vector3(...pose.position);
  const columns = pose.frames.map(({ origin, axis, type }) => {
    const linear = type === 'prismatic' ? axis : new Vector3().crossVectors(axis, tip.clone().sub(origin));
    const angular = type === 'prismatic' ? new Vector3() : axis;
    return [...linear.toArray(), ...angular.toArray()];
  });
  return Array.from({ length: 6 }, (_, row) => columns.map(column => column[row]));
}

function solveLinear(matrix, right) {
  const n = right.length, a = matrix.map((row, index) => [...row, right[index]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    if (Math.abs(a[pivot][col]) < 1e-15) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const divisor = a[col][col];
    for (let column = col; column <= n; column++) a[col][column] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let column = col; column <= n; column++) a[row][column] -= factor * a[col][column];
    }
  }
  return a.map(row => row[n]);
}

function numericalRank(columns) {
  const basis = [], largest = Math.max(0, ...columns.map(norm));
  if (largest < 1e-12) return 0;
  for (const column of columns) {
    const remaining = [...column];
    for (const direction of basis) {
      const dot = direction.reduce((sum, value, row) => sum + value * remaining[row], 0);
      for (let row = 0; row < remaining.length; row++) remaining[row] -= dot * direction[row];
    }
    const length = norm(remaining);
    if (length > largest * 1e-7) basis.push(remaining.map(value => value / length));
  }
  return basis.length;
}

function rotateTwist(twist, quaternion, inverse = false) {
  const rotation = new Quaternion(...quaternion).normalize();
  if (inverse) rotation.invert();
  return [
    ...new Vector3(...twist.slice(0, 3)).applyQuaternion(rotation).toArray(),
    ...new Vector3(...twist.slice(3, 6)).applyQuaternion(rotation).toArray(),
  ];
}

/**
 * Inverse velocity kinematics for one serial-model state.
 *
 * `twist` is TCP linear [m/s] and angular [rad/s] velocity, expressed in
 * options.frame ('world' or 'tool'). The tool frame is at the current TCP, so
 * changing expression frame rotates both three-vectors without a lever-arm
 * term. The returned qdot follows model.jointNames; `achieved` and `residual`
 * use the requested frame. `dt` bounds the next Euler step by joint positions.
 *
 * A bounded damped least-squares active set handles joint rate/position caps.
 * Infeasible commands return `limited` or `singular` with the best bounded
 * qdot and actual twist; callers decide whether to apply that approximation.
 */
export function solveVelocity(model, q, twist, options = {}) {
  const n = model?.jointNames?.length;
  if (!Number.isInteger(n) || n < 1 || !finite(q, n) || !finite(twist, 6))
    return { status: 'invalid_target', reason: 'Velocity IK needs a finite joint state and six-component TCP twist.' };
  const frame = options.frame ?? 'world';
  if (!['world', 'tool'].includes(frame)) return { status: 'invalid_target', reason: 'Velocity frame must be world or tool.' };
  const dt = options.dt ?? 0.05, damping = options.damping ?? 1e-4;
  const orientationWeight = options.orientationWeight ?? 0.25;
  const translationTolerance = options.translationTolerance ?? 1e-4;
  const rotationTolerance = options.rotationTolerance ?? 1e-3;
  if (![dt, damping, orientationWeight, translationTolerance, rotationTolerance]
    .every(value => Number.isFinite(value) && value > 0))
    return { status: 'invalid_target', reason: 'Velocity IK step, damping, weight, and tolerances must be positive.' };
  const velocityLimits = options.velocityLimits ?? options.limits?.velocity ?? Array(n).fill(Infinity);
  if (!Array.isArray(velocityLimits) || velocityLimits.length !== n ||
      !velocityLimits.every(value => value === Infinity || Number.isFinite(value) && value > 0))
    return { status: 'invalid_target', reason: 'Velocity limits must be positive in active-joint order.' };
  const pose = forwardKinematics(model, q);
  const requestedWorld = frame === 'tool' ? rotateTwist(twist, pose.quaternion) : [...twist];
  const jacobian = geometricJacobian(model, q);
  const weights = [1, 1, 1, orientationWeight, orientationWeight, orientationWeight];
  const columns = Array.from({ length: n }, (_, column) => jacobian.map((row, index) => row[column] * weights[index]));
  const target = requestedWorld.map((value, index) => value * weights[index]);
  const rank = numericalRank(columns);
  const lower = [], upper = [];
  for (let index = 0; index < n; index++) {
    const joint = model.joints[model.active[index]];
    const limit = velocityLimits[index];
    const low = joint.type === 'continuous' ? -Infinity : (joint.lower - q[index]) / dt;
    const high = joint.type === 'continuous' ? Infinity : (joint.upper - q[index]) / dt;
    lower.push(Math.max(-limit, low)); upper.push(Math.min(limit, high));
    if (lower[index] > upper[index] + 1e-12)
      return { status: 'invalid_target', reason: `Joint ${model.jointNames[index]} starts outside its position limit.` };
  }
  const qdot = Array(n).fill(0), free = new Set(Array.from({ length: n }, (_, index) => index));
  const limited = new Set();
  while (free.size) {
    const indices = [...free];
    const remainder = target.map((value, row) => value - qdot.reduce((sum, rate, index) =>
      sum + (free.has(index) ? 0 : columns[index][row] * rate), 0));
    const normal = indices.map(i => indices.map(j => columns[i].reduce((sum, value, row) =>
      sum + value * columns[j][row], i === j ? damping * damping : 0)));
    const right = indices.map(i => columns[i].reduce((sum, value, row) => sum + value * remainder[row], 0));
    const candidate = solveLinear(normal, right);
    if (!candidate) return { status: 'numerical_failure', reason: 'Damped velocity IK linear solve failed.' };
    let worst = null;
    for (let slot = 0; slot < indices.length; slot++) {
      const index = indices[slot], value = candidate[slot];
      const bound = value < lower[index] ? lower[index] : value > upper[index] ? upper[index] : null;
      if (bound == null) continue;
      const excess = Math.abs(value - bound);
      if (!worst || excess > worst.excess) worst = { index, bound, excess };
    }
    if (!worst) {
      for (let slot = 0; slot < indices.length; slot++) qdot[indices[slot]] = candidate[slot];
      break;
    }
    qdot[worst.index] = worst.bound;
    free.delete(worst.index); limited.add(worst.index);
  }
  const achievedWorld = jacobian.map(row => row.reduce((sum, value, index) => sum + value * qdot[index], 0));
  const achieved = frame === 'tool' ? rotateTwist(achievedWorld, pose.quaternion, true) : achievedWorld;
  const residual = twist.map((value, index) => value - achieved[index]);
  const translationError = norm(residual.slice(0, 3)), rotationError = norm(residual.slice(3, 6));
  const status = translationError <= translationTolerance && rotationError <= rotationTolerance ? 'solved' :
    limited.size ? 'limited' : 'singular';
  return { status, qdot, achieved, residual, translationError, rotationError, rank,
    limitedJoints: [...limited].map(index => model.jointNames[index]),
    nextQ: q.map((value, index) => value + dt * qdot[index]),
    ...(status === 'limited' ? { reason: `Joint velocity or position limit prevents the requested TCP twist (${[...limited].map(index => model.jointNames[index]).join(', ')}).` } : {}),
    ...(status === 'singular' ? { reason: 'Requested TCP twist is outside the local Jacobian range at this configuration.' } : {}) };
}
