import { Quaternion, Vector3 } from 'three';
import { forwardKinematics } from './robot-model.js';
import { poseResidual, solvePose } from './ik-pose.js';
import { relativeRotationVector } from './orientation.js';

const EPS = 1e-10;
const point = pose => new Vector3(...pose.position);
const rotation = pose => new Quaternion(...pose.quaternion).normalize();
const pose = (position, quaternion) => ({ position: position.toArray(), quaternion: quaternion.toArray() });
const angle = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(a.dot(b))));
const validPose = value => Array.isArray(value?.position) && value.position.length === 3 && value.position.every(Number.isFinite)
  && Array.isArray(value.quaternion) && value.quaternion.length === 4 && value.quaternion.every(Number.isFinite)
  && Math.hypot(...value.quaternion) > EPS;

export function linearPath(start, end) {
  if (!validPose(start) || !validPose(end)) throw new Error('LIN needs two finite TCP poses.');
  const a = point(start), b = point(end), qa = rotation(start), qb = rotation(end);
  const bodyRate = relativeRotationVector(qa.toArray(), qb.toArray()).divideScalar(Math.max(a.distanceTo(b), EPS)).toArray();
  return {
    type: 'LIN', length: a.distanceTo(b), rotationAngle: angle(qa, qb), start, end,
    tangentAt() { return b.clone().sub(a).normalize().toArray(); },
    curvatureAt() { return [0, 0, 0]; },
    angularVelocityAt() { return bodyRate; },
    at(fraction) { const s = Math.max(0, Math.min(1, fraction)); return pose(a.clone().lerp(b, s), qa.clone().slerp(qb, s)); },
  };
}

export function circularPath(start, via, end) {
  if (![start, via, end].every(validPose)) throw new Error('CIRC needs three finite TCP poses.');
  const a = point(start), b = point(via), c = point(end);
  const u = b.clone().sub(a), v = c.clone().sub(a), cross = new Vector3().crossVectors(u, v);
  const scale = Math.max(u.lengthSq(), v.lengthSq());
  if (u.lengthSq() < EPS || v.lengthSq() < EPS || b.distanceToSquared(c) < EPS || cross.lengthSq() < scale * scale * 1e-12) {
    throw new Error('CIRC start, via, and end must be distinct non-collinear positions.');
  }
  const center = a.clone().addScaledVector(v.clone().cross(cross), u.lengthSq() / (2 * cross.lengthSq()))
    .addScaledVector(cross.clone().cross(u), v.lengthSq() / (2 * cross.lengthSq()));
  const normal = cross.normalize(), radiusVector = a.clone().sub(center), radius = radiusVector.length();
  const angleTo = p => {
    const r = p.clone().sub(center);
    const theta = Math.atan2(normal.dot(new Vector3().crossVectors(radiusVector, r)), radiusVector.dot(r));
    return theta < 0 ? theta + 2 * Math.PI : theta;
  };
  const viaAngle = angleTo(b), endAngle = angleTo(c);
  const sweep = endAngle >= viaAngle ? endAngle : endAngle - 2 * Math.PI;
  const adjustedVia = sweep >= 0 ? viaAngle : viaAngle - 2 * Math.PI;
  const viaFraction = adjustedVia / sweep;
  const tangent = new Vector3().crossVectors(normal, radiusVector);
  const qa = rotation(start), qb = rotation(via), qc = rotation(end);
  const length = Math.abs(sweep) * radius;
  const firstRate = relativeRotationVector(qa.toArray(), qb.toArray()).divideScalar(viaFraction * length).toArray();
  const secondRate = relativeRotationVector(qb.toArray(), qc.toArray()).divideScalar((1 - viaFraction) * length).toArray();
  return {
    type: 'CIRC', length,
    rotationAngle: angle(qa, qb) + angle(qb, qc), radius, center: center.toArray(), sweep, viaFraction,
    start, via, end,
    tangentAt(fraction) {
      const radial = new Vector3(...this.at(fraction).position).sub(center).normalize();
      return new Vector3().crossVectors(normal, radial).multiplyScalar(Math.sign(sweep)).toArray();
    },
    curvatureAt(fraction) {
      return center.clone().sub(new Vector3(...this.at(fraction).position)).divideScalar(radius * radius).toArray();
    },
    angularVelocityAt(fraction) { return fraction < viaFraction ? firstRate : secondRate; },
    at(fraction) {
      const s = Math.max(0, Math.min(1, fraction)), theta = sweep * s;
      const position = center.clone().addScaledVector(radiusVector, Math.cos(theta)).addScaledVector(tangent, Math.sin(theta));
      const quaternion = s <= viaFraction
        ? qa.clone().slerp(qb, s / viaFraction)
        : qb.clone().slerp(qc, (s - viaFraction) / (1 - viaFraction));
      return pose(position, quaternion);
    },
  };
}

