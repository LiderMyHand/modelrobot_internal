import { Quaternion, Vector3 } from 'three';
import { clampConfiguration, forwardKinematics } from './robot-model.js';

const norm = values => Math.hypot(...values);
const finite = (values, length) => Array.isArray(values) && values.length === length && values.every(Number.isFinite);

function orientationError(actual, target) {
  const a = new Quaternion(...actual).normalize(), b = new Quaternion(...target).normalize();
  const delta = b.multiply(a.invert()).normalize();
  if (delta.w < 0) delta.set(-delta.x, -delta.y, -delta.z, -delta.w);
  const sine = Math.hypot(delta.x, delta.y, delta.z);
  const angle = 2 * Math.atan2(sine, delta.w);
  return sine < 1e-12 ? [0, 0, 0] : [delta.x * angle / sine, delta.y * angle / sine, delta.z * angle / sine];
}

export function poseResidual(actual, target) {
  const translation = target.position.map((value, index) => value - actual.position[index]);
  const rotation = orientationError(actual.quaternion, target.quaternion);
  return { translation, rotation, positionError: norm(translation), orientationError: norm(rotation) };
}

function solveLinear(matrix, right) {
  const n = right.length, a = matrix.map((row, i) => [...row, right[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    if (Math.abs(a[pivot][col]) < 1e-15) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const divisor = a[col][col];
    for (let k = col; k <= n; k++) a[col][k] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let k = col; k <= n; k++) a[row][k] -= factor * a[col][k];
    }
  }
  return a.map(row => row[n]);
}

function jacobian(model, q, tipPosition, frames, orientationWeight) {
  const tip = new Vector3(...tipPosition);
  return frames.map(({ origin, axis, type }) => {
    const linear = type === 'prismatic' ? axis : new Vector3().crossVectors(axis, tip.clone().sub(origin));
    const angular = type === 'prismatic' ? new Vector3() : axis;
    return [...linear.toArray(), ...angular.multiplyScalar(orientationWeight).toArray()];
  });
}

function targetScore(residual, weight) { return Math.hypot(residual.positionError, residual.orientationError * weight); }

/** Solve a full TCP position and orientation target. This method is pure and Worker-safe. */
export function solvePose(model, target, options = {}) {
  if (!finite(target?.position, 3) || !finite(target?.quaternion, 4) || norm(target.quaternion) < 1e-12) {
    return { status: 'invalid_target', reason: 'Target needs a finite position and nonzero quaternion.' };
  }
  const n = model.active.length;
  const seed = options.seed ?? model.initial;
  if (!finite(seed, n)) return { status: 'invalid_target', reason: 'Seed configuration is invalid.' };
  const positionTolerance = options.positionTolerance ?? 1e-4;
  const orientationTolerance = options.orientationTolerance ?? 1e-3;
  const orientationWeight = options.orientationWeight ?? 0.25;
  const maxIterations = options.maxIterations ?? 160;
  const maxStarts = options.maxStarts ?? 1 + n * 4;
  if (![positionTolerance, orientationTolerance, orientationWeight].every(value => Number.isFinite(value) && value > 0) ||
      !Number.isInteger(maxIterations) || maxIterations < 0 || !Number.isInteger(maxStarts) || maxStarts < 1) {
    return { status: 'invalid_target', reason: 'IK tolerances and weight must be positive; iteration and restart budgets must be valid integers.' };
  }
  const isStateValid = options.isStateValid ?? (() => true);
  const attempts = [clampConfiguration(model, [...seed])];
  // Deterministic restarts help a fully extended arm leave a Jacobian singularity.
  const offset = [0.12, -0.12, 0.5, -0.5];
  for (let k = 0; k < n && attempts.length < maxStarts; k++) {
    for (const delta of offset) {
      if (attempts.length >= maxStarts) break;
      const restart = [...seed];
      restart[k] += model.joints[model.active[k]].type === 'prismatic' ? delta * 0.1 : delta;
      attempts.push(clampConfiguration(model, restart));
    }
  }
  let best = null;
  for (const start of attempts) {
    let q = start, damping = 0.03;
    for (let iteration = 0; iteration <= maxIterations; iteration++) {
      const pose = forwardKinematics(model, q, { frames: true });
      const residual = poseResidual(pose, target);
      const score = targetScore(residual, orientationWeight);
      if (!best || score < best.score) best = { q: [...q], pose, residual, score, iteration };
      if (residual.positionError <= positionTolerance && residual.orientationError <= orientationTolerance && isStateValid(q)) {
        return { status: 'reached', q: [...q], pose: { position: pose.position, quaternion: pose.quaternion }, positionError: residual.positionError, orientationError: residual.orientationError, iterations: iteration };
      }
      if (iteration === maxIterations) break;
      const columns = jacobian(model, q, pose.position, pose.frames, orientationWeight);
      const error = [...residual.translation, ...residual.rotation.map(value => value * orientationWeight)];
      const normal = columns.map((a, i) => columns.map((b, j) => a.reduce((sum, value, row) => sum + value * b[row], i === j ? damping * damping : 0)));
      const right = columns.map(column => column.reduce((sum, value, row) => sum + value * error[row], 0));
      const step = solveLinear(normal, right);
      if (!step) break;
      let improved = false;
      for (const factor of [1, 0.5, 0.25, 0.125]) {
        const candidate = clampConfiguration(model, q.map((value, k) => {
          const joint = model.joints[model.active[k]];
          const maxStep = joint.type === 'prismatic' ? 0.05 : 0.25;
          return value + Math.max(-maxStep, Math.min(maxStep, step[k])) * factor;
        }));
        const nextResidual = poseResidual(forwardKinematics(model, candidate), target);
        if (targetScore(nextResidual, orientationWeight) < score - 1e-11) { q = candidate; damping = Math.max(0.003, damping * 0.7); improved = true; break; }
      }
      if (!improved) { damping *= 5; if (damping > 10) break; }
    }
  }
  const poseReached = best.residual.positionError <= positionTolerance && best.residual.orientationError <= orientationTolerance;
  return { status: poseReached ? 'collision' : 'unreachable',
    reason: poseReached ? 'IK reached the pose only in a disallowed configuration.' : 'No joint configuration met the position and orientation tolerances.', q: best.q,
    pose: { position: best.pose.position, quaternion: best.pose.quaternion },
    positionError: best.residual.positionError, orientationError: best.residual.orientationError };
}
