const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const fixture = name => readFileSync(path.join(root, 'testowe/four_bar', name), 'utf8');
const origin = x => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
function joints(T) {
  const joint = (name, parent, child, type, x, lower = 0, upper = 0, theta = 0, velocity = 1) => ({
    name, parent, child, type, axis: new T.Vector3(0, 0, 1), basicMatrix: new T.Matrix4().fromArray(origin(x)),
    lower, upper, theta, attributes: { limit: { velocity } },
  });
  return [
    joint('input', 'base', 'input_link', 'revolute', 0, .35, 1.2, .6, .8),
    joint('coupler', 'input_link', 'coupler_link', 'revolute', .22, -1.05, .25, 0, 1.6),
    joint('left_pin', 'coupler_link', 'C_left', 'fixed', .48),
    joint('output', 'base', 'output_link', 'revolute', .55, 1.25, 1.7, 0, .8),
    joint('right_pin', 'output_link', 'C_right', 'fixed', .32),
  ];
}

test('worker and direct four-bar plans keep only the driver trajectory and close every sample', async () => {
  const T = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const { compileProgram } = await import('../frontend/program.js');
  const { planProgram } = await import('../frontend/program-plan.js');
  const { snapshotProgramContext } = await import('../frontend/planning/snapshot.js');
  const { planProgramFromSnapshot } = await import('../frontend/planning/worker-core.js');
  const { expandFourBar } = await import('../frontend/planning/four-bar.js');
  const { interpolateTimedJointSegment } = await import('../frontend/timed-joints.js');
  const scene = new T.Scene(), robotRoot = new T.Group(); scene.add(robotRoot);
  const sceneModel = new SceneModel({ scene });
  sceneModel.addRobot('four_bar', robotRoot, { links: new Map(['base', 'input_link', 'coupler_link', 'C_left', 'output_link', 'C_right']
    .map(name => [name, new T.Group()])) });
  sceneModel.loadWorld({ name: 'four_bar_world', models: [] });
  const context = { robotName: 'four_bar', robotRoot, jointModels: joints(T), sceneModel,
    robotCollisionShapes: [
      { link: 'input_link', geometry: { type: 'box', size: [.1, .02, .02] }, origin: origin(.1) },
      { link: 'C_left', geometry: { type: 'sphere', radius: .012 }, origin: origin(0) },
      { link: 'C_right', geometry: { type: 'sphere', radius: .012 }, origin: origin(0) },
    ],
    kinematicConstraints: JSON.parse(fixture('kinematic-constraints.json')) };
  const compiled = compileProgram(fixture('program.robot'));
  assert.equal(compiled.ok, true);
  const direct = planProgram(compiled, context);
  assert.equal(direct.status, 'planned', JSON.stringify(direct.diagnostics));
  assert.equal(direct.constrained, true);
  assert.deepEqual(direct.trajectory.joint_names, ['input']);
  assert.equal(direct.plans.length, 3);
  assert.ok(direct.samples.length > 10);
  for (const sample of direct.samples) {
    assert.equal(sample.q.length, 1);
    const state = expandFourBar(direct.model, sample.q[0]);
    assert.equal(state.status, 'expanded');
    assert.ok(state.closureResidual < 1e-8);
  }
  const limited = planProgram(compiled, { ...context,
    motionLimits: { coupler: { velocity: .12, acceleration: .18 } } });
  assert.equal(limited.status, 'planned', JSON.stringify(limited.diagnostics));
  assert.ok(limited.duration > direct.duration);
  const bound = limited.limitDetails;
  const replayStates = [...limited.samples];
  for (let i = 1; i < limited.samples.length; i++) {
    const a = limited.samples[i - 1], b = limited.samples[i];
    for (const fraction of [0.25, 0.5, 0.75])
      replayStates.push(interpolateTimedJointSegment(a, b, a.time + (b.time - a.time) * fraction));
  }
  for (const sample of replayStates) {
    const state = expandFourBar(limited.model, sample.q[0]);
    assert.equal(state.status, 'expanded');
    for (let j = 0; j < 3; j++) {
      const velocity = state.ratePerTheta[j] * sample.velocity[0];
      const acceleration = state.ratePerTheta[j] * sample.acceleration[0] +
        state.secondPerTheta2[j] * sample.velocity[0] ** 2;
      assert.ok(Math.abs(velocity) <= bound[j].velocity + 1e-8, `velocity ${j}`);
      assert.ok(Math.abs(acceleration) <= bound[j].acceleration + 1e-8, `acceleration ${j}`);
    }
  }
  const worker = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(context));
  assert.equal(worker.status, 'planned', JSON.stringify(worker.diagnostics));
  assert.deepEqual(worker.trajectory, direct.trajectory);
  const first = direct.samples[4], second = direct.samples[5];
  const midway = expandFourBar(direct.model, (first.q[0] + second.q[0]) / 2);
  assert.ok(midway.closureResidual < 1e-8);
  const bad = compileProgram('ROBOT four_bar\nTOOL C_left\nJOINTS bad input=0.8 coupler=0\nMOVEJ bad');
  assert.equal(planProgram(bad, context).diagnostics[0].code, 'FOUR_BAR_JOINT_TARGET');
  const infeasible = compileProgram('ROBOT four_bar\nTOOL C_left\nPOSE far world 0 0 1 Q 0 0 0 1\nMOVEJ far');
  assert.equal(planProgram(infeasible, context).diagnostics[0].code, 'FOUR_BAR_IK');
});
