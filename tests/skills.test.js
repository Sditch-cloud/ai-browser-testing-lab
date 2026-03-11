'use strict';

/**
 * Skill unit tests - exercise each skill in isolation without a live browser.
 * Run with: node tests/skills.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs');

const { parseTestCase } = require('../skills/parse-testcase/index.js');
const { resolveLocator } = require('../skills/resolve-locator/index.js');
const { browserAction } = require('../skills/browser-action/index.js');
const { assert: assertSkill } = require('../skills/assert/index.js');
const { logRecorder } = require('../skills/log-recorder/index.js');
const { reportGenerator } = require('../skills/report-generator/index.js');

class FakeLocator {
  constructor(kind, value, calls, options = {}) {
    this.kind = kind;
    this.value = value;
    this.calls = calls;
    this.options = options;
    this.visible = options.visible !== false;
    this.text = options.text || '';
    this.countValue = options.countValue ?? 1;
    this.attributes = options.attributes || {};
  }

  async click(options = {}) {
    this.calls.push({ method: 'click', kind: this.kind, value: this.value, options });
  }

  async fill(value, options = {}) {
    this.calls.push({ method: 'fill', kind: this.kind, value: this.value, fillValue: value, options });
  }

  async selectOption(value, options = {}) {
    this.calls.push({ method: 'selectOption', kind: this.kind, value: this.value, selectValue: value, options });
  }

  async hover(options = {}) {
    this.calls.push({ method: 'hover', kind: this.kind, value: this.value, options });
  }

  async waitFor(options = {}) {
    this.calls.push({ method: 'waitFor', kind: this.kind, value: this.value, options });
  }

  async isVisible() {
    return this.visible;
  }

  async innerText() {
    return this.text;
  }

  async count() {
    return this.countValue;
  }

  async getAttribute(name) {
    return this.attributes[name] ?? null;
  }
}

function createFakePage(locatorOptions = {}, candidates = []) {
  const calls = [];

  const getOptions = (kind, value) => locatorOptions[`${kind}:${value}`] || {};
  const buildLocator = (kind, value, options) => new FakeLocator(kind, value, calls, options || getOptions(kind, value));

  return {
    __calls: calls,
    async goto(url, options = {}) {
      calls.push({ method: 'goto', url, options });
    },
    async screenshot(options = {}) {
      calls.push({ method: 'screenshot', options });
    },
    async waitForTimeout(value) {
      calls.push({ method: 'waitForTimeout', value });
    },
    async waitForSelector(selector, options = {}) {
      calls.push({ method: 'waitForSelector', selector, options });
    },
    locator(selector) {
      return buildLocator('selector', selector);
    },
    getByTestId(testId) {
      return buildLocator('testId', testId);
    },
    getByLabel(label, options = {}) {
      return buildLocator('label', label, getOptions('label', label));
    },
    getByRole(role, options = {}) {
      return buildLocator('role', `${role}:${options.name || ''}`, getOptions('role', `${role}:${options.name || ''}`));
    },
    getByPlaceholder(placeholder, options = {}) {
      return buildLocator('placeholder', placeholder, getOptions('placeholder', placeholder));
    },
    getByText(text, options = {}) {
      return buildLocator('text', text, getOptions('text', text));
    },
    async evaluate() {
      return candidates;
    },
    url() {
      return 'http://localhost:5173/dashboard';
    },
    async title() {
      return 'Dashboard';
    },
  };
}

// ---------------------------------------------------------------------------
// parse-testcase
// ---------------------------------------------------------------------------

test('parse-testcase: resolves login.yaml correctly', async () => {
  const result = await parseTestCase({ testName: 'login' });

  assert.ok(result.metadata, 'should have metadata');
  assert.equal(result.metadata.name, 'login');
  assert.ok(Array.isArray(result.steps), 'steps should be an array');
  assert.ok(result.steps.length > 0, 'login test should have at least one step');
  assert.ok(Array.isArray(result.assertions), 'assertions should be an array');
  assert.ok(result.assertions.length > 0, 'login test should have at least one assertion');
});

test('parse-testcase: resolves search.yaml correctly', async () => {
  const result = await parseTestCase({ testName: 'search' });
  assert.equal(result.metadata.name, 'search');
  assert.ok(result.steps.length > 0);
});

test('parse-testcase: throws for missing test case', async () => {
  await assert.rejects(
    () => parseTestCase({ testName: 'nonexistent' }),
    /Test case file not found/
  );
});

test('parse-testcase: throws when testName is omitted', async () => {
  await assert.rejects(
    () => parseTestCase({}),
    /testName.*required/i
  );
});

// ---------------------------------------------------------------------------
// resolve-locator / browser-action / assert
// ---------------------------------------------------------------------------

test('resolve-locator: uses explicit testId when present', async () => {
  const result = await resolveLocator({ descriptor: { type: 'click', testId: 'login-submit' } });
  assert.deepEqual(result.locator, { testId: 'login-submit' });
  assert.equal(result.strategy, 'testId');
});

test('resolve-locator: infers testId from natural-language target using page candidates', async () => {
  const page = createFakePage({}, [
    {
      role: 'textbox',
      dataTestId: 'login-username',
      id: 'username',
      labels: ['Username'],
      accessibleName: 'Username',
      text: '',
      placeholder: 'Enter username',
      nameAttr: '',
      value: '',
    },
    {
      role: 'button',
      dataTestId: 'login-submit',
      id: '',
      labels: [],
      accessibleName: 'Sign In',
      text: 'Sign In',
      placeholder: '',
      nameAttr: '',
      value: '',
    },
  ]);

  const result = await resolveLocator({
    descriptor: { type: 'fill', target: 'username field', description: 'Enter username' },
    context: { page },
  });

  assert.deepEqual(result.locator, { testId: 'login-username' });
  assert.equal(result.strategy, 'inferred:testId');
});

test('browser-action: fills using inferred locator when selector is omitted', async () => {
  const page = createFakePage({}, [
    {
      role: 'textbox',
      dataTestId: 'login-username',
      id: 'username',
      labels: ['Username'],
      accessibleName: 'Username',
      text: '',
      placeholder: 'Enter username',
      nameAttr: '',
      value: '',
    },
  ]);

  const result = await browserAction({
    action: { type: 'fill', target: 'username field', value: 'demo', description: 'Enter username' },
    context: { page },
  });

  assert.equal(result.status, 'pass');
  assert.deepEqual(page.__calls[0], {
    method: 'fill',
    kind: 'testId',
    value: 'login-username',
    fillValue: 'demo',
    options: { timeout: 30000 },
  });
});

test('assert: supports non-selector element assertions via testId', async () => {
  const page = createFakePage({
    'testId:welcome-message': { text: 'Welcome back, Demo User!' },
  });

  const result = await assertSkill({
    assertion: {
      type: 'element-text',
      testId: 'welcome-message',
      expected: 'Welcome back, Demo User!',
    },
    context: { page },
  });

  assert.equal(result.passed, true);
});

// ---------------------------------------------------------------------------
// log-recorder
// ---------------------------------------------------------------------------

test('log-recorder: records a pass entry', async () => {
  const logStore = [];
  const { logEntry } = await logRecorder({
    event: 'browser-action:click',
    status: 'pass',
    detail: 'Clicked submit',
    logStore,
  });

  assert.equal(logEntry.event, 'browser-action:click');
  assert.equal(logEntry.status, 'pass');
  assert.equal(logStore.length, 1);
  assert.ok(logEntry.timestamp, 'should have a timestamp');
});

test('log-recorder: records a fail entry', async () => {
  const logStore = [];
  await logRecorder({ event: 'assert:url-contains', status: 'fail', detail: 'URL mismatch', logStore });
  assert.equal(logStore[0].status, 'fail');
});

test('log-recorder: appends multiple entries to logStore', async () => {
  const logStore = [];
  await logRecorder({ event: 'e1', status: 'pass', logStore });
  await logRecorder({ event: 'e2', status: 'info', logStore });
  await logRecorder({ event: 'e3', status: 'skip', logStore });
  assert.equal(logStore.length, 3);
});

test('log-recorder: throws for invalid status', async () => {
  await assert.rejects(
    () => logRecorder({ event: 'test', status: 'unknown' }),
    /status.*must be/i
  );
});

test('log-recorder: works without logStore', async () => {
  const { logEntry } = await logRecorder({ event: 'standalone', status: 'info' });
  assert.equal(logEntry.event, 'standalone');
});

// ---------------------------------------------------------------------------
// report-generator
// ---------------------------------------------------------------------------

test('report-generator: creates json and html reports', async () => {
  const outputDir = path.join(os.tmpdir(), `report-test-${Date.now()}`);
  const logs = [
    { event: 'browser-action:navigate', status: 'pass', detail: 'Navigated', timestamp: new Date().toISOString() },
    { event: 'assert:url-contains', status: 'fail', detail: 'URL mismatch', timestamp: new Date().toISOString() },
  ];

  const result = await reportGenerator({
    testName: 'login',
    metadata: { name: 'login', description: 'test', author: 'ai', tags: ['smoke'] },
    logs,
    outputDir,
  });

  assert.ok(fs.existsSync(result.jsonPath), 'JSON report should exist');
  assert.ok(fs.existsSync(result.htmlPath), 'HTML report should exist');
  assert.equal(result.summary.total, 2);
  assert.equal(result.summary.passed, 1);
  assert.equal(result.summary.failed, 1);

  const json = JSON.parse(fs.readFileSync(result.jsonPath, 'utf8'));
  assert.equal(json.testName, 'login');
  assert.equal(json.logs.length, 2);

  const html = fs.readFileSync(result.htmlPath, 'utf8');
  assert.ok(html.includes('login'), 'HTML should contain test name');
  assert.ok(html.includes('PASS'), 'HTML should contain PASS');
  assert.ok(html.includes('FAIL'), 'HTML should contain FAIL');

  fs.rmSync(outputDir, { recursive: true });
});

test('report-generator: throws when testName is missing', async () => {
  await assert.rejects(
    () => reportGenerator({ logs: [] }),
    /testName.*required/i
  );
});
