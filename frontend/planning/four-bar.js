import { Matrix4, Quaternion, Vector3 } from 'three';
import { poseResidual } from './ik-pose.js';

const IDENTITY = new Matrix4().elements.slice();
const PI2 = 2 * Math.PI;
const GEOMETRY_EPS = 1e-8;
const finite = (v, n) => Array.isArray(v) && v.length === n && v.every(Number.isFinite);
const angleVector = t => [Math.cos(t), Math.sin(t)];
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];
const length = a => Math.hypot(...a);
const failure = (status, reason) => ({ status, reason });

function matrixArray(value, label) {
  const data = value?.elements ? [...value.elements] : value == null ? [...IDENTITY] : [...value];
  if (!finite(data, 16)) throw new Error(`${label} needs a 4x4 finite matrix.`);
  return data;
}

function planarTranslation(value, label) {
  const m = matrixArray(value, label);
  for (const i of [0, 5, 10, 15]) if (Math.abs(m[i] - 1) > GEOMETRY_EPS) throw new Error(`${label} must have identity rotation and scale.`);
  for (const i of [1, 2, 3, 4, 6, 7, 8, 9, 11, 14]) if (Math.abs(m[i]) > GEOMETRY_EPS) throw new Error(`${label} must be an XY translation.`);
  for (const i of [12, 13]) if (!Number.isFinite(m[i])) throw new Error(`${label} has invalid coordinates.`);
  return [m[12], m[13]];
}

function snapshotJoint(joint) {
  const get = key => joint.get?.(key);
  const axis = joint.axis?.toArray ? joint.axis.toArray() : joint.axis ?? [1, 0, 0];
  const linkName = value => typeof value === 'string' ? value : value?.link;
  return {
    name: joint.name ?? get('name'), type: joint.type ?? get('type'),
    parent: linkName(get('parent')) ?? linkName(joint.parent),
    child: linkName(get('child')) ?? linkName(joint.child),
    origin: matrixArray(joint.basicMatrix ?? joint.origin ?? get('basicMatrix'), `Joint ${joint.name} origin`),
    axis, lower: Number(joint.lower ?? get('lower')), upper: Number(joint.upper ?? get('upper')),
    initial: Number(joint.theta ?? get('theta') ?? 0), mimic: joint.mimic ?? get('mimic'),
    velocity: Number(joint.velocity ?? get('velocity')), acceleration: Number(joint.acceleration ?? get('acceleration')),
  };
}

function angleInLimits(angle, limits, reference) {
  const [lower, upper] = limits;
  const center = Number.isFinite(reference) ? reference : (lower + upper) / 2;
  const nMin = Math.ceil((lower - angle - 1e-10) / PI2);
  const nMax = Math.floor((upper - angle + 1e-10) / PI2);
  if (nMin > nMax) return null;
  return angle + Math.max(nMin, Math.min(nMax, Math.round((center - angle) / PI2))) * PI2;
}

function solve2x2(a, b, right) {
  const det = a[0] * b[1] - a[1] * b[0];
  if (Math.abs(det) < 1e-12) return null;
  return [(right[0] * b[1] - right[1] * b[0]) / det,
    (a[0] * right[1] - a[1] * right[0]) / det];
}

/**
 * Validate the supported cut-tree URDF shape and derive all lengths from origins.
 * Only the unrotated +X bar frames and +Z revolute axes are supported for now.
 * The returned object contains plain data and can cross a Worker boundary.
 */
