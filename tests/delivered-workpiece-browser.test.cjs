const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('device delivers an SDF workpiece before Worker planning and robot pick/place in Chromium', () => {
  execFileSync(process.execPath, [path.resolve(__dirname, '../notes/scripts/check_delivered_workpiece.cjs')],
    { stdio: 'inherit', timeout: 180000 });
});
