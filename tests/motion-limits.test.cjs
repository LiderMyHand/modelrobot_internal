const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let resolveMotionLimits;
before(async () => ({ resolveMotionLimits } = await import('../frontend/motion-limits.js')));
const model = { jointNames: ['revolute', 'slide'], active: [0, 1], joints: [{ type: 'revolute' }, { type: 'prismatic' }] };
const joints = [{ name: 'revolute', get: key => key === 'limit' ? { velocity: '3' } : null }, { name: 'slide', get: () => null }];

test('URDF velocities and clearly labeled simulation defaults resolve in joint order', () => {
  const result = resolveMotionLimits(model, joints);
  assert.deepEqual(result.velocity, [3, 0.25]);
  assert.deepEqual(result.acceleration, [6, 0.5]);
  assert.equal(result.details[0].velocitySource, 'URDF');
  assert.equal(result.details[1].velocitySource, 'simulation default');
  assert.equal(result.details[0].accelerationSource, 'simulation default');
});

test('project settings override per joint and invalid limits fail', () => {
  const result = resolveMotionLimits(model, joints, { slide: { velocity: 0.4, acceleration: 0.8 } });
  assert.deepEqual(result.velocity, [3, 0.4]);
  assert.deepEqual(result.acceleration, [6, 0.8]);
  assert.equal(result.details[1].velocitySource, 'project setting');
  assert.throws(() => resolveMotionLimits(model, joints, { slide: { acceleration: -1 } }), /positive/);
});
