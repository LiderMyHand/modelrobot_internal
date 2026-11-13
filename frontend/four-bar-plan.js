import { Matrix4, Quaternion, Vector3 } from 'three';
import { createFourBarModel, expandFourBar, fourBarPose, solveFourBarPose } from './planning/four-bar.js';
import { createRobotModel } from './planning/robot-model.js';
import { createPlanningCollisionScene, parseURDFCollisionShapes } from './planning/collision-scene.js';
import { planPTP } from './planning/ptp.js';
import { timeParameterize } from './planning/timing.js';
import { resolveMotionLimits } from './motion-limits.js';
import { interpolateTimedJointSegment } from './timed-joints.js';

const fail = (line, code, message) => ({ status: 'error', diagnostics: [{ line, column: 1, code, message }] });
const stamp = seconds => {
  const sec = Math.floor(seconds), nanosec = Math.round((seconds - sec) * 1e9);
  return { sec: sec + Math.floor(nanosec / 1e9), nanosec: nanosec % 1e9 };
};
const expanded = (model, theta) => {
  const result = expandFourBar(model, theta);
  if (result.status !== 'expanded') throw new Error(result.reason || `Four-bar closure failed at ${theta} rad (${result.status}).`);
  return result;
};
function constrainedCollisionChecks(model, collision) {
  const isStateValid = q => {
    const state = expandFourBar(model, q[0]);
    return state.status === 'expanded' && collision.isStateValid(state.q);
  };
  const isEdgeValid = (a, b) => {
    if (!isStateValid(a) || !isStateValid(b)) return false;
    const direction = Math.sign(b[0] - a[0]);
    if (!direction) return true;
    let theta = a[0], previous = expanded(model, theta), count = 0;
    while (direction * (b[0] - theta) > 1e-12) {
      if (++count > 100000) throw new Error('Four-bar collision edge exceeds the sample budget.');
      const maxRate = Math.max(1, ...previous.ratePerTheta.map(Math.abs));
      let step = Math.min(0.005, 0.02 / maxRate, Math.abs(b[0] - theta));
      let next = null;
      for (let attempt = 0; attempt < 24; attempt++) {
        next = expandFourBar(model, theta + direction * step);
        if (next.status !== 'expanded') return false;
        if (next.q.every((value, i) => Math.abs(value - previous.q[i]) <= 0.02 + 1e-10)) break;
        step /= 2;
      }
      if (!next?.q.every((value, i) => Math.abs(value - previous.q[i]) <= 0.02 + 1e-10))
        throw new Error('Four-bar collision edge cannot be sampled at the requested angular resolution.');
      theta += direction * step; previous = next;
      if (!collision.isStateValid(next.q)) return false;
    }
    return true;
  };
  return { isStateValid, isEdgeValid };
}
function worldPose(definition, theta, model, scene) {
  if (!definition) throw new Error('Missing pose target.');
  const frame = scene.getFrameWorld(definition.frame, expanded(model, theta).q);
  const local = new Matrix4().compose(new Vector3(...definition.position), new Quaternion(...definition.quaternion), new Vector3(1, 1, 1));
  const world = frame.clone().multiply(local);
  const position = new Vector3(), quaternion = new Quaternion(), scale = new Vector3();
  world.decompose(position, quaternion, scale);
  return { position: position.toArray(), quaternion: quaternion.toArray() };
}

