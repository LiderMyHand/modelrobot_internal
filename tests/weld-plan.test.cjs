const { test, before } = require('node:test');
const assert = require('node:assert/strict');

let T, SceneModel, compileProgram, planProgram, snapshotProgramContext, planProgramFromSnapshot;
before(async () => {
  T = await import('three');
  ({ SceneModel } = await import('../frontend/scene-model.js'));
  ({ compileProgram } = await import('../frontend/program.js'));
  ({ planProgram } = await import('../frontend/program-plan.js'));
  ({ snapshotProgramContext } = await import('../frontend/planning/snapshot.js'));
  ({ planProgramFromSnapshot } = await import('../frontend/planning/worker-core.js'));
});

function context() {
  const robotRoot = new T.Group();
  const sceneModel = new SceneModel({ scene: new T.Scene() });
  sceneModel.loadWorld({ name: 'weld_test', models: [{ name: 'workpiece', pose: [0.35, 0.1, -0.075, 0, 0, 0], static: true,
    links: [{ name: 'plate', pose: [0, 0, 0, 0, 0, 0], visuals: [],
      collisions: [{ name: 'solid', pose: [0, 0, 0, 0, 0, 0], geometry: { type: 'box', size: [0.8, 0.5, 0.1] } }] }] },
  { name: 'child', pose: [0.85, 0.1, -0.075, 0, 0, 0], static: true,
    links: [{ name: 'plate', pose: [0, 0, 0, 0, 0, 0], visuals: [],
      collisions: [{ name: 'solid', pose: [0, 0, 0, 0, 0, 0], geometry: { type: 'box', size: [0.2, 0.5, 0.1] } }] }] }] });
  sceneModel.addRobot('arm', robotRoot, { links: new Map([['tip', new T.Group()]]) });
  const joint = { name: 'slide', parent: 'base', child: 'tip', type: 'prismatic', axis: new T.Vector3(1, 0, 0),
    basicMatrix: new T.Matrix4(), lower: 0, upper: 1, theta: 0, attributes: { limit: { velocity: 1 } } };
  return { robotName: 'arm', robotRoot, jointModels: [joint], sceneModel,
    robotCollisionShapes: [{ link: 'tip', geometry: { type: 'box', size: [0.01, 0.01, 0.01] }, origin: new T.Matrix4().elements.slice() }],
    motionLimits: { slide: { velocity: 1, acceleration: 2 } } };
}

function xyContext() {
  const cell = context();
  cell.jointModels[0].child = 'x_link';
  cell.jointModels.push({ name: 'slide_y', parent: 'x_link', child: 'tip', type: 'prismatic', axis: new T.Vector3(0, 1, 0),
    basicMatrix: new T.Matrix4(), lower: -1, upper: 1, theta: 0, attributes: { limit: { velocity: 1 } } });
  cell.motionLimits.slide_y = { velocity: 1, acceleration: 2 };
  return cell;
}

function joinContext() {
  const cell = context(), world = cell.sceneModel.snapshotWorld();
  world.models.find(model => model.name === 'workpiece').links[0].collisions[0].geometry.size[0] = 0.6;
  world.models.find(model => model.name === 'child').pose[0] = 0.75;
  cell.sceneModel.loadWorld(world);
  return cell;
}

test('Worker weld plan records world-frame timed TCP seam and process transitions', () => {
  const source = `ROBOT arm\nTOOL tip\nPOSE end world 0.5 0 0 Q 0 0 0 1\nWELD ON workpiece\nMOVEL end\nWELD OFF`;
  const compiled = compileProgram(source);
  assert.equal(compiled.ok, true);
  const live = context();
  const direct = planProgram(compiled, live);
  const worker = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(live));
  assert.equal(worker.status, 'planned', JSON.stringify(worker.diagnostics));
  assert.deepEqual(worker.weld, direct.weld);
  assert.deepEqual(worker.weld.events.map(event => event.kind), ['WELD_ON', 'WELD_OFF']);
  assert.deepEqual(worker.weld.events.map(event => event.object), ['workpiece', 'workpiece']);
  assert.deepEqual(worker.events, []); // Scene attachment playback remains independent.
  assert.equal(worker.weld.segments.length, 1);
  const segment = worker.weld.segments[0];
  assert.equal(segment.type, 'LIN');
  assert.equal(segment.object, 'workpiece');
  assert.equal(segment.line, 5);
  assert.equal(segment.startTime, 0);
  assert.equal(segment.endTime, worker.duration);
  assert.ok(segment.samples.length > 2);
  assert.deepEqual(segment.samples[0].position, [0, 0, 0]);
  assert.ok(Math.abs(segment.samples.at(-1).position[0] - 0.5) < 1e-3);
  assert.deepEqual(segment.samples[0].quaternion, [0, 0, 0, 1]);
  assert.deepEqual(segment.samples.map(point => point.time), segment.samples.map(point => point.time).sort((a, b) => a - b));
  assert.equal(worker.weld.events[0].time, 0);
  assert.equal(worker.weld.events[1].time, worker.duration);
  assert.deepEqual(worker.processTrajectory, { header: { frame_id: 'world' }, events: worker.weld.events, segments: worker.weld.segments });
  assert.deepEqual(worker.trajectory.joint_names, ['slide']);
  assert.doesNotThrow(() => structuredClone(worker));
});

