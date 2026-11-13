const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, createRobotModel, forwardKinematics, geometricJacobian, solveVelocity;
before(async () => {
  T = await import('three');
  ({ createRobotModel, forwardKinematics } = await import('../frontend/planning/robot-model.js'));
  ({ geometricJacobian, solveVelocity } = await import('../frontend/planning/velocity-ik.js'));
});

function joint(name, parent, child, axis, origin, limits = [-2, 2], type = 'revolute') {
  return { name, parent, child, type, axis, basicMatrix: new T.Matrix4().makeTranslation(...origin),
    lower: limits[0], upper: limits[1], theta: 0 };
}

function pivot() {
  return createRobotModel({ joints: [joint('turn', 'base', 'tcp', [0, 0, 1], [0, 0, 0], [-2, 2])],
    tipLink: 'tcp', toolTransform: new T.Matrix4().makeTranslation(1, 0, 0) });
}

test('geometric Jacobian maps a pivot rate to TCP tangent speed and yaw rate', () => {
  const J = geometricJacobian(pivot(), [0]);
  assert.deepEqual(J.map(row => row[0]), [0, 1, 0, 0, 0, 1]);
  const result = solveVelocity(pivot(), [0], [0, 0.1, 0, 0, 0, 0.1]);
  assert.equal(result.status, 'solved', JSON.stringify(result));
  assert.ok(Math.abs(result.qdot[0] - 0.1) < 1e-6);
  assert.ok(result.translationError < 1e-6 && result.rotationError < 1e-6);
});

test('tool-frame TCP twist rotates with the current tool orientation', () => {
  const model = pivot(), q = [Math.PI / 2];
  const result = solveVelocity(model, q, [0, 0.1, 0, 0, 0, 0.1], { frame: 'tool' });
  assert.equal(result.status, 'solved', JSON.stringify(result));
  assert.ok(Math.abs(result.qdot[0] - 0.1) < 1e-6);
  assert.ok(Math.abs(result.achieved[1] - 0.1) < 1e-6);
  const world = solveVelocity(model, q, [-0.1, 0, 0, 0, 0, 0.1], { frame: 'world' });
  assert.equal(world.status, 'solved', JSON.stringify(world));
  assert.ok(Math.abs(result.qdot[0] - world.qdot[0]) < 1e-9);
});

test('unreachable instantaneous direction reports a singular Jacobian residual', () => {
  const result = solveVelocity(pivot(), [0], [0.1, 0, 0, 0, 0, 0]);
  assert.equal(result.status, 'singular', JSON.stringify(result));
  assert.equal(result.rank, 1);
  assert.ok(result.translationError > 0.099);
  assert.ok(Math.abs(result.qdot[0]) < 1e-10);
});

test('rate and near-bound position limits report best bounded rate without hiding the shortfall', () => {
  const rate = solveVelocity(pivot(), [0], [0, 0.2, 0, 0, 0, 0.2],
    { velocityLimits: [0.05], dt: 0.1 });
  assert.equal(rate.status, 'limited', JSON.stringify(rate));
  assert.ok(Math.abs(rate.qdot[0] - 0.05) < 1e-10);
  assert.deepEqual(rate.limitedJoints, ['turn']);
  assert.ok(rate.rotationError > 0.14);

  const model = pivot();
  model.joints[model.active[0]].upper = 1;
  const position = solveVelocity(model, [0.995], [-0.1 * Math.sin(0.995), 0.1 * Math.cos(0.995), 0, 0, 0, 0.1],
    { dt: 0.1 });
  assert.equal(position.status, 'limited', JSON.stringify(position));
  assert.ok(position.qdot[0] <= 0.05 + 1e-12);
  assert.ok(position.nextQ[0] <= 1 + 1e-12);
});

test('six-axis DLS realizes a feasible twist on a rotated robot base', () => {
  const base = new T.Matrix4().makeRotationZ(0.4).setPosition(0.8, -0.3, 0.15);
  const model = createRobotModel({ joints: [
    joint('j1', 'base', 'l1', [0, 0, 1], [0, 0, 0]),
    joint('j2', 'l1', 'l2', [0, 1, 0], [0, 0, 0.3]),
    joint('j3', 'l2', 'l3', [0, 1, 0], [0.35, 0, 0]),
    joint('j4', 'l3', 'l4', [1, 0, 0], [0.3, 0, 0]),
    joint('j5', 'l4', 'l5', [0, 1, 0], [0.2, 0, 0]),
    joint('j6', 'l5', 'tcp', [1, 0, 0], [0, 0, 0.12]),
  ], tipLink: 'tcp', toolTransform: new T.Matrix4().makeTranslation(0.12, 0, 0), worldFromBase: base });
  const q = [0.4, -0.3, 0.5, 0.25, -0.2, 0.3];
  const rates = [0.05, -0.03, 0.04, 0.02, 0.01, -0.025];
  const J = geometricJacobian(model, q);
  const requested = J.map(row => row.reduce((sum, value, index) => sum + value * rates[index], 0));
  const result = solveVelocity(model, q, requested, { dt: 0.02, velocityLimits: Array(6).fill(0.4) });
  assert.equal(result.status, 'solved', JSON.stringify(result));
  assert.ok(result.translationError < 1e-5 && result.rotationError < 1e-5);
  assert.ok(result.qdot.every((value, index) => Math.abs(value - rates[index]) < 1e-4));
  const p0 = forwardKinematics(model, q).position;
  const p1 = forwardKinematics(model, result.nextQ).position;
  assert.ok(Math.hypot(...p1.map((value, index) => value - p0[index] - requested[index] * 0.02)) < 1e-4);
});

test('velocity IK validates frame, dimension and limit inputs', () => {
  const model = pivot(), zero = [0, 0, 0, 0, 0, 0];
  assert.equal(solveVelocity(model, [0], zero, { frame: 'base' }).status, 'invalid_target');
  assert.equal(solveVelocity(model, [0], [0, 0]).status, 'invalid_target');
  assert.equal(solveVelocity(model, [0], zero, { velocityLimits: [-1] }).status, 'invalid_target');
  assert.equal(solveVelocity(model, [0], zero, { dt: 0 }).status, 'invalid_target');
});
