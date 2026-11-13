const { test } = require('node:test');
const assert = require('node:assert/strict');

function model(name, x, isStatic = false) {
  return { name, pose: [x, 0.2, 0.3, 0.1, -0.2, 0.3], static: isStatic,
    links: [{ name: 'body', pose: [0, 0, 0, 0, 0, 0], visuals: [], collisions: [] }] };
}

test('scheduler world-axis model motion materializes in a transformed scene without rotating the model', async () => {
  const { Group, Scene, Vector3, Quaternion } = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const { captureSceneDevices, applySceneDevices } = await import('../frontend/device-motion.js');
  const { createMultiProgramState, stepMultiProgram } = await import('../frontend/multi-program-scheduler.js');
  const scene = new Scene(), root = new Group(); root.position.set(0.4, -0.1, 0.2); root.rotation.z = 0.7; scene.add(root);
  const workcell = new SceneModel({ scene: root });
  workcell.loadWorld({ name: 'cell', models: [model('tray', 0.15), model('table', 0, true)] });
  const captured = captureSceneDevices(workcell);
  assert.deepEqual(Object.keys(captured), ['tray']);
  const target = captured.tray[0] + 0.4;
  const initialRotation = new Quaternion(); workcell.getObject('tray').getWorldQuaternion(initialRotation);
  let state = createMultiProgramState({ programs: [{ name: 'conveyor', commands: [
    { kind: 'MOVE_MODEL', model: 'tray', axis: 'X', position: target, durationTicks: 4 },
  ] }], devices: captured });
  for (let tick = 0; tick < 4; tick++) {
    state = stepMultiProgram(state).state;
    applySceneDevices(workcell, state);
    const actual = new Vector3(); workcell.getObject('tray').getWorldPosition(actual);
    assert.ok(Math.abs(actual.x - (captured.tray[0] + 0.1 * (tick + 1))) < 1e-10);
    assert.ok(Math.abs(actual.y - captured.tray[1]) < 1e-10);
    assert.ok(Math.abs(actual.z - captured.tray[2]) < 1e-10);
    const rotation = new Quaternion(); workcell.getObject('tray').getWorldQuaternion(rotation);
    assert.ok(rotation.angleTo(initialRotation) < 1e-10);
  }
  assert.equal(state.status, 'finished');
  assert.ok(Math.abs(workcell.snapshotWorld().models[0].pose[0] - target) < 1e-10);
  applySceneDevices(workcell, { devices: captured });
  assert.ok(Math.abs(captureSceneDevices(workcell).tray[0] - captured.tray[0]) < 1e-10);
});

test('static and attached models are not movable; failed apply changes no model', async () => {
  const { Scene } = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const { captureSceneDevices, applySceneDevices } = await import('../frontend/device-motion.js');
  const scene = new Scene(), workcell = new SceneModel({ scene });
  workcell.loadWorld({ name: 'cell', models: [model('tray', 0.1), model('table', 0, true)] });
  const before = captureSceneDevices(workcell).tray;
  assert.throws(() => applySceneDevices(workcell, { devices: { tray: [1, 2, 3], table: [0, 0, 0] } }), /table.*unavailable/);
  assert.deepEqual(captureSceneDevices(workcell).tray, before);
  workcell.attach('tray', 'world');
  assert.deepEqual(captureSceneDevices(workcell), {});
  assert.throws(() => applySceneDevices(workcell, { devices: { tray: [1, 2, 3] } }), /tray.*unavailable/);
});
