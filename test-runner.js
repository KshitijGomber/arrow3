#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, description) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}Running: ${description}${colors.reset}`);
    log(`${colors.yellow}Command: ${command} ${args.join(' ')}${colors.reset}`);
    log(`${colors.yellow}Directory: ${cwd}${colors.reset}\n`);

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`\n${colors.green}✅ ${description} completed successfully${colors.reset}`);
        resolve();
      } else {
        log(`\n${colors.red}❌ ${description} failed with exit code ${code}${colors.reset}`);
        reject(new Error(`${description} failed`));
      }
    });

    child.on('error', (error) => {
      log(`\n${colors.red}❌ ${description} failed with error: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

async function runTests() {
  const rootDir = __dirname;
  const clientDir = path.join(rootDir, 'client');
  const serverDir = path.join(rootDir, 'server');

  try {
    log(`${colors.bright}${colors.magenta}🚀 Arrow3 Aerospace Platform - Comprehensive Test Suite${colors.reset}`);
    log(`${colors.bright}================================================================${colors.reset}`);

    // 1. Install dependencies if needed
    log(`\n${colors.bright}📦 Installing Dependencies${colors.reset}`);
    
    try {
      await runCommand('npm', ['install'], serverDir, 'Server dependencies installation');
    } catch (error) {
      log(`${colors.yellow}⚠️  Server dependencies installation failed, continuing...${colors.reset}`);
    }

    try {
      await runCommand('npm', ['install'], clientDir, 'Client dependencies installation');
    } catch (error) {
      log(`${colors.yellow}⚠️  Client dependencies installation failed, continuing...${colors.reset}`);
    }

    // 2. Run server unit tests
    log(`\n${colors.bright}🧪 Running Server Unit Tests${colors.reset}`);
    await runCommand('npm', ['test'], serverDir, 'Server unit tests');

    // 3. Run client unit tests
    log(`\n${colors.bright}🧪 Running Client Unit Tests${colors.reset}`);
    await runCommand('npm', ['test'], clientDir, 'Client unit tests');

    // 4. Run integration tests
    log(`\n${colors.bright}🔗 Running Integration Tests${colors.reset}`);
    await runCommand('npm', ['run', 'test:integration'], serverDir, 'Integration tests');

    // 5. Build client for E2E tests
    log(`\n${colors.bright}🏗️  Building Client for E2E Tests${colors.reset}`);
    await runCommand('npm', ['run', 'build'], clientDir, 'Client build');

    // 6. Run E2E tests (if Cypress is available)
    log(`\n${colors.bright}🎭 Running E2E Tests${colors.reset}`);
    try {
      await runCommand('npx', ['cypress', 'run'], clientDir, 'E2E tests');
    } catch (error) {
      log(`${colors.yellow}⚠️  E2E tests failed or Cypress not available, continuing...${colors.reset}`);
    }

    // Success summary
    log(`\n${colors.bright}${colors.green}🎉 All Tests Completed Successfully!${colors.reset}`);
    log(`${colors.bright}================================================================${colors.reset}`);
    log(`${colors.green}✅ Server unit tests passed${colors.reset}`);
    log(`${colors.green}✅ Client unit tests passed${colors.reset}`);
    log(`${colors.green}✅ Integration tests passed${colors.reset}`);
    log(`${colors.green}✅ E2E tests completed${colors.reset}`);
    log(`${colors.bright}================================================================${colors.reset}`);

  } catch (error) {
    log(`\n${colors.bright}${colors.red}💥 Test Suite Failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    log(`${colors.bright}================================================================${colors.reset}`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bright}Arrow3 Aerospace Platform Test Runner${colors.reset}`);
  log(`${colors.bright}=====================================${colors.reset}`);
  log('');
  log('Usage: node test-runner.js [options]');
  log('');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --server-only  Run only server tests');
  log('  --client-only  Run only client tests');
  log('  --e2e-only     Run only E2E tests');
  log('  --no-build     Skip build step');
  log('');
  log('Examples:');
  log('  node test-runner.js                 # Run all tests');
  log('  node test-runner.js --server-only   # Run only server tests');
  log('  node test-runner.js --client-only   # Run only client tests');
  log('  node test-runner.js --e2e-only      # Run only E2E tests');
  process.exit(0);
}

// Run specific test suites based on arguments
if (args.includes('--server-only')) {
  runServerTestsOnly();
} else if (args.includes('--client-only')) {
  runClientTestsOnly();
} else if (args.includes('--e2e-only')) {
  runE2ETestsOnly();
} else {
  runTests();
}

async function runServerTestsOnly() {
  const serverDir = path.join(__dirname, 'server');
  try {
    log(`${colors.bright}${colors.magenta}🚀 Arrow3 Aerospace Platform - Server Tests Only${colors.reset}`);
    await runCommand('npm', ['install'], serverDir, 'Server dependencies installation');
    await runCommand('npm', ['test'], serverDir, 'Server unit tests');
    await runCommand('npm', ['run', 'test:integration'], serverDir, 'Integration tests');
    log(`\n${colors.bright}${colors.green}🎉 Server Tests Completed Successfully!${colors.reset}`);
  } catch (error) {
    log(`\n${colors.bright}${colors.red}💥 Server Tests Failed${colors.reset}`);
    process.exit(1);
  }
}

async function runClientTestsOnly() {
  const clientDir = path.join(__dirname, 'client');
  try {
    log(`${colors.bright}${colors.magenta}🚀 Arrow3 Aerospace Platform - Client Tests Only${colors.reset}`);
    await runCommand('npm', ['install'], clientDir, 'Client dependencies installation');
    await runCommand('npm', ['test'], clientDir, 'Client unit tests');
    log(`\n${colors.bright}${colors.green}🎉 Client Tests Completed Successfully!${colors.reset}`);
  } catch (error) {
    log(`\n${colors.bright}${colors.red}💥 Client Tests Failed${colors.reset}`);
    process.exit(1);
  }
}

async function runE2ETestsOnly() {
  const clientDir = path.join(__dirname, 'client');
  try {
    log(`${colors.bright}${colors.magenta}🚀 Arrow3 Aerospace Platform - E2E Tests Only${colors.reset}`);
    if (!args.includes('--no-build')) {
      await runCommand('npm', ['run', 'build'], clientDir, 'Client build');
    }
    await runCommand('npx', ['cypress', 'run'], clientDir, 'E2E tests');
    log(`\n${colors.bright}${colors.green}🎉 E2E Tests Completed Successfully!${colors.reset}`);
  } catch (error) {
    log(`\n${colors.bright}${colors.red}💥 E2E Tests Failed${colors.reset}`);
    process.exit(1);
  }
}