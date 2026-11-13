const { before, test } = require('node:test');
const assert = require('node:assert/strict');
const { unzipSync, zipSync, strToU8 } = require('fflate');

let T, SceneModel, packProject, unpackProject;
before(async () => {
  T = await import('three');
  ({ SceneModel } = await import('../frontend/scene-model.js'));
  ({ packProject, unpackProject } = await import('../frontend/project-bundle.js'));
});
const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
const world = x => ({ name: 'mount_cell', models: [{ name: 'carrier', pose: [x, 0, 0, 0, 0, .3], static: false,
  links: [{ name: 'deck', pose: [0, 0, .1, 0, 0, 0], visuals: [], collisions: [] }] }] });
function fixture() {
  const scene = new T.Scene(), model = new SceneModel({ scene });
  const root = new T.Group(), tool = new T.Group();
  root.position.set(.2, -.1, .2); root.rotation.z = -.4; root.add(tool); scene.add(root);
  model.addRobot('arm', root, { links: new Map([['tool', tool]]) });
  model.loadWorld(world(.1));
  return { scene, model, root, tool };
}
const pose = object => ({ position: object.getWorldPosition(new T.Vector3()).toArray(),
  quaternion: object.getWorldQuaternion(new T.Quaternion()).toArray() });

test('mount preserves world pose, carries robot with model, and can unmount', () => {
  const { scene, model, root } = fixture();
  const before = pose(root);
  const record = model.mountRobotBase('arm', 'model/carrier/link/deck');
  assert.equal(record.robot, 'arm'); assert.equal(record.frame, 'model/carrier/link/deck');
  assert.equal(root.parent, model.getFrame(record.frame));
  const after = pose(root);
  after.position.forEach((value, i) => near(value, before.position[i]));
  near(new T.Quaternion(...after.quaternion).angleTo(new T.Quaternion(...before.quaternion)), 0, 1e-7);
  const copy = model.robotMountRecord(); copy.localPose.position[0] += 10;
  assert.notEqual(copy.localPose.position[0], model.robotMountRecord().localPose.position[0]);
  model.getObject('carrier').position.x += .3; scene.updateMatrixWorld(true);
  const moved = pose(root); near(moved.position[0], before.position[0] + .3);
  model.mountRobotBase('arm', 'world');
  assert.equal(model.robotMountRecord(), null); assert.equal(root.parent, scene);
  near(pose(root).position[0], moved.position[0]);
});

test('replacement SDF remounts robot with its local offset and invalid replacement is atomic', () => {
  const { model, root } = fixture();
  const record = model.mountRobotBase('arm', 'model/carrier/link/deck',
    { localPose: { position: [.15, .02, .03], quaternion: [0, 0, 0, 2] } });
  assert.deepEqual(record.localPose.quaternion, [0, 0, 0, 1]);
  const oldFrame = model.getFrame(record.frame), oldWorld = model.getObject('carrier');
  const missing = { name: 'other', models: [] };
  assert.throws(() => model.loadWorld(missing), /needs frame/);
  assert.equal(model.getFrame(record.frame), oldFrame);
  assert.equal(root.parent, oldFrame);
  model.loadWorld(world(.6));
  assert.notEqual(model.getObject('carrier'), oldWorld);
  assert.equal(root.parent, model.getFrame(record.frame));
  assert.deepEqual(model.robotMountRecord(), record);
  near(root.position.x, .15); near(root.position.y, .02); near(root.position.z, .03);
  near(root.getWorldPosition(new T.Vector3()).x, .6 + .15 * Math.cos(.3) - .02 * Math.sin(.3));
  model.removeRobot('arm');
  assert.equal(root.parent, model.scene);
  assert.equal(model.robotMountRecord(), null);
});

test('mount rejects unknown frame, nonrigid orientation, and scene graph cycles', () => {
  const { model, root } = fixture();
  assert.throws(() => model.mountRobotBase('arm', 'robot/arm/link/tool'), /SDF model or model link/);
  assert.throws(() => model.mountRobotBase('arm', 'model/missing'), /Unknown scene frame/);
  assert.throws(() => model.mountRobotBase('arm', 'model/carrier',
    { localPose: { position: [0, 0, 0], quaternion: [0, 0, 0, 0] } }), /quaternion must be nonzero/);
  root.scale.set(2, 1, 1);
  assert.throws(() => model.mountRobotBase('arm', 'model/carrier'), /unit-scale/);
  root.scale.set(1, 1, 1);
  model.attach('carrier', 'robot/arm/link/tool');
  assert.throws(() => model.mountRobotBase('arm', 'model/carrier'), /cycle/);
  assert.equal(root.parent, model.scene);
  model.release('carrier');
  model.mountRobotBase('arm', 'model/carrier');
  assert.throws(() => model.attach('carrier', 'robot/arm/link/tool'), /cycle/);
  model.clear();
  assert.equal(root.parent, model.scene);
  assert.equal(model.robotMountRecord(), null);
});

test('project ZIP round trips optional base mount and rejects malformed mount metadata', () => {
  const robotMount = { robot: 'arm', frame: 'model/carrier/link/deck',
    localPose: { position: [.1, 0, .2], quaternion: [0, 0, 0, 2] } };
  const base = { worldSdf: '<sdf version="1.10"><world name="cell"/></sdf>',
    robots: [{ name: 'arm', urdf: '<robot name="arm"/>' }] };
  const archive = packProject({ ...base, robotMount });
  const project = unpackProject(archive);
  assert.deepEqual(project.robotMount, { ...robotMount,
    localPose: { ...robotMount.localPose, quaternion: [0, 0, 0, 1] } });
  assert.equal(project.manifest.robotMount, 'robot-mount.json');
  assert.equal(unpackProject(packProject(base)).robotMount, null);
  assert.throws(() => packProject({ ...base, robotMount: { ...robotMount, frame: 'robot/arm' } }), /Invalid robot base mount/);
  assert.throws(() => packProject({ ...base, robotMount: { ...robotMount, robot: 'missing' } }), /unavailable robot/);
  const entries = unzipSync(archive);
  entries['robot-mount.json'] = strToU8('{bad json');
  assert.throws(() => unpackProject(zipSync(entries)), /Invalid robot-mount\.json/);
  entries['robot-mount.json'] = strToU8(JSON.stringify({ ...robotMount,
    localPose: { ...robotMount.localPose, quaternion: [0, 0, 0, 0] } }));
  assert.throws(() => unpackProject(zipSync(entries)), /Invalid robot-mount\.json/);
});
