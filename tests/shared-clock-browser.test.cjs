const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('planned robot and signal-driven conveyor share a browser clock', () => {
  execFileSync(process.execPath, [path.resolve(__dirname, '../notes/scripts/check_shared_clock.cjs')], { stdio: 'inherit', timeout: 120000 });
});
