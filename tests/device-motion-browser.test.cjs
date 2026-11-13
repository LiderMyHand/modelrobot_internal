const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

test('concurrent program moves a scene device in Chromium and preserves its pose in ZIP', () => {
  execFileSync(process.execPath, [path.resolve(__dirname, '../notes/scripts/check_device_motion.cjs')], { stdio: 'inherit', timeout: 120000 });
});
