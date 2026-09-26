const { execFileSync } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');

// Ensure fresh seed state for reproducible test runs
execFileSync(process.execPath, [path.join(root, 'db', 'init.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts', 'seed-users.js')], { stdio: 'inherit' });

const files = ['smoke.js', 'smoke-gap.js', 'smoke-live.js'];
for (const file of files) {
  console.log(`\n=== Running test/${file} ===`);
  execFileSync(process.execPath, [path.join(__dirname, file)], { stdio: 'inherit' });
}
