const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\x1b[36m%s\x1b[0m', '─────────────────────────────────────────────────────────');
console.log('\x1b[36m%s\x1b[0m', '  JOUST – Professional Setup & Environment Initialization');
console.log('\x1b[36m%s\x1b[0m', '─────────────────────────────────────────────────────────');

// 1. OS Detection
const isWin = os.platform() === 'win32';
console.log(`\n[OS] Detected ${isWin ? 'Windows' : 'Linux/macOS'} architecture.`);

// 2. Cleanup
console.log('\n[1/4] 🗑️  Cleaning up previous build artifacts and dependencies...');
const targets = ['.next', 'node_modules', 'package-lock.json'];
targets.forEach(target => {
  const p = path.join(__dirname, target);
  if (fs.existsSync(p)) {
    process.stdout.write(`  > Removing ${target}... `);
    try {
      if (fs.lstatSync(p).isDirectory()) {
        if (isWin) {
          execSync(`rmdir /s /q "${p}"`, { stdio: 'ignore' });
        } else {
          execSync(`rm -rf "${p}"`, { stdio: 'ignore' });
        }
      } else {
        fs.unlinkSync(p);
      }
      console.log('\x1b[32m%s\x1b[0m', 'OK');
    } catch (e) {
      console.log('\x1b[33m%s\x1b[0m', 'SKIPPED (File in use or access denied)');
    }
  }
});

// 3. Install
console.log('\n[2/4] 📦 Installing fresh dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (e) {
  console.error('\n\x1b[31mError: npm install failed. Check your network or permissions.\x1b[0m');
  process.exit(1);
}

// 4. Audit
console.log('\n[3/4] 🛡️  Running security audit...');
try {
  // We use --audit-level=high to only show significant issues
  execSync('npm audit', { stdio: 'inherit' });
} catch (e) {
  console.log('\x1b[33m%s\x1b[0m', '\nAudit reported vulnerabilities. Run "npm audit fix" if necessary.');
}

// 5. Env Generation
console.log('\n[4/4] ⚙️  Generating environment configuration...');
console.log('  > Targeting backend on: localhost (Secure Mode)');
try {
  if (isWin) {
    execSync('generate-env.bat localhost', { stdio: 'inherit' });
  } else {
    // Ensure bash script is executable
    try { execSync('chmod +x generate-env.sh', { stdio: 'ignore' }); } catch (e) { }
    execSync('./generate-env.sh localhost', { stdio: 'inherit' });
  }
} catch (e) {
  console.error('\n\x1b[31mError: Environment generation failed.\x1b[0m');
  process.exit(1);
}

console.log('\n\x1b[32m%s\x1b[0m', '✅ Setup complete! You are ready to develop.');
console.log('Run \x1b[1mnpm run dev\x1b[0m to start the frontend.\n');
