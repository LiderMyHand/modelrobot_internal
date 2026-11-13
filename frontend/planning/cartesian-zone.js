import { Quaternion, Vector3 } from 'three';
import { forwardKinematics } from './robot-model.js';
import { poseResidual } from './ik-pose.js';
import { solveCartesianPath } from './paths.js';
import { createCollisionQueries } from './ptp.js';
import { timeParameterize } from './timing.js';
import { orientationTransition } from './orientation.js';

const vector = values => new Vector3(...values);
const rotationDistance = (a, b) => 2 * Math.acos(Math.min(1, Math.abs(new Quaternion(...a).normalize().dot(new Quaternion(...b).normalize()))));
const bernstein = (n, i, u) => {
  const coefficients = n === 5 ? [1, 5, 10, 10, 5, 1] : [1, 4, 6, 4, 1];
  return coefficients[i] * u ** i * (1 - u) ** (n - i);
};
const bezier = (controls, u) => controls.reduce((sum, control, i) => sum.addScaledVector(control, bernstein(5, i, u)), new Vector3());

/** A CIRC has two SLERP segments; evaluate both exact segment rates. */
export function maximumPathAngularRate(path) {
  return Math.max(vector(path.angularVelocityAt(0)).length(), vector(path.angularVelocityAt(1)).length());
}

/** A world-TCP reference: exact original line/arc outside a local position/rotation transition. */
export function createCartesianZonePath(inbound, outbound, radius, { trimScale = 1 } = {}) {
  if (!(Number.isFinite(radius) && radius > 0 && radius <= 0.2)) return { status: 'invalid_target', reason: 'Cartesian ZONE needs a radius from 0 to 0.2 m.' };
  if (![inbound, outbound].every(path => ['LIN', 'CIRC'].includes(path?.type) && path.length > 1e-8))
    return { status: 'zone_infeasible', reason: 'Cartesian ZONE needs two non-degenerate LIN/CIRC paths.' };
  const waypoint = inbound.at(1), nextStart = outbound.at(0);
  if (vector(waypoint.position).distanceTo(vector(nextStart.position)) > 1e-7 ||
      rotationDistance(waypoint.quaternion, nextStart.quaternion) > 1e-4)
    return { status: 'zone_infeasible', reason: 'Cartesian ZONE paths must share one nominal TCP waypoint.' };
  const viaRoomIn = inbound.type === 'CIRC' ? (1 - inbound.viaFraction) * inbound.length : Infinity;
  const viaRoomOut = outbound.type === 'CIRC' ? outbound.viaFraction * outbound.length : Infinity;
  const dIn = Math.min(radius * 0.75, inbound.length / 3, viaRoomIn * 0.5) * trimScale;
  const dOut = Math.min(radius * 0.75, outbound.length / 3, viaRoomOut * 0.5) * trimScale;
  if (dIn < 1e-4 || dOut < 1e-4) return { status: 'zone_infeasible', reason: 'ZONE cannot trim either Cartesian move without losing a via pose or a usable transition.' };
  const entryFraction = 1 - dIn / inbound.length, exitFraction = dOut / outbound.length;
  const A = vector(inbound.at(entryFraction).position), B = vector(outbound.at(exitFraction).position);
  const TA = vector(inbound.tangentAt(entryFraction)), TB = vector(outbound.tangentAt(exitFraction));
  const KA = vector(inbound.curvatureAt(entryFraction)), KB = vector(outbound.curvatureAt(exitFraction));
  if (TA.dot(TB) < -0.98) return { status: 'zone_infeasible', reason: 'Cartesian ZONE cannot fly through a near-reversal cusp.' };
  const h = dIn + dOut, vA = TA.clone().multiplyScalar(h), vB = TB.clone().multiplyScalar(h);
  const aA = KA.clone().multiplyScalar(h * h), aB = KB.clone().multiplyScalar(h * h);
  const controls = [A, A.clone().addScaledVector(vA, 1 / 5), A.clone().addScaledVector(vA, 2 / 5).addScaledVector(aA, 1 / 20),
    B.clone().addScaledVector(vB, -2 / 5).addScaledVector(aB, 1 / 20), B.clone().addScaledVector(vB, -1 / 5), B];
  const P = vector(waypoint.position);
  if (controls.some(control => control.distanceTo(P) > radius - 1e-6))
    return { status: 'zone_infeasible', reason: 'Cartesian blend control hull leaves the waypoint ZONE ball.' };
  const chord = B.clone().sub(A);
  // The derivative is a Bernstein-weighted sum of control-polygon edges.
  // Positive projection of every edge certifies forward chord progress for
  // the whole curve, including between geometric samples.
  if (chord.lengthSq() < 1e-12 || controls.slice(0, 5)
    .some((control, i) => controls[i + 1].clone().sub(control).dot(chord) <= 1e-9))
    return { status: 'zone_infeasible', reason: 'Cartesian blend would loop or reverse near the waypoint.' };
  const prefix = inbound.length - dIn, total = inbound.length + outbound.length;
  const entry = prefix / total, boundary = (prefix + h / 2) / total, exit = (prefix + h) / total;
  const requiredFractions = [entry, boundary, exit];
  if (inbound.type === 'CIRC') requiredFractions.push(inbound.viaFraction * inbound.length / total);
  if (outbound.type === 'CIRC') requiredFractions.push((prefix + h + outbound.viaFraction * outbound.length - dOut) / total);
  requiredFractions.sort((a, b) => a - b);
  const qA = new Quaternion(...inbound.at(entryFraction).quaternion).normalize();
  const qB = new Quaternion(...outbound.at(exitFraction).quaternion).normalize();
  const orientation = orientationTransition(qA.toArray(), qB.toArray(),
    inbound.angularVelocityAt(entryFraction), outbound.angularVelocityAt(exitFraction), h);
  const angularRateBound = Math.max(orientation.rateBound,
    maximumPathAngularRate(inbound), maximumPathAngularRate(outbound));
  const path = { type: 'CARTESIAN_ZONE', length: total,
    rotationAngle: inbound.rotationAngle + outbound.rotationAngle + orientation.angleBound,
    angularRateBound, orientationTransitionAngle: orientation.relativeAngle,
    requiredFractions, entryFraction: entry, boundaryFraction: boundary, exitFraction: exit,
    at(fraction) {
      const distance = Math.max(0, Math.min(1, fraction)) * total;
      if (distance <= prefix) return inbound.at(distance / inbound.length);
      if (distance >= prefix + h) return outbound.at((distance - prefix - h + dOut) / outbound.length);
      const u = (distance - prefix) / h;
      return { position: bezier(controls, u).toArray(), quaternion: orientation.at(u) };
    } };
  return { status: 'built', path, controls: controls.map(control => control.toArray()),
    orientation, trimIn: dIn, trimOut: dOut, waypoint: waypoint.position, radius };
}

