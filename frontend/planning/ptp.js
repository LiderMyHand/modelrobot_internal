import { clampConfiguration } from './robot-model.js';

const clone = q => [...q];
const distance = (a, b, scales) => Math.hypot(...a.map((value, i) => (value - b[i]) / scales[i]));
const mix = (a, b, fraction) => a.map((value, i) => value + (b[i] - value) * fraction);

function randomGenerator(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function createCollisionQueries(model, isStateValid = () => true, { maxRevoluteStep = 0.04, maxPrismaticStep = 0.01 } = {}) {
  if (![maxRevoluteStep, maxPrismaticStep].every(value => Number.isFinite(value) && value > 0)) throw new Error('Collision sample steps must be finite positive numbers.');
  const edgeValid = (a, b) => {
    if (!isStateValid(a) || !isStateValid(b)) return false;
    let count = 1;
    for (let i = 0; i < model.active.length; i++) {
      const joint = model.joints[model.active[i]];
      const step = joint.type === 'prismatic' ? maxPrismaticStep : maxRevoluteStep;
      count = Math.max(count, Math.ceil(Math.abs(b[i] - a[i]) / step));
    }
    for (let k = 1; k < count; k++) if (!isStateValid(mix(a, b, k / count))) return false;
    return true;
  };
  return { isStateValid, isEdgeValid: edgeValid };
}

/** Deterministic joint-space RRT-Connect. Collision functions must be synchronous and current. */
export function planPTP(model, start, goal, options = {}) {
  const n = model.active.length;
  if (![start, goal].every(q => Array.isArray(q) && q.length === n && q.every(Number.isFinite))) return { status: 'invalid_target', reason: 'PTP needs one finite value per active joint.' };
  const q0 = clampConfiguration(model, start), q1 = clampConfiguration(model, goal);
  if (q0.some((v, i) => Math.abs(v - start[i]) > 1e-10) || q1.some((v, i) => Math.abs(v - goal[i]) > 1e-10)) return { status: 'joint_limit', reason: 'PTP start or target exceeds joint limits.' };
  const isStateValid = options.isStateValid ?? (() => true);
  const isEdgeValid = options.isEdgeValid ?? createCollisionQueries(model, isStateValid, options).isEdgeValid;
  if (!isStateValid(q0)) return { status: 'collision', reason: 'PTP start is in collision.' };
  if (!isStateValid(q1)) return { status: 'collision', reason: 'PTP target is in collision.' };
  if (isEdgeValid(q0, q1)) return { status: 'planned', type: 'PTP', jointPath: [{ s: 0, q: clone(q0) }, { s: 1, q: clone(q1) }], direct: true, stopAtInternalNodes: false };

  const bounds = model.active.map((index, i) => {
    const joint = model.joints[index];
    return joint.type === 'continuous'
      ? [Math.min(q0[i], q1[i]) - Math.PI, Math.max(q0[i], q1[i]) + Math.PI]
      : [joint.lower, joint.upper];
  });
  const scales = model.active.map(index => model.joints[index].type === 'prismatic' ? 0.25 : 1);
  const rng = randomGenerator(options.seed ?? 0x5f3759df);
  const maxNodes = options.maxNodes ?? 6000, stepSize = options.stepSize ?? 0.25;
  if (!(Number.isInteger(maxNodes) && maxNodes > 0 && maxNodes <= 100000 && Number.isFinite(stepSize) && stepSize > 0)) return { status: 'invalid_target', reason: 'PTP planner limits must be finite positive values.' };
  const deadline = Number.isFinite(options.timeBudgetMs) && options.timeBudgetMs > 0 ? performance.now() + options.timeBudgetMs : Infinity;
  const trees = [
    { root: 'start', nodes: [{ q: clone(q0), parent: -1 }] },
    { root: 'goal', nodes: [{ q: clone(q1), parent: -1 }] },
  ];
  const nearest = (tree, sample) => {
    let index = 0, best = Infinity;
    tree.nodes.forEach((node, i) => { const d = distance(node.q, sample, scales); if (d < best) { best = d; index = i; } });
    return index;
  };
  const extend = (tree, sample) => {
    const parent = nearest(tree, sample), from = tree.nodes[parent].q, d = distance(from, sample, scales);
    if (d < 1e-10) return { status: 'reached', index: parent };
    const q = mix(from, sample, Math.min(1, stepSize / d));
    if (!isEdgeValid(from, q)) return { status: 'trapped', index: parent };
    const index = tree.nodes.push({ q, parent }) - 1;
    return { status: d <= stepSize ? 'reached' : 'advanced', index };
  };
  const trace = (tree, index) => {
    const route = [];
    while (index >= 0) { route.push(clone(tree.nodes[index].q)); index = tree.nodes[index].parent; }
    return route.reverse();
  };
  const shortcut = route => {
    const result = [...route];
    for (let trial = 0; trial < Math.min(200, result.length * 20) && result.length > 2; trial++) {
      const i = Math.floor(rng() * (result.length - 2));
      const j = i + 2 + Math.floor(rng() * (result.length - i - 2));
      if (isEdgeValid(result[i], result[j])) result.splice(i + 1, j - i - 1);
    }
    return result;
  };
  for (let iteration = 0; iteration < maxNodes; iteration++) {
    if (options.signal?.aborted) return { status: 'cancelled', reason: 'PTP planning was cancelled.' };
    if (performance.now() > deadline) return { status: 'time_budget', reason: 'PTP planning exceeded its time budget.', nodesExplored: trees[0].nodes.length + trees[1].nodes.length };
    const sample = rng() < 0.15 ? trees[1].nodes[0].q : bounds.map(([low, high]) => low + rng() * (high - low));
    const first = extend(trees[0], sample);
    if (first.status !== 'trapped') {
      const target = trees[0].nodes[first.index].q;
      let second;
      do { second = extend(trees[1], target); } while (second.status === 'advanced' && trees[0].nodes.length + trees[1].nodes.length < maxNodes);
      if (second.status === 'reached') {
        const fromFirst = trace(trees[0], first.index), fromSecond = trace(trees[1], second.index);
        const joined = trees[0].root === 'start'
          ? [...fromFirst, ...fromSecond.reverse().slice(1)]
          : [...fromSecond, ...fromFirst.reverse().slice(1)];
        const route = shortcut(joined);
        return { status: 'planned', type: 'PTP', jointPath: route.map((q, i) => ({ s: i / (route.length - 1), q })), direct: false, stopAtInternalNodes: route.length > 2,
          nodesExplored: trees[0].nodes.length + trees[1].nodes.length };
      }
    }
    trees.reverse();
    if (trees[0].nodes.length + trees[1].nodes.length >= maxNodes) break;
  }
  return { status: 'no_path', reason: 'RRT-Connect found no collision-free joint path within the node budget.', nodesExplored: trees[0].nodes.length + trees[1].nodes.length };
}
