// The static imports keep the classroom examples available when standalone.html
// is opened directly from disk. Under HTTP we still read the served files, so
// an edited fixture takes effect without rebuilding the JavaScript bundle.
import deviceCollisionWorld from '../testowe/device_collision/world.sdf';
import externalCarrierCycle from '../testowe/external_carrier/cycle.mprg';
import externalCarrierProgram from '../testowe/external_carrier/program.robot';
import externalCarrierWorld from '../testowe/external_carrier/world.sdf';
import externalRailProgram from '../testowe/external_rail/program.robot';
import externalRailRobot from '../testowe/external_rail/robot.urdf';
import fourBarDescriptor from '../testowe/four_bar/kinematic-constraints.json';
import fourBarProgram from '../testowe/four_bar/program.robot';
import fourBarState from '../testowe/four_bar/robot-state.json';
import fourBarRobot from '../testowe/four_bar/robot.urdf';
import fourBarWorld from '../testowe/four_bar/world.sdf';
import mimicGripper from '../testowe/mimic_gripper.urdf';
import multiCombinedSignals from '../testowe/multi_program/combined.mprg';
import multiCombinedRobot from '../testowe/multi_program/combined.robot';
import multiConveyorSignals from '../testowe/multi_program/conveyor.mprg';
import multiConveyorWorld from '../testowe/multi_program/conveyor.sdf';
import multiDeliveredSignals from '../testowe/multi_program/delivered.mprg';
import multiDeliveredRobot from '../testowe/multi_program/delivered.robot';
import multiDeliveredWorld from '../testowe/multi_program/delivered_world.sdf';
import multiHandshake from '../testowe/multi_program/handshake.mprg';
import multiTriggered from '../testowe/multi_program/triggered.mprg';
import multiTwoRequestsSignals from '../testowe/multi_program/two_requests.mprg';
import multiTwoRequestsRobot from '../testowe/multi_program/two_requests.robot';
import piRobotUrdf from '../testowe/pi_robot_urdf.urdf';
import piRobotXml from '../testowe/pi_robot_urdf.xml';
import r2d2Xml from '../testowe/r2d2.xml';
import weldJoinProgram from '../testowe/weld/join_program.txt';
import weldProgram from '../testowe/weld/program.txt';
import weldRobot from '../testowe/weld/robot.urdf';
import weldWorld from '../testowe/weld/world.sdf';
import workcellArm from '../testowe/workcell/arm.urdf';
import workcellProgram from '../testowe/workcell/program.txt';
import workcellWorld from '../testowe/workcell/world.sdf';
import zoneMulticornerProgram from '../testowe/zone_multicorner/program.robot';
import zoneOrientationProgram from '../testowe/zone_orientation/program.robot';
import zoneOrientationRobot from '../testowe/zone_orientation/robot.urdf';

const bundled = new Map([
  ['testowe/device_collision/world.sdf', deviceCollisionWorld],
  ['testowe/external_carrier/cycle.mprg', externalCarrierCycle],
  ['testowe/external_carrier/program.robot', externalCarrierProgram],
  ['testowe/external_carrier/world.sdf', externalCarrierWorld],
  ['testowe/external_rail/program.robot', externalRailProgram],
  ['testowe/external_rail/robot.urdf', externalRailRobot],
  ['testowe/four_bar/kinematic-constraints.json', JSON.stringify(fourBarDescriptor, null, 2) + '\n'],
  ['testowe/four_bar/program.robot', fourBarProgram],
  ['testowe/four_bar/robot-state.json', JSON.stringify(fourBarState, null, 2) + '\n'],
  ['testowe/four_bar/robot.urdf', fourBarRobot],
  ['testowe/four_bar/world.sdf', fourBarWorld],
  ['testowe/mimic_gripper.urdf', mimicGripper],
  ['testowe/multi_program/combined.mprg', multiCombinedSignals],
  ['testowe/multi_program/combined.robot', multiCombinedRobot],
  ['testowe/multi_program/conveyor.mprg', multiConveyorSignals],
  ['testowe/multi_program/conveyor.sdf', multiConveyorWorld],
  ['testowe/multi_program/delivered.mprg', multiDeliveredSignals],
  ['testowe/multi_program/delivered.robot', multiDeliveredRobot],
  ['testowe/multi_program/delivered_world.sdf', multiDeliveredWorld],
  ['testowe/multi_program/handshake.mprg', multiHandshake],
  ['testowe/multi_program/triggered.mprg', multiTriggered],
  ['testowe/multi_program/two_requests.mprg', multiTwoRequestsSignals],
  ['testowe/multi_program/two_requests.robot', multiTwoRequestsRobot],
  ['testowe/pi_robot_urdf.urdf', piRobotUrdf],
  ['testowe/pi_robot_urdf.xml', piRobotXml],
  ['testowe/r2d2.xml', r2d2Xml],
  ['testowe/weld/join_program.txt', weldJoinProgram],
  ['testowe/weld/program.txt', weldProgram],
  ['testowe/weld/robot.urdf', weldRobot],
  ['testowe/weld/world.sdf', weldWorld],
  ['testowe/workcell/arm.urdf', workcellArm],
  ['testowe/workcell/program.txt', workcellProgram],
  ['testowe/workcell/world.sdf', workcellWorld],
  ['testowe/zone_multicorner/program.robot', zoneMulticornerProgram],
  ['testowe/zone_orientation/program.robot', zoneOrientationProgram],
  ['testowe/zone_orientation/robot.urdf', zoneOrientationRobot],
]);

export const bundledExamplePaths = Object.freeze([...bundled.keys()]);

function exampleKey(path) {
  if (typeof path !== 'string' || !/^(?:\.\/)?testowe\/[A-Za-z0-9_./-]+(?:\?[^#]*)?(?:#.*)?$/.test(path))
    throw new Error('Example path must be a relative testowe/ file.');
  const key = path.replace(/^\.\//, '').split(/[?#]/, 1)[0];
  if (key.split('/').some(part => part === '.' || part === '..' || !part) || !bundled.has(key))
    throw new Error(`Example ${key} is not bundled.`);
  return key;
}

/** Read a known example from the local bundle for file://, or from the server under HTTP. */
export async function readExampleText(path, { protocol = globalThis.location?.protocol ?? 'http:', fetcher = globalThis.fetch } = {}) {
  const key = exampleKey(path);
  if (protocol === 'file:') return bundled.get(key);
  if (typeof fetcher !== 'function') throw new Error('Example loading needs browser fetch under HTTP.');
  const response = await fetcher(path);
  if (!response?.ok || typeof response.text !== 'function')
    throw new Error(`Cannot load example ${key}${response?.status ? ` (HTTP ${response.status})` : ''}.`);
  return response.text();
}
