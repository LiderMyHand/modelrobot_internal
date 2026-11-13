/** Portable project extension for the first supported closed-loop mechanism. */
import { Euler, Matrix4 } from 'three';
import { createFourBarModel, expandFourBar } from './planning/four-bar.js';
const FIELDS = ['branch', 'couplerJoint', 'driverJoint', 'leftClosureLink', 'outputJoint', 'rightClosureLink', 'robot', 'type'];
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function normalizeKinematicConstraints(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      Object.keys(value).sort().join(',') !== 'format,mechanisms,version' ||
      value.format !== 'modelrobot-kinematic-constraints' || value.version !== 1 ||
      !Array.isArray(value.mechanisms) || value.mechanisms.length !== 1) {
    throw new Error('Unsupported or invalid kinematic-constraints.json format or version.');
  }
  const mechanism = value.mechanisms[0];
  if (!mechanism || Array.isArray(mechanism) || typeof mechanism !== 'object' ||
      Object.keys(mechanism).sort().join(',') !== FIELDS.join(',') ||
      mechanism.type !== 'planar-four-bar' || ![1, -1].includes(mechanism.branch) ||
      ['robot', 'driverJoint', 'couplerJoint', 'outputJoint', 'leftClosureLink', 'rightClosureLink']
        .some(key => typeof mechanism[key] !== 'string' || !IDENTIFIER.test(mechanism[key])) ||
      new Set([mechanism.driverJoint, mechanism.couplerJoint, mechanism.outputJoint]).size !== 3 ||
      mechanism.leftClosureLink === mechanism.rightClosureLink) {
    throw new Error('Invalid planar-four-bar mechanism in kinematic-constraints.json.');
  }
  return { format: value.format, version: 1, mechanisms: [{ ...mechanism }] };
}

const tuple = (value, label, fallback) => {
  if (value == null) return fallback;
  const numbers = value.trim().split(/\s+/).map(Number);
  if (numbers.length !== 3 || !numbers.every(Number.isFinite)) throw new Error(`${label} needs three finite numbers.`);
  return numbers;
};

/**
 * Validate a constrained project's saved independent state before scene mutation.
 * The URDF has already passed the application's ordinary tree validator.
 */
export function validateFourBarProjectState({ descriptor, robotDocument, robotState }) {
  const normalized = normalizeKinematicConstraints(descriptor);
  const mechanism = normalized.mechanisms[0];
  if (!robotDocument || robotDocument.documentElement?.tagName !== 'robot' ||
      robotDocument.documentElement.getAttribute('name') !== mechanism.robot) {
    throw new Error('Kinematic constraints robot does not match the URDF robot name.');
  }
  if (!robotState || !Array.isArray(robotState.jointNames) || !Array.isArray(robotState.positions) ||
      robotState.jointNames.length !== 1 || robotState.positions.length !== 1 ||
      robotState.jointNames[0] !== mechanism.driverJoint || !Number.isFinite(robotState.positions[0])) {
    throw new Error(`Four-bar robot state must contain only independent joint ${mechanism.driverJoint}.`);
  }
  const theta = robotState.positions[0];
  const joints = [...robotDocument.querySelectorAll('robot > joint')].map(joint => {
    const name = joint.getAttribute('name');
    const origin = joint.querySelector(':scope > origin');
    const xyz = tuple(origin?.getAttribute('xyz'), `Joint ${name} origin xyz`, [0, 0, 0]);
    const rpy = tuple(origin?.getAttribute('rpy'), `Joint ${name} origin rpy`, [0, 0, 0]);
    const limit = joint.querySelector(':scope > limit');
    const type = joint.getAttribute('type');
    return {
      name, type,
      parent: joint.querySelector(':scope > parent')?.getAttribute('link'),
      child: joint.querySelector(':scope > child')?.getAttribute('link'),
      origin: [...new Matrix4().makeRotationFromEuler(new Euler(...rpy, 'ZYX')).setPosition(...xyz).elements],
      axis: tuple(joint.querySelector(':scope > axis')?.getAttribute('xyz'), `Joint ${name} axis`, [1, 0, 0]),
      lower: type === 'fixed' ? 0 : limit?.hasAttribute('lower') ? Number(limit.getAttribute('lower')) : NaN,
      upper: type === 'fixed' ? 0 : limit?.hasAttribute('upper') ? Number(limit.getAttribute('upper')) : NaN,
      velocity: limit?.hasAttribute('velocity') ? Number(limit.getAttribute('velocity')) : NaN,
      theta: name === mechanism.driverJoint ? theta : 0,
      mimic: joint.querySelector(':scope > mimic') ? true : null,
    };
  });
  const moving = joints.filter(joint => joint.type !== 'fixed');
  const expected = new Set([mechanism.driverJoint, mechanism.couplerJoint, mechanism.outputJoint]);
  if (moving.length !== expected.size || moving.some(joint => !expected.has(joint.name)))
    throw new Error('Four-bar URDF must have exactly the three declared moving joints.');
  const model = createFourBarModel({ descriptor: normalized, joints, tipLink: mechanism.leftClosureLink });
  const home = expandFourBar(model, theta);
  if (home.status !== 'expanded') throw new Error(`Saved four-bar input does not close: ${home.reason}`);
  // Also reject a declared input interval with an obviously unreachable or
  // passive-limit-invalid section. Motion planning rechecks every path sample.
  const [lower, upper] = model.limits[0];
  for (let index = 0; index <= 256; index++) {
    const input = lower + (upper - lower) * index / 256;
    const state = expandFourBar(model, input, { seed: home.q });
    if (state.status !== 'expanded')
      throw new Error(`Four-bar input range fails near ${input.toPrecision(6)} rad: ${state.reason}`);
  }
  return { descriptor: normalized, model, independentState: [theta], expandedState: home.q,
    closureResidual: home.closureResidual };
}
