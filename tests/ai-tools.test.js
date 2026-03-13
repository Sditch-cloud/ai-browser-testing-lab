'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCliArgs,
  parseCliOutput,
  runTestCase,
} = require('../tools/runner/run-test-case');

test('buildCliArgs: builds argv for named test execution', async () => {
  const args = buildCliArgs({
    testCaseInput: 'login',
    reportDir: 'reports',
    timeout: 4500,
    headless: true,
  });

  assert.deepEqual(args, ['login', '--report-dir', 'reports', '--timeout', '4500', '--headless']);
});

test('buildCliArgs: prefers filePath and headed mode when provided', async () => {
  const args = buildCliArgs({
    testCaseInput: 'ignored',
    filePath: 'tests/cases/search.yaml',
    headed: true,
    slowMo: 150,
  });

  assert.deepEqual(args, ['tests/cases/search.yaml', '--slow-mo', '150', '--headed']);
});

test('parseCliOutput: extracts status and report paths', async () => {
  const parsed = parseCliOutput([
    'Test failed (2 failures)',
    'Steps logged: 9',
    'JSON report: reports/login.json',
    'HTML report: reports/login.html',
  ].join('\n'));

  assert.equal(parsed.statusLine, 'Test failed (2 failures)');
  assert.equal(parsed.stepsLine, 'Steps logged: 9');
  assert.equal(parsed.jsonPath, 'reports/login.json');
  assert.equal(parsed.htmlPath, 'reports/login.html');
  assert.equal(parsed.passed, false);
});

test('runTestCase tool: executes CLI wrapper and returns parsed success result', async () => {
  const result = await runTestCase(
    { testCaseInput: 'login', reportDir: 'reports' },
    {
      rootDir: 'E:/workspace',
      cliPath: 'E:/workspace/runner/cli.js',
      nodeExecutable: 'node',
      execFileAsync: async (command, args, options) => {
        assert.equal(command, 'node');
        assert.deepEqual(args, ['E:/workspace/runner/cli.js', 'login', '--report-dir', 'reports']);
        assert.equal(options.cwd, 'E:/workspace');

        return {
          stdout: [
            'Test passed',
            'Steps logged: 7',
            'JSON report: reports/login.json',
            'HTML report: reports/login.html',
          ].join('\n'),
          stderr: '',
        };
      },
    }
  );

  assert.equal(result.exitCode, 0);
  assert.equal(result.passed, true);
  assert.equal(result.jsonPath, 'reports/login.json');
  assert.equal(result.htmlPath, 'reports/login.html');
});

test('runTestCase tool: captures non-zero CLI exit results', async () => {
  const result = await runTestCase(
    { filePath: 'tests/cases/missing.yaml' },
    {
      rootDir: 'E:/workspace',
      cliPath: 'E:/workspace/runner/cli.js',
      nodeExecutable: 'node',
      execFileAsync: async () => {
        const error = new Error('CLI failed');
        error.code = 1;
        error.stdout = 'Test failed (runner error): missing case';
        error.stderr = '';
        throw error;
      },
    }
  );

  assert.equal(result.exitCode, 1);
  assert.equal(result.passed, false);
  assert.equal(result.statusLine, 'Test failed (runner error): missing case');
});