const { test } = require('node:test');
const assert = require('node:assert/strict');

const sample = {
  name: 'bench',
  models: [{
    name: 'part', pose: [2, 1, 0, 0, 0, 0], static: false,
    links: [{ name: 'body', pose: [0, 0, 0, 0, 0, 0], visuals: [
      { name: 'box', pose: [0, 0, 0, 0, 0, 0], geometry: { type: 'box', size: [0.2, 0.2, 0.2] } },
    ], collisions: [
      { name: 'body', pose: [0, 0, 0, 0, 0, 0], geometry: { type: 'box', size: [0.2, 0.2, 0.2] } },
    ] }],
  }],
};

test('environment is a separate scene layer and preserves world pose through attach/release', async () => {
  const { Scene, Group, Vector3 } = await import('three');
  const { SceneModel, getSDFWorldPose } = await import('../frontend/scene-model.js');
  const scene = new Scene();
  const robot = new Group(); robot.name = 'robot';
  const tool = new Group(); tool.name = 'tool'; tool.position.set(0.3, 0.2, 0.8);
  robot.position.set(0.8, -0.4, 0.1); robot.rotation.z = Math.PI / 3;
  robot.add(tool); scene.add(robot);
  const model = new SceneModel({ scene });
  model.addRobot('arm', robot, { links: new Map([['tool', tool]]) });
  assert.deepEqual(model.loadWorld(sample), []);
  const part = model.getObject('part'), before = new Vector3();
  part.getWorldPosition(before);
  assert.deepEqual(model.getFrame('robot/arm/link/tool'), tool);
  assert.equal(model.collisionEntries.length, 1);
  model.attach('part', 'robot/arm/link/tool');
  const after = new Vector3(); part.getWorldPosition(after);
  assert.ok(after.distanceTo(before) < 1e-10, 'grab keeps world position even under a rotated frame');
  tool.position.x += 0.25; scene.updateMatrixWorld(true);
  const carried = new Vector3(); part.getWorldPosition(carried);
  assert.ok(carried.distanceTo(before) > 0.2, 'part follows the tool');
  model.release('part');
  const released = new Vector3(); part.getWorldPosition(released);
  assert.ok(released.distanceTo(carried) < 1e-10, 'release keeps current world position');
  tool.position.x += 0.25; scene.updateMatrixWorld(true);
  const stationary = new Vector3(); part.getWorldPosition(stationary);
  assert.ok(stationary.distanceTo(released) < 1e-10, 'released part no longer follows');
  assert.equal(model.attachmentRecords().length, 0);
  assert.ok(Math.abs(getSDFWorldPose(part)[0] - stationary.x) < 1e-10);
  assert.ok(Math.abs(model.snapshotWorld().models[0].pose[0] - stationary.x) < 1e-10);
});

test('missing local mesh and attachment cycle receive explicit errors', async () => {
  const { Scene, Group } = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const scene = new Scene(), model = new SceneModel({ scene });
  const world = structuredClone(sample);
  world.models[0].links[0].visuals[0].geometry = { type: 'mesh', uri: 'part.stl', scale: [1, 1, 1] };
  world.models[0].links[0].collisions[0].geometry = { type: 'mesh', uri: 'part.stl', scale: [1, 1, 1] };
  const issues = model.loadWorld(world);
  assert.deepEqual(issues.map(issue => issue.code), ['MISSING_VISUAL_ASSET', 'MISSING_COLLISION_ASSET']);
  assert.throws(() => model.attach('part', 'model/part/link/body'), /cycle/);
  assert.throws(() => model.getFrame('missing'), /Unknown scene frame/);
  const robot = new Group(); scene.add(robot); model.addRobot('arm', robot);
  assert.throws(() => model.addRobot('arm', robot), /duplicate robot/);
});

test('robot removal releases carried objects and scene replacement disposes owned visuals', async () => {
  const { Scene, Group, Vector3 } = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const scene = new Scene(), model = new SceneModel({ scene });
  const robot = new Group(), tool = new Group();
  tool.position.set(0.2, 0.1, 0.3); robot.add(tool); scene.add(robot);
  model.addRobot('arm', robot, { links: new Map([['tool', tool]]) });
  model.loadWorld(sample);
  const part = model.getObject('part'), visual = part.getObjectByName('box');
  let materialDisposed = false, geometryDisposed = false;
  const materialDispose = visual.material.dispose.bind(visual.material);
  const geometryDispose = visual.geometry.dispose.bind(visual.geometry);
  visual.material.dispose = () => { materialDisposed = true; materialDispose(); };
  visual.geometry.dispose = () => { geometryDisposed = true; geometryDispose(); };
  model.attach('part', 'robot/arm/link/tool');
  const before = new Vector3(); part.getWorldPosition(before);
  model.removeRobot('arm');
  const after = new Vector3(); part.getWorldPosition(after);
  assert.ok(after.distanceTo(before) < 1e-10);
  assert.equal(part.parent, model.layer);
  assert.deepEqual(model.attachmentRecords(), []);
  assert.throws(() => model.getFrame('robot/arm/link/tool'), /Unknown scene frame/);
  const bad = structuredClone(sample); bad.models.push(structuredClone(sample.models[0]));
  assert.throws(() => model.loadWorld(bad), /duplicate model/);
  assert.equal(model.getObject('part'), part, 'failed validation leaves old scene intact');
  model.clear();
  assert.ok(materialDisposed && geometryDisposed);
  assert.throws(() => model.getObject('part'), /Unknown scene object/);
});
