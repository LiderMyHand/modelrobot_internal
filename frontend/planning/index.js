import { forwardKinematics } from './robot-model.js';
import { solvePose } from './ik-pose.js';
import { circularPath, linearPath, solveCartesianPath } from './paths.js';
import { createCollisionQueries, planPTP } from './ptp.js';
import { timeParameterize } from './timing.js';

/** Plan one program move. No scene or UI state is changed. */
export function planMove({ type, model, start, goal, via, limits, isStateValid, options = {} }) {
  const checks = createCollisionQueries(model, isStateValid, options.collision ?? {});
  let path, geometric;
  if (type === 'PTP') {
    let goalQ = goal;
    if (!Array.isArray(goal)) {
      const solution = solvePose(model, goal, { seed: start, isStateValid: checks.isStateValid, ...options.ik });
      if (solution.status !== 'reached') return { status: 'ik_failed', type, reason: solution.reason, result: solution };
      goalQ = solution.q;
    }
    geometric = planPTP(model, start, goalQ, { ...checks, ...options.ptp });
  } else if (type === 'LIN' || type === 'CIRC') {
    const startPose = forwardKinematics(model, start);
    try { path = type === 'LIN' ? linearPath(startPose, goal) : circularPath(startPose, via, goal); }
    catch (error) { return { status: 'invalid_target', type, reason: error.message }; }
    geometric = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian });
  } else return { status: 'invalid_target', reason: `Unknown move type ${type}.` };
  if (geometric.status !== 'planned') return { ...geometric, type };
  let timed = timeParameterize(geometric.jointPath, limits, {
    model, cartesianPath: path, ...checks, allowInternalStops: type === 'PTP', ...options.timing,
  });
  // A denser IK path often cures a joint spline's small Cartesian deviation.
  for (let attempt = 0; attempt < 2 && timed.status === 'geometry_deviation' && path; attempt++) {
    const step = (options.cartesian?.translationStep ?? 0.01) / 2 ** (attempt + 1);
    const angle = (options.cartesian?.orientationStep ?? Math.PI / 90) / 2 ** (attempt + 1);
    geometric = solveCartesianPath(model, path, { start, ...checks, ...options.ik, ...options.cartesian,
      translationStep: step, orientationStep: angle });
    if (geometric.status !== 'planned') return { ...geometric, type };
    timed = timeParameterize(geometric.jointPath, limits, { model, cartesianPath: path, ...checks, ...options.timing });
  }
  if (timed.status !== 'timed') return { ...timed, type };
  return { status: 'planned', type, jointPath: geometric.jointPath, duration: timed.duration, points: timed.points,
    internalStops: timed.internalStops, direct: geometric.direct ?? null, length: geometric.length ?? null };
}

/** Compatible field names and units for a trajectory_msgs/msg/JointTrajectory JSON document. */
export function trajectoryToROS(plan, jointNames, frameId = 'world') {
  if (plan.status !== 'planned' || !Array.isArray(plan.points)) throw new Error('Only a timed planned move can be exported.');
  return {
    header: { frame_id: frameId }, joint_names: [...jointNames],
    points: plan.points.map(point => {
      const sec = Math.floor(point.time), nanosec = Math.round((point.time - sec) * 1e9);
      return { positions: [...point.q], velocities: [...point.velocity], accelerations: [...point.acceleration],
        time_from_start: { sec: sec + Math.floor(nanosec / 1e9), nanosec: nanosec % 1e9 } };
    }),
  };
}
