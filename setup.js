const { spawn } = require('child_process');
const os = require('os');

/**
 * JOUST Setup Dispatcher
 * Detects the OS and runs the appropriate setup script (.sh or .bat)
 */

const isWin = os.platform() === 'win32';
const script = isWin ? 'generate-env.bat' : './generate-env.sh';

console.log(`\x1b[36m[JOUST]\x1b[0m Detecting OS: \x1b[32m${os.platform()}\x1b[0m`);
console.log(`\x1b[36m[JOUST]\x1b[0m Launching: \x1b[32m${script}\x1b[0m\n`);

const child = spawn(isWin ? script : 'bash', isWin ? [] : [script], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n\x1b[32m[SUCCESS]\x1b[0m Setup completed successfully.`);
  } else {
    console.error(`\n\x1b[31m[ERROR]\x1b[0m Setup failed with exit code ${code}.`);
  }
  process.exit(code);
});
