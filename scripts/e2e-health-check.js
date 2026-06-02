const { spawn } = require('child_process');
const http = require('http');

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}`));
    });

    child.on('error', reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probeApi() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3000/api', (res) => {
      const ok = typeof res.statusCode === 'number' && res.statusCode >= 200 && res.statusCode < 500;
      res.resume();
      resolve(ok);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForApiReady(timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await probeApi()) {
      return;
    }

    await wait(1000);
  }

  throw new Error('API readiness probe timed out.');
}

function stopProcess(pid) {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
        stdio: 'ignore',
      });

      killer.on('exit', () => resolve());
      killer.on('error', () => resolve());
      return;
    }

    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Process already stopped.
    }

    resolve();
  });
}

async function main() {
  console.log('Running database migration...');
  await runCommand('npm', ['run', 'db:migrate']);

  console.log('Running database seed...');
  await runCommand('npm', ['run', 'seed']);

  console.log('Building project...');
  await runCommand('npm', ['run', 'build']);

  console.log('Starting API for smoke check...');
  const server = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  try {
    if (!server.pid) {
      throw new Error('Could not determine server PID for shutdown.');
    }

    await waitForApiReady(30000);
    console.log('E2E health-check passed. API is reachable.');
  } finally {
    if (server.pid) {
      await stopProcess(server.pid);
    }
  }
}

main().catch((error) => {
  console.error('E2E health-check failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
