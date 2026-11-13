const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { readFileSync } = require('node:fs');

const moduleUrl = 'data:text/javascript;base64,' + readFileSync('frontend/sdf.js').toString('base64');
const fixture = readFileSync('testowe/workcell/world.sdf', 'utf8');
const arm = readFileSync('testowe/workcell/arm.urdf', 'utf8');
let browser;
before(async () => {
  browser = await chromium.launch({ args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); });

const model = `<sdf version="1.10"><model name="crate"><static>true</static><link name="body"><visual name="v"><geometry><box><size>0.2 0.3 0.4</size></box></geometry></visual><collision name="c"><geometry><box><size>0.2 0.3 0.4</size></box></geometry></collision></link></model></sdf>`;
const world = `<sdf version="1.12"><world name="classroom"><model name="table"><static>true</static><pose>1 2 0 0 0 1.57</pose><link name="top"><pose relative_to="table">0 0 0.7 0 0 0</pose><visual name="top"><geometry><box><size>1 0.5 0.1</size></box></geometry></visual><collision name="top"><geometry><box><size>1 0.5 0.1</size></box></geometry></collision></link></model><include><uri>model://crate</uri><name>part</name><pose>1 2 0.8 0 0 0</pose></include></world></sdf>`;

test('SDF world subset loads bundled includes and round trips without a server resolver', async () => {
  const page = await browser.newPage();
  const result = await page.evaluate(async ({ world, model, moduleUrl }) => {
    const { parseSDF, serializeSDF } = await import(moduleUrl);
    const parsed = parseSDF(world, { readInclude: uri => uri === 'model://crate' ? model : null });
    const exported = serializeSDF(parsed.world);
    const again = parseSDF(exported);
    return { parsed, again, exported };
  }, { world, model, moduleUrl });
  assert.equal(result.parsed.world.name, 'classroom');
  assert.deepEqual(result.parsed.world.models.map(item => item.name), ['table', 'part']);
  assert.deepEqual(result.parsed.world.models[0].links[0].pose, [0, 0, 0.7, 0, 0, 0]);
  assert.deepEqual(result.parsed.world.models[1].pose, [1, 2, 0.8, 0, 0, 0]);
  assert.deepEqual(result.parsed.diagnostics.filter(item => item.severity === 'error'), []);
  assert.deepEqual(result.again.world, result.parsed.world);
  assert.match(result.exported, /<sdf version="1.10">/);
  assert.doesNotMatch(result.exported, /<include>/);
  await page.close();
});

test('unsupported frames, geometry, remote URIs and absent assets are diagnosed', async () => {
  const page = await browser.newPage();
  const source = `<sdf version="1.8"><world name="w"><plugin name="controller" filename="lib.so"/><model name="m"><pose relative_to="missing">0 0 0 0 0 0</pose><link name="l"><visual name="bad"><geometry><mesh><uri>javascript:alert(1)</uri></mesh></geometry></visual><collision name="bad"><geometry><ellipsoid><radii>1 2 3</radii></ellipsoid></geometry></collision></link></model><include><uri>model://missing</uri></include></world></sdf>`;
  const result = await page.evaluate(async ({ source, moduleUrl }) => {
    const { parseSDF, serializeSDF } = await import(moduleUrl);
    const parsed = parseSDF(source, { readInclude: () => null });
    let exportError;
    try { serializeSDF(parsed.world); } catch (error) { exportError = error.message; }
    return { diagnostics: parsed.diagnostics, exportError };
  }, { source, moduleUrl });
  assert.ok(result.diagnostics.some(item => item.code === 'UNSUPPORTED_FRAME'));
  assert.ok(result.diagnostics.some(item => item.code === 'INVALID_GEOMETRY' && /local URI/.test(item.message)));
  assert.ok(result.diagnostics.some(item => item.code === 'UNSUPPORTED_GEOMETRY'));
  assert.ok(result.diagnostics.some(item => item.code === 'INCLUDE_FAILED'));
  assert.ok(result.diagnostics.some(item => item.code === 'IGNORED_WORLD_ELEMENT' && /plugin/.test(item.message)));
  assert.match(result.exportError, /Cannot export invalid/);
  await page.close();
});

test('bundled workcell fixture has visual and collision geometry for each object', async () => {
  const page = await browser.newPage();
  const result = await page.evaluate(async ({ fixture, moduleUrl }) => {
    const { parseSDF, serializeSDF } = await import(moduleUrl);
    const parsed = parseSDF(fixture);
    const second = parseSDF(serializeSDF(parsed.world));
    return { parsed, second };
  }, { fixture, moduleUrl });
  assert.deepEqual(result.parsed.world.models.map(model => model.name), ['table', 'pick_box', 'obstacle', 'destination']);
  assert.deepEqual(result.parsed.diagnostics.filter(issue => issue.severity === 'error'), []);
  assert.ok(result.parsed.diagnostics.some(issue => issue.code === 'PHYSICS_IGNORED' && /pick_box/.test(issue.path)));
  assert.ok(result.parsed.world.models.every(model => model.links.every(link => link.visuals.length && link.collisions.length)));
  assert.deepEqual(result.second.world, result.parsed.world);
  await page.close();
});

test('bundled teaching arm is a serial six-axis URDF with a collidable named TCP', async () => {
  const page = await browser.newPage();
  const result = await page.evaluate(arm => {
    const doc = new DOMParser().parseFromString(arm, 'application/xml');
    const links = [...doc.querySelectorAll('robot > link')];
    const joints = [...doc.querySelectorAll('robot > joint')];
    const origins = joints.map(joint => (joint.querySelector(':scope > origin')?.getAttribute('xyz') || '0 0 0').split(/\s+/).map(Number));
    return {
      malformed: Boolean(doc.querySelector('parsererror')),
      root: doc.documentElement.localName,
      name: doc.documentElement.getAttribute('name'),
      links: links.map(link => ({ name: link.getAttribute('name'), visual: link.querySelectorAll(':scope > visual').length, collision: link.querySelectorAll(':scope > collision').length })),
      joints: joints.map((joint, index) => ({ name: joint.getAttribute('name'), type: joint.getAttribute('type'), parent: joint.querySelector(':scope > parent')?.getAttribute('link'), child: joint.querySelector(':scope > child')?.getAttribute('link'), axis: joint.querySelector(':scope > axis')?.getAttribute('xyz'), lower: Number(joint.querySelector(':scope > limit')?.getAttribute('lower')), upper: Number(joint.querySelector(':scope > limit')?.getAttribute('upper')), origin: origins[index] })),
    };
  }, arm);
  assert.equal(result.malformed, false);
  assert.equal(result.root, 'robot');
  assert.equal(result.name, 'classroom_six_axis_arm');
  assert.equal(result.links.length, 8);
  assert.ok(result.links.every(link => link.visual && link.collision));
  assert.ok(result.links.some(link => link.name === 'tcp_link'));
  assert.equal(result.joints.filter(joint => joint.type === 'revolute').length, 6);
  assert.equal(result.joints.filter(joint => joint.type === 'fixed').length, 1);
  const available = new Set(result.links.map(link => link.name));
  assert.ok(result.joints.every(joint => available.has(joint.parent) && available.has(joint.child)));
  assert.ok(result.joints.filter(joint => joint.type === 'revolute').every(joint => joint.axis && Number.isFinite(joint.lower) && Number.isFinite(joint.upper) && joint.lower < 0 && joint.upper > 0));
  const home = result.joints.reduce((position, joint) => position.map((value, i) => value + joint.origin[i]), [0, 0, 0]);
  assert.ok(Math.abs(home[0] - 0.94) < 1e-10 && Math.abs(home[2] - 0.95) < 1e-10);
  await page.close();
});
