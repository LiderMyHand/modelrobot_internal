import { Quaternion, Vector3 } from 'three';
import { forwardKinematics } from './robot-model.js';
import { solveJogVelocity } from './velocity-ik.js';

const norm = values => Math.hypot(...values);
const finite = (values, count) => Array.isArray(values) && values.length === count && values.every(Number.isFinite);

/**
 * Pure, atomic finite jog. Integrate at <=10 ms, recomputing the bounded
 * velocity solve at each state. Halve a substep when its actual FK increment
 * differs from its local Cartesian Euler/exponential reference. `samples`
 * includes every accepted joint state; the caller must collision-check every
 * segment of that polyline before committing the final configuration.
 *
 * This is a kinematic integrator, not an acceleration-controlled servo.
 * qdot is (nextQ-q)/dt. achieved/residual/effectiveRequested are time averages
 * of the instantaneous solves in the requested expression frame (which moves
 * during a tool-frame jog), not endpoint velocity or global pose-error bounds.
 * speedScale is the minimum applied scale; averageSpeedScale is its time mean.
 */
export function integrateJogVelocity(model, q, twist, options = {}) {
  const n = model?.jointNames?.length, dt = options.dt ?? 0.05;
  const frame = options.frame ?? 'world';
  const fail = (result, atTime = 0) => ({ ...result,
    nextQ: Array.isArray(q) ? [...q] : [], samples: Array.isArray(q) ? [[...q]] : [],
    qdot: Array(Number.isInteger(n) && n > 0 ? n : 0).fill(0),
    achieved: Array(6).fill(0), residual: finite(twist, 6) ? [...twist] : [],
    translationError: finite(twist, 6) ? norm(twist.slice(0, 3)) : null,
    rotationError: finite(twist, 6) ? norm(twist.slice(3)) : null,
    integratedTime: 0, failedAtTime: atTime, applied: false });
  if (!Number.isInteger(n) || n < 1 || !finite(q, n) || !finite(twist, 6) ||
      !Number.isFinite(dt) || dt <= 0 || dt > 1 || !['world', 'tool'].includes(frame))
    return fail({ status: 'invalid_target', reason: 'Jog integration needs finite joints and twist, world/tool coordinates, and a duration in (0, 1] seconds.' });
  for (let index = 0; index < n; index++) {
    const joint = model.joints[model.active[index]];
    if (joint.type !== 'continuous' && (q[index] < joint.lower - 1e-10 || q[index] > joint.upper + 1e-10))
      return fail({ status: 'invalid_target', reason: `Joint ${model.jointNames[index]} starts outside its position limit.` });
  }
  const maximumStep = 0.01, minimumStep = 1e-6, maximumAttempts = 4096;
  const samples = [[...q]], sampleTimes = [0], achievedIntegral = Array(6).fill(0);
  const requestedIntegral = Array(6).fill(0), limitedJoints = new Set();
  let current = [...q], time = 0, attempts = 0, minimumScale = 1, scaleIntegral = 0, last;
  let maximumPositionError = 0, maximumOrientationError = 0;
  while (time < dt) {
    const remaining = dt - time;
    // Consume an almost-exact final step instead of leaving a ~1e-17 second
    // residue after repeated decimal additions. Its FK error tolerance would
    // otherwise be far below floating-point resolution.
    let step = remaining <= maximumStep + 16 * Number.EPSILON * Math.max(dt, maximumStep)
      ? remaining : maximumStep;
    const before = forwardKinematics(model, current);
    while (true) {
      if (++attempts > maximumAttempts)
        return fail({ status: 'integration_failure', reason: 'Jog integration exceeded its accuracy budget. Reduce the step duration or change posture.' }, time);
      const result = solveJogVelocity(model, current, twist, { ...options, frame, dt: step });
      if (result.status !== 'solved') return fail(result, time);
      const after = forwardKinematics(model, result.nextQ);
      const linear = new Vector3(...result.effectiveRequested.slice(0, 3));
      const angular = new Vector3(...result.effectiveRequested.slice(3));
      const rotation = new Quaternion(...before.quaternion);
      if (frame === 'tool') { linear.applyQuaternion(rotation); angular.applyQuaternion(rotation); }
      const desiredPosition = new Vector3(...before.position).addScaledVector(linear, step);
      const angle = angular.length() * step;
      const delta = angle > 0 ? new Quaternion().setFromAxisAngle(angular.normalize(), angle) : new Quaternion();
      const desiredRotation = delta.multiply(rotation).normalize();
      const positionError = desiredPosition.distanceTo(new Vector3(...after.position));
      // acos(dot) has a sqrt(epsilon) angular noise floor near equal rotations.
      // The relative quaternion's vector part retains small-angle precision.
      const relativeRotation = desiredRotation.clone().conjugate()
        .multiply(new Quaternion(...after.quaternion).normalize()).normalize();
      const orientationError = 2 * Math.atan2(Math.hypot(relativeRotation.x,
        relativeRotation.y, relativeRotation.z), Math.abs(relativeRotation.w));
      // Scale the absolute allowance with time so splitting a step cannot
      // increase its total allowance without bound. Relative allowances use
      // actual requested translation/rotation, including any speed backoff.
      const positionTolerance = 1e-5 * step / maximumStep + 0.02 * linear.length() * step;
      const orientationTolerance = 1e-4 * step / maximumStep + 0.02 * angle;
      if (positionError > positionTolerance || orientationError > orientationTolerance) {
        step /= 2;
        if (step < minimumStep)
          return fail({ status: 'integration_failure', reason: 'Jog cannot meet its finite-motion accuracy tolerance. Reduce speed or change posture.' }, time);
        continue;
      }
      current = [...result.nextQ];
      time = Math.min(dt, time + step);
      samples.push([...current]); sampleTimes.push(time);
      for (let axis = 0; axis < 6; axis++) {
        achievedIntegral[axis] += result.achieved[axis] * step;
        requestedIntegral[axis] += result.effectiveRequested[axis] * step;
      }
      minimumScale = Math.min(minimumScale, result.speedScale);
      scaleIntegral += result.speedScale * step;
      for (const name of result.limitedJoints || []) limitedJoints.add(name);
      maximumPositionError = Math.max(maximumPositionError, positionError);
      maximumOrientationError = Math.max(maximumOrientationError, orientationError);
      last = result;
      break;
    }
  }
  const achieved = achievedIntegral.map(value => value / dt);
  const effectiveRequested = requestedIntegral.map(value => value / dt);
  const residual = effectiveRequested.map((value, i) => value - achieved[i]);
  return { ...last, status: 'solved', nextQ: current, samples, sampleTimes,
    qdot: current.map((value, i) => (value - q[i]) / dt), achieved, effectiveRequested, residual,
    translationError: norm(residual.slice(0, 3)), rotationError: norm(residual.slice(3)),
    speedScale: minimumScale, averageSpeedScale: scaleIntegral / dt,
    limitedJoints: [...limitedJoints], integratedTime: dt, applied: false,
    maximumPositionError, maximumOrientationError,
    diagnosticSemantics: 'Time-averaged instantaneous velocity in the requested frame; FK errors bound each accepted substep.' };
}
