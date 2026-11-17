/** Symmetric Jacobi eigensolver for the six-dimensional normalized task Gram matrix. */
function eigenvalues(matrix) {
  const a = matrix.map(row => [...row]), n = a.length;
  for (let iteration = 0; iteration < 1000; iteration++) {
    let p = 0, q = 1, off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.abs(a[i][j]) > off) { off = Math.abs(a[i][j]); p = i; q = j; }
    }
    const scale = Math.max(...a.map((row, i) => Math.abs(row[i])));
    if (off === 0 || off <= scale * 1e-16) break;
    const tau = (a[q][q] - a[p][p]) / (2 * a[p][q]);
    const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.hypot(1, tau));
    const c = 1 / Math.hypot(1, t), s = t * c, apq = a[p][q];
    a[p][p] -= t * apq; a[q][q] += t * apq;
    a[p][q] = a[q][p] = 0;
    for (let k = 0; k < n; k++) {
      if (k === p || k === q) continue;
      const akp = a[k][p], akq = a[k][q];
      a[k][p] = a[p][k] = c * akp - s * akq;
      a[k][q] = a[q][k] = s * akp + c * akq;
    }
  }
  return a.map((row, i) => Math.max(0, row[i])).sort((a, b) => b - a);
}

/**
 * Configuration diagnostic, independent of a requested velocity.
 * Linear TCP rows are divided by characteristicLength [m]; angular rows are
 * radians. Prismatic columns are multiplied by the same length, so a unit
 * input is a 1-radian revolute or characteristicLength-metre prismatic move.
 * The resulting condition depends on this declared scale, not on mixed units.
 * Rank loss is relative to min(6, joint count); fewer than six joints by itself
 * is a task limitation and is not a singular configuration.
 */
export function analyzeJacobian(jacobian, { characteristicLength = 0.25,
  jointTypes = [], nearSingularRatio = 0.02, rankTolerance = 1e-7 } = {}) {
  const n = jacobian?.[0]?.length;
  if (!Array.isArray(jacobian) || jacobian.length !== 6 || !Number.isInteger(n) || n < 1 ||
      !jacobian.every(row => Array.isArray(row) && row.length === n && row.every(Number.isFinite)))
    throw new Error('Jacobian health needs six finite rows and at least one joint column.');
  if (!(Number.isFinite(characteristicLength) && characteristicLength > 0 &&
      rankTolerance > 0 && rankTolerance < nearSingularRatio && nearSingularRatio < 1))
    throw new Error('Jacobian health needs a positive length and 0 < rank tolerance < near-singular ratio < 1.');
  if (jointTypes.length && (jointTypes.length !== n || jointTypes.some(type => !['revolute', 'continuous', 'prismatic'].includes(type))))
    throw new Error('Jacobian joint types must follow the joint columns.');
  const normalized = jacobian.map((row, i) => row.map((value, j) =>
    value * (i < 3 ? 1 / characteristicLength : 1) * (jointTypes[j] === 'prismatic' ? characteristicLength : 1)));
  const gram = normalized.map(a => normalized.map(b => a.reduce((sum, value, j) => sum + value * b[j], 0)));
  const singularValues = eigenvalues(gram).map(Math.sqrt), expectedRank = Math.min(6, n);
  const maximum = singularValues[0], minimum = singularValues[expectedRank - 1];
  const rank = maximum > 0 ? singularValues.filter(value => value > maximum * rankTolerance).length : 0;
  const relativeMinimum = maximum > 0 ? minimum / maximum : 0;
  const status = rank < expectedRank ? 'rank_deficient' : relativeMinimum < nearSingularRatio ? 'near_singular' : 'regular';
  return { status, rank, expectedRank, activeJoints: n, taskLimited: n < 6,
    relativeMinimum, conditionNumber: rank < expectedRank ? null : maximum / minimum,
    singularValues, characteristicLength, nearSingularRatio, rankTolerance };
}
