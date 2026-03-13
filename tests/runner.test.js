'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const reporters = require('../runner/reporters');
const { main, parseArgs } = require('../runner/cli');
const { runTestCase } = require('../runner');
const { parseTestCase } = require('../runner/runtime/parse-test-case');

function createLogRecorder(order = []) {
  return async function record({ event, status, detail = '', data = {}, timestamp, logStore }) {
    order.push(`log:${event}:${status}`);
    const logEntry = {
      event,
      status,
      detail,
      data,
      timestamp: timestamp || new Date().toISOString(),
    };

    if (Array.isArray(logStore)) {
      logStore.push(logEntry);
    }

    return { logEntry };
  };
}

test('runTestCase: executes steps and assertions in deterministic order and writes reports', async () => {
  const order = [];
  const reportDir = path.join(os.tmpdir(), `runner-reports-${Date.now()}`);

  const result = await runTestCase('sample', { reportDir }, {
    skills: {
      parseTestCase: async () => {
        order.push('parse');
        return {
          metadata: { name: 'sample', timeout: 1500, continueOnFail: false, baseUrl: 'http://example.test' },
          steps: [
            { type: 'navigate', url: '/login', description: 'Open login' },
            { type: 'fill', target: 'username field', value: 'demo', description: 'Enter username' },
          ],
          assertions: [
            { type: 'element-visible', testId: 'welcome-message', description: 'Welcome visible' },
          ],
        };
      },
      resolveLocator: async ({ descriptor }) => {
        order.push(`resolve:${descriptor.type}`);
        return {
          locator: { testId: 'login-username' },
          strategy: 'inferred:testId',
          detail: 'Resolved username field',
        };
      },
      browserAction: async ({ action, context }) => {
        order.push(`action:${action.type}`);
        return { status: 'pass', detail: `Executed ${action.type}`, context };
      },
      assert: async ({ assertion }) => {
        order.push(`assert:${assertion.type}`);
        return { passed: true, actual: 'visible', expected: 'visible', message: 'Assertion passed' };
      },
      logRecorder: createLogRecorder(order),
    },
    hooks: {
      beforeTest: async () => {
        order.push('before');
        return { page: {}, startedAt: new Date().toISOString() };
      },
      afterTest: async () => {
        order.push('after');
        return { endedAt: new Date().toISOString(), durationMs: 25 };
      },
      onError: async () => {
        order.push('error');
        return { screenshotPath: null, errorMessage: 'unexpected', shouldAbort: true };
      },
    },
    reporters,
  });

  assert.equal(result.passed, true);
  assert.ok(fs.existsSync(result.jsonPath));
  assert.ok(fs.existsSync(result.htmlPath));
  assert.deepEqual(order.slice(0, 7), [
    'parse',
    'log:parse-testcase:pass',
    'before',
    'log:hook:before-test:pass',
    'action:navigate',
    'log:browser-action:navigate:pass',
    'resolve:fill',
  ]);
  assert.ok(order.includes('assert:element-visible'));
  assert.ok(order.includes('after'));

  fs.rmSync(reportDir, { recursive: true, force: true });
});

test('runTestCase: aborts after failing step when continueOnFail is false', async () => {
  const order = [];
  const reportDir = path.join(os.tmpdir(), `runner-abort-${Date.now()}`);

  const result = await runTestCase('abort-case', { reportDir }, {
    skills: {
      parseTestCase: async () => ({
        metadata: { name: 'abort-case', timeout: 1000, continueOnFail: false },
        steps: [
          { type: 'click', testId: 'submit-button', description: 'Submit' },
          { type: 'wait', value: 10, description: 'Should never run' },
        ],
        assertions: [
          { type: 'url-contains', expected: '/done', description: 'Should be skipped' },
        ],
      }),
      resolveLocator: async ({ descriptor }) => descriptor,
      browserAction: async ({ action, context }) => {
        order.push(`action:${action.type}`);
        if (action.type === 'click') {
          return { status: 'fail', detail: 'Click failed', context };
        }

        return { status: 'pass', detail: 'Unexpected pass', context };
      },
      assert: async () => {
        order.push('assert');
        return { passed: true, actual: '', expected: '', message: 'ok' };
      },
      logRecorder: createLogRecorder(order),
    },
    hooks: {
      beforeTest: async () => ({ page: {}, startedAt: new Date().toISOString() }),
      afterTest: async () => ({ endedAt: new Date().toISOString(), durationMs: 20 }),
      onError: async ({ error }) => {
        order.push(`error:${error.message}`);
        return { screenshotPath: null, errorMessage: error.message, shouldAbort: true };
      },
    },
    reporters,
  });

  assert.equal(result.passed, false);
  assert.equal(result.aborted, true);
  assert.deepEqual(order.filter((entry) => entry.startsWith('action:')), ['action:click']);
  assert.equal(order.includes('assert'), false);
  assert.ok(result.logs.some((entry) => entry.event === 'assertions' && entry.status === 'skip'));

  fs.rmSync(reportDir, { recursive: true, force: true });
});

