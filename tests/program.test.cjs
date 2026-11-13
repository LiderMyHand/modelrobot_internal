const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let compileProgram, axisAngleToQuaternion, quaternionToAxisAngle;
before(async () => ({ compileProgram, axisAngleToQuaternion, quaternionToAxisAngle } = await import('../frontend/program.js')));

test('pick-and-place source compiles into named six-dimensional poses and typed steps', () => {
  const source = `# metres and radians
JOINTS home shoulder=0 elbow=-0.8
POSE pick world 0.4 0 0.2 0 0 0 2
POSE via world 0.5 0.1 0.3 0 0 0 1
POSE place world 0.6 0.2 0.2 0 0 0 1
ROBOT arm
TOOL tcp
MOVEJ home
MOVEL pick
GRAB box
MOVEC via place
RELEASE box
PAUSE 0.5`;
  const result = compileProgram(source);
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.poses.get('pick').position, [0.4, 0, 0.2]);
  assert.deepEqual(result.poses.get('pick').quaternion, [0, 0, 0, 1]);
  assert.equal(result.joints.get('home').values.elbow, -0.8);
  assert.deepEqual(result.steps.map(step => step.kind), ['ROBOT','TOOL','MOVEJ','MOVEL','GRAB','MOVEC','RELEASE','PAUSE']);
  assert.equal(result.steps.find(step => step.kind === 'MOVEC').line, 11);
});

test('parser rejects malformed syntax, unknown targets, duplicate definitions, and unsafe text with line diagnostics', () => {
  const source = `MOVEL nowhere
ROBOT arm
JOINTS home shoulder=0 shoulder=1
POSE p world 0 0 0 0 0 0 0
POSE p world 0 0 0 0 0 0 1
MOVEC p absent
PAUSE -1
window.alert(1)`;
  const result = compileProgram(source);
  assert.equal(result.ok, false);
  assert.deepEqual(result.diagnostics.map(item => [item.line,item.code]), [
    [1,'ROBOT_REQUIRED'],[3,'JOINTS_SYNTAX'],[4,'POSE_QUATERNION'],[6,'UNKNOWN_TARGET'],[7,'PAUSE_SYNTAX'],[8,'UNKNOWN_COMMAND']
  ]);
});

test('forward references, comments, frame names, and finite numeric checks are deterministic', () => {
  const result = compileProgram(`ROBOT arm\nMOVEL approach # named later\nPOSE approach model/table/link/top 1e-1 -0.2 0.3 0 0 0 1\nJOINTS home wrist=Infinity\n`);
  assert.equal(result.steps[1].args[0], 'approach');
  assert.equal(result.poses.get('approach').frame, 'model/table/link/top');
  assert.deepEqual(result.diagnostics.map(item => item.code), ['JOINTS_SYNTAX']);
});

test('axis-angle and quaternion targets represent the same rotation', () => {
  const source = `POSE q world 0 0 0 Q 0 0 0.7071067811865475 0.7071067811865476\nPOSE a world 0 0 0 AA 0 0 2 1.5707963267948966`;
  const result = compileProgram(source);
  assert.equal(result.ok, true);
  const q = result.poses.get('q').quaternion, a = result.poses.get('a').quaternion;
  q.forEach((value, index) => assert.ok(Math.abs(value - a[index]) < 1e-12));
  assert.equal(result.poses.get('a').orientationInput, 'axis-angle');
  const angleAxis = quaternionToAxisAngle(q);
  assert.ok(Math.abs(angleAxis.angle - Math.PI / 2) < 1e-12);
  assert.deepEqual(axisAngleToQuaternion([0, 0, 0], 0), [0, 0, 0, 1]);
  assert.deepEqual(compileProgram('POSE bad world 0 0 0 AA 0 0 0 1').diagnostics.map(item => item.code), ['POSE_AXIS_ANGLE']);
});

test('axis-angle conversion preserves rotations at identity and 180 degrees', () => {
  for (const quaternion of [[0, 0, 0, 1], [0, 0, 1, 0], [0, 0, -1, 0], [0, 0, -0.7071067811865475, -0.7071067811865476]]) {
    const { axis, angle } = quaternionToAxisAngle(quaternion);
    const roundTrip = axisAngleToQuaternion(axis, angle);
    const dot = quaternion.reduce((sum, value, index) => sum + value * roundTrip[index], 0);
    assert.ok(Math.abs(Math.abs(dot) - 1) < 1e-12, `rotation changed for ${quaternion}`);
  }
  const compiled = compileProgram('POSE q world 0 0 0 Q 0 0 1 0\nPOSE a world 0 0 0 AA 0 0 -1 -3.141592653589793');
  assert.equal(compiled.ok, true);
  const q = compiled.poses.get('q').quaternion, a = compiled.poses.get('a').quaternion;
  assert.ok(Math.abs(Math.abs(q.reduce((sum, value, index) => sum + value * a[index], 0)) - 1) < 1e-12);
});

