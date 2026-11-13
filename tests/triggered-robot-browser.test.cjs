const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('device-first RUN_ROBOT plans from moved scene and executes in Chromium', () => {
  execFileSync(process.execPath, [path.resolve(__dirname, '../notes/scripts/check_triggered_robot.cjs')], { stdio: 'inherit', timeout: 120000 });
});