/** One path through every corner of a consecutive Cartesian run. */
export function createCartesianZoneChainPath(paths, radii, { trimScale = 1 } = {}) {
  if (!Array.isArray(paths) || paths.length < 3 || radii?.length !== paths.length - 1)
    return { status: 'invalid_target', reason: 'Cartesian ZONE chain needs at least three paths and one radius per corner.' };
  const total = paths.reduce((sum, path) => sum + path.length, 0);
  const offsets = [0];
  for (const path of paths) offsets.push(offsets.at(-1) + path.length);
  const corners = [];
  for (let i = 0; i < radii.length; i++) {
    const corner = createCartesianZonePath(paths[i], paths[i + 1], radii[i], { trimScale });
    if (corner.status !== 'built') return { ...corner, cornerIndex: i };
    const entryDistance = offsets[i + 1] - corner.trimIn;
    const exitDistance = offsets[i + 1] + corner.trimOut;
    if (corners.length && entryDistance <= corners.at(-1).exitDistance + 1e-6)
      return { status: 'zone_infeasible', cornerIndex: i, reason: 'Adjacent Cartesian ZONE trims overlap on their shared move.' };
    corners.push({ ...corner, index: i, entryDistance, exitDistance,
      boundaryDistance: offsets[i] + corner.path.boundaryFraction * corner.path.length });
  }
  const requiredFractions = [];
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].type === 'CIRC') requiredFractions.push((offsets[i] + paths[i].viaFraction * paths[i].length) / total);
  }
  for (const corner of corners) requiredFractions.push(corner.entryDistance / total,
    corner.boundaryDistance / total, corner.exitDistance / total);
  requiredFractions.sort((a, b) => a - b);
  const path = { type: 'CARTESIAN_ZONE_CHAIN', length: total,
    rotationAngle: paths.reduce((sum, segment) => sum + segment.rotationAngle, 0) +
      corners.reduce((sum, corner) => sum + corner.orientation.angleBound, 0),
    angularRateBound: Math.max(...paths.map(maximumPathAngularRate),
      ...corners.map(corner => corner.orientation.rateBound)),
    requiredFractions,
    at(fraction) {
      const distance = Math.max(0, Math.min(1, fraction)) * total;
      for (const corner of corners) {
        if (distance >= corner.entryDistance && distance <= corner.exitDistance)
          return corner.path.at((distance - offsets[corner.index]) / corner.path.length);
      }
      let segment = paths.length - 1;
      for (let i = 0; i < paths.length - 1; i++) {
        if (distance <= offsets[i + 1]) { segment = i; break; }
      }
      return paths[segment].at((distance - offsets[segment]) / paths[segment].length);
    },
  };
  return { status: 'built', path, corners, offsets, total };
}

