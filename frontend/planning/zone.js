import { forwardKinematics } from './robot-model.js';
import { poseResidual } from './ik-pose.js';
import { createCollisionQueries } from './ptp.js';
import { interpolateTimedJointSegment, timedJointStateAt } from '../timed-joints.js';

function originalAt(samples, time) { return { time, q: timedJointStateAt(samples, time).q }; }

function quintic(start, end, time) {
  return { time, ...interpolateTimedJointSegment(start, end, time) };
}

function blendTimes(samples, left, right, boundaryTime, count) {
  const start = samples[left].time, end = samples[right].time;
  const candidates = [
    ...Array.from({ length: count + 1 }, (_, i) => ({ time: start + (end - start) * i / count, priority: 0 })),
    ...samples.slice(left, right + 1).map(sample => ({ time: sample.time, priority: 1 })),
    { time: boundaryTime, priority: 2 }, { time: start, priority: 3 }, { time: end, priority: 3 },
  ].sort((a, b) => a.time - b.time || b.priority - a.priority);
  const kept = [];
  for (const candidate of candidates) {
    const last = kept.at(-1);
    if (last && candidate.time - last.time < 2e-9) {
      if (candidate.priority > last.priority) kept[kept.length - 1] = candidate;
    } else kept.push(candidate);
  }
  return kept.map(candidate => candidate.time);
}

/**
 * Replace a stop between two PTP commands with a bounded C2 joint blend.
 * Both TCP distance to the waypoint and deviation from the original trajectory
 * stay inside radius; orientation deviation is separately capped at 0.05 rad.
 */
