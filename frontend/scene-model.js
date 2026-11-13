import {
  BoxGeometry, CylinderGeometry, DoubleSide, Euler, Group, Mesh,
  MeshStandardMaterial, Object3D, PlaneGeometry, Quaternion,
  SphereGeometry, Vector3,
} from 'three';

const zAxis = new Vector3(0, 0, 1);
const finitePose = values => Array.isArray(values) && values.length === 6 && values.every(Number.isFinite);
const modelFrame = name => typeof name === 'string' && /^model\/[^/]+(?:\/link\/[^/]+)?$/.test(name);
function normalizedMountPose(pose) {
  if (!pose || typeof pose !== 'object' || Array.isArray(pose) ||
      !Array.isArray(pose.position) || pose.position.length !== 3 || !pose.position.every(Number.isFinite) ||
      !Array.isArray(pose.quaternion) || pose.quaternion.length !== 4 || !pose.quaternion.every(Number.isFinite))
    throw new Error('Robot base mount needs finite position XYZ and quaternion xyzw arrays.');
  const length = Math.hypot(...pose.quaternion);
  if (!(length > 1e-12)) throw new Error('Robot base mount quaternion must be nonzero.');
  return { position: [...pose.position], quaternion: pose.quaternion.map(value => value / length) };
}

export function setSDFPose(object, pose) {
  if (!finitePose(pose)) throw new Error('SDF pose needs six finite values.');
  object.position.set(...pose.slice(0, 3));
  object.rotation.set(...pose.slice(3), 'ZYX');
  return object;
}

export function getSDFWorldPose(object) {
  object.updateWorldMatrix(true, false);
  const position = new Vector3(), rotation = new Quaternion(), scale = new Vector3();
  object.matrixWorld.decompose(position, rotation, scale);
  const euler = new Euler().setFromQuaternion(rotation, 'ZYX');
  return [...position.toArray(), euler.x, euler.y, euler.z];
}

function shapeGeometry(shape, meshGeometry) {
  switch (shape.type) {
    case 'box': return new BoxGeometry(...shape.size);
    case 'sphere': return new SphereGeometry(shape.radius, 24, 16);
    case 'cylinder': {
      const geometry = new CylinderGeometry(shape.radius, shape.radius, shape.length, 24);
      geometry.rotateX(Math.PI / 2); // Three.js cylinders are Y-up; SDF cylinders are Z-up.
      return geometry;
    }
    case 'plane': {
      const geometry = new PlaneGeometry(...shape.size);
      const normal = new Vector3(...shape.normal);
      if (normal.lengthSq() === 0) throw new Error('Plane normal cannot be zero.');
      geometry.applyQuaternion(new Quaternion().setFromUnitVectors(zAxis, normal.normalize()));
      return geometry;
    }
    case 'mesh': {
      if (!meshGeometry) throw new Error(`No local mesh resolver for ${shape.uri}.`);
      const geometry = meshGeometry(shape.uri);
      if (!geometry?.isBufferGeometry) throw new Error(`Local mesh ${shape.uri} is missing or invalid.`);
      return geometry;
    }
    default: throw new Error(`Unsupported visual geometry ${shape.type}.`);
  }
}

function makeVisual(entry, meshGeometry) {
  const shape = entry.geometry;
  const geometry = shapeGeometry(shape, meshGeometry);
  const material = new MeshStandardMaterial({ color: 0x94a6b8, roughness: 0.7, ...(shape.type === 'plane' ? { side: DoubleSide } : {}) });
  if (entry.color) { material.color.setRGB(...entry.color.slice(0, 3)); material.opacity = entry.color[3]; material.transparent = entry.color[3] < 1; }
  const mesh = new Mesh(geometry, material);
  mesh.name = entry.name || shape.type;
  mesh.userData.sceneModelOwnedGeometry = shape.type !== 'mesh';
  if (shape.type === 'mesh') mesh.scale.set(...shape.scale);
  setSDFPose(mesh, entry.pose);
  return mesh;
}

/**
 * One browser planning scene. This owns the environment layer and object
 * attachments; robot rendering remains owned by the caller. Frame names are
 * world, model/<name>, model/<name>/link/<name>, and
 * robot/<name>/link/<name>.
 */
export class SceneModel {
  constructor({ scene, meshGeometry } = {}) {
    if (!scene?.isScene && !scene?.isGroup) throw new Error('SceneModel needs a Three.js scene or group.');
    this.scene = scene;
    this.meshGeometry = meshGeometry;
    this.layer = new Group(); this.layer.name = 'SDF world'; scene.add(this.layer);
    this.models = new Map();
    this.robots = new Map();
    this.robotMounts = new Map();
    this.frames = new Map([['world', scene]]);
    this.attached = new Map();
    this.collisionEntries = [];
    this.world = { name: 'world', models: [] };
  }

