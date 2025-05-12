
// Script to build the Electron app without modifying package.json scripts
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Building Electron application...');

// First build the React app
const buildReactProcess = spawn('npm', ['run', 'build'], { 
  shell: true,
  env: process.env,
  stdio: 'inherit'
});

buildReactProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`React build failed with code ${code}`);
    process.exit(code);
  }
  
  console.log('React build complete. Building Electron app...');
  
  // Then build the Electron app with npm instead of npx
  const buildElectronProcess = spawn('npm', ['exec', 'electron-builder', 'build', '--win', '--mac', '--linux'], {
    shell: true,
    env: process.env,
    stdio: 'inherit'
  });

  buildElectronProcess.on('close', (code) => {
    console.log(`Electron build exited with code ${code}`);
    process.exit(code);
  });
});
