'use strict';

/**
 * Skill unit tests – exercise each skill in isolation without a live browser.
 * Run with: node tests/skills.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { parseTestCase } = require('../skills/parse-testcase/index.js');
const { logRecorder } = require('../skills/log-recorder/index.js');
const { reportGenerator } = require('../skills/report-generator/index.js');

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

const os = require('os');
const fs = require('fs');

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
