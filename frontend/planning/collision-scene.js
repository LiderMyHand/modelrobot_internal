import {
  Box3, BoxGeometry, CylinderGeometry, DoubleSide, Euler, Matrix4, PlaneGeometry,
  Quaternion, Ray, SphereGeometry, Vector3,
} from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { MeshBVH } from 'three-mesh-bvh';

const IDENTITY = new Matrix4();
const AXIS = new Vector3(0.923, 0.517, 0.377).normalize();
const CONTACT_EPS = 1e-6; // Treat exact support contact as contact, not penetration.
const numberList = (value, count, label) => {
  const numbers = Array.isArray(value) ? value.map(Number) : String(value ?? '').trim().split(/\s+/).map(Number);
  if (numbers.length !== count || !numbers.every(Number.isFinite)) throw new Error(`${label} needs ${count} finite numbers.`);
  return numbers;
};
const matrix = value => value?.isMatrix4 ? value.clone() : new Matrix4().fromArray(value ?? IDENTITY.elements);
const poseMatrix = (xyz = [0, 0, 0], rpy = [0, 0, 0]) => new Matrix4()
  .makeRotationFromEuler(new Euler(...rpy, 'ZYX')).setPosition(...xyz);
const sdfPoseMatrix = pose => poseMatrix(pose.slice(0, 3), pose.slice(3));
const positive = (value, label) => { if (!(Number.isFinite(value) && value > 0)) throw new Error(`${label} must be positive.`); return value; };
const contactSize = value => Math.max(value - CONTACT_EPS, value * 0.5);

/** Parse only explicit URDF collision shapes. Unsupported or missing shapes fail closed. */
export function parseURDFCollisionShapes(xml) {
  if (typeof DOMParser === 'undefined') throw new Error('URDF collision parsing needs a DOMParser on the browser side.');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  if (document.querySelector('parsererror') || document.documentElement?.tagName !== 'robot') throw new Error('Invalid URDF XML.');
  const shapes = [];
  for (const link of document.querySelectorAll('robot > link')) {
    const linkName = link.getAttribute('name');
    const collisions = [...link.querySelectorAll(':scope > collision')];
    if (!collisions.length && link.querySelector(':scope > visual')) throw new Error(
      `Planning collision geometry missing for robot ${document.documentElement.getAttribute('name') || 'unnamed'}, visible link ${linkName}. Add a <collision> shape to that URDF link.`);
    for (const collision of collisions) {
      const origin = collision.querySelector(':scope > origin');
      const xyz = origin?.getAttribute('xyz') ? numberList(origin.getAttribute('xyz'), 3, 'URDF collision xyz') : [0, 0, 0];
      const rpy = origin?.getAttribute('rpy') ? numberList(origin.getAttribute('rpy'), 3, 'URDF collision rpy') : [0, 0, 0];
      const geometry = collision.querySelector(':scope > geometry')?.firstElementChild;
      if (!geometry) throw new Error(`Missing collision geometry on ${linkName}.`);
      let shape;
      if (geometry.tagName === 'box') shape = { type: 'box', size: numberList(geometry.getAttribute('size'), 3, 'URDF box size') };
      else if (geometry.tagName === 'sphere') shape = { type: 'sphere', radius: Number(geometry.getAttribute('radius')) };
      else if (geometry.tagName === 'cylinder') shape = { type: 'cylinder', radius: Number(geometry.getAttribute('radius')), length: Number(geometry.getAttribute('length')) };
      else if (geometry.tagName === 'mesh') shape = { type: 'mesh', uri: geometry.getAttribute('filename'),
        scale: geometry.getAttribute('scale') ? numberList(geometry.getAttribute('scale'), 3, 'URDF mesh scale') : [1, 1, 1] };
      else throw new Error(`Unsupported collision geometry ${geometry.tagName} on ${linkName}.`);
      shapes.push({ link: linkName, geometry: shape, origin: poseMatrix(xyz, rpy).elements.slice() });
    }
  }
  if (!shapes.length) throw new Error('Robot has no explicit URDF collision geometry.');
  return shapes;
}

