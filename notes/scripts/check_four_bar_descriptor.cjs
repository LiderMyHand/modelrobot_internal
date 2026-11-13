const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const { build } = require('esbuild');
const { chromium } = require('@playwright/test');

(async () => {
  const root = resolve(__dirname, '../..');
  const bundle = await build({ entryPoints: [resolve(root, 'frontend/kinematic-constraints.js')],
    bundle: true, write: false, format: 'iife', globalName: 'FourBarPreflight' });
  const fixture = name => readFileSync(resolve(root, 'testowe/four_bar', name), 'utf8');
  const robotXml = fixture('robot.urdf');
  const descriptor = JSON.parse(fixture('kinematic-constraints.json'));
  const robotState = JSON.parse(fixture('robot-state.json'));
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const result = await page.evaluate(({ robotXml, descriptor, robotState }) => {
      const parse = xml => new DOMParser().parseFromString(xml, 'application/xml');
      const validate = (xml, desc, state) => FourBarPreflight.validateFourBarProjectState({
        descriptor: desc, robotDocument: parse(xml), robotState: state,
      });
      const valid = validate(robotXml, descriptor, robotState);
      const rejection = (xml, desc, state) => {
        try { validate(xml, desc, state); return null; } catch (error) { return error.message; }
      };
      return {
        dimensions: valid.model.dimensions,
        independentState: valid.independentState,
        expandedState: valid.expandedState,
        closureResidual: valid.closureResidual,
        badState: rejection(robotXml, descriptor, { jointNames: ['input', 'coupler'], positions: [0.6, 0] }),
        badBranch: rejection(robotXml, { ...descriptor, mechanisms: [{ ...descriptor.mechanisms[0], branch: -1 }] }, robotState),
        badOrigin: rejection(robotXml.replace('xyz="0.48 0 0"', 'xyz="0.48 0 0.01"'), descriptor, robotState),
        badLimit: rejection(robotXml.replace('lower="1.25" upper="1.7"', 'lower="-0.3" upper="0.3"'), descriptor, robotState),
      };
    }, { robotXml, descriptor, robotState });
    assert.deepEqual(result.dimensions, { a: 0.22, b: 0.48, c: 0.32, d: 0.55 });
    assert.deepEqual(result.independentState, [0.6]);
    assert.equal(result.expandedState.length, 3);
    assert.ok(result.closureResidual < 1e-12);
    assert.match(result.badState, /only independent joint/);
    assert.match(result.badBranch, /does not close|joint angle exceeds/i);
    assert.match(result.badOrigin, /XY translation/);
    assert.match(result.badLimit, /does not close|joint angle exceeds/i);
    console.log(JSON.stringify({ status: 'passed', ...result }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
