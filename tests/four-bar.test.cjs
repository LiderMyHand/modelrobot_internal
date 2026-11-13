const test = require('node:test');
const assert = require('node:assert/strict');

const I = (x = 0, y = 0) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1];
const descriptor = branch => ({ format: 'modelrobot-kinematic-constraints', version: 1, mechanisms: [{
  type: 'planar-four-bar', robot: 'four_bar', driverJoint: 'input', couplerJoint: 'coupler',
  outputJoint: 'output', leftClosureLink: 'C_left', rightClosureLink: 'C_right', branch,
}] });
const joint = (name, parent, child, type, x, lower = -Math.PI * 2, upper = Math.PI * 2, theta = 0) =>
  ({ name, parent, child, type, axis: [0, 0, 1], origin: I(x), lower, upper, theta });
const joints = () => [
  joint('input', 'base', 'input_bar', 'revolute', 0, 0.35, 1.2, 0.7),
  joint('coupler', 'input_bar', 'coupler_bar', 'revolute', 0.22),
  joint('output', 'base', 'output_bar', 'revolute', 0.55),
  joint('left_pin', 'coupler_bar', 'C_left', 'fixed', 0.48),
  joint('right_pin', 'output_bar', 'C_right', 'fixed', 0.32),
];

test('four-bar validates cut tree and derives geometry from URDF origins', async () => {
  const { createFourBarModel } = await import('../frontend/planning/four-bar.js');
  const model = createFourBarModel({ descriptor: descriptor(1), joints: joints(), tipLink: 'C_left' });
  assert.deepEqual(model.dimensions, { a: 0.22, b: 0.48, c: 0.32, d: 0.55 });
  assert.deepEqual(model.jointNames, ['input']);
  assert.deepEqual(model.expandedJointNames, ['input', 'coupler', 'output']);
  assert.deepEqual(model.initial, [0.7]);
  assert.equal(typeof structuredClone(model), 'object');
  const broken = joints(); broken[1].parent = 'base';
  assert.throws(() => createFourBarModel({ descriptor: descriptor(1), joints: broken }), /topology/);
  const tilted = joints(); tilted[2].axis = [0, 1, 0];
  assert.throws(() => createFourBarModel({ descriptor: descriptor(1), joints: tilted }), /\+Z axis/);
  const rotated = joints(); rotated[3].origin[0] = 0;
  assert.throws(() => createFourBarModel({ descriptor: descriptor(1), joints: rotated }), /identity rotation/);
});

test('both branches close and expanded values are relative URDF angles', async () => {
  const { createFourBarModel, expandFourBar } = await import('../frontend/planning/four-bar.js');
  const plus = createFourBarModel({ descriptor: descriptor(1), joints: joints() });
  const minus = createFourBarModel({ descriptor: descriptor(-1), joints: joints() });
  for (let i = 0; i <= 85; i++) {
    const theta = 0.35 + 0.85 * i / 85;
    const p = expandFourBar(plus, theta), m = expandFourBar(minus, theta);
    assert.equal(p.status, 'expanded'); assert.equal(m.status, 'expanded');
    assert.ok(p.closureResidual < 1e-12); assert.ok(m.closureResidual < 1e-12);
    assert.ok(Math.hypot(p.points.C[0] - m.points.C[0], p.points.C[1] - m.points.C[1]) > 0.5);
    for (const state of [p, m]) {
      assert.ok(Math.abs(state.phi - (state.q[0] + state.q[1])) < 1e-12);
      assert.ok(Math.abs(state.psi - state.q[2]) < 1e-12);
    }
  }
});

test('passive rates and acceleration match centered differences', async () => {
  const { createFourBarModel, expandFourBar, fourBarRates } = await import('../frontend/planning/four-bar.js');
  const model = createFourBarModel({ descriptor: descriptor(1), joints: joints() });
  const theta = 0.71, h = 1e-4;
  const state = expandFourBar(model, theta), lo = expandFourBar(model, theta - h), hi = expandFourBar(model, theta + h);
  for (let i = 0; i < 3; i++) {
    const first = (hi.q[i] - lo.q[i]) / (2 * h);
    const second = (hi.q[i] - 2 * state.q[i] + lo.q[i]) / h ** 2;
    assert.ok(Math.abs(first - state.ratePerTheta[i]) < 1e-7, `rate ${i}`);
    assert.ok(Math.abs(second - state.secondPerTheta2[i]) < 2e-6, `acceleration ${i}`);
  }
  const rates = fourBarRates(state, 0.4, 0.3);
  assert.ok(Math.abs(rates.velocity[1] - state.ratePerTheta[1] * 0.4) < 1e-12);
  assert.ok(Math.abs(rates.acceleration[2] - (state.ratePerTheta[2] * 0.3 + state.secondPerTheta2[2] * 0.16)) < 1e-12);
});

test('joint limits, impossible geometry, and toggle report typed failures', async () => {
  const { createFourBarModel, expandFourBar } = await import('../frontend/planning/four-bar.js');
  const model = createFourBarModel({ descriptor: descriptor(1), joints: joints() });
  assert.equal(expandFourBar(model, 0.1).status, 'joint_limit');
  const passive = structuredClone(model); passive.limits[1] = [0, 0.01];
  assert.equal(expandFourBar(passive, 0.7).status, 'joint_limit');
  const impossible = structuredClone(model); impossible.dimensions.b = 0.01;
  assert.equal(expandFourBar(impossible, 0.7).status, 'unreachable');
  const toggle = structuredClone(model);
  const r = Math.hypot(toggle.dimensions.d - toggle.dimensions.a * Math.cos(0.7), toggle.dimensions.a * Math.sin(0.7));
  toggle.dimensions.b = r - toggle.dimensions.c;
  assert.equal(expandFourBar(toggle, 0.7).status, 'toggle');
});

test('full-pose IK recovers a reachable TCP and rejects an off-manifold target', async () => {
  const { createFourBarModel, fourBarPose, solveFourBarPose } = await import('../frontend/planning/four-bar.js');
  const model = createFourBarModel({ descriptor: descriptor(1), joints: joints(), tipLink: 'C_right', worldFromBase: I(1, 2) });
  const target = fourBarPose(model, 0.92);
  assert.equal(target.status, 'expanded');
  const result = solveFourBarPose(model, target, { seed: 0.4 });
  assert.equal(result.status, 'reached');
  assert.ok(Math.abs(result.theta - 0.92) < 1e-4);
  assert.equal(result.q.length, 1);
  assert.equal(result.expandedQ.length, 3);
  const off = { position: [target.position[0], target.position[1], target.position[2] + 0.2], quaternion: target.quaternion };
  assert.equal(solveFourBarPose(model, off).status, 'unreachable');
  assert.equal(solveFourBarPose(model, target, { isStateValid: () => false }).status, 'collision');
});
