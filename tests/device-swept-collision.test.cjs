const { before, test } = require('node:test');
const assert = require('node:assert/strict');

let T, SceneModel, createSceneDeviceCollisionQuery;
before(async () => {
  T = await import('three');
  ({ SceneModel } = await import('../frontend/scene-model.js'));
  ({ createSceneDeviceCollisionQuery } = await import('../frontend/planning/collision-scene.js'));
});

const box = (size = [.1, .1, .1]) => ({ type: 'box', size });
const item = (name, x, { staticModel = false, size = [.1, .1, .1] } = {}) => ({
  name, pose: [x, 0, 0, 0, 0, 0], static: staticModel,
  links: [{ name: 'body', pose: [0, 0, 0, 0, 0, 0], visuals: [],
    collisions: [{ name: 'body', pose: [0, 0, 0, 0, 0, 0], geometry: box(size) }] }],
});
function world(models) {
  const scene = new T.Scene(), sceneModel = new SceneModel({ scene });
  sceneModel.loadWorld({ name: 'device_sweep', models });
  return { scene, sceneModel };
}

test('sweep detects an obstacle between clear endpoint poses without mutating the scene', () => {
  const { sceneModel } = world([item('cart', 0), item('obstacle', .5, { staticModel: true })]);
  const before = sceneModel.getObject('cart').matrixWorld.clone();
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const result = query.checkSweep({ cart: [0, 0, 0] }, { cart: [1, 0, 0] });
  assert.equal(result.status, 'collision');
  assert.equal(result.model, 'cart');
  assert.match(result.other, /obstacle/);
  assert.ok(result.fraction > 0 && result.fraction < 1);
  assert.deepEqual(result.pair, ['model/cart/link/body', 'model/obstacle/link/body']);
  assert.deepEqual(sceneModel.getObject('cart').matrixWorld.elements, before.elements);
  query.dispose();
});

test('opposing same-tick model moves are evaluated at synchronized fractions', () => {
  const { sceneModel } = world([item('left', 0), item('right', 1)]);
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const crossing = query.checkSweep({ left: [0, 0, 0], right: [1, 0, 0] },
    { left: [1, 0, 0], right: [0, 0, 0] });
  assert.equal(crossing.status, 'collision');
  assert.deepEqual(crossing.movingModels, ['left', 'right']);
  assert.ok(crossing.fraction > .4 && crossing.fraction < .6);
  const parallel = query.checkSweep({ left: [0, 0, 0], right: [1, 0, 0] },
    { left: [.5, 0, 0], right: [1.5, 0, 0] });
  assert.equal(parallel.status, 'clear');
  query.dispose();
});

test('a joined model descendant sweeps with its detached moving parent', () => {
  const { sceneModel } = world([item('carrier', 0), item('child', .3),
    item('obstacle', .7, { staticModel: true })]);
  sceneModel.attach('child', 'model/carrier');
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const result = query.checkSweep({ carrier: [0, 0, 0] }, { carrier: [.8, 0, 0] });
  assert.equal(result.status, 'collision');
  assert.equal(result.model, 'carrier');
  assert.ok(result.pair.some(label => label.includes('model/child/')));
  assert.equal(sceneModel.getObject('child').getWorldPosition(new T.Vector3()).x, .3);
  query.dispose();
});

test('a mounted robot shape sweeps with its SDF carrier while joints stay fixed', () => {
  const { scene, sceneModel } = world([item('carrier', 0),
    item('obstacle', .6, { staticModel: true })]);
  const root = new T.Group(), base = new T.Group(); root.position.x = .25; root.add(base); scene.add(root);
  sceneModel.addRobot('arm', root, { links: new Map([['base', base]]) });
  sceneModel.getObject('carrier').attach(root);
  scene.updateMatrixWorld(true);
  const originalX = root.getWorldPosition(new T.Vector3()).x;
  const query = createSceneDeviceCollisionQuery({ sceneModel, robotName: 'arm',
    robotCollisionShapes: [{ link: 'base', geometry: box(), origin: new T.Matrix4().elements.slice() }] });
  const result = query.checkSweep({ carrier: [0, 0, 0] }, { carrier: [.4, 0, 0] });
  assert.equal(result.status, 'collision');
  assert.equal(result.model, 'carrier');
  assert.ok(result.pair.some(label => label === 'robot/arm/link/base'));
  assert.match(result.other, /obstacle/);
  assert.equal(root.getWorldPosition(new T.Vector3()).x, originalX);
  query.dispose();
});

