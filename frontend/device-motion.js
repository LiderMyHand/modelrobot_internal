import { Vector3 } from 'three';

function movable(sceneModel, name) {
  const record = sceneModel?.models?.get(name);
  return record?.source?.static === false && !sceneModel.attached.has(name);
}

/** Capture detached, non-static SDF model origins in world XYZ metres. */
export function captureSceneDevices(sceneModel) {
  if (!sceneModel?.models || !sceneModel?.attached) throw new Error('A SceneModel is required.');
  sceneModel.scene.updateMatrixWorld(true);
  return Object.fromEntries([...sceneModel.models.keys()].sort().filter(name => movable(sceneModel, name)).map(name => {
    const position = new Vector3();
    sceneModel.getObject(name).getWorldPosition(position);
    return [name, position.toArray()];
  }));
}

/** Apply a scheduler state to scene origins, preserving each model's orientation. */
export function applySceneDevices(sceneModel, state) {
  if (!sceneModel?.models || !sceneModel?.attached || !state?.devices || typeof state.devices !== 'object')
    throw new Error('A SceneModel and scheduler device state are required.');
  const entries = Object.entries(state.devices);
  for (const [name, xyz] of entries) {
    if (!movable(sceneModel, name)) throw new Error(`Model ${name} is unavailable for kinematic motion; it must exist, have static=false, and be detached.`);
    if (!Array.isArray(xyz) || xyz.length !== 3 || !xyz.every(Number.isFinite))
      throw new Error(`Model ${name} needs three finite world coordinates.`);
  }
  sceneModel.scene.updateMatrixWorld(true);
  for (const [name, xyz] of entries) {
    const object = sceneModel.getObject(name);
    object.position.copy(object.parent.worldToLocal(new Vector3(...xyz)));
  }
  sceneModel.scene.updateMatrixWorld(true);
}
