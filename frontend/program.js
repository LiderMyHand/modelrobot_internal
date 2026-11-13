// A deliberately small robotics language. Parsing never evaluates JavaScript.
// Geometry and robot names are resolved against the active workcell at preflight.
const namePattern = /^[A-Za-z_][A-Za-z0-9_.:/-]*$/;
const commands = new Set(['ROBOT', 'TOOL', 'MOVEJ', 'MOVEL', 'MOVEC', 'PAUSE', 'GRAB', 'RELEASE', 'WELD', 'ZONE']);

function diagnostic(line, code, message) { return { line, column: 1, code, message }; }
function validName(value) { return Boolean(value && namePattern.test(value)); }
function finiteNumber(value) { return value !== '' && Number.isFinite(Number(value)); }
function normalizedQuaternion(values) {
  const length = Math.hypot(...values);
  if (length < 1e-12) return null;
  const sign = values[3] < 0 ? -1 : 1;
  return values.map(value => sign * value / length);
}

export function axisAngleToQuaternion(axis, angle) {
  if (!Array.isArray(axis) || axis.length !== 3 || !axis.every(Number.isFinite) || !Number.isFinite(angle)) throw new Error('Axis and angle must be finite numbers.');
  const length = Math.hypot(...axis);
  if (length < 1e-12) {
    if (Math.abs(angle) < 1e-12) return [0, 0, 0, 1];
    throw new Error('A nonzero angle needs a nonzero axis.');
  }
  const scale = Math.sin(angle / 2) / length;
  return normalizedQuaternion([...axis.map(value => value * scale), Math.cos(angle / 2)]);
}

export function quaternionToAxisAngle(quaternion) {
  const q = normalizedQuaternion(quaternion);
  if (!q) throw new Error('Quaternion must be nonzero.');
  const sinHalf = Math.hypot(...q.slice(0, 3));
  if (sinHalf < 1e-12) return { axis: [0, 0, 1], angle: 0 };
  return { axis: q.slice(0, 3).map(value => value / sinHalf), angle: 2 * Math.atan2(sinHalf, q[3]) };
}

/**
 * Compile movement source into named targets and line-numbered commands.
 * All lengths are metres, joint angles radians, and quaternions are xyzw.
 * POSE accepts bare xyzw, Q xyzw, or AA axis-x axis-y axis-z angle.
 * This parser checks syntax and local references; scene names and reachability
 * are checked later by the workcell preflight.
 */
