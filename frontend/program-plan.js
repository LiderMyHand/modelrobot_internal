import { Matrix4, Quaternion, Vector3 } from 'three';
import { createRobotModel, forwardKinematics } from './planning/robot-model.js';
import { planMove } from './planning/index.js';
import { createPlanningCollisionScene, parseURDFCollisionShapes } from './planning/collision-scene.js';
import { resolveMotionLimits } from './motion-limits.js';
import { blendPTPCorner } from './planning/zone.js';
import { linearPath, circularPath } from './planning/paths.js';
import { solvePose } from './planning/ik-pose.js';
import { planCartesianZonePair, planCartesianZoneChain } from './planning/cartesian-zone.js';
import { planFourBarProgram } from './four-bar-plan.js';

function worldPose(definition, q, collisionScene) {
  const frame = collisionScene.getFrameWorld(definition.frame, q);
  const local = new Matrix4().compose(new Vector3(...definition.position), new Quaternion(...definition.quaternion), new Vector3(1, 1, 1));
  const world = frame.clone().multiply(local);
  const position = new Vector3(), quaternion = new Quaternion(), scale = new Vector3();
  world.decompose(position, quaternion, scale);
  return { position: position.toArray(), quaternion: quaternion.toArray() };
}
function failure(line, code, message) { return { status: 'error', diagnostics: [{ line, column: 1, code, message }] }; }
function rosTime(seconds) {
  const sec = Math.floor(seconds), nanosec = Math.round((seconds - sec) * 1e9);
  return { sec: sec + Math.floor(nanosec / 1e9), nanosec: nanosec % 1e9 };
}
const ZONE_TIME_RESERVE = 1.45;
function zoneTimingMoves(steps) {
  const eligible = new Set();
  let zone = 0, previous = null;
  for (const step of steps) {
    if (step.kind === 'ZONE') { zone = step.radius; continue; }
    if (step.kind === 'MOVEJ') {
      if (previous && previous.zone > 0 && zone > 0) { eligible.add(previous.line); eligible.add(step.line); }
      previous = { line: step.line, zone };
    } else previous = null;
  }
  return eligible;
}
function nextCartesianMove(steps, index, currentZone, currentZoneLine) {
  let zone = currentZone, zoneLine = currentZoneLine, next = index + 1;
  while (steps[next]?.kind === 'ZONE') { zone = steps[next].radius; zoneLine = steps[next].line; next++; }
  return ['MOVEL', 'MOVEC'].includes(steps[next]?.kind)
    ? { step: steps[next], index: next, zone, zoneLine } : null;
}