/** Solve a multi-corner Cartesian run with one IK path and one smooth clock. */
export function planCartesianZoneChain({ model, start, paths, radii, limits, isStateValid, options = {} }) {
  const maxAngularSpeed = options.cartesianZone?.maxAngularSpeed ?? 1;
  if (!(Number.isFinite(maxAngularSpeed) && maxAngularSpeed > 0))
    return { status: 'invalid_target', reason: 'Cartesian ZONE angular speed limit must be positive and finite.' };
  const checks = createCollisionQueries(model, isStateValid, options.collision ?? {});
  let last = null;
  for (let attempt = 0; attempt < 7; attempt++) {
    const built = createCartesianZoneChainPath(paths, radii, { trimScale: 1 / 2 ** attempt });
    if (built.status === 'invalid_target') return built;
    if (built.status !== 'built') { last = built; continue; }
    const path = built.path, smallestRadius = Math.min(...radii);
    const withCorner = result => ({ ...result, cornerIndex: result.cornerIndex ??
      (Number.isFinite(result.at) ? built.corners.reduce((best, corner) =>
        Math.abs(corner.boundaryDistance / path.length - result.at) <
        Math.abs(built.corners[best].boundaryDistance / path.length - result.at) ? corner.index : best, 0) : 0) });
    const minimumDuration = Math.max(options.timing?.minimumDuration ?? 0.01,
      1.875 * path.length * path.angularRateBound / maxAngularSpeed);
    const translationStep = Math.min(options.cartesian?.translationStep ?? 0.01, smallestRadius / 8, 0.005);
    let geometric = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian, translationStep });
    if (geometric.status !== 'planned') { last = withCorner(geometric); continue; }
    let timed = timeParameterize(geometric.jointPath, limits, { model, cartesianPath: path, ...checks, ...options.timing,
      minimumDuration, allowInternalStops: false,
      pathTolerance: Math.min(options.timing?.pathTolerance ?? 0.002, smallestRadius / 10),
      orientationPathTolerance: Math.min(options.timing?.orientationPathTolerance ?? 0.02, 1e-4) });
    for (let density = 2; timed.status === 'geometry_deviation' && density <= 8; density *= 2) {
      const denser = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian,
        translationStep: translationStep / density,
        orientationStep: Math.min(options.cartesian?.orientationStep ?? Math.PI / 90, Math.PI / (90 * density)) });
      if (denser.status !== 'planned') { timed = denser; break; }
      timed = timeParameterize(denser.jointPath, limits, { model, cartesianPath: path, ...checks, ...options.timing,
        minimumDuration, allowInternalStops: false,
        pathTolerance: Math.min(options.timing?.pathTolerance ?? 0.002, smallestRadius / 10),
        orientationPathTolerance: Math.min(options.timing?.orientationPathTolerance ?? 0.02, 1e-4) });
      if (timed.status === 'timed') geometric = denser;
    }
    if (timed.status !== 'timed') { last = withCorner(timed); continue; }
    if (timed.internalStops) { last = { reason: 'Cartesian ZONE chain timing introduced an internal stop.' }; continue; }
    const maxAngularSpeedBound = 1.875 * path.length * path.angularRateBound / timed.duration;
    if (maxAngularSpeedBound > maxAngularSpeed * (1 + 1e-9)) {
      last = { reason: 'Cartesian ZONE chain orientation exceeds its angular speed limit.' }; continue;
    }
    const cornerResults = [];
    for (const corner of built.corners) {
      const find = distance => timed.points.find(point => Math.abs(point.s - distance / path.length) < 1e-9);
      const entry = find(corner.entryDistance), boundary = find(corner.boundaryDistance), exit = find(corner.exitDistance);
      if (!entry || !boundary || !exit) { last = { reason: 'Timed Cartesian ZONE chain omitted a mandatory corner sample.', cornerIndex: corner.index }; break; }
      const speedFraction = Math.max(...boundary.velocity.map((value, j) => Math.abs(value) / limits.velocity[j]));
      if (speedFraction < 1e-5) { last = { reason: 'Cartesian ZONE chain has zero joint speed at a corner.', cornerIndex: corner.index }; break; }
      const waypoint = vector(corner.waypoint);
      const transitionPoints = timed.points.filter(point => point.s >= corner.entryDistance / path.length - 1e-10 &&
        point.s <= corner.exitDistance / path.length + 1e-10);
      const maxWaypointDistance = transitionPoints.reduce((maximum, point) => Math.max(maximum,
        vector(forwardKinematics(model, point.q).position).distanceTo(waypoint)), 0);
      if (maxWaypointDistance > corner.radius + 1e-7) { last = { reason: 'Timed TCP leaves a Cartesian ZONE ball.', cornerIndex: corner.index }; break; }
      const residual = poseResidual(forwardKinematics(model, boundary.q), path.at(boundary.s));
      if (residual.positionError > Math.min(0.002, corner.radius / 10) || residual.orientationError > 1e-4) {
        last = { reason: 'Timed Cartesian ZONE corner misses its declared TCP curve.', cornerIndex: corner.index }; break;
      }
      cornerResults.push({ index: corner.index, radius: corner.radius,
        entryTime: entry.time, boundaryTime: boundary.time, exitTime: exit.time,
        trimIn: corner.trimIn, trimOut: corner.trimOut, maxWaypointDistance, speedFraction,
        orientationTransitionAngle: corner.orientation.relativeAngle });
    }
    if (cornerResults.length !== built.corners.length) continue;
    return { status: 'planned', duration: timed.duration, points: timed.points, jointPath: geometric.jointPath,
      internalStops: false, corners: cornerResults, maxAngularSpeedBound,
      requiredFractions: path.requiredFractions, path };
  }
  return { status: 'zone_infeasible', causeStatus: last?.status ?? null, cornerIndex: last?.cornerIndex ?? null,
    reason: last?.reason ?? 'No Cartesian ZONE chain passed IK, timing, and collision checks.' };
}