test('compiler rejects welding through joint motion or scene attachment', () => {
  for (const command of ['MOVEJ goal', 'GRAB part', 'RELEASE part']) {
    const compiled = compileProgram(`ROBOT arm\nTOOL tip\nWELD ON workpiece\n${command}\nWELD OFF`);
    assert.equal(compiled.ok, false);
    assert.ok(compiled.diagnostics.some(item => item.line === 4 && item.code === 'WELD_MOTION'), command);
    const result = planProgram(compiled, context());
    assert.equal(result.status, 'error');
  }
});

test('one weld interval spans both a circular and a linear timed seam segment', () => {
  const compiled = compileProgram(`ROBOT arm\nTOOL tip\nPOSE via world 0.25 0.15 0 Q 0 0 0 1\nPOSE arc_end world 0.5 0 0 Q 0 0 0 1\nPOSE finish world 0.6 0.1 0 Q 0 0 0 1\nWELD ON workpiece\nMOVEC via arc_end\nMOVEL finish\nWELD OFF`);
  assert.equal(compiled.ok, true);
  const result = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(xyContext()));
  assert.equal(result.status, 'planned', JSON.stringify(result.diagnostics));
  assert.deepEqual(result.weld.segments.map(segment => segment.type), ['CIRC', 'LIN']);
  assert.equal(result.weld.segments[0].endTime, result.weld.segments[1].startTime);
  assert.equal(result.weld.segments[1].endTime, result.duration);
  assert.ok(result.weld.segments[0].samples.some(sample => sample.position[1] > 0.1));
  assert.equal(result.weld.events[1].time, result.duration);
});

test('weld preflight rejects an absent object, a distant start, and seam departure', () => {
  const compile = body => compileProgram(`ROBOT arm\nTOOL tip\nPOSE far world 0.95 0 0 Q 0 0 0 1\n${body}`);
  const missing = planProgramFromSnapshot(compile('WELD ON absent\nMOVEL far\nWELD OFF'), snapshotProgramContext(context()));
  assert.equal(missing.diagnostics[0].code, 'WELD_OBJECT');
  assert.equal(missing.diagnostics[0].line, 4);
  const distant = planProgramFromSnapshot(compile('MOVEJ far\nWELD ON workpiece\nMOVEL far\nWELD OFF'), snapshotProgramContext(context()));
  assert.equal(distant.diagnostics[0].code, 'WELD_DISTANCE');
  assert.equal(distant.diagnostics[0].line, 5);
  const departure = planProgramFromSnapshot(compile('WELD ON workpiece\nMOVEL far\nWELD OFF'), snapshotProgramContext(context()));
  assert.equal(departure.diagnostics[0].code, 'WELD_DISTANCE');
  assert.equal(departure.diagnostics[0].line, 5);
  assert.match(departure.diagnostics[0].message, /collision surface/);
});