  clear({ preserveRobotMounts = false } = {}) {
    for (const [name] of this.attached) this.release(name);
    // Mounted URDF roots must leave old SDF groups before those groups are
    // destroyed. loadWorld retains the local mount records for reapplication.
    this.scene.updateMatrixWorld(true);
    for (const [name, record] of this.robots) if (this.robotMounts.has(name)) this.scene.attach(record.root);
    if (!preserveRobotMounts) this.robotMounts.clear();
    this.layer.traverse(object => {
      if (!object.isMesh) return;
      object.material?.dispose();
      if (object.userData.sceneModelOwnedGeometry) object.geometry?.dispose();
    });
    this.layer.clear();
    this.models.clear(); this.collisionEntries = []; this.attached.clear();
    this.frames = new Map([['world', this.scene]]);
    for (const [name, record] of this.robots) this.registerRobotFrames(name, record);
    this.world = { name: 'world', models: [] };
  }

  registerRobotFrames(name, { root, links }) {
    this.frames.set(`robot/${name}`, root);
    for (const [linkName, object] of links) this.frames.set(`robot/${name}/link/${linkName}`, object);
  }

  addRobot(name, root, { links = new Map() } = {}) {
    if (!name || !root?.isObject3D || this.robots.has(name)) throw new Error(`Invalid or duplicate robot ${name}.`);
    const namedLinks = links instanceof Map ? links : new Map(Object.entries(links));
    const record = { root, links: namedLinks };
    this.robots.set(name, record);
    this.registerRobotFrames(name, record);
    return record;
  }

  removeRobot(name) {
    for (const [objectName, frame] of this.attached) if (frame === `robot/${name}` || frame.startsWith(`robot/${name}/`)) this.release(objectName);
    if (this.robots.has(name)) this.unmountRobotBase(name);
    this.robots.delete(name);
    for (const key of this.frames.keys()) if (key === `robot/${name}` || key.startsWith(`robot/${name}/`)) this.frames.delete(key);
  }

  getFrame(name) {
    const frame = this.frames.get(name);
    if (!frame) throw new Error(`Unknown scene frame ${name}.`);
    return frame;
  }

  getObject(name) {
    const object = this.models.get(name)?.group;
    if (!object) throw new Error(`Unknown scene object ${name}.`);
    return object;
  }

  /** Mount a URDF root below an SDF model frame with a rigid local offset. */
  mountRobotBase(robotName, frameName, { keepWorldPose = true, localPose = null } = {}) {
    const robot = this.robots.get(robotName);
    if (!robot) throw new Error(`Unknown robot ${robotName} for base mount.`);
    if (frameName === 'world') {
      if (localPose != null) throw new Error('World robot base does not use a mount-local pose.');
      return this.unmountRobotBase(robotName);
    }
    if (!modelFrame(frameName)) throw new Error('Robot base mount frame must name an SDF model or model link.');
    const parent = this.getFrame(frameName), root = robot.root;
    if (parent === root || root.getObjectById(parent.id)) throw new Error('Robot base mount would create a scene graph cycle.');
    const pose = localPose == null ? null : normalizedMountPose(localPose);
    if (pose == null && !keepWorldPose) throw new Error('Robot base mount needs keepWorldPose or an explicit localPose.');
    this.scene.updateMatrixWorld(true);
    const rootScale = root.getWorldScale(new Vector3()), parentScale = parent.getWorldScale(new Vector3());
    if ([...rootScale.toArray(), ...parentScale.toArray()].some(value => Math.abs(value - 1) > 1e-8))
      throw new Error('Robot base mount requires rigid unit-scale frames.');
    if (pose) {
      parent.add(root);
      root.position.set(...pose.position);
      root.quaternion.set(...pose.quaternion);
      root.scale.set(1, 1, 1);
    } else parent.attach(root);
    this.scene.updateMatrixWorld(true);
    const stored = normalizedMountPose({ position: root.position.toArray(), quaternion: root.quaternion.toArray() });
    const record = { robot: robotName, frame: frameName, localPose: stored };
    this.robotMounts.set(robotName, record);
    return structuredClone(record);
  }

  /** Reparent the robot into the world while retaining its current world pose. */
  unmountRobotBase(robotName) {
    const robot = this.robots.get(robotName);
    if (!robot) throw new Error(`Unknown robot ${robotName} for base mount.`);
    if (this.robotMounts.has(robotName)) {
      this.scene.updateMatrixWorld(true);
      this.scene.attach(robot.root);
      this.robotMounts.delete(robotName);
    }
    return null;
  }