export function compileProgram(source) {
  if (typeof source !== 'string') throw new TypeError('Program source must be text.');
  const poses = new Map(), joints = new Map(), steps = [], diagnostics = [];
  let activeRobot = null, welding = false, weldStartLine = null, weldObject = null, weldMotionCount = 0;
  const completedSeamObjects = [];
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = index + 1;
    const raw = lines[index].replace(/(^|\s)#.*$/, '$1').trim();
    if (!raw) continue;
    const words = raw.split(/\s+/), op = words[0];
    const error = (code, message) => diagnostics.push(diagnostic(line, code, message));
    if (op === 'POSE') {
      const explicit = words.length === 11 && ['Q', 'AA'].includes(words[6]);
      const bare = words.length === 10;
      if ((!explicit && !bare) || !validName(words[1]) || !validName(words[2]) || !words.slice(3, 6).every(finiteNumber) || !(explicit ? words.slice(7).every(finiteNumber) : words.slice(6).every(finiteNumber))) {
        error('POSE_SYNTAX', 'Use POSE name frame x y z Q qx qy qz qw or POSE name frame x y z AA ax ay az angle.'); continue;
      }
      const name = words[1], frame = words[2], position = words.slice(3, 6).map(Number);
      const orientationValues = words.slice(explicit ? 7 : 6).map(Number);
      let quaternion;
      try { quaternion = explicit && words[6] === 'AA' ? axisAngleToQuaternion(orientationValues.slice(0, 3), orientationValues[3]) : normalizedQuaternion(orientationValues); }
      catch (cause) { error('POSE_AXIS_ANGLE', cause.message); continue; }
      if (!quaternion) { error('POSE_QUATERNION', 'Pose quaternion must be nonzero.'); continue; }
      if (poses.has(name) || joints.has(name)) { error('DUPLICATE_TARGET', `Target ${name} is already defined.`); continue; }
      poses.set(name, { name, frame, position, quaternion, orientationInput: explicit && words[6] === 'AA' ? 'axis-angle' : 'quaternion', line });
      continue;
    }
    if (op === 'JOINTS') {
      if (words.length < 3 || !validName(words[1])) { error('JOINTS_SYNTAX', 'Use JOINTS name joint=value [joint=value ...].'); continue; }
      const name = words[1], values = Object.create(null);
      let valid = true;
      for (const assignment of words.slice(2)) {
        const equals = assignment.indexOf('=');
        const joint = assignment.slice(0, equals), text = assignment.slice(equals + 1);
        if (equals <= 0 || !validName(joint) || !finiteNumber(text) || Object.hasOwn(values, joint)) { valid = false; break; }
        values[joint] = Number(text);
      }
      if (!valid) { error('JOINTS_SYNTAX', 'Joint values must be unique joint=value numbers.'); continue; }
      if (poses.has(name) || joints.has(name)) { error('DUPLICATE_TARGET', `Target ${name} is already defined.`); continue; }
      joints.set(name, { name, values, line });
      continue;
    }
    if (!commands.has(op)) { error('UNKNOWN_COMMAND', `Unknown command ${op}.`); continue; }
    const args = words.slice(1);
    if (op === 'WELD') {
      if (args[0] === 'JOIN') {
        if (args.length !== 3 || !validName(args[1]) || !validName(args[2])) {
          error('WELD_SYNTAX', 'Use WELD JOIN child parent.'); continue;
        }
        if (!activeRobot) { error('ROBOT_REQUIRED', 'Select a robot with ROBOT name before WELD JOIN.'); continue; }
        if (welding) { error('WELD_MOTION', 'Finish the active seam with WELD OFF before WELD JOIN.'); continue; }
        if (args[1] === args[2]) { error('WELD_JOIN_SELF', 'A scene object cannot be joined to itself.'); continue; }
        const seamIndex = completedSeamObjects.findLastIndex(name => name === args[1] || name === args[2]);
        if (seamIndex < 0) {
          error('WELD_SEAM_REQUIRED', 'WELD JOIN needs a completed seam involving its child or parent.'); continue;
        }
        completedSeamObjects.splice(seamIndex, 1);
        steps.push({ kind: 'WELD_JOIN', child: args[1], parent: args[2], robot: activeRobot, line });
        continue;
      }
      if (!((args.length === 2 && args[0] === 'ON' && validName(args[1])) || (args.length === 1 && args[0] === 'OFF'))) {
        error('WELD_SYNTAX', 'Use WELD ON object or WELD OFF.'); continue;
      }
      if (!activeRobot) { error('ROBOT_REQUIRED', 'Select a robot with ROBOT name before WELD.'); continue; }
      if (args[0] === 'ON' && welding) { error('WELD_STATE', 'WELD is already ON.'); continue; }
      if (args[0] === 'OFF' && !welding) { error('WELD_STATE', 'WELD is already OFF.'); continue; }
      if (args[0] === 'ON') { welding = true; weldStartLine = line; weldObject = args[1]; weldMotionCount = 0; }
      else {
        if (weldMotionCount) completedSeamObjects.push(weldObject);
        welding = false; weldStartLine = null; weldObject = null; weldMotionCount = 0;
      }
      steps.push({ kind: 'WELD', state: args[0], object: args[0] === 'ON' ? args[1] : null, robot: activeRobot, line });
      continue;
    }
    if (welding && !['MOVEL', 'MOVEC'].includes(op)) {
      error('WELD_MOTION', `Only MOVEL or MOVEC is allowed while WELD is ON; switch it OFF before ${op}.`); continue;
    }
    if (op === 'ZONE') {
      if (args.length !== 1 || !finiteNumber(args[0]) || Number(args[0]) < 0 || Number(args[0]) > 0.2) {
        error('ZONE_SYNTAX', 'Use ZONE radius in metres, from 0 through 0.2; ZONE 0 stops exactly.'); continue;
      }
      if (!activeRobot) { error('ROBOT_REQUIRED', 'Select a robot with ROBOT name before ZONE.'); continue; }
      steps.push({ kind: 'ZONE', radius: Number(args[0]), robot: activeRobot, line }); continue;
    }
    if (op === 'PAUSE') {
      if (args.length !== 1 || !finiteNumber(args[0]) || Number(args[0]) < 0) { error('PAUSE_SYNTAX', 'Use PAUSE with a nonnegative number of seconds.'); continue; }
      steps.push({ kind: op, seconds: Number(args[0]), line }); continue;
    }
    const expected = op === 'MOVEC' ? 2 : 1;
    if (args.length !== expected || !args.every(validName)) {
      error('COMMAND_SYNTAX', `${op} needs ${expected} named ${expected === 1 ? 'argument' : 'arguments'}.`); continue;
    }
    if (op === 'ROBOT') activeRobot = args[0];
    else if (!activeRobot) { error('ROBOT_REQUIRED', `Select a robot with ROBOT name before ${op}.`); continue; }
    steps.push({ kind: op, args, robot: activeRobot, line });
    if (welding && ['MOVEL', 'MOVEC'].includes(op)) weldMotionCount++;
  }
  if (welding) diagnostics.push(diagnostic(weldStartLine, 'WELD_UNCLOSED', 'End the weld path with WELD OFF.'));
  for (const step of steps) {
    const targets = step.kind === 'MOVEC' ? step.args : ['MOVEJ', 'MOVEL'].includes(step.kind) ? step.args : [];
    for (const name of targets) {
      if (step.kind === 'MOVEJ' ? !poses.has(name) && !joints.has(name) : !poses.has(name)) {
        diagnostics.push(diagnostic(step.line, 'UNKNOWN_TARGET', `${step.kind} target ${name} is not defined with ${step.kind === 'MOVEJ' ? 'POSE or JOINTS' : 'POSE'}.`));
      }
    }
  }
  diagnostics.sort((a, b) => a.line - b.line || a.column - b.column);
  return { poses, joints, steps, diagnostics, ok: diagnostics.length === 0 };
}
