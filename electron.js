
const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');

console.log('Starting Electron development environment...');

// First run Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], { 
  shell: true,
  env: process.env,
  stdio: 'inherit'
});

// Wait for Vite server to start
waitOn({ resources: ['http://localhost:8080'] }, (err) => {
  if (err) {
    console.error('Error waiting for dev server:', err);
    process.exit(1);
  }
  
  console.log('Vite server is ready. Starting Electron...');
  
  // Then start Electron
  const electronProcess = spawn('npx', ['electron', '.', '--no-sandbox'], {
    shell: true,
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:8080'
    },
    stdio: 'inherit'
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    viteProcess.kill();
    process.exit(code);
  });
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});