test('weld process commands compile and require bounded linear or circular motion', () => {
  const source = `ROBOT arm\nTOOL tcp\nPOSE start world 0 0 0 Q 0 0 0 1\nPOSE via world 0.1 0.1 0 Q 0 0 0 1\nPOSE end world 0.2 0 0 Q 0 0 0 1\nWELD ON workpiece\nMOVEL start\nMOVEC via end\nWELD OFF`;
  const compiled = compileProgram(source);
  assert.equal(compiled.ok, true);
  assert.deepEqual(compiled.steps.slice(-4).map(step => [step.kind, step.state ?? null]),
    [['WELD', 'ON'], ['MOVEL', null], ['MOVEC', null], ['WELD', 'OFF']]);
  assert.equal(compiled.steps.at(-4).object, 'workpiece');
  for (const forbidden of ['MOVEJ start', 'GRAB part', 'RELEASE part', 'PAUSE 0.5', 'TOOL other', 'ROBOT other']) {
    const result = compileProgram(`ROBOT arm\nTOOL tcp\nPOSE start world 0 0 0 Q 0 0 0 1\nWELD ON workpiece\n${forbidden}\nWELD OFF`);
    assert.ok(result.diagnostics.some(item => item.code === 'WELD_MOTION'), forbidden);
  }
  assert.deepEqual(compileProgram('ROBOT arm\nWELD OFF').diagnostics.map(item => item.code), ['WELD_STATE']);
  assert.deepEqual(compileProgram('ROBOT arm\nWELD ON workpiece\nWELD ON workpiece\nWELD OFF').diagnostics.map(item => item.code), ['WELD_STATE']);
  assert.deepEqual(compileProgram('ROBOT arm\nWELD ON workpiece').diagnostics.map(item => item.code), ['WELD_UNCLOSED']);
  assert.deepEqual(compileProgram('ROBOT arm\nWELD START').diagnostics.map(item => item.code), ['WELD_SYNTAX']);
  assert.deepEqual(compileProgram('ROBOT arm\nWELD ON').diagnostics.map(item => item.code), ['WELD_SYNTAX']);
});

test('WELD JOIN requires a finished seam involving the child or parent', () => {
  const source = `ROBOT arm\nTOOL tcp\nPOSE end world 0.5 0 0 Q 0 0 0 1\nWELD ON parent\nMOVEL end\nWELD OFF\nWELD JOIN child parent`;
  const compiled = compileProgram(source);
  assert.equal(compiled.ok, true);
  assert.deepEqual(compiled.steps.at(-1), { kind: 'WELD_JOIN', child: 'child', parent: 'parent', robot: 'arm', line: 7 });
  const missing = compileProgram('ROBOT arm\nWELD JOIN child parent');
  assert.deepEqual(missing.diagnostics.map(item => item.code), ['WELD_SEAM_REQUIRED']);
  const active = compileProgram('ROBOT arm\nWELD ON parent\nWELD JOIN child parent\nWELD OFF');
  assert.ok(active.diagnostics.some(item => item.code === 'WELD_MOTION'));
  const empty = compileProgram('ROBOT arm\nWELD ON parent\nWELD OFF\nWELD JOIN child parent');
  assert.deepEqual(empty.diagnostics.map(item => item.code), ['WELD_SEAM_REQUIRED']);
  const self = compileProgram('ROBOT arm\nWELD JOIN parent parent');
  assert.deepEqual(self.diagnostics.map(item => item.code), ['WELD_JOIN_SELF']);
  const syntax = compileProgram('ROBOT arm\nWELD JOIN child');
  assert.deepEqual(syntax.diagnostics.map(item => item.code), ['WELD_SYNTAX']);
  const repeated = compileProgram(`${source}\nWELD JOIN another parent`);
  assert.deepEqual(repeated.diagnostics.map(item => item.code), ['WELD_SEAM_REQUIRED']);
});