/** Plan an entire small-language program against a detached scene snapshot. */
export function planProgram(compiled, { robotName, robotRoot, jointModels, robotXml, robotCollisionShapes: providedRobotCollisionShapes,
  sceneModel, meshGeometry, motionLimits = {}, planningOptions = {}, kinematicConstraints = null }) {
  if (!compiled?.ok) return { status: 'error', diagnostics: compiled?.diagnostics || [{ line: 1, code: 'PROGRAM', message: 'Compile the program first.' }] };
  if (kinematicConstraints) return planFourBarProgram(compiled, { robotName, robotRoot, jointModels, robotXml,
    robotCollisionShapes: providedRobotCollisionShapes, sceneModel, meshGeometry, motionLimits,
    planningOptions, kinematicConstraints });
  const allJoints = [...jointModels];
  const zoneTimedLines = zoneTimingMoves(compiled.steps);
  let tipLink = null, model = null, collisionScene = null, limits = null, q = null, time = 0, currentLine = 1, welding = false, weldObject = null, weldMotionCount = 0;
  let zoneRadius = 0, zoneLine = 0, boundaryClear = false;
  const samples = [], events = [], plans = [], moveRecords = [], zoneBlends = [], cartesianZoneBlends = [], weldSegments = [], processEvents = [];
  const completedSeamObjects = [];
  try {
    for (let stepIndex = 0; stepIndex < compiled.steps.length; stepIndex++) {
      const step = compiled.steps[stepIndex];
      currentLine = step.line;
      if (welding && !['MOVEL', 'MOVEC', 'WELD'].includes(step.kind)) return failure(step.line, 'WELD_MOTION', `Only MOVEL or MOVEC is allowed while WELD is ON; switch it OFF before ${step.kind}.`);
      if (step.kind === 'ROBOT') {
        if (step.args[0] !== robotName) return failure(step.line, 'UNKNOWN_ROBOT', `Loaded robot is ${robotName}; program selected ${step.args[0]}.`);
        boundaryClear = false;
        continue;
      }
      if (step.kind === 'ZONE') {
        if (!(Number.isFinite(step.radius) && step.radius >= 0 && step.radius <= 0.2)) return failure(step.line, 'ZONE_RANGE', 'ZONE radius must be from 0 through 0.2 m.');
        zoneRadius = step.radius; zoneLine = step.line;
        continue;
      }
      if (step.kind === 'TOOL') {
        if (model && step.args[0] !== tipLink) return failure(step.line, 'TOOL_CHANGE', 'Changing the TCP link within one program is not supported yet.');
        if (model) { boundaryClear = false; continue; }
        tipLink = step.args[0];
        sceneModel.getFrame(`robot/${robotName}/link/${tipLink}`);
        robotRoot.updateWorldMatrix(true, false);
        model = createRobotModel({ joints: allJoints, tipLink, worldFromBase: robotRoot.matrixWorld });
        q = [...model.initial];
        const robotCollisionShapes = providedRobotCollisionShapes ?? parseURDFCollisionShapes(robotXml);
        collisionScene = createPlanningCollisionScene({ robotName, robotModel: model, allJoints, robotCollisionShapes, sceneModel, meshGeometry });
        limits = resolveMotionLimits(model, allJoints, motionLimits);
        samples.push({ time: 0, q: [...q], velocity: q.map(() => 0), acceleration: q.map(() => 0) });
        boundaryClear = false;
        continue;
      }
      if (!model || !collisionScene) return failure(step.line, 'TOOL_REQUIRED', `Select a TCP link with TOOL name before ${step.kind}.`);
      if (step.kind === 'WELD') {
        boundaryClear = false;
        if (step.state !== 'ON' && step.state !== 'OFF') return failure(step.line, 'WELD_SYNTAX', 'Use WELD ON object or WELD OFF.');
        if ((step.state === 'ON') === welding) return failure(step.line, 'WELD_STATE', `WELD is already ${welding ? 'ON' : 'OFF'}.`);
        if (step.state === 'ON') {
          if (!step.object) return failure(step.line, 'WELD_SYNTAX', 'WELD ON needs a scene object.');
          const tcp = forwardKinematics(model, q).position;
          let distance;
          try { distance = collisionScene.distanceToObjectSurface(step.object, tcp, q); }
          catch (cause) { return failure(step.line, 'WELD_OBJECT', cause.message); }
          if (distance > 0.04) return failure(step.line, 'WELD_DISTANCE', `WELD ON ${step.object} is ${distance.toFixed(3)} m from the TCP; stay within 0.040 m of its collision surface.`);
          weldObject = step.object; weldMotionCount = 0;
        } else if (weldMotionCount) {
          completedSeamObjects.push(weldObject);
        }
        welding = step.state === 'ON';
        processEvents.push({ time, kind: welding ? 'WELD_ON' : 'WELD_OFF', line: step.line,
          object: weldObject, frame: `robot/${robotName}/link/${tipLink}`, pose: forwardKinematics(model, q) });
        if (!welding) { weldObject = null; weldMotionCount = 0; }
        continue;
      }
      if (step.kind === 'WELD_JOIN') {
        boundaryClear = false;
        const { child, parent } = step;
        if (!child || !parent || child === parent) return failure(step.line, 'WELD_JOIN', 'WELD JOIN needs distinct child and parent scene objects.');
        const seamIndex = completedSeamObjects.findLastIndex(name => name === child || name === parent);
        if (seamIndex < 0) {
          return failure(step.line, 'WELD_SEAM_REQUIRED', 'WELD JOIN needs a completed seam involving its child or parent.');
        }
        const currentAttachment = collisionScene.snapshot().find(item => item.name === child)?.attachment;
        if (currentAttachment?.startsWith('model/')) {
          return failure(step.line, 'WELD_ALREADY_JOINED', `${child} is already joined to ${currentAttachment}; an already joined child cannot be joined again.`);
        }
        const tcp = forwardKinematics(model, q).position;
        let childDistance, parentDistance;
        try {
          childDistance = collisionScene.distanceToObjectSurface(child, tcp, q);
          parentDistance = collisionScene.distanceToObjectSurface(parent, tcp, q);
        } catch (cause) { return failure(step.line, 'WELD_JOIN', cause.message); }
        if (childDistance > 0.04 || parentDistance > 0.04) {
          return failure(step.line, 'WELD_JOIN_DISTANCE', `WELD JOIN ${child} ${parent} needs the TCP within 0.040 m of both collision surfaces; distances are ${childDistance.toFixed(3)} m and ${parentDistance.toFixed(3)} m.`);
        }
        const frame = `model/${parent}`;
        try { collisionScene.attach(child, frame, q); }
        catch (cause) { return failure(step.line, 'WELD_JOIN', cause.message); }
        if (!collisionScene.isStateValid(q)) return failure(step.line, 'SCENE_COLLISION', `WELD JOIN ${child} ${parent} would leave the assembly in collision.`);
        completedSeamObjects.splice(seamIndex, 1);
        events.push({ time, kind: 'WELD_JOIN', object: child, child, parent, frame, line: step.line });
        processEvents.push({ time, kind: 'WELD_JOIN', line: step.line, object: child, child, parent, frame,
          pose: forwardKinematics(model, q) });
        continue;
      }
      if (step.kind === 'PAUSE') {
        boundaryClear = false;
        if (step.seconds > 0) { time += step.seconds; samples.push({ time, q: [...q], velocity: q.map(() => 0), acceleration: q.map(() => 0) }); }
        continue;
      }
      if (step.kind === 'GRAB' || step.kind === 'RELEASE') {
        boundaryClear = false;
        const object = step.args[0];
        const attachment = collisionScene.snapshot().find(item => item.name === object)?.attachment;
        if (step.kind === 'GRAB') {
          if (attachment?.startsWith('model/')) return failure(step.line, 'GRAB_JOINED', `GRAB ${object} would separate it from ${attachment}; grab the assembly parent instead.`);
          const tcp = new Vector3().setFromMatrixPosition(collisionScene.getFrameWorld('tool', q));
          const distance = collisionScene.distanceToObject(object, tcp, q);
          if (distance > 0.04) return failure(step.line, 'GRASP_DISTANCE', `GRAB ${object} is ${distance.toFixed(3)} m from the TCP; bring the TCP within 0.040 m of its collision surface.`);
          collisionScene.attach(object, 'tool', q);
        } else {
          if (attachment?.startsWith('model/')) return failure(step.line, 'RELEASE_JOINED', `RELEASE ${object} would separate it from ${attachment}; release the assembly parent instead.`);
          if (!(attachment === 'tool' || attachment?.startsWith('robot/'))) return failure(step.line, 'RELEASE_NOT_HELD', `RELEASE ${object} requires an object attached to the robot tool.`);
          collisionScene.release(object, q);
        }
        if (!collisionScene.isStateValid(q)) return failure(step.line, 'SCENE_COLLISION', `${step.kind} ${object} would leave the robot or carried object in collision.`);
        events.push({ time, kind: step.kind, object, frame: `robot/${robotName}/link/${tipLink}`, line: step.line });
        continue;
      }
      let goal, via;
      if (step.kind === 'MOVEJ') {
        const name = step.args[0], target = compiled.joints.get(name);
        if (target) {
          const names = Object.keys(target.values);
          if (names.length !== model.jointNames.length || names.some(joint => !model.jointNames.includes(joint))) return failure(step.line, 'JOINT_TARGET', `JOINTS ${name} must name every active joint in ${model.jointNames.join(', ')}.`);
          goal = model.jointNames.map(joint => target.values[joint]);
        } else goal = worldPose(compiled.poses.get(name), q, collisionScene);
      } else {
        goal = worldPose(compiled.poses.get(step.args.at(-1)), q, collisionScene);
        if (step.kind === 'MOVEC') via = worldPose(compiled.poses.get(step.args[0]), q, collisionScene);
      }
      const type = step.kind === 'MOVEJ' ? 'PTP' : step.kind === 'MOVEL' ? 'LIN' : 'CIRC';
      const cartesianNeighbor = type !== 'PTP' && zoneRadius > 0
        ? nextCartesianMove(compiled.steps, stepIndex, zoneRadius, zoneLine) : null;
      if (cartesianNeighbor?.zone > 0) {
        if (welding) return failure(zoneLine || step.line, 'ZONE_WELD_UNSUPPORTED',
          'Cartesian ZONE flybys are not supported while a weld seam is active.');
        const third = nextCartesianMove(compiled.steps, cartesianNeighbor.index, cartesianNeighbor.zone, cartesianNeighbor.zoneLine);
        if (third?.zone > 0) {
          const run = [{ step, index: stepIndex, zone: zoneRadius, zoneLine }];
          let cursor = { step, index: stepIndex, zone: zoneRadius, zoneLine };
          while (true) {
            const next = nextCartesianMove(compiled.steps, cursor.index, cursor.zone, cursor.zoneLine);
            if (!next || !(next.zone > 0)) break;
            run.push(next); cursor = next;
          }
          const runPaths = [], runRadii = [];
          let nominalQ = [...q], precedingPose = forwardKinematics(model, q);
          for (let i = 0; i < run.length; i++) {
            const command = run[i], commandType = command.step.kind === 'MOVEL' ? 'LIN' : 'CIRC';
            let commandGoal, commandVia;
            try {
              commandGoal = i ? worldPose(compiled.poses.get(command.step.args.at(-1)), nominalQ, collisionScene) : goal;
              commandVia = i && command.step.kind === 'MOVEC'
                ? worldPose(compiled.poses.get(command.step.args[0]), nominalQ, collisionScene) : via;
              runPaths.push(commandType === 'LIN' ? linearPath(precedingPose, commandGoal)
                : circularPath(precedingPose, commandVia, commandGoal));
            } catch (error) { return failure(command.step.line, 'CARTESIAN_TARGET', `${command.step.kind}: ${error.message}`); }
            // A flyby deliberately does not visit its nominal waypoint. Solve
            // that pose only to resolve any following robot-relative target;
            // collision checks belong to the final composite path instead.
            const nextCommand = run[i + 1]?.step;
            const followingFrames = nextCommand?.args.map(name => compiled.poses.get(name)?.frame) ?? [];
            if (followingFrames.some(frame => frame !== 'world')) {
              const nominal = solvePose(model, commandGoal, { ...planningOptions.ik, seed: nominalQ });
              if (nominal.status !== 'reached') return failure(command.step.line, 'IK_FAILED',
                `${commandType}: nominal waypoint cannot resolve a following frame: ${nominal.reason || nominal.status}.`);
              nominalQ = [...nominal.q];
            }
            precedingPose = runPaths.at(-1).at(1);
            if (i) runRadii.push(Math.min(run[i - 1].zone, command.zone));
          }
          const chain = planCartesianZoneChain({ model, start: q, paths: runPaths, radii: runRadii,
            limits, isStateValid: collisionScene.isStateValid, options: planningOptions });
          if (chain.status !== 'planned') {
            const corner = chain.cornerIndex ?? 0;
            const before = run[corner], after = run[corner + 1];
            const radiusLine = after.zone < before.zone ? after.zoneLine : before.zoneLine;
            const diagnosticLine = corner ? after.step.line : (radiusLine || after.step.line);
            return failure(diagnosticLine,
              chain.causeStatus === 'collision' ? 'ZONE_COLLISION' : 'ZONE_INFEASIBLE',
              `Cartesian ZONE after ${before.step.kind} on line ${before.step.line}: ${chain.reason || chain.status}.`);
          }
          const startTime = time;
          for (const point of chain.points.slice(1)) samples.push({ time: time + point.time, q: [...point.q],
            velocity: [...point.velocity], acceleration: [...point.acceleration] });
          time += chain.duration; q = [...chain.points.at(-1).q];
          const records = chain.corners.map((corner, i) => ({ afterLine: run[i].step.line,
            beforeLine: run[i + 1].step.line, radius: corner.radius,
            entryTime: startTime + corner.entryTime, boundaryTime: startTime + corner.boundaryTime,
            exitTime: startTime + corner.exitTime, maxWaypointDistance: corner.maxWaypointDistance,
            speedFraction: corner.speedFraction, maxAngularSpeedBound: chain.maxAngularSpeedBound,
            orientationTransitionAngle: corner.orientationTransitionAngle,
            requiredFractions: chain.requiredFractions }));
          cartesianZoneBlends.push(...records);
          for (let i = 0; i < run.length; i++) {
            const begin = i ? records[i - 1].boundaryTime : startTime;
            const end = i < records.length ? records[i].boundaryTime : time;
            const commandType = run[i].step.kind === 'MOVEL' ? 'LIN' : 'CIRC';
            const command = { line: run[i].step.line, type: commandType, startTime: begin,
              endTime: end, duration: end - begin, jointPath: chain.jointPath };
            if (i) command.cartesianZoneBlendIn = records[i - 1];
            if (i < records.length) command.cartesianZoneBlendOut = records[i];
            plans.push(command);
            moveRecords.push({ line: run[i].step.line, type: commandType, startTime: begin, endTime: end,
              zoneRadius: run[i].zone, zoneLine: run[i].zoneLine, canBlendBefore: i ? true : boundaryClear });
          }
          boundaryClear = true;
          zoneRadius = run.at(-1).zone; zoneLine = run.at(-1).zoneLine;
          stepIndex = run.at(-1).index;
          continue;
        }
        const nominal = planMove({ type, model, start: q, goal, via, limits,
          isStateValid: collisionScene.isStateValid, options: planningOptions });
        if (nominal.status !== 'planned') return failure(step.line, nominal.status.toUpperCase(),
          `${type}: ${nominal.reason || nominal.result?.reason || nominal.status}.`);
        const nominalEnd = nominal.points.at(-1).q;
        const following = cartesianNeighbor.step;
        const inbound = type === 'LIN' ? linearPath(forwardKinematics(model, q), goal)
          : circularPath(forwardKinematics(model, q), via, goal);
        let outbound;
        try {
          const followingGoal = worldPose(compiled.poses.get(following.args.at(-1)), nominalEnd, collisionScene);
          const followingVia = following.kind === 'MOVEC'
            ? worldPose(compiled.poses.get(following.args[0]), nominalEnd, collisionScene) : null;
          outbound = following.kind === 'MOVEL' ? linearPath(inbound.at(1), followingGoal)
            : circularPath(inbound.at(1), followingVia, followingGoal);
        } catch (error) { return failure(following.line, 'CARTESIAN_TARGET', `${following.kind}: ${error.message}`); }
        const radius = Math.min(zoneRadius, cartesianNeighbor.zone);
        const radiusLine = cartesianNeighbor.zone < zoneRadius ? cartesianNeighbor.zoneLine : zoneLine;
        const pair = planCartesianZonePair({ model, start: q, inbound, outbound, radius, limits,
          isStateValid: collisionScene.isStateValid, options: planningOptions });
        if (pair.status !== 'planned') return failure(radiusLine || step.line,
          pair.causeStatus === 'collision' ? 'ZONE_COLLISION' : 'ZONE_INFEASIBLE',
          `Cartesian ZONE after ${step.kind} on line ${step.line}: ${pair.reason || pair.status}.`);
        const startTime = time, boundaryTime = time + pair.boundaryTime;
        for (const point of pair.points.slice(1)) samples.push({ time: time + point.time, q: [...point.q],
          velocity: [...point.velocity], acceleration: [...point.acceleration] });
        time += pair.duration; q = [...pair.points.at(-1).q];
        const record = { afterLine: step.line, beforeLine: following.line, radius,
          entryTime: startTime + pair.entryTime, boundaryTime, exitTime: startTime + pair.exitTime,
          maxWaypointDistance: pair.maxWaypointDistance, speedFraction: pair.speedFraction,
          maxAngularSpeedBound: pair.maxAngularSpeedBound,
          orientationTransitionAngle: pair.orientationTransitionAngle,
          requiredFractions: pair.requiredFractions };
        cartesianZoneBlends.push(record);
        plans.push({ line: step.line, type, startTime, endTime: boundaryTime,
          duration: pair.boundaryTime, jointPath: pair.jointPath, cartesianZoneBlendOut: record });
        plans.push({ line: following.line, type: following.kind === 'MOVEL' ? 'LIN' : 'CIRC',
          startTime: boundaryTime, endTime: time, duration: pair.duration - pair.boundaryTime,
          jointPath: pair.jointPath, cartesianZoneBlendIn: record });
        moveRecords.push({ line: step.line, type, startTime, endTime: boundaryTime, zoneRadius, zoneLine,
          canBlendBefore: boundaryClear });
        moveRecords.push({ line: following.line, type: following.kind === 'MOVEL' ? 'LIN' : 'CIRC',
          startTime: boundaryTime, endTime: time, zoneRadius: cartesianNeighbor.zone,
          zoneLine: cartesianNeighbor.zoneLine, canBlendBefore: true });
        boundaryClear = true;
        zoneRadius = cartesianNeighbor.zone; zoneLine = cartesianNeighbor.zoneLine;
        stepIndex = cartesianNeighbor.index;
        continue;
      }
      const result = planMove({ type, model, start: q, goal, via, limits, isStateValid: collisionScene.isStateValid, options: planningOptions });
      if (result.status !== 'planned') return failure(step.line, result.status.toUpperCase(), `${type}: ${result.reason || result.result?.reason || result.status}.`);
      if (type === 'PTP' && zoneTimedLines.has(step.line)) {
        // Reserve acceleration headroom for the later C2 corner splice. This
        // slows only PTP moves that actually have a compatible ZONE neighbor.
        result.duration *= ZONE_TIME_RESERVE;
        for (const point of result.points) {
          point.time *= ZONE_TIME_RESERVE;
          point.velocity = point.velocity.map(value => value / ZONE_TIME_RESERVE);
          point.acceleration = point.acceleration.map(value => value / ZONE_TIME_RESERVE ** 2);
        }
      }
      const startTime = time;
      let seamSamples = null;
      if (welding) {
        seamSamples = [];
        for (const point of result.points) {
          const pose = forwardKinematics(model, point.q), sampleTime = startTime + point.time;
          const distance = collisionScene.distanceToObjectSurface(weldObject, pose.position, point.q);
          if (distance > 0.04) return failure(step.line, 'WELD_DISTANCE', `${type} leaves ${weldObject}'s collision surface by ${distance.toFixed(3)} m at ${sampleTime.toFixed(3)} s; stay within 0.040 m.`);
          seamSamples.push({ time: sampleTime, ...pose });
        }
      }
      for (const point of result.points.slice(1)) samples.push({ time: time + point.time, q: [...point.q], velocity: [...point.velocity], acceleration: [...point.acceleration] });
      time += result.duration; q = [...result.points.at(-1).q];
      plans.push({ line: step.line, type, startTime, endTime: time, duration: result.duration, jointPath: result.jointPath, internalStops: result.internalStops });
      moveRecords.push({ line: step.line, type, startTime, endTime: time, zoneRadius, zoneLine,
        canBlendBefore: boundaryClear });
      const previous = moveRecords.at(-2), next = moveRecords.at(-1);
      if (previous && next.canBlendBefore && previous.type === 'PTP' && next.type === 'PTP') {
        const radius = Math.min(previous.zoneRadius, next.zoneRadius);
        if (radius > 0) {
          const blend = blendPTPCorner(samples, { boundaryTime: previous.endTime,
            leftStart: previous.startTime, rightEnd: next.endTime, radius, model, limits,
            isStateValid: collisionScene.isStateValid, collisionOptions: planningOptions.collision });
          if (blend.status !== 'blended') return failure(previous.zoneLine || previous.line, 'ZONE_INFEASIBLE', `ZONE after MOVEJ on line ${previous.line}: ${blend.reason}`);
          samples.splice(0, samples.length, ...blend.samples);
          const record = { afterLine: previous.line, beforeLine: next.line, radius,
            entryTime: blend.entryTime, waypointTime: blend.waypointTime, exitTime: blend.exitTime,
            waypointDeviation: blend.waypointDeviation, cornerSpeedFraction: blend.cornerSpeedFraction };
          zoneBlends.push(record);
          plans.at(-2).zoneBlendOut = record; plans.at(-1).zoneBlendIn = record;
        }
      }
      boundaryClear = true;
      if (welding) {
        weldSegments.push({ line: step.line, type, object: weldObject, startTime, endTime: time, samples: seamSamples });
        weldMotionCount++;
      }
    }
    if (welding) return failure(currentLine, 'WELD_UNCLOSED', 'End the weld path with WELD OFF.');
    if (!model || !samples.length) return failure(1, 'NO_ROBOT', 'Select a robot and TOOL link to plan this program.');
    if (!plans.length) return failure(1, 'NO_MOTION', 'Program has no movement command.');
    const trajectory = { header: { frame_id: 'world' }, joint_names: [...model.jointNames], points: samples.map(point => ({ positions: [...point.q], velocities: [...point.velocity], accelerations: [...point.acceleration], time_from_start: rosTime(point.time) })) };
    const weld = { segments: weldSegments, events: processEvents };
    const processTrajectory = { header: { frame_id: 'world' }, events: processEvents, segments: weldSegments };
    return { status: 'planned', model, samples, events, plans, zoneBlends, cartesianZoneBlends,
      duration: time, trajectory, weld, processTrajectory, limitDetails: limits.details, diagnostics: [] };
  } catch (error) {
    return failure(currentLine, 'PREFLIGHT', error.message);
  } finally { collisionScene?.dispose(); }
}
