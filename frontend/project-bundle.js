import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { normalizeKinematicConstraints } from './kinematic-constraints.js';

const MAX_ZIP_BYTES = 80 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 300 * 1024 * 1024;
const text = value => strToU8(value);
const safePath = path => typeof path === 'string' && path.length > 0 && !path.startsWith('/') && !path.includes('\\') && !path.includes(':') && !path.split('/').some(part => !part || part === '.' || part === '..');
const bytesOf = value => value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : null;
const validRobotState = state => state && !Array.isArray(state) && typeof state === 'object' &&
  Object.keys(state).sort().join(',') === 'jointNames,positions' &&
  Array.isArray(state.jointNames) && Array.isArray(state.positions) &&
  state.jointNames.length === state.positions.length &&
  state.jointNames.every(name => typeof name === 'string' && name.length > 0) &&
  new Set(state.jointNames).size === state.jointNames.length && state.positions.every(Number.isFinite);
function normalizeRobotMount(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      Object.keys(value).sort().join(',') !== 'frame,localPose,robot' ||
      typeof value.robot !== 'string' || !value.robot ||
      typeof value.frame !== 'string' || !/^model\/[^/]+(?:\/link\/[^/]+)?$/.test(value.frame) ||
      !value.localPose || Array.isArray(value.localPose) || typeof value.localPose !== 'object' ||
      Object.keys(value.localPose).sort().join(',') !== 'position,quaternion' ||
      !Array.isArray(value.localPose.position) || value.localPose.position.length !== 3 ||
      !value.localPose.position.every(Number.isFinite) ||
      !Array.isArray(value.localPose.quaternion) || value.localPose.quaternion.length !== 4 ||
      !value.localPose.quaternion.every(Number.isFinite)) throw new Error('Invalid robot base mount record.');
  const length = Math.hypot(...value.localPose.quaternion);
  if (!(length > 1e-12)) throw new Error('Invalid robot base mount quaternion.');
  return { robot: value.robot, frame: value.frame,
    localPose: { position: [...value.localPose.position],
      quaternion: value.localPose.quaternion.map(component => component / length) } };
}

// Read ZIP central-directory sizes before decompression. This avoids expanding
// an oversized user-provided archive merely to discover that it is too large.
function checkZipDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let offset = bytes.byteLength - 22; offset >= Math.max(0, bytes.byteLength - 65557); offset--) {
    if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  }
  if (end < 0) throw new Error('Invalid project ZIP directory.');
  const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
  if (count === 0xffff || size === 0xffffffff || start === 0xffffffff || start + size > end) throw new Error('ZIP64 or invalid project directory is unsupported.');
  const names = new Set(); let offset = start, expanded = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) throw new Error('Invalid project ZIP entry.');
    const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true), length = view.getUint16(offset + 28, true), extra = view.getUint16(offset + 30, true), comment = view.getUint16(offset + 32, true);
    const unpacked = view.getUint32(offset + 24, true), next = offset + 46 + length + extra + comment;
    if (next > end || flags & 1 || ![0, 8].includes(method) || unpacked === 0xffffffff) throw new Error('Unsupported or invalid project ZIP entry.');
    const name = strFromU8(bytes.subarray(offset + 46, offset + 46 + length));
    if (!safePath(name) || names.has(name)) throw new Error('Invalid or duplicate project ZIP path: ' + name);
    names.add(name); expanded += unpacked;
    if (expanded > MAX_EXPANDED_BYTES) throw new Error('Expanded project exceeds 300 MB.');
    offset = next;
  }
  if (offset !== start + size) throw new Error('Invalid project ZIP directory size.');
}