test('post-seam join is a timed playback event and parent can be grabbed with child attached', () => {
  const source = `ROBOT arm\nTOOL tip\nPOSE seam_start world 0.15 0 0 Q 0 0 0 1\nPOSE seam_end world 0.65 0 0 Q 0 0 0 1\nPOSE carry_end world 0.3 0 0 Q 0 0 0 1\nMOVEJ seam_start\nWELD ON workpiece\nMOVEL seam_end\nWELD OFF\nWELD JOIN child workpiece\nGRAB workpiece\nMOVEL carry_end\nRELEASE workpiece`;
  const compiled = compileProgram(source);
  assert.equal(compiled.ok, true, JSON.stringify(compiled.diagnostics));
  const result = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(joinContext()));
  assert.equal(result.status, 'planned', JSON.stringify(result.diagnostics));
  assert.deepEqual(result.events.map(event => event.kind), ['WELD_JOIN', 'GRAB', 'RELEASE']);
  assert.deepEqual(result.events[0], { time: result.weld.segments[0].endTime,
    kind: 'WELD_JOIN', object: 'child', child: 'child', parent: 'workpiece', frame: 'model/workpiece', line: 10 });
  assert.deepEqual(result.weld.events.map(event => event.kind), ['WELD_ON', 'WELD_OFF', 'WELD_JOIN']);
  assert.equal(result.events[0].time, result.events[1].time);
  assert.equal(result.events[2].time, result.duration);
  assert.doesNotThrow(() => structuredClone(result));
});

test('post-weld join rejects a remote child with a line-specific distance diagnostic', () => {
  const source = `ROBOT arm\nTOOL tip\nPOSE seam_end world 0.5 0 0 Q 0 0 0 1\nWELD ON workpiece\nMOVEL seam_end\nWELD OFF\nWELD JOIN child workpiece`;
  const compiled = compileProgram(source);
  assert.equal(compiled.ok, true);
  const result = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(context()));
  assert.equal(result.status, 'error');
  assert.equal(result.diagnostics[0].line, 7);
  assert.equal(result.diagnostics[0].code, 'WELD_JOIN_DISTANCE');
  assert.match(result.diagnostics[0].message, /both collision surfaces/);
});

test('join rejects a child already joined to another model without replacing its bond', () => {
  const cell = joinContext(), world = cell.sceneModel.snapshotWorld();
  world.models.push({ name: 'other', pose: [1.2, 0, -0.075, 0, 0, 0], static: true, links: [] });
  cell.sceneModel.loadWorld(world);
  cell.sceneModel.attach('child', 'model/other', { keepWorldPose: true });
  const compiled = compileProgram(`ROBOT arm\nTOOL tip\nPOSE seam_start world 0.15 0 0 Q 0 0 0 1\nPOSE seam_end world 0.65 0 0 Q 0 0 0 1\nMOVEJ seam_start\nWELD ON workpiece\nMOVEL seam_end\nWELD OFF\nWELD JOIN child workpiece`);
  assert.equal(compiled.ok, true);
  const result = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(cell));
  assert.equal(result.status, 'error');
  assert.deepEqual(result.diagnostics.map(item => [item.line, item.code]), [[9, 'WELD_ALREADY_JOINED']]);
  assert.deepEqual(cell.sceneModel.attachmentRecords(), [{ object: 'child', frame: 'model/other' }]);
});

test('GRAB and RELEASE cannot break a joined child from its parent', () => {
  const prefix = `ROBOT arm\nTOOL tip\nPOSE seam_start world 0.15 0 0 Q 0 0 0 1\nPOSE seam_end world 0.65 0 0 Q 0 0 0 1\nMOVEJ seam_start\nWELD ON workpiece\nMOVEL seam_end\nWELD OFF\nWELD JOIN child workpiece`;
  for (const [command, code] of [['GRAB child', 'GRAB_JOINED'], ['RELEASE child', 'RELEASE_JOINED']]) {
    const compiled = compileProgram(`${prefix}\n${command}`);
    assert.equal(compiled.ok, true);
    const result = planProgramFromSnapshot(structuredClone(compiled), snapshotProgramContext(joinContext()));
    assert.equal(result.status, 'error');
    assert.deepEqual(result.diagnostics.map(item => [item.line, item.code]), [[10, code]]);
  }
  const unheld = compileProgram('ROBOT arm\nTOOL tip\nRELEASE child\nPOSE end world 0.3 0 0 Q 0 0 0 1\nMOVEJ end');
  const result = planProgramFromSnapshot(structuredClone(unheld), snapshotProgramContext(joinContext()));
  assert.equal(result.diagnostics[0].code, 'RELEASE_NOT_HELD');
  assert.equal(result.diagnostics[0].line, 3);
});
