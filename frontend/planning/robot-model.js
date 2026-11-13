import { Matrix4, Quaternion, Vector3 } from 'three';

const TYPES = new Set(['fixed', 'revolute', 'continuous', 'prismatic']);
const finiteArray = (values, length, label) => {
  if (!Array.isArray(values) || values.length !== length || !values.every(Number.isFinite)) throw new Error(`${label} needs ${length} finite numbers.`);
  return values;
};
const matrixValues = (value, label) => {
  const values = value?.elements ? [...value.elements] : value == null ? new Matrix4().elements.slice() : [...value];
  return finiteArray(values, 16, label);
};

/** Snapshot a serial URDF chain. The result contains plain arrays and can cross a Worker boundary. */
export function createRobotModel({ joints, tipLink, toolTransform, worldFromBase } = {}) {
  if (!tipLink || !Array.isArray(joints)) throw new Error('IK needs a tip link and a joint array.');
  const byChild = new Map();
  for (const joint of joints) {
    const child = joint.get?.('child')?.link ?? joint.child;
    if (!child || byChild.has(child)) throw new Error('IK requires one parent joint per link.');
    byChild.set(child, joint);
  }
  const chain = [], seen = new Set();
  let link = tipLink;
  while (byChild.has(link)) {
    if (seen.has(link)) throw new Error('IK requires an acyclic joint tree.');
    seen.add(link);
    const joint = byChild.get(link);
    const parent = joint.get?.('parent')?.link ?? joint.parent;
    const type = joint.type;
    if (!TYPES.has(type)) throw new Error(`IK does not support ${type} joints.`);
    if (joint.mimic && type !== 'fixed') throw new Error(`IK cannot directly drive mimic joint ${joint.name}.`);
    const axis = joint.axis?.toArray ? joint.axis.toArray() : joint.axis ?? [1, 0, 0];
    finiteArray(axis, 3, `Joint ${joint.name} axis`);
    const normalized = new Vector3(...axis);
    if (type !== 'fixed' && normalized.lengthSq() < 1e-20) throw new Error(`Joint ${joint.name} axis is zero.`);
    normalized.normalize();
    const lower = type === 'continuous' || type === 'fixed' ? null : Number(joint.lower);
    const upper = type === 'continuous' || type === 'fixed' ? null : Number(joint.upper);
    if (type !== 'continuous' && type !== 'fixed' && (!Number.isFinite(lower) || !Number.isFinite(upper) || lower > upper)) throw new Error(`Joint ${joint.name} needs valid limits.`);
    chain.push({
      name: joint.name ?? joint.get?.('name') ?? child,
      parent, child: link, type, axis: normalized.toArray(),
      origin: matrixValues(joint.basicMatrix ?? joint.origin, `Joint ${joint.name} origin`),
      lower, upper, initial: type === 'fixed' ? null : Number(joint.theta ?? 0),
    });
    link = parent;
  }
  chain.reverse();
  const active = chain.map((joint, index) => joint.type === 'fixed' ? null : index).filter(index => index != null);
  if (!active.length) throw new Error('IK chain has no movable joints.');
  for (const index of active) if (!Number.isFinite(chain[index].initial)) throw new Error(`Joint ${chain[index].name} has an invalid position.`);
  return {
    baseLink: link, tipLink, joints: chain, active,
    jointNames: active.map(index => chain[index].name),
    initial: active.map(index => chain[index].initial),
    toolTransform: matrixValues(toolTransform, 'Tool transform'),
    worldFromBase: matrixValues(worldFromBase, 'Robot base transform'),
  };
}

export function clampConfiguration(model, values) {
  finiteArray(values, model.active.length, 'Joint configuration');
  return values.map((value, k) => {
    const joint = model.joints[model.active[k]];
    return joint.type === 'continuous' ? value : Math.max(joint.lower, Math.min(joint.upper, value));
  });
}

/** Forward pose and joint frames, both in world coordinates. */
export function forwardKinematics(model, values, { frames = false } = {}) {
  finiteArray(values, model.active.length, 'Joint configuration');
  const transform = new Matrix4().fromArray(model.worldFromBase);
  const jointFrames = [];
  let activeIndex = 0;
  for (const joint of model.joints) {
    transform.multiply(new Matrix4().fromArray(joint.origin));
    if (joint.type === 'fixed') continue;
    const origin = new Vector3().setFromMatrixPosition(transform);
    const axis = new Vector3(...joint.axis).transformDirection(transform);
    jointFrames.push({ origin, axis, type: joint.type });
    const value = values[activeIndex++];
    const motion = joint.type === 'prismatic'
      ? new Matrix4().makeTranslation(joint.axis[0] * value, joint.axis[1] * value, joint.axis[2] * value)
      : new Matrix4().makeRotationAxis(new Vector3(...joint.axis), value);
    transform.multiply(motion);
  }
  transform.multiply(new Matrix4().fromArray(model.toolTransform));
  const position = new Vector3(), quaternion = new Quaternion(), scale = new Vector3();
  transform.decompose(position, quaternion, scale);
  const result = { position: position.toArray(), quaternion: quaternion.toArray() };
  if (frames) result.frames = jointFrames;
  return result;
}