function geometryFor(shape, meshGeometry) {
  let geometry;
  switch (shape.type) {
    case 'box': geometry = new BoxGeometry(...numberList(shape.size, 3, 'Box size').map(value => contactSize(positive(value, 'Box size')))); break;
    case 'sphere': geometry = new SphereGeometry(contactSize(positive(Number(shape.radius), 'Sphere radius')), 32, 24); break;
    case 'cylinder':
      geometry = new CylinderGeometry(contactSize(positive(Number(shape.radius), 'Cylinder radius')),
        contactSize(Number(shape.radius)), contactSize(positive(Number(shape.length), 'Cylinder length')), 48);
      geometry.rotateX(Math.PI / 2); break;
    case 'plane': {
      geometry = new PlaneGeometry(...numberList(shape.size, 2, 'Plane size').map(value => positive(value, 'Plane size')));
      const normal = new Vector3(...numberList(shape.normal, 3, 'Plane normal'));
      if (normal.lengthSq() < 1e-20) throw new Error('Plane normal is zero.');
      geometry.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal.normalize()));
      break;
    }
    case 'mesh': {
      const uri = shape.uri ?? shape.filename;
      const source = meshGeometry?.(uri);
      if (!source?.isBufferGeometry) throw new Error(`Missing local collision mesh ${uri}.`);
      geometry = source.clone();
      const scale = numberList(shape.scale ?? [1, 1, 1], 3, 'Collision mesh scale');
      if (scale.some(value => value === 0)) throw new Error('Collision mesh scale cannot be zero.');
      geometry.scale(...scale);
      geometry.computeBoundingBox();
      const center = geometry.boundingBox.getCenter(new Vector3()), extent = geometry.boundingBox.getSize(new Vector3());
      // A tiny inward tolerance distinguishes support contact from penetration
      // for locally supplied triangle meshes, without modifying the cached STL.
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(...extent.toArray().map(value => value > CONTACT_EPS ? 1 - CONTACT_EPS / value : 1));
      geometry.translate(center.x, center.y, center.z);
      break;
    }
    default: throw new Error(`Unsupported collision geometry ${shape.type}.`);
  }
  geometry.computeBoundingBox();
  if (!geometry.getAttribute('position')?.count || geometry.boundingBox.isEmpty()) throw new Error('Collision geometry has no triangles.');
  return geometry;
}

function shapeRecord(owner, shape, source, meshGeometry) {
  const geometry = geometryFor(shape, meshGeometry);
  return { owner, shape, source, geometry, bvh: new MeshBVH(geometry), localBox: geometry.boundingBox.clone(),
    world: new Matrix4(), worldBox: new Box3(), worldOBB: new OBB() };
}

function currentJoint(joint) {
  const get = key => joint.get?.(key);
  const type = joint.type ?? get('type');
  const axis = joint.axis?.toArray?.() ?? joint.axis ?? [1, 0, 0];
  const origin = joint.basicMatrix?.elements ?? joint.origin ?? IDENTITY.elements;
  const mimic = joint.mimic ?? get('mimic');
  return { name: joint.name ?? get('name'), parent: get('parent')?.link ?? joint.parent, child: get('child')?.link ?? joint.child,
    type, axis: numberList(axis, 3, 'Joint axis'), origin: [...origin], initial: Number(joint.theta ?? 0),
    mimic: mimic ? { joint: mimic.joint, multiplier: Number(mimic.multiplier ?? 1), offset: Number(mimic.offset ?? 0) } : null };
}

function fixedAndAdjacent(joints) {
  const parent = new Map();
  const root = name => {
    if (!parent.has(name)) parent.set(name, name);
    if (parent.get(name) !== name) parent.set(name, root(parent.get(name)));
    return parent.get(name);
  };
  for (const joint of joints) if (joint.type === 'fixed') parent.set(root(joint.child), root(joint.parent));
  const adjacent = new Set();
  for (const joint of joints) {
    const a = root(joint.parent), b = root(joint.child);
    if (a !== b) adjacent.add([a, b].sort().join('\0'));
  }
  return (a, b) => {
    const ra = root(a), rb = root(b);
    return ra === rb || adjacent.has([ra, rb].sort().join('\0'));
  };
}