test('parseTestCase: supports explicit YAML file path', async () => {
  const dir = path.join(os.tmpdir(), `runner-parse-${Date.now()}`);
  const filePath = path.join(dir, 'custom.yaml');

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, [
    'metadata:',
    '  name: custom',
    '  description: file path parsing',
    'steps:',
    '  - type: wait',
    '    value: 5',
    'assertions:',
    '  - type: url-contains',
    '    expected: /ok',
  ].join('\n'), 'utf8');

  const parsed = await parseTestCase({ filePath });

  assert.equal(parsed.metadata.name, 'custom');
  assert.equal(parsed.steps.length, 1);
  assert.equal(parsed.assertions.length, 1);

  fs.rmSync(dir, { recursive: true, force: true });
});

test('parseArgs: resolves name and path based invocation', async () => {
  const fromName = parseArgs(['login', '--headed', '--timeout', '4500']);
  assert.equal(fromName.testCaseInput, 'login');
  assert.equal(fromName.options.headless, false);
  assert.equal(fromName.options.timeout, 4500);
  assert.equal(fromName.options.filePath, undefined);

  const fromPath = parseArgs(['tests/cases/login.yaml', '--report-dir', 'reports']);
  assert.ok(fromPath.options.filePath.endsWith(path.join('tests', 'cases', 'login.yaml')));
  assert.equal(fromPath.options.reportDir, 'reports');
});

test('runTestCase: name-based execution uses testName instead of file path', async () => {
  let parseArgsSeen = null;

  await runTestCase('login', { reportDir: path.join(os.tmpdir(), `runner-name-${Date.now()}`) }, {
    skills: {
      parseTestCase: async (args) => {
        parseArgsSeen = args;
        return {
          metadata: { name: 'login', timeout: 1000, continueOnFail: true },
          steps: [],
          assertions: [],
        };
      },
      resolveLocator: async ({ descriptor }) => descriptor,
      browserAction: async ({ context }) => ({ status: 'pass', detail: 'noop', context }),
      assert: async () => ({ passed: true, actual: '', expected: '', message: 'noop' }),
      logRecorder: createLogRecorder([]),
    },
    hooks: {
      beforeTest: async () => ({ page: {}, startedAt: new Date().toISOString() }),
      afterTest: async () => ({ endedAt: new Date().toISOString(), durationMs: 0 }),
      onError: async () => ({ screenshotPath: null, errorMessage: 'noop', shouldAbort: true }),
    },
    reporters,
  });

  assert.equal(parseArgsSeen.testName, 'login');
  assert.equal(parseArgsSeen.filePath, undefined);
});

test('cli main: returns success exit code and forwards parsed options', async () => {
  const calls = [];
  const output = [];
  const originalLog = console.log;
  console.log = (message) => output.push(String(message));

  try {
    const exitCode = await main(['login', '--headed', '--report-dir', 'reports'], {
      runTestCase: async (testCaseInput, options) => {
        calls.push({ testCaseInput, options });
        return {
          passed: true,
          summary: { total: 3, failed: 0 },
          jsonPath: 'reports/login.json',
          htmlPath: 'reports/login.html',
        };
      },
    });

    assert.equal(exitCode, 0);
    assert.equal(calls[0].testCaseInput, 'login');
    assert.equal(calls[0].options.headless, false);
    assert.ok(output.some((line) => line.includes('Test passed')));
  } finally {
    console.log = originalLog;
  }
});