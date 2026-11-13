const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { unzipSync, zipSync, strToU8 } = require('fflate');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
let packProject, unpackProject;
before(async () => ({ packProject, unpackProject } = await import('../frontend/project-bundle.js')));

test('workcell ZIP round trips SDF, URDF, program, limits and binary STL', () => {
  const stl = Uint8Array.from([0, 255, 12, 0, 64]);
  const zip = packProject({
    name: 'Pick and place', worldSdf: '<sdf version="1.10"><world name="cell"/></sdf>',
    robots: [{ name: 'arm', urdf: '<robot name="arm"/>' }],
    assets: [{ name: 'demo/gripper.stl', bytes: stl }],
    includes: [{ name: 'models/box.sdf', text: '<sdf version="1.10"><model name="box"/></sdf>' }],
    attachments: [{ object: 'workpiece', frame: 'model/fixture' }],
    program: 'ROBOT arm\nMOVEJ home\n', signalPrograms: 'PROGRAM conveyor\nSET done 1\nEND\n',
    motionLimits: { shoulder: { velocity: 1, acceleration: 2 } },
    robotState: { jointNames: ['shoulder', 'elbow'], positions: [0.2, -0.4] }
  });
  const project = unpackProject(zip);
  assert.equal(project.name, 'Pick and place');
  assert.equal(project.robots[0].urdf, '<robot name="arm"/>');
  assert.equal(project.worldSdf, '<sdf version="1.10"><world name="cell"/></sdf>');
  assert.equal(project.program, 'ROBOT arm\nMOVEJ home\n');
  assert.equal(project.signalPrograms, 'PROGRAM conveyor\nSET done 1\nEND\n');
  assert.equal(project.motionLimits.shoulder.acceleration, 2);
  assert.deepEqual(project.assets[0].bytes, stl);
  assert.equal(project.includes[0].name, 'models/box.sdf');
  assert.match(project.includes[0].text, /model name="box"/);
  assert.deepEqual(project.attachments, [{ object: 'workpiece', frame: 'model/fixture' }]);
  assert.deepEqual(project.robotState, { jointNames: ['shoulder', 'elbow'], positions: [0.2, -0.4] });
});

test('project rejects path traversal and invalid archives', () => {
  assert.throws(() => packProject({ worldSdf: '<sdf/>', assets: [{ name: '../bad.stl', bytes: new Uint8Array(1) }] }), /Invalid asset name/);
  assert.throws(() => packProject({ worldSdf: '<sdf/>', robots: [{ name: 'a', path: '../a.urdf', urdf: '<robot/>' }] }), /Invalid or duplicate URDF path/);
  assert.throws(() => unpackProject(new Uint8Array([1, 2, 3])), /zip|invalid|unknown|unexpected/i);
  assert.throws(() => packProject({ worldSdf: '<sdf/>', robotState: { jointNames: ['axis', 'axis'], positions: [0, 1] } }), /Robot state/);
  assert.throws(() => packProject({ worldSdf: '<sdf/>', robotState: { jointNames: ['axis'], positions: [Infinity] } }), /Robot state/);
});

test('older ZIP without robot-state.json loads with no saved joint state', () => {
  const zip = packProject({ worldSdf: '<sdf version="1.10"><world name="legacy"/></sdf>', robots: [{ name: 'arm', urdf: '<robot name="arm"/>' }] });
  const old = unpackProject(zip);
  assert.equal(old.robotState, null);
  assert.equal(old.signalPrograms, '');
  assert.equal(old.manifest.robotState, undefined);
});

test('malformed joint-state entry is rejected during ZIP unpack', () => {
  const zip = packProject({ worldSdf: '<sdf version="1.10"><world name="cell"/></sdf>',
    robots: [{ name: 'arm', urdf: '<robot name="arm"/>' }],
    robotState: { jointNames: ['axis'], positions: [0.2] } });
  const entries = unzipSync(zip);
  entries['robot-state.json'] = strToU8('{bad json');
  assert.throws(() => unpackProject(zipSync(entries)), /Invalid robot-state\.json/);
  entries['robot-state.json'] = strToU8(JSON.stringify({ jointNames: ['axis', 'axis'], positions: [0.1, 0.2] }));
  assert.throws(() => unpackProject(zipSync(entries)), /Invalid robot-state\.json/);
});

test('four-bar constraints, branch, and driver-only state survive project ZIP', () => {
  const fixture = name => readFileSync(join(__dirname, '../testowe/four_bar', name), 'utf8');
  const constraints = JSON.parse(fixture('kinematic-constraints.json'));
  const state = JSON.parse(fixture('robot-state.json'));
  const zip = packProject({ worldSdf: fixture('world.sdf'),
    robots: [{ name: 'four_bar', urdf: fixture('robot.urdf') }],
    program: fixture('program.robot'), robotState: state, kinematicConstraints: constraints });
  const project = unpackProject(zip);
  assert.deepEqual(project.kinematicConstraints, constraints);
  assert.deepEqual(project.robotState, { jointNames: ['input'], positions: [0.6] });
  assert.equal(project.manifest.kinematicConstraints, 'kinematic-constraints.json');
  assert.match(project.program, /TOOL C_left/);
  assert.deepEqual(unzipSync(zip)['kinematic-constraints.json'], strToU8(JSON.stringify(constraints, null, 2) + '\n'));
});

test('constraint extension validates version, names, robot reference and file path', () => {
  const robot = { name: 'four_bar', urdf: '<robot name="four_bar"/>' };
  const constraints = JSON.parse(readFileSync(join(__dirname, '../testowe/four_bar/kinematic-constraints.json'), 'utf8'));
  const base = { worldSdf: '<sdf/>', robots: [robot], kinematicConstraints: constraints };
  assert.throws(() => packProject({ ...base, kinematicConstraints: { ...constraints, version: 2 } }), /kinematic-constraints/);
  assert.throws(() => packProject({ ...base, kinematicConstraints: { ...constraints, mechanisms: [{ ...constraints.mechanisms[0], branch: 0 }] } }), /kinematic-constraints/);
  assert.throws(() => packProject({ ...base, robots: [{ ...robot, name: 'other' }] }), /unavailable robot/);
  const files = unzipSync(packProject(base));
  files['kinematic-constraints.json'] = strToU8('{bad json');
  assert.throws(() => unpackProject(zipSync(files)), /Invalid kinematic-constraints\.json/);
  files['kinematic-constraints.json'] = strToU8(JSON.stringify({ ...constraints, version: 2 }));
  assert.throws(() => unpackProject(zipSync(files)), /Invalid kinematic-constraints\.json/);
  files['kinematic-constraints.json'] = strToU8(JSON.stringify(constraints));
  const manifest = JSON.parse(Buffer.from(files['project.json']).toString());
  manifest.kinematicConstraints = '../kinematic-constraints.json';
  files['project.json'] = strToU8(JSON.stringify(manifest));
  assert.throws(() => unpackProject(zipSync(files)), /manifest paths/);
});
