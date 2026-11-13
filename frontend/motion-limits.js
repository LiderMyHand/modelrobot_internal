/** Return planner limits in the active-joint order of a serializable robot model. */
export function resolveMotionLimits(model, jointModels, overrides = {}) {
  if (!model?.jointNames || !Array.isArray(jointModels) || !overrides || typeof overrides !== 'object') throw new Error('Robot model and motion settings are required.');
  const byName = new Map(jointModels.map(joint => [joint.name ?? joint.get?.('name'), joint]));
  const details = model.jointNames.map((name, index) => {
    const joint = byName.get(name), type = model.joints[model.active[index]].type;
    const urdfVelocity = Number(joint?.get?.('limit')?.velocity ?? joint?.attributes?.limit?.velocity);
    const velocityDefault = Number.isFinite(urdfVelocity) && urdfVelocity > 0 ? urdfVelocity : type === 'prismatic' ? 0.25 : 1;
    const accelerationDefault = 2 * velocityDefault;
    const configured = overrides[name] || {};
    const velocity = configured.velocity == null ? velocityDefault : Number(configured.velocity);
    const acceleration = configured.acceleration == null ? accelerationDefault : Number(configured.acceleration);
    if (![velocity, acceleration].every(value => Number.isFinite(value) && value > 0)) throw new Error(`Joint ${name} needs positive velocity and acceleration limits.`);
    return { name, velocity, acceleration,
      velocitySource: configured.velocity == null ? (urdfVelocity > 0 ? 'URDF' : 'simulation default') : 'project setting',
      accelerationSource: configured.acceleration == null ? 'simulation default' : 'project setting' };
  });
  return { velocity: details.map(item => item.velocity), acceleration: details.map(item => item.acceleration), details };
}