export function createFourBarModel({ descriptor, joints, worldFromBase, tipLink } = {}) {
  if (descriptor?.format !== 'modelrobot-kinematic-constraints' || descriptor.version !== 1 ||
      !Array.isArray(descriptor.mechanisms) || descriptor.mechanisms.length !== 1) {
    throw new Error('Four-bar needs one version 1 kinematic constraint descriptor.');
  }
  const mechanism = descriptor.mechanisms[0];
  if (mechanism?.type !== 'planar-four-bar' || ![-1, 1].includes(mechanism.branch)) throw new Error('Four-bar type or assembly branch is invalid.');
  const names = [mechanism.driverJoint, mechanism.couplerJoint, mechanism.outputJoint];
  if (names.some(name => typeof name !== 'string' || !name) || new Set(names).size !== 3 ||
      !mechanism.leftClosureLink || !mechanism.rightClosureLink || mechanism.leftClosureLink === mechanism.rightClosureLink) {
    throw new Error('Four-bar joint and closure link names must be distinct.');
  }
  if (!Array.isArray(joints)) throw new Error('Four-bar needs URDF joint snapshots.');
  const all = joints.map(snapshotJoint), byName = new Map(), byChild = new Map();
  for (const joint of all) {
    if (!joint.name || !joint.parent || !joint.child || byName.has(joint.name) || byChild.has(joint.child)) throw new Error(`Four-bar needs a uniquely named acyclic cut-tree joint snapshot (${joint.name}, ${joint.parent}, ${joint.child}).`);
    byName.set(joint.name, joint); byChild.set(joint.child, joint);
  }
  const driver = byName.get(names[0]), coupler = byName.get(names[1]), output = byName.get(names[2]);
  const left = byChild.get(mechanism.leftClosureLink), right = byChild.get(mechanism.rightClosureLink);
  if (!driver || !coupler || !output || !left || !right ||
      driver.parent !== output.parent || coupler.parent !== driver.child ||
      left.parent !== coupler.child || right.parent !== output.child ||
      left.type !== 'fixed' || right.type !== 'fixed') {
    throw new Error('Four-bar cut-tree topology must be ground→input→coupler→C_left and ground→output→C_right.');
  }
  if (all.some(joint => joint.type !== 'fixed' && !names.includes(joint.name))) throw new Error('Four-bar supports exactly three movable cut-tree joints.');
  for (const joint of [driver, coupler, output]) {
    if (joint.type !== 'revolute' || joint.mimic) throw new Error(`Four-bar joint ${joint.name} must be an independent revolute joint.`);
    if (!finite(joint.axis, 3) || Math.hypot(...joint.axis) < GEOMETRY_EPS ||
        Math.abs(joint.axis[0]) > GEOMETRY_EPS || Math.abs(joint.axis[1]) > GEOMETRY_EPS || joint.axis[2] <= 0) {
      throw new Error(`Four-bar joint ${joint.name} needs a +Z axis.`);
    }
    if (!Number.isFinite(joint.lower) || !Number.isFinite(joint.upper) || joint.lower > joint.upper) throw new Error(`Four-bar joint ${joint.name} needs finite limits.`);
  }
  const A = planarTranslation(driver.origin, 'Input pivot');
  const D = planarTranslation(output.origin, 'Output pivot');
  const Brel = planarTranslation(coupler.origin, 'Coupler pivot');
  const CleftRel = planarTranslation(left.origin, 'Left closure pin');
  const CrightRel = planarTranslation(right.origin, 'Right closure pin');
  if (length(A) > GEOMETRY_EPS || Math.abs(D[1]) > GEOMETRY_EPS ||
      Math.abs(Brel[1]) > GEOMETRY_EPS || Math.abs(CleftRel[1]) > GEOMETRY_EPS ||
      Math.abs(CrightRel[1]) > GEOMETRY_EPS ||
      [D[0], Brel[0], CleftRel[0], CrightRel[0]].some(value => value <= GEOMETRY_EPS)) {
    throw new Error('Four-bar frames need A=(0,0) and positive +X dimensions d,a,b,c.');
  }
  if (tipLink != null && tipLink !== mechanism.leftClosureLink && tipLink !== mechanism.rightClosureLink) throw new Error('Four-bar TCP must be one of the two closure endpoint links.');
  const limits = [driver, coupler, output].map(joint => [joint.lower, joint.upper]);
  const initialJointValues = [driver, coupler, output].map(joint => joint.initial);
  const model = {
    kind: 'planar-four-bar', robot: mechanism.robot ?? null, baseLink: driver.parent,
    tipLink: tipLink ?? mechanism.leftClosureLink, branch: mechanism.branch,
    jointNames: [driver.name], expandedJointNames: names,
    closureLinks: [mechanism.leftClosureLink, mechanism.rightClosureLink],
    dimensions: { a: Brel[0], b: CleftRel[0], c: CrightRel[0], d: D[0] },
    limits, initialJointValues,
    velocityLimits: [driver, coupler, output].map(joint => Number.isFinite(joint.velocity) && joint.velocity > 0 ? joint.velocity : null),
    accelerationLimits: [driver, coupler, output].map(joint => Number.isFinite(joint.acceleration) && joint.acceleration > 0 ? joint.acceleration : null),
    worldFromBase: matrixArray(worldFromBase, 'Robot base transform'),
  };
  let theta = driver.initial;
  if (!Number.isFinite(theta) || theta < driver.lower || theta > driver.upper) theta = (driver.lower + driver.upper) / 2;
  let home = expandFourBar(model, theta, { seed: initialJointValues });
  if (home.status !== 'expanded') {
    for (let i = 0; i <= 128 && home.status !== 'expanded'; i++) {
      theta = driver.lower + (driver.upper - driver.lower) * i / 128;
      home = expandFourBar(model, theta, { seed: initialJointValues });
    }
  }
  if (home.status !== 'expanded') throw new Error(`Four-bar has no valid home configuration: ${home.reason}`);
  model.initial = [theta];
  model.expandedInitial = home.q;
  return model;
}

