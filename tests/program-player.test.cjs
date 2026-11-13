const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let ProgramPlayer;
before(async () => ({ ProgramPlayer } = await import('../frontend/program-player.js')));

test('seeking, attachment events and reset reproduce the same state', () => {
  const state = { q: [], attached: false, history: [] };
  const sceneModel = {
    snapshotWorld: () => ({ name: 'initial' }),
    loadWorld: () => { state.attached = false; state.history.push('restore'); },
    attach: (object, frame) => { state.attached = true; state.history.push(`grab:${object}:${frame}:${state.q[0]}`); },
    release: object => { state.attached = false; state.history.push(`release:${object}:${state.q[0]}`); },
  };
  const player = new ProgramPlayer({ sceneModel, applyJointState: q => { state.q = [...q]; } });
  player.load({ samples: [{ time: 0, q: [0] }, { time: 1, q: [1] }, { time: 2, q: [2] }], events: [{ time: 1, kind: 'GRAB', object: 'box', frame: 'tool' }, { time: 2, kind: 'RELEASE', object: 'box' }] });
  player.seek(1.5); assert.deepEqual(state.q, [1.5]); assert.equal(state.attached, true);
  assert.ok(state.history.includes('grab:box:tool:1'));
  player.seek(2); assert.equal(state.attached, false); assert.ok(state.history.includes('release:box:2'));
  player.reset(); assert.deepEqual(state.q, [0]); assert.equal(state.attached, false);
  player.seek(1.5); assert.deepEqual(state.q, [1.5]); assert.equal(state.attached, true);
  assert.equal(state.history.filter(item => item === 'grab:box:tool:1').length, 2);
});

test('invalid timelines are rejected before playback', () => {
  const player = new ProgramPlayer({ sceneModel: { snapshotWorld: () => ({}) }, applyJointState: () => {} });
  assert.throws(() => player.load({ samples: [{ time: 1, q: [0] }] }), /t=0/);
  assert.throws(() => player.load({ samples: [{ time: 0, q: [0] }, { time: 0, q: [1] }] }), /strictly increasing/);
});

test('events at zero and a previous playback state are restored before a new load', () => {
  const state = { attached: false, q: 0 };
  const sceneModel = {
    snapshotWorld: () => ({ name: 'initial' }), attachmentRecords: () => state.attached ? [{ object: 'box', frame: 'tool' }] : [],
    loadWorld: () => { state.attached = false; },
    attach: () => { state.attached = true; }, release: () => { state.attached = false; },
  };
  const player = new ProgramPlayer({ sceneModel, applyJointState: q => { state.q = q[0]; } });
  player.load({ samples: [{ time: 0, q: [0] }, { time: 1, q: [1] }], events: [{ time: 0, kind: 'GRAB', object: 'box', frame: 'tool' }] });
  assert.equal(state.attached, true);
  player.seek(1); player.reset(); assert.equal(state.attached, true); assert.equal(state.q, 0);
  player.load({ samples: [{ time: 0, q: [0] }, { time: 1, q: [2] }], events: [] });
  assert.equal(state.attached, true, 'New load captures the previous timeline start attachment');
});

test('weld join and subsequent parent grab carry the child; reset restores unjoined poses', async () => {
  const T = await import('three');
  const { SceneModel } = await import('../frontend/scene-model.js');
  const scene = new T.Scene(), sceneModel = new SceneModel({ scene });
  const model = (name, x) => ({ name, pose: [x, 0, 0, 0, 0, 0], static: true, links: [] });
  sceneModel.loadWorld({ name: 'cell', models: [model('parent', 0.2), model('child', 0.3)] });
  const root = new T.Group(), tip = new T.Group(); root.add(tip); scene.add(root);
  sceneModel.addRobot('arm', root, { links: new Map([['tool', tip]]) });
  const player = new ProgramPlayer({ sceneModel, applyJointState: q => { tip.position.x = q[0]; scene.updateMatrixWorld(true); } });
  const at = name => sceneModel.getObject(name).getWorldPosition(new T.Vector3()).x;
  player.load({ samples: [{ time: 0, q: [0] }, { time: 1, q: [0.2] }, { time: 2, q: [0.4] }],
    events: [{ time: 1, kind: 'WELD_JOIN', object: 'child', child: 'child', parent: 'parent', frame: 'model/parent' },
      { time: 1, kind: 'GRAB', object: 'parent', frame: 'robot/arm/link/tool' }] });
  player.seek(1);
  assert.deepEqual(sceneModel.attachmentRecords(), [{ object: 'child', frame: 'model/parent' }, { object: 'parent', frame: 'robot/arm/link/tool' }]);
  assert.ok(Math.abs(at('child') - 0.3) < 1e-10);
  player.seek(2);
  assert.ok(Math.abs(at('parent') - 0.4) < 1e-10);
  assert.ok(Math.abs(at('child') - 0.5) < 1e-10);
  player.reset();
  assert.deepEqual(sceneModel.attachmentRecords(), []);
  assert.ok(Math.abs(at('parent') - 0.2) < 1e-10);
  assert.ok(Math.abs(at('child') - 0.3) < 1e-10);
  assert.equal(player.state, 'ready');
});