function inside(shape, record, worldPoint) {
  if (shape.type === 'plane') return false;
  const p = worldPoint.clone().applyMatrix4(record.world.clone().invert());
  if (shape.type === 'box') return numberList(shape.size, 3, 'Box size').every((length, axis) => Math.abs(p.getComponent(axis)) < length / 2 - 1e-8);
  if (shape.type === 'sphere') return p.lengthSq() < shape.radius ** 2 - 1e-8;
  if (shape.type === 'cylinder') return p.x * p.x + p.y * p.y < shape.radius ** 2 - 1e-8 && Math.abs(p.z) < shape.length / 2 - 1e-8;
  const hits = record.bvh.raycast(new Ray(p, AXIS), DoubleSide).filter(hit => hit.distance > 1e-8);
  let distinct = 0, last = -Infinity;
  for (const hit of hits.sort((a, b) => a.distance - b.distance)) if (hit.distance - last > 1e-7) { distinct++; last = hit.distance; }
  return distinct % 2 === 1;
}

function sphereBox(sphere, box) {
  const center = new Vector3().setFromMatrixPosition(sphere.world).applyMatrix4(box.world.clone().invert());
  const size = numberList(box.shape.size, 3, 'Box size');
  const dx = Math.max(0, Math.abs(center.x) - size[0] / 2), dy = Math.max(0, Math.abs(center.y) - size[1] / 2), dz = Math.max(0, Math.abs(center.z) - size[2] / 2);
  return dx * dx + dy * dy + dz * dz < Math.max(0, sphere.shape.radius - CONTACT_EPS) ** 2;
}

function planePenetration(plane, other) {
  const normal = new Vector3(...numberList(plane.shape.normal, 3, 'Plane normal')).normalize();
  const planeFrame = plane.world.clone().multiply(new Matrix4().makeRotationFromQuaternion(
    new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal)));
  const inverse = planeFrame.invert(), half = numberList(plane.shape.size, 2, 'Plane size').map(value => value / 2);
  let minZ = Infinity, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const box = other.worldBox;
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const point = new Vector3(x, y, z).applyMatrix4(inverse);
    minZ = Math.min(minZ, point.z); minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
  }
  return minZ < -CONTACT_EPS && minX < half[0] && maxX > -half[0] && minY < half[1] && maxY > -half[1];
}

function intersects(a, b) {
  if (a.shape.type === 'plane') return planePenetration(a, b);
  if (b.shape.type === 'plane') return planePenetration(b, a);
  if (!a.worldBox.intersectsBox(b.worldBox)) return false;
  if (a.shape.type === 'box' && b.shape.type === 'box') return a.worldOBB.intersectsOBB(b.worldOBB, 1e-10);
  if (a.shape.type === 'sphere' && b.shape.type === 'sphere') {
    const x = new Vector3().setFromMatrixPosition(a.world), y = new Vector3().setFromMatrixPosition(b.world);
    return x.distanceToSquared(y) < Math.max(0, a.shape.radius + b.shape.radius - CONTACT_EPS) ** 2;
  }
  if (a.shape.type === 'sphere' && b.shape.type === 'box') return sphereBox(a, b);
  if (b.shape.type === 'sphere' && a.shape.type === 'box') return sphereBox(b, a);
  const fromAtoB = a.world.clone().invert().multiply(b.world);
  if (a.bvh.intersectsGeometry(b.geometry, fromAtoB)) return true;
  const centerA = a.localBox.getCenter(new Vector3()).applyMatrix4(a.world);
  const centerB = b.localBox.getCenter(new Vector3()).applyMatrix4(b.world);
  return inside(a.shape, a, centerB) || inside(b.shape, b, centerA);
}

function setWorld(record, world) {
  record.world.copy(world);
  record.worldBox.copy(record.localBox).applyMatrix4(record.world);
  record.worldOBB.fromBox3(record.localBox).applyMatrix4(record.world);
  record.worldOBB.center.copy(record.localBox.getCenter(new Vector3())).applyMatrix4(record.world);
  if (record.shape.type === 'box') {
    record.worldOBB.halfSize.set(
      Math.max(0, record.worldOBB.halfSize.x - CONTACT_EPS / 2),
      Math.max(0, record.worldOBB.halfSize.y - CONTACT_EPS / 2),
      Math.max(0, record.worldOBB.halfSize.z - CONTACT_EPS / 2),
    );
  }
}