/** Constrained one-coordinate planner. The cut-tree URDF is only a renderer; every query closes the loop. */
export function planFourBarProgram(compiled, context) {
  const { robotName, robotRoot, jointModels, robotXml, robotCollisionShapes, sceneModel,
    meshGeometry, motionLimits = {}, planningOptions = {}, kinematicConstraints } = context;
  if (!compiled?.ok) return { status: 'error', diagnostics: compiled?.diagnostics || [] };
  const descriptor = kinematicConstraints?.mechanisms?.[0];
  if (!descriptor || descriptor.type !== 'planar-four-bar' || descriptor.robot !== robotName)
    return fail(1, 'FOUR_BAR_DESCRIPTOR', 'The active robot has no matching planar four-bar descriptor.');
  let model, collision, driverModel, limits, allLimits, theta, tipLink = null, time = 0;
  const samples = [], events = [], plans = [], expandedTrace = [];
  try {
    for (const step of compiled.steps) {
      if (step.kind === 'ROBOT') {
        if (step.args[0] !== robotName) return fail(step.line, 'UNKNOWN_ROBOT', `Loaded robot is ${robotName}; program selected ${step.args[0]}.`);
        continue;
      }
      if (step.kind === 'TOOL') {
        if (model && tipLink !== step.args[0]) return fail(step.line, 'TOOL_CHANGE', 'Changing the TCP link within one program is unsupported.');
        if (model) continue;
        tipLink = step.args[0];
        sceneModel.getFrame(`robot/${robotName}/link/${tipLink}`);
        robotRoot.updateWorldMatrix(true, false);
        model = createFourBarModel({ descriptor: kinematicConstraints, joints: jointModels,
          worldFromBase: robotRoot.matrixWorld, tipLink });
        theta = model.initial[0];
        const start = expanded(model, theta);
        const left = createRobotModel({ joints: jointModels, tipLink, worldFromBase: robotRoot.matrixWorld });
        const collisionModel = { ...left, active: [0, 1, 2],
          jointNames: [descriptor.driverJoint, descriptor.couplerJoint, descriptor.outputJoint], initial: start.q };
        collision = createPlanningCollisionScene({ robotName, robotModel: collisionModel, allJoints: jointModels,
          robotCollisionShapes: robotCollisionShapes ?? parseURDFCollisionShapes(robotXml), sceneModel, meshGeometry,
          allowedCollisionPairs: [[descriptor.leftClosureLink, descriptor.rightClosureLink]] });
        const driver = jointModels.find(joint => (joint.name ?? joint.get?.('name')) === descriptor.driverJoint);
        driverModel = { joints: [{ name: descriptor.driverJoint, type: driver.type,
          lower: Number(driver.lower), upper: Number(driver.upper) }], active: [0],
          jointNames: [descriptor.driverJoint], initial: [theta] };
        limits = resolveMotionLimits(driverModel, jointModels, motionLimits);
        const fullLimitModel = { ...driverModel,
          joints: [descriptor.driverJoint, descriptor.couplerJoint, descriptor.outputJoint]
            .map(name => ({ name, type: 'revolute' })), active: [0, 1, 2],
          jointNames: [descriptor.driverJoint, descriptor.couplerJoint, descriptor.outputJoint] };
        allLimits = resolveMotionLimits(fullLimitModel, jointModels, motionLimits);
        if (!collision.isStateValid(start.q)) return fail(step.line, 'SCENE_COLLISION', 'The closed initial four-bar collides with the scene.');
        samples.push({ time: 0, q: [theta], velocity: [0], acceleration: [0] });
        expandedTrace.push({ time: 0, q: start.q, closureResidual: start.closureResidual });
        continue;
      }
      if (!model) return fail(step.line, 'TOOL_REQUIRED', `Select a TCP link with TOOL before ${step.kind}.`);
      if (step.kind === 'ZONE') {
        if (step.radius > 0) return fail(step.line, 'FOUR_BAR_ZONE', 'ZONE blending for a constrained four-bar is not available; use ZONE 0.');
        continue;
      }
      if (step.kind === 'PAUSE') {
        if (step.seconds > 0) {
          time += step.seconds;
          samples.push({ time, q: [theta], velocity: [0], acceleration: [0] });
          expandedTrace.push({ time, q: expanded(model, theta).q, closureResidual: 0 });
        }
        continue;
      }
      if (step.kind === 'GRAB' || step.kind === 'RELEASE') {
        const q = expanded(model, theta).q, object = step.args[0];
        const attachment = collision.snapshot().find(item => item.name === object)?.attachment;
        if (step.kind === 'GRAB') {
          if (attachment?.startsWith('model/')) return fail(step.line, 'GRAB_JOINED', `${object} is joined to another scene model.`);
          const tcp = new Vector3().setFromMatrixPosition(collision.getFrameWorld('tool', q));
          const distance = collision.distanceToObject(object, tcp, q);
          if (distance > 0.04) return fail(step.line, 'GRASP_DISTANCE', `GRAB ${object} is ${distance.toFixed(3)} m from the TCP; reach within 0.040 m.`);
          collision.attach(object, 'tool', q);
        } else {
          if (!(attachment === 'tool' || attachment?.startsWith('robot/'))) return fail(step.line, 'RELEASE_NOT_HELD', `${object} is not held by the robot.`);
          collision.release(object, q);
        }
        if (!collision.isStateValid(q)) return fail(step.line, 'SCENE_COLLISION', `${step.kind} ${object} would leave the scene in collision.`);
        events.push({ time, kind: step.kind, object, frame: `robot/${robotName}/link/${tipLink}`, line: step.line });
        continue;
      }
      if (step.kind !== 'MOVEJ') return fail(step.line, 'FOUR_BAR_PATH',
        `${step.kind} requires a Cartesian path on the four-bar manifold; this command is not supported for the constrained mechanism.`);
      const targetName = step.args[0], jointTarget = compiled.joints.get(targetName);
      let targetTheta;
      if (jointTarget) {
        const names = Object.keys(jointTarget.values);
        if (names.length !== 1 || names[0] !== descriptor.driverJoint)
          return fail(step.line, 'FOUR_BAR_JOINT_TARGET', `JOINTS ${targetName} must specify only ${descriptor.driverJoint}; passive joints are solved by closure.`);
        targetTheta = jointTarget.values[descriptor.driverJoint];
      } else {
        const goal = worldPose(compiled.poses.get(targetName), theta, model, collision);
        const solution = solveFourBarPose(model, goal, { seed: theta,
          isStateValid: candidate => {
            const angle = Array.isArray(candidate) ? candidate[0] : candidate;
            const closure = expandFourBar(model, angle);
            return closure.status === 'expanded' && collision.isStateValid(closure.q);
          }, ...planningOptions.ik });
        if (solution.status !== 'reached') return fail(step.line, 'FOUR_BAR_IK', `MOVEJ ${targetName}: ${solution.reason || solution.status}.`);
        targetTheta = Array.isArray(solution.q) ? solution.q[0] : solution.theta;
      }
      const target = expandFourBar(model, targetTheta);
      if (target.status !== 'expanded') return fail(step.line, 'FOUR_BAR_CLOSURE', target.reason || `The target angle ${targetTheta} cannot close the four-bar.`);
      const checks = constrainedCollisionChecks(model, collision);
      const path = planPTP(driverModel, [theta], [targetTheta], { ...checks, ...planningOptions.ptp });
      if (path.status !== 'planned') return fail(step.line, `FOUR_BAR_${path.status.toUpperCase()}`, `MOVEJ: ${path.reason || path.status}.`);
      const timed = timeParameterize(path.jointPath, limits, { model: driverModel, ...checks,
        allowInternalStops: true, ...planningOptions.timing });
      if (timed.status !== 'timed') return fail(step.line, `FOUR_BAR_${timed.status.toUpperCase()}`, `MOVEJ: ${timed.reason || timed.status}.`);
      let scale = 1;
      const boundRates = point => {
        const state = expanded(model, point.q[0]);
        for (let j = 0; j < 3; j++) {
          const velocity = state.ratePerTheta[j] * point.velocity[0];
          const acceleration = state.ratePerTheta[j] * point.acceleration[0] + state.secondPerTheta2[j] * point.velocity[0] ** 2;
          scale = Math.max(scale, Math.abs(velocity) / allLimits.velocity[j],
            Math.sqrt(Math.abs(acceleration) / allLimits.acceleration[j]));
        }
      };
      for (const point of timed.points) boundRates(point);
      for (let i = 1; i < timed.points.length; i++) {
        const a = timed.points[i - 1], b = timed.points[i];
        for (const fraction of [0.25, 0.5, 0.75])
          boundRates(interpolateTimedJointSegment(a, b, a.time + (b.time - a.time) * fraction));
      }
      scale *= 1.02;
      const startTime = time;
      for (const point of timed.points.slice(1)) {
        const sample = { time: time + point.time * scale, q: [...point.q],
          velocity: point.velocity.map(value => value / scale),
          acceleration: point.acceleration.map(value => value / scale ** 2) };
        const state = expanded(model, sample.q[0]);
        samples.push(sample);
        expandedTrace.push({ time: sample.time, q: state.q, closureResidual: state.closureResidual });
      }
      time += timed.duration * scale;
      theta = targetTheta;
      plans.push({ line: step.line, type: 'PTP', startTime, endTime: time, duration: time - startTime,
        jointPath: path.jointPath, constrained: true });
    }
    if (!model || !samples.length) return fail(1, 'NO_ROBOT', 'Select a robot and TOOL link.');
    if (!plans.length) return fail(1, 'NO_MOTION', 'Program has no MOVEJ command.');
    const trajectory = { header: { frame_id: 'world' }, joint_names: [descriptor.driverJoint],
      points: samples.map(point => ({ positions: [...point.q], velocities: [...point.velocity],
        accelerations: [...point.acceleration], time_from_start: stamp(point.time) })) };
    return { status: 'planned', model, constrained: true, samples, expandedTrace, events, plans,
      zoneBlends: [], cartesianZoneBlends: [], weld: { segments: [], events: [] },
      processTrajectory: { header: { frame_id: 'world' }, events: [], segments: [] },
      duration: time, trajectory, limitDetails: allLimits.details, diagnostics: [] };
  } catch (error) { return fail(compiled.steps.findLast(step => step.kind === 'MOVEJ')?.line || 1,
    'FOUR_BAR_PLAN', error.message); }
  finally { collision?.dispose(); }
}
