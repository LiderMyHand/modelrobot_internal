const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const textLoaders = Object.fromEntries(['.xml', '.urdf', '.sdf', '.robot', '.mprg', '.txt'].map(extension => [extension, 'text']));
let modulePromise;
function bundledModule() {
  modulePromise ??= esbuild.build({ entryPoints: [path.join(root, 'frontend/example-text.js')],
    bundle: true, write: false, platform: 'neutral', format: 'esm', loader: textLoaders })
    .then(result => import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64')));
  return modulePromise;
}

test('every advertised Workcell and Workspace example resolves directly from the browser bundle', async () => {
  const { readExampleText, bundledExamplePaths } = await bundledModule();
  const advertised = [
    './testowe/pi_robot_urdf.xml?v=ik-guide-20261108', './testowe/r2d2.xml',
    './testowe/mimic_gripper.urdf',
    'testowe/workcell/arm.urdf', 'testowe/workcell/world.sdf', 'testowe/workcell/program.txt',
    'testowe/weld/robot.urdf', 'testowe/weld/world.sdf', 'testowe/weld/program.txt',
    'testowe/weld/join_program.txt',
    'testowe/four_bar/robot.urdf', 'testowe/four_bar/world.sdf',
    'testowe/four_bar/program.robot', 'testowe/four_bar/kinematic-constraints.json',
    'testowe/four_bar/robot-state.json',
    'testowe/multi_program/handshake.mprg', 'testowe/multi_program/conveyor.sdf',
    'testowe/multi_program/conveyor.mprg', 'testowe/multi_program/combined.robot',
    'testowe/multi_program/combined.mprg', 'testowe/multi_program/triggered.mprg',
    'testowe/multi_program/two_requests.robot', 'testowe/multi_program/two_requests.mprg',
  ];
  assert.ok(bundledExamplePaths.length >= advertised.length);
  for (const advertisedPath of advertised) {
    const normalized = advertisedPath.replace(/^\.\//, '').split('?')[0];
    assert.ok(existsSync(path.join(root, normalized)), normalized);
    const text = await readExampleText(advertisedPath, { protocol: 'file:', fetcher: () => { throw new Error('file:// must not fetch'); } });
    assert.equal(typeof text, 'string', normalized);
    assert.ok(text.length > 0, normalized);
    if (normalized.endsWith('.json')) assert.deepEqual(JSON.parse(text), JSON.parse(readFileSync(path.join(root, normalized), 'utf8')));
    else assert.equal(text, readFileSync(path.join(root, normalized), 'utf8'), normalized);
  }
});

test('HTTP requests use the served text, while unknown or traversing paths fail before I/O', async () => {
  const { readExampleText } = await bundledModule();
  const calls = [];
  const fetcher = async request => { calls.push(request); return { ok: true, status: 200, text: async () => 'served edit' }; };
  assert.equal(await readExampleText('testowe/workcell/program.txt', { protocol: 'http:', fetcher }), 'served edit');
  assert.deepEqual(calls, ['testowe/workcell/program.txt']);
  await assert.rejects(readExampleText('testowe/workcell/program.txt', {
    protocol: 'https:', fetcher: async () => ({ ok: false, status: 404, text: async () => '' }),
  }), /HTTP 404/);
  for (const invalid of ['../testowe/workcell/program.txt', 'testowe/../secret.txt',
    'https://host/testowe/workcell/program.txt', 'testowe/not-bundled.urdf']) {
    await assert.rejects(readExampleText(invalid, { protocol: 'file:', fetcher }), /Example/);
  }
  assert.equal(calls.length, 1, 'invalid paths must not reach fetch');
});