export function blendPTPCorner(samples, { boundaryTime, leftStart, rightEnd, radius, model, limits,
  isStateValid, collisionOptions = {} }) {
  if (!(Number.isFinite(radius) && radius > 0)) return { status: 'invalid_target', reason: 'ZONE radius must be positive and finite.' };
  const boundary = samples.findIndex(sample => Math.abs(sample.time - boundaryTime) < 1e-9);
  if (boundary <= 0 || boundary >= samples.length - 1) return { status: 'invalid_target', reason: 'ZONE needs samples on both sides of the PTP waypoint.' };
  const waypoint = forwardKinematics(model, samples[boundary].q);
  const maxHalfWindow = Math.min((boundaryTime - leftStart) / 4, (rightEnd - boundaryTime) / 4, 0.5);
  if (!(maxHalfWindow > 0)) return { status: 'invalid_target', reason: 'ZONE needs two nonzero-duration PTP moves.' };
  const checks = createCollisionQueries(model, isStateValid, collisionOptions);
  let lastReason = 'No C2 blend fits the requested ZONE and motion limits.';
  const tried = new Set();
  for (let attempt = 0; attempt < 12; attempt++) {
    const half = maxHalfWindow / 2 ** attempt;
    let left = boundary - 1, right = boundary + 1;
    while (left > 0 && samples[left - 1].time >= boundaryTime - half) left--;
    while (right < samples.length - 1 && samples[right + 1].time <= boundaryTime + half) right++;
    if (samples[left].time <= leftStart || samples[right].time >= rightEnd) continue;
    const key = `${left}:${right}`;
    if (tried.has(key)) continue;
    tried.add(key);
    const start = samples[left], end = samples[right];
    const count = Math.max(2, Math.ceil((end.time - start.time) / 0.005));
    const times = blendTimes(samples, left, right, boundaryTime, count);
    const alpha = (boundaryTime - start.time) / (end.time - start.time);
    const middleState = { time: boundaryTime,
      q: start.q.map((value, j) => {
        const bias = 0.25 * (Math.abs(start.velocity[j]) - Math.abs(end.velocity[j])) /
          (Math.abs(start.velocity[j]) + Math.abs(end.velocity[j]) + 1e-12);
        const fraction = Math.max(0.05, Math.min(0.95, alpha + bias));
        return value + (end.q[j] - value) * fraction;
      }),
      velocity: end.q.map((value, j) => (value - start.q[j]) / (end.time - start.time)),
      acceleration: start.q.map(() => 0) };
    const blend = times.map(time => time <= boundaryTime
      ? quintic(start, middleState, time) : quintic(middleState, end, time));
    const checked = [];
    for (let i = 0; i < blend.length; i++) {
      if (i) for (const fraction of [0.25, 0.5, 0.75]) {
        const a = blend[i - 1], b = blend[i], time = a.time + (b.time - a.time) * fraction;
        checked.push(quintic(a, b, time));
      }
      checked.push(blend[i]);
    }
    let valid = true;
    for (let i = 0; i < checked.length; i++) {
      const point = checked[i];
      if (i && point.q.some((value, j) => {
        const direction = Math.sign(end.q[j] - start.q[j]);
        return direction ? direction * (value - checked[i - 1].q[j]) < -1e-8
          : Math.abs(value - start.q[j]) > 1e-7;
      })) { lastReason = 'ZONE blend would reverse a joint near the corner.'; valid = false; break; }
      const offendingJoint = point.q.findIndex((value, j) => {
        const joint = model.joints[model.active[j]];
        return (joint.type !== 'continuous' && (value < joint.lower - 1e-9 || value > joint.upper + 1e-9)) ||
          Math.abs(point.velocity[j]) > limits.velocity[j] * (1 + 1e-6) ||
          Math.abs(point.acceleration[j]) > limits.acceleration[j] * (1 + 1e-6);
      });
      if (offendingJoint >= 0) { lastReason = `ZONE blend violates a joint position, velocity, or acceleration limit at joint ${model.jointNames[offendingJoint]} and t=${point.time.toFixed(4)} s (q=${point.q[offendingJoint].toFixed(4)}, v=${point.velocity[offendingJoint].toFixed(4)}, a=${point.acceleration[offendingJoint].toFixed(4)}).`; valid = false; break; }
      const pose = forwardKinematics(model, point.q);
      const reference = forwardKinematics(model, originalAt(samples, point.time).q);
      const waypointDistance = Math.hypot(...pose.position.map((value, j) => value - waypoint.position[j]));
      const deviation = poseResidual(pose, reference);
      if (waypointDistance > radius + 1e-8 || deviation.positionError > radius + 1e-8 || deviation.orientationError > 0.05 + 1e-8) {
        lastReason = 'ZONE blend leaves the TCP tolerance around the waypoint or original path.'; valid = false; break;
      }
      try {
        if (!checks.isStateValid(point.q) || (i && !checks.isEdgeValid(checked[i - 1].q, point.q))) {
          lastReason = 'ZONE blend intersects an obstacle.'; valid = false; break;
        }
      } catch (error) { lastReason = error.message; valid = false; break; }
    }
    if (!valid) continue;
    const middle = blend.find(point => Math.abs(point.time - boundaryTime) < 1e-9);
    const cornerSpeedFraction = middle ? Math.max(...middle.velocity.map((value, j) => Math.abs(value) / limits.velocity[j])) : 0;
    if (cornerSpeedFraction < 1e-5) {
      lastReason = 'ZONE blend cannot maintain nonzero speed through the corner.'; continue;
    }
    if (!checks.isEdgeValid(samples[left - 1].q, blend[0].q) ||
      !checks.isEdgeValid(blend.at(-1).q, samples[right + 1].q)) {
      lastReason = 'ZONE splice crosses an obstacle at its entry or exit.'; continue;
    }
    return { status: 'blended', samples: [...samples.slice(0, left + 1), ...blend.slice(1, -1), ...samples.slice(right)],
      entryTime: start.time, exitTime: end.time, waypointTime: boundaryTime,
      waypointDeviation: poseResidual(forwardKinematics(model, middle.q), waypoint).positionError,
      cornerSpeedFraction, radius };
  }
  return { status: 'zone_infeasible', reason: lastReason };
}
