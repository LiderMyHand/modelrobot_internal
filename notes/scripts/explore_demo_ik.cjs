const { writeFileSync } = require('node:fs');
const path = require('node:path');

async function main() {
  const { Matrix4, Euler, Quaternion } = await import('three');
  const { createRobotModel, forwardKinematics } = await import('../../frontend/planning/robot-model.js');
  const { solvePose } = await import('../../frontend/planning/ik-pose.js');
  const joint = (name, parent, child, xyz, axis, lower, upper, type = 'revolute') => ({
    name, parent, child, type, axis, lower, upper, theta: 0,
    origin: new Matrix4().makeTranslation(...xyz),
  });
  const joints = [
    joint('base_yaw', 'base_link', 'column_link', [0, 0, 0.2], [0, 0, 1], -3.14159, 3.14159),
    joint('shoulder_pitch', 'column_link', 'upper_arm_link', [0, 0, 0.75], [0, 1, 0], -1.8, 1.5),
    joint('elbow_pitch', 'upper_arm_link', 'forearm_link', [0.38, 0, 0], [0, 1, 0], -2.4, 2.4),
    joint('wrist_roll', 'forearm_link', 'wrist_roll_link', [0.32, 0, 0], [1, 0, 0], -3.14159, 3.14159),
    joint('wrist_pitch', 'wrist_roll_link', 'wrist_pitch_link', [0.08, 0, 0], [0, 1, 0], -2.2, 2.2),
    joint('wrist_final', 'wrist_pitch_link', 'wrist_final_link', [0.08, 0, 0], [1, 0, 0], -3.14159, 3.14159),
    joint('tcp_mount', 'wrist_final_link', 'tcp_link', [0.08, 0, 0], [1, 0, 0], null, null, 'fixed'),
  ];
  const model = createRobotModel({ joints, tipLink: 'tcp_link' });
  const orientations = [
    [0, 0, 0], [0, Math.PI / 2, 0], [0, -Math.PI / 2, 0],
    [0, 0, Math.PI], [0, Math.PI / 2, Math.PI], [0, -Math.PI / 2, Math.PI],
    [Math.PI / 2, 0, 0], [-Math.PI / 2, 0, 0],
  ];
  const positions = {
    pickApproach: [0.25, 0.16, 0.80], pick: [0.355, 0.16, 0.78],
    highVia: [0.60, 0.11, 1.12], placeApproach: [0.775, -0.16, 0.95], place: [0.775, -0.16, 0.80],
  };
  for (const x of [0.30, 0.35, 0.40, 0.45]) for (const z of [0.82, 0.87, 0.92]) positions[`approach_${x}_${z}`] = [x, 0.16, z];
  for (const z of [0.83, 0.90, 0.98]) positions[`topPick_${z}`] = [0.42, 0.16, z];
  for (const z of [0.85, 0.93, 1.02]) positions[`topPlace_${z}`] = [0.84, -0.16, z];
  const report = { home: forwardKinematics(model, model.initial), targets: {} };
  for (const [name, position] of Object.entries(positions)) {
    report.targets[name] = [];
    for (const rpy of orientations) {
      const quaternion = new Quaternion().setFromEuler(new Euler(...rpy, 'ZYX')).toArray();
      const result = solvePose(model, { position, quaternion }, { maxIterations: 240 });
      report.targets[name].push({ rpy, status: result.status, positionError: result.positionError, orientationError: result.orientationError, q: result.q });
    }
  }
  const destination = path.resolve(__dirname, '../artifacts/demo_ik_sweep.json');
  writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
  for (const [name, cases] of Object.entries(report.targets)) {
    const good = cases.filter(item => item.status === 'reached');
    console.log(name, 'solutions:', good.length, good.map(item => ({ rpy: item.rpy.map(v => Number(v.toFixed(2))), q: item.q.map(v => Number(v.toFixed(2))) })));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