function distanceToShape(record, worldPoint, surface = false) {
  const local = worldPoint.clone().applyMatrix4(record.world.clone().invert());
  const shape = record.shape;
  if (shape.type === 'box') {
    const half = shape.size.map(value => value / 2);
    const offsets = half.map((value, index) => Math.abs(local.getComponent(index)) - value);
    return surface && offsets.every(value => value <= 0) ? -Math.max(...offsets) : Math.hypot(...offsets.map(value => Math.max(0, value)));
  }
  if (shape.type === 'sphere') return surface ? Math.abs(local.length() - shape.radius) : Math.max(0, local.length() - shape.radius);
  if (shape.type === 'cylinder') {
    const radial = Math.hypot(local.x, local.y) - shape.radius, axial = Math.abs(local.z) - shape.length / 2;
    return surface && radial <= 0 && axial <= 0 ? -Math.max(radial, axial) : Math.hypot(Math.max(0, radial), Math.max(0, axial));
  }
  const closest = record.bvh.closestPointToPoint(local);
  if (!closest?.point) throw new Error(`Collision geometry ${record.owner} has no nearest point.`);
  return worldPoint.distanceTo(closest.point.clone().applyMatrix4(record.world));
}

/** Detached, synchronous planning collision scene. It never mutates the live viewer. */
export function createPlanningCollisionScene({ robotName, robotModel, allJoints, robotCollisionShapes, sceneModel, meshGeometry,
  allowedCollisionPairs = [] }) {
  if (!robotModel || !Array.isArray(allJoints) || !Array.isArray(robotCollisionShapes) || !robotCollisionShapes.length) throw new Error('Planning collision scene needs the robot model, all joints, and explicit URDF collision shapes.');
  if (!sceneModel) throw new Error('Planning collision scene needs a loaded SceneModel.');
  const joints = allJoints.map(currentJoint);
  const excludes = fixedAndAdjacent(joints);
  const declaredPairs = new Set(allowedCollisionPairs.map(pair => {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(name => typeof name !== 'string' || !name) || pair[0] === pair[1])
      throw new Error('Allowed collision pairs need two distinct link names.');
    return [...pair].sort().join('\0');
  }));
  const excluded = (a, b) => excludes(a, b) || declaredPairs.has([a, b].sort().join('\0'));
  const fixedBaseLinks = new Set([robotModel.baseLink]);
  let fixedExpanded = true;
  while (fixedExpanded) {
    fixedExpanded = false;
    for (const joint of joints) if (joint.type === 'fixed') {
      if (fixedBaseLinks.has(joint.parent) && !fixedBaseLinks.has(joint.child)) {
        fixedBaseLinks.add(joint.child); fixedExpanded = true;
      }
      if (fixedBaseLinks.has(joint.child) && !fixedBaseLinks.has(joint.parent)) {
        fixedBaseLinks.add(joint.parent); fixedExpanded = true;
      }
    }
  }
  const mountedCarrier = sceneModel.robotMountRecord?.(robotName)?.frame.split('/')[1] ?? null;
  const robotShapes = robotCollisionShapes.map((entry, index) => ({ ...shapeRecord(`robot:${entry.link}:${index}`, entry.geometry, { kind: 'robot', link: entry.link, origin: matrix(entry.origin) }, meshGeometry), link: entry.link }));
  meshGeometry ??= sceneModel.meshGeometry;
  sceneModel.scene.updateMatrixWorld(true);
  const objects = new Map();
  for (const [name, entry] of sceneModel.models) objects.set(name, { name, fixedWorld: entry.group.matrixWorld.clone(), attachment: null, shapes: [] });
  const modelFrames = new Map();
  for (const [frameName, frameObject] of sceneModel.frames) {
    if (!frameName.startsWith('model/')) continue;
    const name = frameName.split('/')[1], object = objects.get(name);
    if (object) modelFrames.set(frameName, { name, local: object.fixedWorld.clone().invert().multiply(frameObject.matrixWorld) });
  }
  for (const [index, entry] of sceneModel.collisionEntries.entries()) {
    const object = objects.get(entry.model);
    if (!object) throw new Error(`Unknown scene collision model ${entry.model}.`);
    const local = object.fixedWorld.clone().invert().multiply(entry.frame.matrixWorld);
    object.shapes.push(shapeRecord(`scene:${entry.model}:${index}`, entry.geometry, { kind: 'scene', model: entry.model, local }, meshGeometry));
  }
  const sceneShapes = [...objects.values()].flatMap(object => object.shapes);
  const active = new Map(robotModel.jointNames.map((name, index) => [name, index]));
  const byName = new Map(joints.map(joint => [joint.name, joint]));
  const valuesFor = q => {
    if (!Array.isArray(q) || q.length !== robotModel.active.length || !q.every(Number.isFinite)) throw new Error('Collision query needs one finite value per active joint.');
    const cache = new Map(), seen = new Set();
    const value = joint => {
      if (cache.has(joint.name)) return cache.get(joint.name);
      if (seen.has(joint.name)) throw new Error('Mimic joint cycle in collision scene.');
      seen.add(joint.name);
      const result = joint.mimic ? value(byName.get(joint.mimic.joint)) * joint.mimic.multiplier + joint.mimic.offset
        : active.has(joint.name) ? q[active.get(joint.name)] : joint.initial;
      if (!Number.isFinite(result)) throw new Error(`Invalid joint position ${joint.name}.`);
      cache.set(joint.name, result); seen.delete(joint.name); return result;
    };
    return new Map(joints.map(joint => [joint.name, value(joint)]));
  };
  const linkTransforms = q => {
    const values = valuesFor(q);
    const transforms = new Map([[robotModel.baseLink, matrix(robotModel.worldFromBase)]]);
    let remaining = [...joints];
    while (remaining.length) {
      const next = [];
      let progressed = false;
      for (const joint of remaining) {
        const parent = transforms.get(joint.parent);
        if (!parent) { next.push(joint); continue; }
        const transform = parent.clone().multiply(matrix(joint.origin));
        const amount = values.get(joint.name);
        if (joint.type === 'prismatic') transform.multiply(new Matrix4().makeTranslation(...joint.axis.map(value => value * amount)));
        else if (joint.type === 'revolute' || joint.type === 'continuous') transform.multiply(new Matrix4().makeRotationAxis(new Vector3(...joint.axis).normalize(), amount));
        else if (joint.type !== 'fixed') throw new Error(`Unsupported collision joint ${joint.type}.`);
        transforms.set(joint.child, transform); progressed = true;
      }
      if (!progressed) throw new Error('Robot collision joints do not form a tree rooted at the IK base.');
      remaining = next;
    }
    return transforms;
  };
  const frameWorld = (name, q, transforms, visiting = new Set()) => {
    if (name === 'world') return IDENTITY;
    if (name === 'tool') {
      const tip = transforms.get(robotModel.tipLink);
      if (!tip) throw new Error(`Missing tip link ${robotModel.tipLink}.`);
      return tip.clone().multiply(matrix(robotModel.toolTransform));
    }
    const prefix = `robot/${robotName}/link/`;
    if (name === `robot/${robotName}`) return matrix(robotModel.worldFromBase);
    if (name.startsWith(prefix)) {
      const transform = transforms.get(name.slice(prefix.length));
      if (!transform) throw new Error(`Unknown robot attachment link ${name}.`);
      return transform;
    }
    const record = modelFrames.get(name);
    if (!record) throw new Error(`Unknown planning attachment frame ${name}.`);
    return modelWorld(objects.get(record.name), q, transforms, visiting).clone().multiply(record.local);
  };
  const modelWorld = (object, q, transforms, visiting = new Set()) => {
    if (!object.attachment) return object.fixedWorld;
    if (visiting.has(object.name)) throw new Error(`Model attachment cycle at ${object.name}.`);
    visiting.add(object.name);
    try { return frameWorld(object.attachment.frame, q, transforms, visiting).clone().multiply(object.attachment.local); }
    finally { visiting.delete(object.name); }
  };
  const getFrameWorld = (name, q) => {
    if (name === 'world') return new Matrix4();
    const transforms = linkTransforms(q);
    if (name === 'tool' || name.startsWith(`robot/${robotName}`)) return frameWorld(name, q, transforms).clone();
    return frameWorld(name, q, transforms).clone();
  };
  const update = q => {
    const transforms = linkTransforms(q);
    for (const record of robotShapes) {
      const link = transforms.get(record.link);
      if (!link) throw new Error(`Collision shape refers to missing robot link ${record.link}.`);
      setWorld(record, link.clone().multiply(record.source.origin));
    }
    for (const object of objects.values()) {
      const world = modelWorld(object, q, transforms);
      for (const record of object.shapes) setWorld(record, world.clone().multiply(record.source.local));
    }
    return transforms;
  };
  const parentObject = object => {
    const record = object.attachment && modelFrames.get(object.attachment.frame);
    return record ? objects.get(record.name) : null;
  };
  const assemblyRoot = object => {
    const seen = new Set();
    while (parentObject(object)) {
      if (seen.has(object.name)) throw new Error(`Model attachment cycle at ${object.name}.`);
      seen.add(object.name);
      object = parentObject(object);
    }
    return object;
  };
  const attachedLink = object => {
    const frame = object.attachment?.frame;
    if (frame === 'tool') return robotModel.tipLink;
    if (frame?.startsWith(`robot/${robotName}/link/`)) return frame.slice(`robot/${robotName}/link/`.length);
    const parent = parentObject(object);
    return parent ? attachedLink(parent) : null;
  };
  let lastCollision = null;
  const isStateValid = q => {
    lastCollision = null;
    update(q);
    for (let i = 0; i < robotShapes.length; i++) for (let j = i + 1; j < robotShapes.length; j++) {
      if (!excluded(robotShapes[i].link, robotShapes[j].link) && intersects(robotShapes[i], robotShapes[j])) {
        lastCollision = [robotShapes[i].link, robotShapes[j].link]; return false;
      }
    }
    for (const robot of robotShapes) for (const object of objects.values()) for (const scene of object.shapes) {
      // The fixed robot base and its declared SDF carrier form one rigid
      // mounting assembly. Other moving links still collide with the carrier.
      if (object.name === mountedCarrier && fixedBaseLinks.has(robot.link)) continue;
      const carrier = attachedLink(object);
      if (carrier && excludes(robot.link, carrier)) continue;
      if (intersects(robot, scene)) { lastCollision = [robot.link, object.name]; return false; }
    }
    for (let i = 0; i < sceneShapes.length; i++) for (let j = i + 1; j < sceneShapes.length; j++) {
      const a = objects.get(sceneShapes[i].source.model), b = objects.get(sceneShapes[j].source.model);
      // The loaded world may contain static objects in contact. Only a carried
      // object can change their separation during this robot's motion.
      if ((a.attachment || b.attachment) && a !== b && assemblyRoot(a) !== assemblyRoot(b)
        && intersects(sceneShapes[i], sceneShapes[j])) { lastCollision = [a.name, b.name]; return false; }
    }
    return true;
  };
  const attach = (objectName, frame, q) => {
    const object = objects.get(objectName);
    if (!object) throw new Error(`Unknown attachable object ${objectName}.`);
    const parentFrame = modelFrames.get(frame);
    const targetObject = parentFrame ? objects.get(parentFrame.name) : null;
    const targetFollowsRobot = frame === 'tool' || frame === `robot/${robotName}` ||
      frame.startsWith(`robot/${robotName}/link/`) || (targetObject && attachedLink(targetObject) != null);
    if (mountedCarrier && targetFollowsRobot) {
      let ancestor = objects.get(mountedCarrier);
      while (ancestor) {
        if (ancestor === object) throw new Error(`Model attachment cycle: ${objectName} carries the mounted robot base.`);
        ancestor = parentObject(ancestor);
      }
    }
    if (parentFrame) {
      let parent = objects.get(parentFrame.name);
      const seen = new Set();
      while (parent) {
        if (parent === object) throw new Error(`Model attachment cycle: ${objectName} cannot join ${frame}.`);
        if (seen.has(parent.name)) throw new Error(`Model attachment cycle at ${parent.name}.`);
        seen.add(parent.name);
        parent = parentObject(parent);
      }
    }
    const transforms = linkTransforms(q);
    const world = modelWorld(object, q, transforms);
    object.attachment = { frame, local: frameWorld(frame, q, transforms).clone().invert().multiply(world) };
  };
  const release = (objectName, q) => {
    const object = objects.get(objectName);
    if (!object) throw new Error(`Unknown attachable object ${objectName}.`);
    if (!object.attachment) return;
    object.fixedWorld = modelWorld(object, q, linkTransforms(q)).clone();
    object.attachment = null;
  };
  const objectDistance = (objectName, worldPoint, q, surface) => {
    const object = objects.get(objectName);
    if (!object) throw new Error(`Unknown scene object ${objectName}.`);
    if (!object.shapes.length) throw new Error(`Scene object ${objectName} has no collision geometry for grasp proximity.`);
    const point = worldPoint?.isVector3 ? worldPoint : new Vector3(...worldPoint);
    if (![point.x, point.y, point.z].every(Number.isFinite)) throw new Error('Grasp position must be finite.');
    update(q);
    return Math.min(...object.shapes.map(record => distanceToShape(record, point, surface)));
  };
  for (const [name, frame] of sceneModel.attached) if (objects.has(name)) attach(name, frame, robotModel.initial);
  return { isStateValid, attach, release, get lastCollision() { return lastCollision ? [...lastCollision] : null; },
    distanceToObject: (name, point, q) => objectDistance(name, point, q, false),
    distanceToObjectSurface: (name, point, q) => objectDistance(name, point, q, true),
    linkTransforms, getFrameWorld,
    getObjectWorld: (name, q) => {
      const object = objects.get(name);
      if (!object) throw new Error(`Unknown scene object ${name}.`);
      return modelWorld(object, q, linkTransforms(q)).clone();
    },
    snapshot: () => [...objects].map(([name, object]) => ({ name, attachment: object.attachment?.frame ?? null })),
    dispose: () => [...robotShapes, ...sceneShapes].forEach(record => record.geometry.dispose()) };
}