/** Expand an independent input angle to the three URDF joint values. */
export function expandFourBar(model, theta, { seed } = {}) {
  if (!Number.isFinite(theta)) return failure('invalid_target', 'Input angle must be finite.');
  if (theta < model.limits[0][0] - 1e-10 || theta > model.limits[0][1] + 1e-10) return failure('joint_limit', 'Input angle exceeds driver limits.');
  const { a, b, c, d } = model.dimensions;
  const A = [0, 0], D = [d, 0], eTheta = angleVector(theta), B = [a * eTheta[0], a * eTheta[1]];
  const delta = subtract(D, B), r = length(delta);
  if (r <= GEOMETRY_EPS || r > b + c + 1e-12 || r < Math.abs(b - c) - 1e-12) return failure('unreachable', 'Bar circles do not intersect.');
  const h = (r * r + b * b - c * c) / (2 * r);
  const k2 = b * b - h * h;
  if (k2 < -1e-12) return failure('unreachable', 'Bar circles do not intersect.');
  const k = Math.sqrt(Math.max(0, k2));
  if (k <= 1e-6) return failure('toggle', 'Four-bar is at a toggle singularity.');
  const ex = [delta[0] / r, delta[1] / r];
  const C = [B[0] + h * ex[0] - model.branch * k * ex[1], B[1] + h * ex[1] + model.branch * k * ex[0]];
  const phi = Math.atan2(C[1] - B[1], C[0] - B[0]);
  const psi = Math.atan2(C[1] - D[1], C[0] - D[0]);
  const reference = Array.isArray(seed) && seed.length === 3 ? seed : model.expandedInitial ?? model.initialJointValues;
  const coupler = angleInLimits(phi - theta, model.limits[1], reference?.[1]);
  const output = angleInLimits(psi, model.limits[2], reference?.[2]);
  if (coupler == null || output == null) return failure('joint_limit', 'Passive joint angle exceeds URDF limits.');
  const ePhi = angleVector(theta + coupler), ePsi = angleVector(output);
  const Cleft = [B[0] + b * ePhi[0], B[1] + b * ePhi[1]];
  const Cright = [D[0] + c * ePsi[0], D[1] + c * ePsi[1]];
  const closureResidual = length(subtract(Cleft, Cright));
  if (closureResidual > 1e-7) return failure('closure', 'Cut-tree endpoint positions do not close.');
  const colPhi = [-b * ePhi[1], b * ePhi[0]];
  const colPsi = [c * ePsi[1], -c * ePsi[0]];
  const first = solve2x2(colPhi, colPsi, [a * eTheta[1], -a * eTheta[0]]);
  if (!first) return failure('toggle', 'Passive velocity Jacobian is singular.');
  const second = solve2x2(colPhi, colPsi, [
    a * eTheta[0] + b * ePhi[0] * first[0] ** 2 - c * ePsi[0] * first[1] ** 2,
    a * eTheta[1] + b * ePhi[1] * first[0] ** 2 - c * ePsi[1] * first[1] ** 2,
  ]);
  if (!second) return failure('toggle', 'Passive acceleration Jacobian is singular.');
  return { status: 'expanded', theta, q: [theta, coupler, output], phi: theta + coupler, psi: output,
    points: { A, B, C: Cleft, D, Cleft, Cright }, closureResidual,
    ratePerTheta: [1, first[0] - 1, first[1]], secondPerTheta2: [0, second[0], second[1]],
    branch: model.branch };
}

export function fourBarRates(expansion, thetaDot, thetaDDot = 0) {
  if (expansion?.status !== 'expanded' || !Number.isFinite(thetaDot) || !Number.isFinite(thetaDDot)) throw new Error('Four-bar rates need an expanded state and finite input derivatives.');
  return {
    velocity: expansion.ratePerTheta.map(value => value * thetaDot),
    acceleration: expansion.ratePerTheta.map((value, i) => value * thetaDDot + expansion.secondPerTheta2[i] * thetaDot * thetaDot),
  };
}