  /** One active mount record; callers with multiple robots must name one. */
  robotMountRecord(robotName = null) {
    if (robotName == null && this.robotMounts.size > 1) throw new Error('Name the robot when multiple base mounts exist.');
    const record = robotName == null ? this.robotMounts.values().next().value : this.robotMounts.get(robotName);
    return record ? structuredClone(record) : null;
  }

  /** Returns diagnostics for assets that could not be rendered. */
  loadWorld(world) {
    if (!world?.name || !Array.isArray(world.models)) throw new Error('World name and models are required.');
    const names = new Set();
    for (const model of world.models) {
      if (!model.name || names.has(model.name) || !finitePose(model.pose) || !Array.isArray(model.links)) throw new Error(`Invalid or duplicate model ${model.name}.`);
      names.add(model.name);
      const linkNames = new Set();
      for (const link of model.links) {
        if (!link.name || linkNames.has(link.name) || !finitePose(link.pose) || !Array.isArray(link.visuals) || !Array.isArray(link.collisions)) throw new Error(`Invalid or duplicate link in ${model.name}.`);
        linkNames.add(link.name);
        for (const entry of [...link.visuals, ...link.collisions]) if (!entry.geometry || !finitePose(entry.pose)) throw new Error(`Invalid shape in ${model.name}/${link.name}.`);
      }
    }
    for (const mount of this.robotMounts.values()) {
      const frame = mount.frame.split('/');
      const model = world.models.find(item => item.name === frame[1]);
      if (!model || frame.length === 4 && !model.links.some(link => link.name === frame[3]))
        throw new Error(`Mounted robot ${mount.robot} needs frame ${mount.frame} in the replacement SDF world.`);
    }
    this.clear({ preserveRobotMounts: true });
    this.world = structuredClone(world);
    const diagnostics = [];
    for (const model of world.models) {
      if (!model.name || this.models.has(model.name)) throw new Error(`Invalid or duplicate model name ${model.name}.`);
      const modelGroup = setSDFPose(new Group(), model.pose);
      modelGroup.name = model.name;
      this.layer.add(modelGroup);
      this.models.set(model.name, { group: modelGroup, source: model });
      this.frames.set(`model/${model.name}`, modelGroup);
      for (const link of model.links) {
        const linkGroup = setSDFPose(new Group(), link.pose);
        linkGroup.name = link.name;
        modelGroup.add(linkGroup);
        this.frames.set(`model/${model.name}/link/${link.name}`, linkGroup);
        for (const visual of link.visuals) {
          if (!visual.geometry) continue;
          try { linkGroup.add(makeVisual(visual, this.meshGeometry)); }
          catch (error) { diagnostics.push({ severity: 'error', code: 'MISSING_VISUAL_ASSET', path: `model/${model.name}/link/${link.name}`, message: error.message }); }
        }
        for (const collision of link.collisions) {
          if (!collision.geometry) continue;
          const frame = setSDFPose(new Object3D(), collision.pose);
          frame.name = collision.name || 'collision';
          linkGroup.add(frame);
          this.collisionEntries.push({ model: model.name, link: link.name, geometry: collision.geometry, frame });
          if (collision.geometry.type === 'mesh') {
            try { shapeGeometry(collision.geometry, this.meshGeometry); }
            catch (error) { diagnostics.push({ severity: 'error', code: 'MISSING_COLLISION_ASSET', path: `model/${model.name}/link/${link.name}`, message: error.message }); }
          }
        }
      }
    }
    for (const mount of [...this.robotMounts.values()])
      this.mountRobotBase(mount.robot, mount.frame, { localPose: mount.localPose });
    return diagnostics;
  }

  /** Kinematic attach with the existing world transform as the default. */
  attach(objectName, frameName, { keepWorldPose = true } = {}) {
    const object = this.getObject(objectName), parent = this.getFrame(frameName);
    if (parent === object || object.getObjectById(parent.id)) throw new Error('Attachment would create a scene graph cycle.');
    this.scene.updateMatrixWorld(true);
    if (keepWorldPose) parent.attach(object); else parent.add(object);
    this.attached.set(objectName, frameName);
    return object;
  }

  release(objectName) {
    const object = this.getObject(objectName);
    if (!this.attached.has(objectName)) return object;
    this.scene.updateMatrixWorld(true);
    this.layer.attach(object);
    this.attached.delete(objectName);
    return object;
  }

  /** Snapshot current world poses for SDF export; attachments need project metadata. */
  snapshotWorld() {
    const snapshot = structuredClone(this.world);
    for (const model of snapshot.models) model.pose = getSDFWorldPose(this.getObject(model.name));
    return snapshot;
  }

  attachmentRecords() { return [...this.attached].map(([object, frame]) => ({ object, frame })); }
}