/** Solve and time one Cartesian pair as a single motion. */
export function planCartesianZonePair({ model, start, inbound, outbound, radius, limits, isStateValid, options = {} }) {
  const maxAngularSpeed = options.cartesianZone?.maxAngularSpeed ?? 1;
  if (!(Number.isFinite(maxAngularSpeed) && maxAngularSpeed > 0))
    return { status: 'invalid_target', reason: 'Cartesian ZONE angular speed limit must be positive and finite.' };
  const checks = createCollisionQueries(model, isStateValid, options.collision ?? {});
  let last = null;
  for (let attempt = 0; attempt < 7; attempt++) {
    const built = createCartesianZonePath(inbound, outbound, radius, { trimScale: 1 / 2 ** attempt });
    if (built.status === 'invalid_target') return built;
    if (built.status !== 'built') { last ??= built; continue; }
    const path = built.path;
    // The global quintic clock has max d(fraction)/dt = 1.875 / duration.
    // SO(3)'s right Jacobian has norm at most one; the Bézier derivative
    // control hull therefore bounds angular speed over the full transition.
    const orientationMinimumDuration = 1.875 * path.length * path.angularRateBound / maxAngularSpeed;
    const minimumDuration = Math.max(options.timing?.minimumDuration ?? 0.01, orientationMinimumDuration);
    const translationStep = Math.min(options.cartesian?.translationStep ?? 0.01, radius / 8, 0.005);
    const geometric = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian,
      translationStep });
    if (geometric.status !== 'planned') { last = geometric; continue; }
    let timed = timeParameterize(geometric.jointPath, limits, { model, cartesianPath: path, ...checks, ...options.timing,
      minimumDuration,
      allowInternalStops: false,
      pathTolerance: Math.min(options.timing?.pathTolerance ?? 0.002, radius / 10),
      orientationPathTolerance: Math.min(options.timing?.orientationPathTolerance ?? 0.02, 1e-4) });
    for (let density = 2; timed.status === 'geometry_deviation' && density <= 8; density *= 2) {
      const denser = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian,
        translationStep: translationStep / density,
        orientationStep: Math.min(options.cartesian?.orientationStep ?? Math.PI / 90, Math.PI / (90 * density)) });
      if (denser.status !== 'planned') { timed = denser; break; }
      timed = timeParameterize(denser.jointPath, limits, { model, cartesianPath: path, ...checks, ...options.timing,
        minimumDuration,
        allowInternalStops: false,
        pathTolerance: Math.min(options.timing?.pathTolerance ?? 0.002, radius / 10),
        orientationPathTolerance: Math.min(options.timing?.orientationPathTolerance ?? 0.02, 1e-4) });
      if (timed.status === 'timed') geometric.jointPath = denser.jointPath;
    }
    if (timed.status !== 'timed') { last = timed; continue; }
    if (timed.internalStops) { last = { reason: 'Cartesian ZONE timing introduced an internal stop.' }; continue; }
    const maxAngularSpeedBound = 1.875 * path.length * path.angularRateBound / timed.duration;
    if (maxAngularSpeedBound > maxAngularSpeed * (1 + 1e-9)) {
      last = { reason: 'Cartesian ZONE orientation exceeds its angular speed limit.' }; continue;
    }
    const boundaryPoint = timed.points.find(point => Math.abs(point.s - path.boundaryFraction) < 1e-9);
    if (!boundaryPoint) { last = { reason: 'Timed Cartesian ZONE omitted its logical boundary.' }; continue; }
    const speedFraction = Math.max(...boundaryPoint.velocity.map((value, j) => Math.abs(value) / limits.velocity[j]));
    if (speedFraction < 1e-5) { last = { reason: 'Cartesian ZONE cannot maintain nonzero joint speed through its boundary.' }; continue; }
    const transitionPoints = timed.points.filter(point => point.s >= path.entryFraction - 1e-10 && point.s <= path.exitFraction + 1e-10);
    const entryPoint = timed.points.find(point => Math.abs(point.s - path.entryFraction) < 1e-9);
    const exitPoint = timed.points.find(point => Math.abs(point.s - path.exitFraction) < 1e-9);
    if (!entryPoint || !exitPoint || !transitionPoints.length) {
      last = { reason: 'Timed Cartesian ZONE omitted a mandatory entry or exit sample.' }; continue;
    }
    const waypoint = vector(built.waypoint);
    const maxWaypointDistance = transitionPoints.reduce((maximum, point) => Math.max(maximum,
      vector(forwardKinematics(model, point.q).position).distanceTo(waypoint)), 0);
    if (maxWaypointDistance > radius + 1e-7) { last = { reason: 'Timed TCP leaves the Cartesian ZONE ball.' }; continue; }
    const residual = poseResidual(forwardKinematics(model, boundaryPoint.q), path.at(path.boundaryFraction));
    if (residual.positionError > Math.min(0.002, radius / 10) || residual.orientationError > 1e-4) {
      last = { reason: 'Timed Cartesian boundary misses its declared TCP curve.' }; continue;
    }
    return { status: 'planned', duration: timed.duration, points: timed.points, jointPath: geometric.jointPath,
      internalStops: false,
      boundaryTime: boundaryPoint.time, boundaryFraction: path.boundaryFraction,
      entryTime: entryPoint.time, exitTime: exitPoint.time,
      trimIn: built.trimIn, trimOut: built.trimOut, maxWaypointDistance, speedFraction,
      maxAngularSpeedBound, orientationTransitionAngle: path.orientationTransitionAngle,
      requiredFractions: path.requiredFractions, path };
  }
  return { status: 'zone_infeasible', causeStatus: last?.status ?? null,
    reason: last?.reason ?? 'No Cartesian ZONE candidate passed IK, timing, and collision checks.' };
}