/** Pose at the selected cut endpoint; its orientation follows that endpoint's bar. */
export function fourBarPose(model, theta, options = {}) {
  const state = expandFourBar(model, theta, options);
  if (state.status !== 'expanded') return state;
  const base = new Matrix4().fromArray(model.worldFromBase);
  const position = new Vector3(state.points.C[0], state.points.C[1], 0).applyMatrix4(base);
  const baseQuaternion = new Quaternion().setFromRotationMatrix(base);
  const yaw = model.tipLink === model.closureLinks[0] ? state.phi : state.psi;
  const quaternion = baseQuaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), yaw));
  return { status: 'expanded', position: position.toArray(), quaternion: quaternion.toArray(), q: state.q,
    theta, closureResidual: state.closureResidual };
}

/** Bounded scalar search of the full 6D TCP pose residual on one assembly branch. */
export function solveFourBarPose(model, target, options = {}) {
  if (!finite(target?.position, 3) || !finite(target?.quaternion, 4) || Math.hypot(...target.quaternion) < 1e-12) return failure('invalid_target', 'Target needs a finite position and nonzero quaternion.');
  const positionTolerance = options.positionTolerance ?? 1e-4;
  const orientationTolerance = options.orientationTolerance ?? 1e-3;
  const orientationWeight = options.orientationWeight ?? 0.25;
  const samples = options.samples ?? 512;
  if (![positionTolerance, orientationTolerance, orientationWeight].every(v => Number.isFinite(v) && v > 0) || !Number.isInteger(samples) || samples < 8) return failure('invalid_target', 'IK search options are invalid.');
  const [lower, upper] = model.limits[0], seed = Array.isArray(options.seed) ? options.seed[0] : options.seed ?? model.initial[0];
  const evaluate = theta => {
    const pose = fourBarPose(model, theta);
    if (pose.status !== 'expanded') return null;
    const residual = poseResidual(pose, target);
    return { theta, pose, residual, score: Math.hypot(residual.positionError, orientationWeight * residual.orientationError) };
  };
  const grid = Array.from({ length: samples + 1 }, (_, i) => evaluate(lower + (upper - lower) * i / samples));
  const candidates = grid.filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 12);
  if (Number.isFinite(seed)) { const seeded = evaluate(Math.max(lower, Math.min(upper, seed))); if (seeded) candidates.push(seeded); }
  // Refine every sampled local minimum. A valid interval may be split by a toggle or passive limit.
  for (let i = 1; i < samples; i++) {
    if (!grid[i] || (grid[i - 1] && grid[i - 1].score < grid[i].score) || (grid[i + 1] && grid[i + 1].score < grid[i].score)) continue;
    let lo = lower + (upper - lower) * (i - 1) / samples;
    let hi = lower + (upper - lower) * (i + 1) / samples;
    for (let step = 0; step < 90; step++) {
      const x = lo + (hi - lo) * 0.3819660112501051;
      const y = hi - (hi - lo) * 0.3819660112501051;
      const sx = evaluate(x)?.score ?? Infinity, sy = evaluate(y)?.score ?? Infinity;
      if (sx < sy) hi = y; else lo = x;
    }
    const refined = evaluate((lo + hi) / 2);
    if (refined) candidates.push(refined);
  }
  if (!candidates.length) return failure('unreachable', 'No valid four-bar configuration exists in the driver limits.');
  candidates.sort((a, b) => a.score - b.score || Math.abs(a.theta - seed) - Math.abs(b.theta - seed));
  const isStateValid = options.isStateValid ?? (() => true);
  let collision = false;
  for (const candidate of candidates) {
    // The weighted score is not an ordering of either individual tolerance.
    if (candidate.residual.positionError > positionTolerance || candidate.residual.orientationError > orientationTolerance) continue;
    if (!isStateValid([candidate.theta], candidate)) { collision = true; continue; }
    return { status: 'reached', theta: candidate.theta, q: [candidate.theta], expandedQ: candidate.pose.q,
      pose: { position: candidate.pose.position, quaternion: candidate.pose.quaternion },
      positionError: candidate.residual.positionError, orientationError: candidate.residual.orientationError };
  }
  const best = candidates[0];
  return { status: collision ? 'collision' : 'unreachable',
    reason: collision ? 'The target pose is reachable only in a disallowed state.' : 'No four-bar configuration met the full pose tolerances.',
    theta: best.theta, q: [best.theta], expandedQ: best.pose.q,
    pose: { position: best.pose.position, quaternion: best.pose.quaternion },
    positionError: best.residual.positionError, orientationError: best.residual.orientationError };
}
