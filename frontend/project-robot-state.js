/** Validate a saved independent-joint vector against a previously validated URDF. */
export function validateRobotStateForURDF(state, document) {
  if (state == null) return null; // Archives made before joint-state persistence.
  if (!Array.isArray(state.jointNames) || !Array.isArray(state.positions) || state.jointNames.length !== state.positions.length ||
    new Set(state.jointNames).size !== state.jointNames.length || !state.positions.every(Number.isFinite)) {
    throw new Error('Project robot state needs unique joint names and finite positions.');
  }
  const joints = [...document.querySelectorAll('robot > joint')];
  const independent = joints.filter(joint => joint.getAttribute('type') !== 'fixed' && !joint.querySelector(':scope > mimic'));
  const values = new Map(state.jointNames.map((name, index) => [name, state.positions[index]]));
  const expected = new Set(independent.map(joint => joint.getAttribute('name')));
  if (values.size !== expected.size || [...values.keys()].some(name => !expected.has(name))) {
    throw new Error(`Project robot state must name every independent joint: ${[...expected].join(', ')}.`);
  }
  const children = new Map(joints.map(joint => [joint.getAttribute('name'), []]));
  for (const joint of joints) {
    const mimic = joint.querySelector(':scope > mimic');
    if (mimic) children.get(mimic.getAttribute('joint'))?.push(joint);
  }
  const check = (joint, value) => {
    const name = joint.getAttribute('name'), type = joint.getAttribute('type');
    if (!Number.isFinite(value)) throw new Error(`Project robot state for ${name} is not finite.`);
    if (type !== 'continuous') {
      const limit = joint.querySelector(':scope > limit');
      const lower = type === 'fixed' ? 0 : Number(limit?.getAttribute('lower') ?? -Math.PI);
      const upper = type === 'fixed' ? 0 : Number(limit?.getAttribute('upper') ?? Math.PI);
      if (value < lower || value > upper) throw new Error(`Project robot state for ${name} is outside [${lower}, ${upper}].`);
    }
    for (const child of children.get(name) || []) {
      const mimic = child.querySelector(':scope > mimic');
      const multiplier = Number(mimic.getAttribute('multiplier') ?? 1);
      const offset = Number(mimic.getAttribute('offset') ?? 0);
      check(child, value * multiplier + offset);
    }
  };
  for (const joint of independent) check(joint, values.get(joint.getAttribute('name')));
  return values;
}
