'use strict';

const { runAssertions } = require('../execution/run-assertions');
const { runStep } = require('../execution/run-step');
const { summarizeRunnerLogs } = require('../helpers/log-summary');
const { mergeRuntimeMetadata } = require('../helpers/metadata-utils');
const { resolveReportOutputDir, resolveTestName } = require('../helpers/path-utils');
const { createRunnerDependencies } = require('../runtime/create-runner-dependencies');
const { createRuntimeState } = require('../runtime/create-runtime-state');

/**
 * Orchestrates a full test case run from parsed YAML through browser lifecycle,
 * step execution, assertion execution, and report generation.
 *
 * @param {string} testCaseInput - Test name or file path provided by the caller.
 * @param {object} [options] - Runner options from CLI or programmatic usage.
 * @param {object} [customDependencies] - Optional overrides used by tests.
 * @returns {Promise<object>} Test result including logs, summary, reports, and state.
 */
async function runTestCase(testCaseInput, options = {}, customDependencies = {}) {
  const dependencies = createRunnerDependencies(customDependencies);
  const { skills, hooks } = dependencies;
  const parsedTestCase = await skills.parseTestCase({
    testName: options.filePath ? undefined : testCaseInput,
    filePath: options.filePath,
    casesDir: options.casesDir,
  });

  const mergedMetadata = mergeRuntimeMetadata(parsedTestCase.metadata, options);
  const testName = resolveTestName(testCaseInput, mergedMetadata);
  const runtimeState = createRuntimeState({ metadata: { ...mergedMetadata, name: testName }, options });

  await skills.recordLog({
    event: 'parse-testcase',
    status: 'pass',
    detail: `Parsed test case "${testName}"`,
    data: {
      steps: parsedTestCase.steps.length,
      assertions: parsedTestCase.assertions.length,
    },
    logStore: runtimeState.logStore,
  });

  try {
    runtimeState.context = await hooks.beforeTest({
      metadata: runtimeState.metadata,
      headless: options.headless !== false,
      slowMo: typeof options.slowMo === 'number' ? options.slowMo : 0,
    });

    await skills.recordLog({
      event: 'hook:before-test',
      status: 'pass',
      detail: 'Browser context created',
      data: {
        headless: options.headless !== false,
      },
      logStore: runtimeState.logStore,
    });

    for (let stepIndex = 0; stepIndex < parsedTestCase.steps.length; stepIndex += 1) {
      const stepResult = await runStep({
        step: parsedTestCase.steps[stepIndex],
        stepIndex,
        metadata: runtimeState.metadata,
        context: runtimeState.context,
        skills,
        hooks,
        logStore: runtimeState.logStore,
      });

      runtimeState.context = stepResult.context || runtimeState.context;
      runtimeState.stepResults.push(stepResult);

      if (stepResult.aborted) {
        runtimeState.aborted = true;
        runtimeState.failureReason = stepResult.errorInfo || stepResult.error;
        break;
      }
    }

    if (!runtimeState.aborted) {
      const assertionRunResult = await runAssertions({
        steps: parsedTestCase.steps,
        assertions: parsedTestCase.assertions,
        metadata: runtimeState.metadata,
        context: runtimeState.context,
        skills,
        logStore: runtimeState.logStore,
      });

      runtimeState.assertionResults = assertionRunResult.results;
      runtimeState.aborted = assertionRunResult.aborted;
      if (assertionRunResult.aborted) {
        runtimeState.failureReason = new Error('Assertion execution aborted the test run.');
      }
    } else if (parsedTestCase.assertions.length > 0) {
      await skills.recordLog({
        event: 'assertions',
        status: 'skip',
        detail: 'Skipped assertions because step execution aborted the run',
        logStore: runtimeState.logStore,
      });
    }
  } catch (error) {
    runtimeState.aborted = true;
    runtimeState.failureReason = error;

    await skills.recordLog({
      event: 'runner',
      status: 'fail',
      detail: error.message,
      data: {
        stack: error.stack,
      },
      logStore: runtimeState.logStore,
    });
  } finally {
    runtimeState.timing = await hooks.afterTest({
      context: runtimeState.context,
      startedAt: runtimeState.context.startedAt,
    });

    await skills.recordLog({
      event: 'hook:after-test',
      status: 'info',
      detail: 'Browser context closed',
      data: runtimeState.timing,
      logStore: runtimeState.logStore,
    });
  }

  const summary = summarizeRunnerLogs(runtimeState.logStore, runtimeState.timing);
  const reportResult = await dependencies.reporters.generateReports({
    testName,
    metadata: runtimeState.metadata,
    logs: runtimeState.logStore,
    summary,
    outputDir: resolveReportOutputDir(options.reportDir),
    generatedAt: runtimeState.generatedAt,
  });

  return {
    testName,
    metadata: runtimeState.metadata,
    logs: runtimeState.logStore,
    summary: reportResult.summary,
    jsonPath: reportResult.jsonPath,
    htmlPath: reportResult.htmlPath,
    stepResults: runtimeState.stepResults,
    assertionResults: runtimeState.assertionResults,
    passed: summary.failed === 0,
    aborted: runtimeState.aborted,
    failureReason: runtimeState.failureReason,
  };
}

module.exports = {
  createRunnerDependencies,
  createRuntimeState,
  runTestCase,
};