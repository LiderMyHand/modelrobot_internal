const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let analyzeJacobian;
before(async () => ({ analyzeJacobian } = await import('../frontend/planning/jacobian-health.js')));
const diagonal = values => Array.from({ length: 6 }, (_, i) => values.map((value, j) => i === j ? value : 0));

test('normalized six-axis health distinguishes a regular, near singular and deficient Jacobian', () => {
  const options = { characteristicLength: 1 };
  const regular = analyzeJacobian(diagonal([1, 1, 1, 1, 1, 1]), options);
  assert.equal(regular.status, 'regular');
  assert.equal(regular.rank, 6);
  assert.equal(regular.conditionNumber, 1);
  const near = analyzeJacobian(diagonal([1, 1, 1, 1, 1, 0.01]), options);
  assert.equal(near.status, 'near_singular');
  assert.equal(near.rank, 6);
  assert.equal(near.conditionNumber, 100);
  const singular = analyzeJacobian(diagonal([1, 1, 1, 1, 1, 0]), options);
  assert.equal(singular.status, 'rank_deficient');
  assert.equal(singular.rank, 5);
  assert.equal(singular.conditionNumber, null);
  assert.equal(singular.relativeMinimum, 0);
});

test('a low-DOF chain is task limited rather than automatically singular', () => {
  const result = analyzeJacobian([[0], [1], [0], [0], [0], [1]]);
  assert.equal(result.status, 'regular');
  assert.equal(result.rank, result.expectedRank);
  assert.equal(result.taskLimited, true);
});

test('declared length normalizes metre translation and prismatic input consistently', () => {
  const j = diagonal([1, 1, 1, 1, 1, 1]);
  const health = analyzeJacobian(j, { characteristicLength: 0.25,
    jointTypes: ['prismatic', 'prismatic', 'prismatic', 'revolute', 'revolute', 'revolute'] });
  assert.equal(health.conditionNumber, 1);
  assert.equal(health.status, 'regular');
  assert.ok(health.singularValues.every(value => value === 1));
  assert.throws(() => analyzeJacobian(j, { characteristicLength: 0 }));
});

test('task-coordinate rotation leaves singular values and status invariant', () => {
  const j = diagonal([0.3, 0.2, 0.1, 1, 0.5, 0.01]);
  const c = Math.cos(0.7), s = Math.sin(0.7);
  const rotated = j.map(row => [...row]);
  for (const base of [0, 3]) for (let k = 0; k < 6; k++) {
    rotated[base][k] = c * j[base][k] - s * j[base + 1][k];
    rotated[base + 1][k] = s * j[base][k] + c * j[base + 1][k];
  }
  const a = analyzeJacobian(j), b = analyzeJacobian(rotated);
  assert.equal(a.status, b.status);
  assert.ok(a.singularValues.every((value, i) => Math.abs(value - b.singularValues[i]) < 1e-12));
});