test('a moving SDF model cannot sweep through a stationary robot link', () => {
  const { scene, sceneModel } = world([item('cart', 0)]);
  const root = new T.Group(), base = new T.Group(); root.position.x = .5; root.add(base); scene.add(root);
  sceneModel.addRobot('arm', root, { links: new Map([['base', base]]) });
  const query = createSceneDeviceCollisionQuery({ sceneModel, robotName: 'arm',
    robotCollisionShapes: [{ link: 'base', geometry: box(), origin: new T.Matrix4().elements.slice() }] });
  const result = query.checkSweep({ cart: [0, 0, 0] }, { cart: [1, 0, 0] });
  assert.equal(result.status, 'collision');
  assert.equal(result.model, 'cart');
  assert.match(result.other, /robot\/arm\/link\/base/);
  assert.ok(result.fraction > 0 && result.fraction < 1);
  query.dispose();
});

test('sample budget and stale origins fail before any viewer change', () => {
  const { sceneModel } = world([item('cart', 0), item('obstacle', .5, { staticModel: true })]);
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const budget = query.checkSweep({ cart: [0, 0, 0] }, { cart: [1, 0, 0] },
    { translationStep: .001, maxSamples: 10 });
  assert.equal(budget.status, 'sample_budget');
  assert.ok(budget.samples > budget.maxSamples);
  assert.throws(() => query.checkSweep({ cart: [.1, 0, 0] }, { cart: [1, 0, 0] }), /differs from the current scene/);
  assert.throws(() => query.checkSweep({ obstacle: [.5, 0, 0] }, { obstacle: [.6, 0, 0] }), /detached, nonstatic/);
  assert.equal(sceneModel.getObject('cart').getWorldPosition(new T.Vector3()).x, 0);
  query.dispose();
});

test('unchanged former device may be attached after GRAB while another device moves', () => {
  const { scene, sceneModel } = world([item('tray', 0), item('pick_box', .5)]);
  const robot = new T.Group(), tool = new T.Group(); robot.add(tool); scene.add(robot);
  sceneModel.addRobot('arm', robot, { links: new Map([['tool', tool]]) });
  sceneModel.attach('pick_box', 'robot/arm/link/tool');
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const from = { tray: [0, 0, 0], pick_box: [.2, 0, 0] };
  const to = { tray: [.1, 0, 0], pick_box: [.2, 0, 0] };
  assert.equal(query.checkSweep(from, to).status, 'clear',
    'Unchanged stale coordinates for a GRABbed object must not block a different device.');
  assert.throws(() => query.checkSweep(from, { ...to, pick_box: [.3, 0, 0] }), /pick_box.*detached, nonstatic/);
  query.dispose();
});

test('an unchanged tool-held object still blocks a different device sweep', () => {
  const { scene, sceneModel } = world([item('tray', 0), item('pick_box', .5)]);
  const robot = new T.Group(), tool = new T.Group(); robot.add(tool); scene.add(robot);
  sceneModel.addRobot('arm', robot, { links: new Map([['tool', tool]]) });
  sceneModel.attach('pick_box', 'robot/arm/link/tool');
  const query = createSceneDeviceCollisionQuery({ sceneModel });
  const result = query.checkSweep({ tray: [0, 0, 0], pick_box: [.2, 0, 0] },
    { tray: [1, 0, 0], pick_box: [.2, 0, 0] });
  assert.equal(result.status, 'collision');
  assert.equal(result.model, 'tray');
  assert.match(result.other, /pick_box/);
  assert.ok(result.fraction > 0 && result.fraction < 1);
  query.dispose();
});
