const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

(async () => {
  const root = resolve(__dirname, '../..');
  const fixture = name => readFileSync(resolve(root, 'testowe/four_bar', name), 'utf8');
  const { packProject } = await import('../../frontend/project-bundle.js');
  const zip = packProject({ name: 'Planar four-bar lesson', worldSdf: fixture('world.sdf'),
    robots: [{ name: 'four_bar', urdf: fixture('robot.urdf') }],
    program: fixture('program.robot'), robotState: JSON.parse(fixture('robot-state.json')),
    kinematicConstraints: JSON.parse(fixture('kinematic-constraints.json')) });
  const output = resolve(root, 'notes/artifacts/four_bar_fixture.workcell.zip');
  mkdirSync(resolve(root, 'notes/artifacts'), { recursive: true });
  writeFileSync(output, zip);
  console.log(output);
})().catch(error => { console.error(error); process.exitCode = 1; });