/** Sample the commanded TCP geometry and solve IK at every sample; never detour a LIN/CIRC. */
export function solveCartesianPath(model, path, options = {}) {
  const translationStep = options.translationStep ?? 0.01;
  const orientationStep = options.orientationStep ?? Math.PI / 90;
  if (!(translationStep > 0 && orientationStep > 0)) throw new Error('Path sample steps must be positive.');
  const samples = Math.max(1, Math.ceil(path.length / translationStep), Math.ceil(path.rotationAngle / orientationStep));
  if (samples > (options.maxSamples ?? 10000)) return { status: 'sample_budget', reason: 'Cartesian path requires too many IK samples.' };
  const required = [path.viaFraction, ...(path.requiredFractions ?? [])]
    .filter(value => Number.isFinite(value) && value > 0 && value < 1);
  // Keep every exact required pose, but replace nearby uniform samples. A
  // nearly duplicate fraction makes the joint spline's derivative explode.
  const fractions = Array.from({ length: samples + 1 }, (_, i) => i / samples)
    .filter((fraction, index) => index === 0 || index === samples || required.every(value => Math.abs(fraction - value) >= 0.5 / samples));
  fractions.push(...required);
  fractions.sort((a, b) => a - b);
  const uniqueFractions = fractions.filter((value, index) => index === 0 || value - fractions[index - 1] > 1e-12);
  const q0 = options.start ?? model.initial;
  const startResidual = poseResidual(forwardKinematics(model, q0), path.at(0));
  if (startResidual.positionError > (options.positionTolerance ?? 1e-4) || startResidual.orientationError > (options.orientationTolerance ?? 1e-3)) {
    return { status: 'invalid_start', reason: 'Current TCP pose does not match the path start.', at: 0, ...startResidual };
  }
  const jointPath = [{ s: 0, q: [...q0], tcp: path.at(0) }];
  if (options.isStateValid && !options.isStateValid(q0)) return { status: 'collision', reason: 'Start configuration collides.', at: 0 };
  let previous = [...q0];
  for (const s of uniqueFractions.slice(1)) {
    const target = path.at(s);
    const { isEdgeValid, ...ikOptions } = options;
    const result = solvePose(model, target, { ...ikOptions, seed: previous });
    if (result.status !== 'reached') return { status: result.status === 'collision' ? 'collision' : 'ik_failed', reason: result.reason, at: s, result };
    const maxJump = options.maxJointJump ?? 0.5;
    if (result.q.some((value, index) => Math.abs(value - previous[index]) > maxJump)) {
      return { status: 'ik_jump', reason: 'IK changed branches along the Cartesian path.', at: s, q: result.q };
    }
    if (options.isStateValid && !options.isStateValid(result.q)) return { status: 'collision', reason: 'TCP path intersects an obstacle.', at: s, q: result.q };
    if (options.isEdgeValid && !options.isEdgeValid(previous, result.q)) return { status: 'collision', reason: 'Joint interpolation between TCP samples intersects an obstacle.', at: s };
    jointPath.push({ s, q: result.q, tcp: target });
    previous = result.q;
  }
  return { status: 'planned', type: path.type, jointPath, length: path.length, samples: jointPath.length - 1 };
}
