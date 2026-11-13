const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { chromium } = require('@playwright/test');

test('saved joint state validates URDF names, direct limits, mimic limits, and legacy absence', async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const url = 'data:text/javascript;base64,' + readFileSync('frontend/project-robot-state.js').toString('base64');
    const result = await page.evaluate(async url => {
      const { validateRobotStateForURDF } = await import(url);
      const xml = `<robot name="arm"><link name="base"/><link name="a"/><link name="b"/><link name="c"/>
        <joint name="x" type="prismatic"><parent link="base"/><child link="a"/><limit lower="0" upper="1"/></joint>
        <joint name="follower" type="prismatic"><parent link="a"/><child link="b"/><limit lower="0" upper="1.5"/><mimic joint="x" multiplier="2" offset="0.1"/></joint>
        <joint name="turn" type="continuous"><parent link="b"/><child link="c"/></joint></robot>`;
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const check = state => {
        try { return { values: [...validateRobotStateForURDF(state, doc) || []] }; }
        catch (error) { return { error: error.message }; }
      };
      return { good: check({ jointNames: ['turn', 'x'], positions: [7, 0.6] }),
        mimic: check({ jointNames: ['x', 'turn'], positions: [0.8, 0] }),
        direct: check({ jointNames: ['x', 'turn'], positions: [-0.1, 0] }),
        missing: check({ jointNames: ['x'], positions: [0.2] }),
        legacy: validateRobotStateForURDF(null, doc) };
    }, url);
    assert.deepEqual(result.good.values, [['turn', 7], ['x', 0.6]]);
    assert.match(result.mimic.error, /follower.*outside/);
    assert.match(result.direct.error, /x.*outside/);
    assert.match(result.missing.error, /every independent joint/);
    assert.equal(result.legacy, null);
  } finally { await browser.close(); }
});