/**
 * Check simultaneous world-axis translations of detached SDF models without
 * changing the viewer. Shapes nested under a moved model, including a mounted
 * robot and joined model descendants, inherit that model's translation.
 */
export function createSceneDeviceCollisionQuery({ sceneModel, robotName, robotCollisionShapes = [], meshGeometry } = {}) {
  if (!sceneModel?.models || !sceneModel?.collisionEntries || !sceneModel?.attached)
    throw new Error('Device collision query needs a loaded SceneModel.');
  if (robotName != null && (!sceneModel.robots?.get(robotName) || !Array.isArray(robotCollisionShapes)))
    throw new Error(`Device collision query needs registered robot ${robotName} and its collision shapes.`);
  sceneModel.scene.updateMatrixWorld(true);
  meshGeometry ??= sceneModel.meshGeometry;
  const roots = new Map([...sceneModel.models].map(([name, entry]) => [name, entry.group]));
  const robot = robotName == null ? null : sceneModel.robots.get(robotName);
  const candidates = [];
  for (const [index, entry] of sceneModel.collisionEntries.entries()) {
    const record = shapeRecord(`scene:${entry.model}:${index}`, entry.geometry,
      { kind: 'scene', model: entry.model, link: entry.link }, meshGeometry);
    candidates.push({ record, source: entry.frame, base: entry.frame.matrixWorld.clone(),
      label: `model/${entry.model}/link/${entry.link}` });
  }
  if (robot) for (const [index, entry] of robotCollisionShapes.entries()) {
    const link = robot.links.get(entry.link);
    if (!link) throw new Error(`Robot collision shape refers to unknown link ${entry.link}.`);
    const record = shapeRecord(`robot:${entry.link}:${index}`, entry.geometry,
      { kind: 'robot', link: entry.link }, meshGeometry);
    candidates.push({ record, source: link, base: link.matrixWorld.clone().multiply(matrix(entry.origin)),
      label: `robot/${robotName}/link/${entry.link}` });
  }
  const descendantsOf = (object, root) => {
    for (let current = object; current; current = current.parent) if (current === root) return true;
    return false;
  };
  const coordinates = (value, label) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must map model names to world XYZ arrays.`);
    return new Map(Object.entries(value).map(([name, xyz]) => {
      if (!Array.isArray(xyz) || xyz.length !== 3 || !xyz.every(Number.isFinite))
        throw new Error(`${label} for ${name} needs three finite world coordinates.`);
      return [name, new Vector3(...xyz)];
    }));
  };
  const dispose = () => candidates.forEach(item => item.record.geometry.dispose());
  const checkSweep = (fromDevices, toDevices, { translationStep = 0.005, maxSamples = 2000 } = {}) => {
    if (!(Number.isFinite(translationStep) && translationStep > 0) ||
        !Number.isSafeInteger(maxSamples) || maxSamples < 1)
      throw new Error('Device sweep needs a positive translationStep and positive safe maxSamples.');
    const from = coordinates(fromDevices, 'Device sweep start'), to = coordinates(toDevices, 'Device sweep end');
    if (from.size !== to.size || [...from.keys()].some(name => !to.has(name)))
      throw new Error('Device sweep start and end must name the same models.');
    const moved = new Map();
    for (const [name, start] of from) {
      const delta = to.get(name).clone().sub(start);
      // A former device may have been GRABbed by a completed robot run.
      // Unchanged scheduler coordinates are then stale bookkeeping, while its
      // current collision shapes still belong in the stationary scene.
      if (delta.lengthSq() <= 1e-20) continue;
      const entry = sceneModel.models.get(name), group = roots.get(name);
      if (!entry || entry.source?.static !== false || sceneModel.attached.has(name))
        throw new Error(`Device ${name} must be a detached, nonstatic SDF model.`);
      const actual = new Vector3().setFromMatrixPosition(group.matrixWorld);
      if (actual.distanceTo(start) > 1e-7)
        throw new Error(`Device ${name} start position differs from the current scene.`);
      moved.set(name, { root: group, delta });
    }
    if (!moved.size) return { status: 'clear', samples: 0 };
    const shapes = candidates.map(item => {
      const motions = [...moved].filter(([, motion]) => descendantsOf(item.source, motion.root));
      if (motions.length > 1) throw new Error(`Collision shape ${item.label} has multiple moving model ancestors.`);
      const [motionName, motion] = motions[0] ?? [null, null];
      return { ...item, motionName, delta: motion?.delta ?? new Vector3() };
    });
    const pairs = [];
    for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) {
      const a = shapes[i], b = shapes[j];
      if (a.record.source.kind === 'robot' && b.record.source.kind === 'robot') continue;
      if (a.record.source.kind === 'scene' && b.record.source.kind === 'scene' &&
          a.record.source.model === b.record.source.model) continue;
      const relative = a.delta.clone().sub(b.delta);
      if (relative.lengthSq() <= 1e-20) continue;
      pairs.push({ a, b, relativeLength: relative.length() });
    }
    const worst = pairs.reduce((best, pair) => !best || pair.relativeLength > best.relativeLength ? pair : best, null);
    const steps = Math.max(1, Math.ceil((worst?.relativeLength ?? 0) / translationStep));
    if (steps > maxSamples) {
      const movingModels = [...new Set([worst?.a.motionName, worst?.b.motionName].filter(Boolean))].sort();
      return { status: 'sample_budget', samples: steps, maxSamples, movingModels,
        ...(movingModels.length === 1 ? { model: movingModels[0] } : {}),
        pair: worst ? [worst.a.label, worst.b.label] : [],
        reason: `Device sweep needs ${steps} samples, above the ${maxSamples} sample limit.` };
    }
    for (let sample = 0; sample <= steps; sample++) {
      const fraction = sample / steps;
      for (const item of shapes) {
        const world = item.base.clone();
        world.setPosition(new Vector3().setFromMatrixPosition(item.base).addScaledVector(item.delta, fraction));
        setWorld(item.record, world);
      }
      for (const { a, b } of pairs) if (intersects(a.record, b.record)) {
        const names = [a.motionName, b.motionName].filter(Boolean).sort();
        const model = names[0], other = a.motionName === model ? b.label : a.label;
        return { status: 'collision', model, other, movingModels: names,
          pair: [a.label, b.label], fraction, samples: steps + 1 };
      }
    }
    return { status: 'clear', samples: steps + 1 };
  };
  return { checkSweep, dispose };
}