/** A portable, self-contained project; world.sdf remains an ordinary SDFormat file. */
export function packProject({ name = 'Workcell', worldSdf, robots = [], assets = [], includes = [], attachments = [], program = '', signalPrograms = '', motionLimits = {}, robotState = null, robotMount = null, kinematicConstraints = null }) {
  if (typeof worldSdf !== 'string' || !worldSdf.trim()) throw new Error('A nonempty world.sdf is required.');
  if (typeof program !== 'string') throw new Error('Program must be text.');
  if (typeof signalPrograms !== 'string') throw new Error('Signal programs must be text.');
  if (!Array.isArray(attachments) || !attachments.every(item => item && typeof item.object === 'string' && item.object.length && typeof item.frame === 'string' && /^(model|robot)\//.test(item.frame)) || new Set(attachments.map(item => item.object)).size !== attachments.length) throw new Error('Attachments need unique objects and model/ or robot/ frames.');
  const files = Object.create(null), manifest = { format: 'modelrobot-workcell', version: 1, name, world: 'world.sdf', program: 'program.mrl', motionLimits: 'motion-limits.json', attachments: 'attachments.json', robots: [], assets: [], includes: [] };
  files['world.sdf'] = text(worldSdf);
  files['program.mrl'] = text(program);
  if (signalPrograms) { manifest.signalPrograms = 'signal-programs.mrl'; files['signal-programs.mrl'] = text(signalPrograms); }
  files['motion-limits.json'] = text(JSON.stringify(motionLimits, null, 2) + '\n');
  files['attachments.json'] = text(JSON.stringify(attachments, null, 2) + '\n');
  if (robotState != null) {
    if (!validRobotState(robotState)) throw new Error('Robot state needs unique joint names and finite positions.');
    manifest.robotState = 'robot-state.json';
    files['robot-state.json'] = text(JSON.stringify(robotState, null, 2) + '\n');
  }
  if (robotMount != null) {
    const mount = normalizeRobotMount(robotMount);
    manifest.robotMount = 'robot-mount.json';
    files['robot-mount.json'] = text(JSON.stringify(mount, null, 2) + '\n');
  }
  if (kinematicConstraints != null) {
    const constraints = normalizeKinematicConstraints(kinematicConstraints);
    manifest.kinematicConstraints = 'kinematic-constraints.json';
    files['kinematic-constraints.json'] = text(JSON.stringify(constraints, null, 2) + '\n');
  }
  const occupied = new Set(Object.keys(files));
  for (const robot of robots) {
    if (typeof robot.name !== 'string' || !robot.name || typeof robot.urdf !== 'string' || !robot.urdf.trim()) throw new Error('Each robot needs a name and URDF text.');
    const path = robot.path || `robots/${robot.name}.urdf`;
    if (!safePath(path) || !path.startsWith('robots/') || !/\.urdf$/i.test(path) || occupied.has(path)) throw new Error('Invalid or duplicate URDF path: ' + path);
    occupied.add(path); files[path] = text(robot.urdf); manifest.robots.push({ name: robot.name, path });
  }
  if (robotMount && !robots.some(robot => robot.name === robotMount.robot))
    throw new Error(`Robot base mount names unavailable robot ${robotMount.robot}.`);
  if (kinematicConstraints && !robots.some(robot => robot.name === kinematicConstraints.mechanisms[0].robot))
    throw new Error(`Kinematic constraints name unavailable robot ${kinematicConstraints.mechanisms[0].robot}.`);
  for (const asset of assets) {
    if (!safePath(asset.name)) throw new Error('Invalid asset name: ' + asset.name);
    const bytes = bytesOf(asset.bytes);
    if (!bytes) throw new Error('Asset bytes must be Uint8Array or ArrayBuffer: ' + asset.name);
    const path = 'assets/' + asset.name;
    if (occupied.has(path)) throw new Error('Duplicate asset path: ' + asset.name);
    occupied.add(path); files[path] = bytes; manifest.assets.push({ name: asset.name, path });
  }
  for (const include of includes) {
    if (!safePath(include.name) || typeof include.text !== 'string') throw new Error('Invalid SDF include name or text: ' + include.name);
    const path = 'includes/' + include.name;
    if (occupied.has(path)) throw new Error('Duplicate SDF include path: ' + include.name);
    occupied.add(path); files[path] = text(include.text); manifest.includes.push({ name: include.name, path });
  }
  files['project.json'] = text(JSON.stringify(manifest, null, 2) + '\n');
  if (Object.values(files).reduce((sum, file) => sum + file.byteLength, 0) > MAX_EXPANDED_BYTES) throw new Error('Expanded project exceeds 300 MB.');
  const zip = zipSync(files, { level: 6 });
  if (zip.byteLength > MAX_ZIP_BYTES) throw new Error('Project ZIP exceeds 80 MB.');
  return zip;
}

export function unpackProject(input) {
  const bytes = bytesOf(input);
  if (!bytes || bytes.byteLength > MAX_ZIP_BYTES) throw new Error('Project ZIP must be at most 80 MB.');
  checkZipDirectory(bytes);
  const files = unzipSync(bytes);
  const total = Object.values(files).reduce((sum, file) => sum + file.byteLength, 0);
  if (total > MAX_EXPANDED_BYTES) throw new Error('Expanded project exceeds 300 MB.');
  if (!files['project.json']) throw new Error('Project ZIP has no project.json.');
  let manifest;
  try { manifest = JSON.parse(strFromU8(files['project.json'])); } catch (_) { throw new Error('Invalid project.json.'); }
  if (manifest.format !== 'modelrobot-workcell' || manifest.version !== 1) throw new Error('Unsupported project format or version.');
  if (manifest.world !== 'world.sdf' || manifest.program !== 'program.mrl' || manifest.motionLimits !== 'motion-limits.json' || (manifest.attachments != null && manifest.attachments !== 'attachments.json') || (manifest.robotState != null && manifest.robotState !== 'robot-state.json') || (manifest.robotMount != null && manifest.robotMount !== 'robot-mount.json') || (manifest.kinematicConstraints != null && manifest.kinematicConstraints !== 'kinematic-constraints.json') || (manifest.signalPrograms != null && manifest.signalPrograms !== 'signal-programs.mrl') || typeof manifest.name !== 'string') throw new Error('Invalid project manifest paths.');
  const read = path => {
    if (!safePath(path) || !files[path]) throw new Error('Project file is missing or invalid: ' + path);
    return files[path];
  };
  const worldSdf = strFromU8(read(manifest.world));
  const program = strFromU8(read(manifest.program));
  const signalPrograms = manifest.signalPrograms ? strFromU8(read(manifest.signalPrograms)) : '';
  let motionLimits;
  try { motionLimits = JSON.parse(strFromU8(read(manifest.motionLimits))); } catch (_) { throw new Error('Invalid motion-limits.json.'); }
  let attachments = [];
  if (manifest.attachments) {
    try { attachments = JSON.parse(strFromU8(read(manifest.attachments))); } catch (_) { throw new Error('Invalid attachments.json.'); }
    if (!Array.isArray(attachments) || !attachments.every(item => item && typeof item.object === 'string' && item.object.length && typeof item.frame === 'string' && /^(model|robot)\//.test(item.frame)) || new Set(attachments.map(item => item.object)).size !== attachments.length) throw new Error('Invalid attachments.json.');
  }
  let robotState = null;
  if (manifest.robotState) {
    try { robotState = JSON.parse(strFromU8(read(manifest.robotState))); }
    catch (_) { throw new Error('Invalid robot-state.json.'); }
    if (!validRobotState(robotState)) throw new Error('Invalid robot-state.json: unique joint names and finite positions are required.');
  }
  let robotMount = null;
  if (manifest.robotMount) {
    try { robotMount = normalizeRobotMount(JSON.parse(strFromU8(read(manifest.robotMount)))); }
    catch (_) { throw new Error('Invalid robot-mount.json.'); }
  }
  let kinematicConstraints = null;
  if (manifest.kinematicConstraints) {
    try { kinematicConstraints = normalizeKinematicConstraints(JSON.parse(strFromU8(read(manifest.kinematicConstraints)))); }
    catch (error) { throw new Error(`Invalid kinematic-constraints.json: ${error.message}`); }
  }
  if (!Array.isArray(manifest.robots) || !Array.isArray(manifest.assets) || !Array.isArray(manifest.includes)) throw new Error('Invalid project asset manifest.');
  const seen = new Set();
  const entry = (record, folder) => {
    if (!record || !safePath(record.name) || record.path !== `${folder}/${record.name}` || seen.has(record.path)) throw new Error('Invalid or duplicate project asset entry.');
    seen.add(record.path); return read(record.path);
  };
  const robots = manifest.robots.map(robot => {
    if (!robot || !safePath(robot.name) || !safePath(robot.path) || !robot.path.startsWith('robots/') || !/\.urdf$/i.test(robot.path) || seen.has(robot.path)) throw new Error('Invalid or duplicate robot entry.');
    seen.add(robot.path);
    return { name: robot.name, path: robot.path, urdf: strFromU8(read(robot.path)) };
  });
  if (robotMount && !robots.some(robot => robot.name === robotMount.robot))
    throw new Error(`Invalid robot-mount.json: robot ${robotMount.robot} is unavailable.`);
  if (kinematicConstraints && !robots.some(robot => robot.name === kinematicConstraints.mechanisms[0].robot))
    throw new Error(`Invalid kinematic-constraints.json: robot ${kinematicConstraints.mechanisms[0].robot} is unavailable.`);
  const assets = manifest.assets.map(asset => ({ name: asset.name, bytes: entry(asset, 'assets') }));
  const includes = manifest.includes.map(include => ({ name: include.name, text: strFromU8(entry(include, 'includes')) }));
  return { name: manifest.name, worldSdf, program, signalPrograms, motionLimits, robotState, robotMount, kinematicConstraints, attachments, robots, assets, includes, manifest };
}
