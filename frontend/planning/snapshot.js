import { BufferGeometry, Float32BufferAttribute, Matrix4 } from 'three';
import { parseURDFCollisionShapes } from './collision-scene.js';

const elements = matrix => [...matrix.elements];

function jointSnapshot(joint) {
  const get = key => joint.get?.(key);
  const limit = get('limit') ?? joint.attributes?.limit ?? {};
  const mimic = joint.mimic ?? get('mimic');
  return {
    name: joint.name ?? get('name'), parent: get('parent')?.link ?? joint.parent,
    child: get('child')?.link ?? joint.child, type: joint.type ?? get('type'),
    axis: joint.axis?.toArray?.() ?? [...(joint.axis ?? [1, 0, 0])],
    origin: elements(joint.basicMatrix ?? new Matrix4().fromArray(joint.origin)),
    lower: Number(joint.lower ?? limit.lower), upper: Number(joint.upper ?? limit.upper),
    theta: Number(joint.theta ?? 0),
    mimic: mimic ? { joint: mimic.joint, multiplier: Number(mimic.multiplier ?? 1), offset: Number(mimic.offset ?? 0) } : null,
    attributes: { limit: { velocity: limit.velocity == null ? null : Number(limit.velocity) } },
  };
}

function meshSnapshot(geometry) {
  if (!geometry?.isBufferGeometry || !geometry.getAttribute('position')) throw new Error('Collision mesh is unavailable for worker planning.');
  const attribute = geometry.getAttribute('position');
  const positions = new Float32Array(attribute.count * 3);
  for (let i = 0; i < attribute.count; i++) {
    positions[3 * i] = attribute.getX(i);
    positions[3 * i + 1] = attribute.getY(i);
    positions[3 * i + 2] = attribute.getZ(i);
  }
  const index = geometry.getIndex();
  return { positions, indices: index ? Uint32Array.from(index.array) : null };
}

/** Capture only planner data; live Three objects and robot joint models stay on the UI thread. */
export function snapshotProgramContext({ robotName, robotRoot, jointModels, robotXml, sceneModel,
  meshGeometry, robotCollisionShapes: providedRobotCollisionShapes, motionLimits = {}, planningOptions = {}, kinematicConstraints = null }) {
  if (!robotRoot || !sceneModel || !Array.isArray(jointModels)) throw new Error('Worker planning needs the loaded robot and workcell.');
  robotRoot.updateWorldMatrix(true, false);
  sceneModel.scene.updateMatrixWorld(true);
  const robotCollisionShapes = providedRobotCollisionShapes ?? parseURDFCollisionShapes(robotXml);
  const models = [...sceneModel.models].map(([name, entry]) => ({ name, world: elements(entry.group.matrixWorld) }));
  const frames = [...sceneModel.frames].filter(([name]) => name.startsWith('model/'))
    .map(([name, frame]) => ({ name, world: elements(frame.matrixWorld) }));
  const collisionEntries = sceneModel.collisionEntries.map(entry => ({
    model: entry.model, link: entry.link, geometry: entry.geometry, world: elements(entry.frame.matrixWorld),
  }));
  const attached = [...sceneModel.attached];
  const robotMount = sceneModel.robotMountRecord?.(robotName) ?? null;
  const uris = new Set([...robotCollisionShapes, ...collisionEntries]
    .filter(entry => entry.geometry.type === 'mesh').map(entry => entry.geometry.uri ?? entry.geometry.filename));
  const meshes = [...uris].map(uri => [uri, meshSnapshot(meshGeometry?.(uri) ?? sceneModel.meshGeometry?.(uri))]);
  return { robotName, worldFromBase: elements(robotRoot.matrixWorld), joints: jointModels.map(jointSnapshot),
    robotCollisionShapes, scene: { models, frames, collisionEntries, attached, robotMount, meshes },
    motionLimits, planningOptions, kinematicConstraints };
}

/** Rebuild the small scene interface consumed by collision preflight inside a Worker. */
export function restoreProgramContext(snapshot) {
  const world = values => new Matrix4().fromArray(values);
  const sceneModel = {
    scene: { updateMatrixWorld() {} },
    models: new Map(snapshot.scene.models.map(entry => [entry.name, { group: { matrixWorld: world(entry.world) } }])),
    frames: new Map(snapshot.scene.frames.map(entry => [entry.name, { matrixWorld: world(entry.world) }])),
    collisionEntries: snapshot.scene.collisionEntries.map(entry => ({
      model: entry.model, link: entry.link, geometry: entry.geometry, frame: { matrixWorld: world(entry.world) },
    })),
    attached: new Map(snapshot.scene.attached),
    robotMountRecord(name) {
      const record = snapshot.scene.robotMount ?? null;
      return record && (!name || name === record.robot) ? structuredClone(record) : null;
    },
    getFrame(name) {
      if (name.startsWith(`robot/${snapshot.robotName}/link/`) && snapshot.joints.some(joint => joint.child === name.split('/').at(-1) || joint.parent === name.split('/').at(-1))) return true;
      throw new Error(`Unknown robot frame ${name}.`);
    },
  };
  const meshes = new Map(snapshot.scene.meshes.map(([uri, item]) => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(item.positions, 3));
    if (item.indices) geometry.setIndex([...item.indices]);
    return [uri, geometry];
  }));
  const robotRoot = { matrixWorld: world(snapshot.worldFromBase), updateWorldMatrix() {} };
  return { robotName: snapshot.robotName, robotRoot, jointModels: snapshot.joints,
    robotCollisionShapes: snapshot.robotCollisionShapes, sceneModel,
    meshGeometry: uri => meshes.get(uri), motionLimits: snapshot.motionLimits,
    planningOptions: snapshot.planningOptions, kinematicConstraints: snapshot.kinematicConstraints ?? null,
    dispose: () => { for (const geometry of meshes.values()) geometry.dispose(); } };
}
