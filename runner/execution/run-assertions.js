'use strict';

const { prepareDescriptorWithLocator } = require('./resolve-descriptor-locator');

/**
 * Collects inline step assertions and standalone assertions into the execution
 * order used by the runner.
 *
 * @param {Array<object>} steps
 * @param {Array<object>} assertions
 * @returns {Array<object>}
 */
function collectAssertionQueue(steps = [], assertions = []) {
  const queuedInlineAssertions = [];

  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
    const step = steps[stepIndex];
    if (!Array.isArray(step.assertions)) {
      continue;
    }

    for (const assertion of step.assertions) {
      queuedInlineAssertions.push({ ...assertion, stepIndex });
    }
  }

  const queuedStandaloneAssertions = assertions.map((assertion) => ({ ...assertion }));
  return queuedInlineAssertions.concat(queuedStandaloneAssertions);
}

/**
 * Executes assertions in order and stops early when continueOnFail is disabled.
 * It shares locator preparation with step execution so intent-based descriptors
 * behave consistently across the runner.
 *
 * @param {object} params
 * @returns {Promise<{aborted: boolean, results: Array<object>}>}
 */
async function runAssertions({
  steps,
  assertions,
  metadata,
  context,
  skills,
  logStore,
}) {
  const assertionsToRun = collectAssertionQueue(steps, assertions);
  const results = [];

  for (let assertionIndex = 0; assertionIndex < assertionsToRun.length; assertionIndex += 1) {
    const originalAssertion = assertionsToRun[assertionIndex];
    let assertionToExecute = originalAssertion;

    try {
      assertionToExecute = await prepareDescriptorWithLocator({
        descriptor: assertionToExecute,
        descriptorKind: 'assertion',
        descriptorIndex: assertionIndex,
        context,
        skills,
        logStore,
      });

      const assertionResult = await skills.executeAssertion({ assertion: assertionToExecute, context });
      const assertionStatus = assertionResult.passed ? 'pass' : 'fail';

      await skills.recordLog({
        event: `assert:${assertionToExecute.type}`,
        status: assertionStatus,
        detail: assertionResult.message || assertionToExecute.description || assertionToExecute.type,
        data: {
          assertionIndex,
          stepIndex: assertionToExecute.stepIndex,
          assertion: assertionToExecute,
          actual: assertionResult.actual,
          expected: assertionResult.expected,
        },
        logStore,
      });

      results.push({ assertion: assertionToExecute, result: assertionResult });

      if (!assertionResult.passed && assertionToExecute.continueOnFail !== true && metadata.continueOnFail !== true) {
        return { aborted: true, results };
      }
    } catch (error) {
      await skills.recordLog({
        event: `assert:${originalAssertion.type || 'unknown'}`,
        status: 'fail',
        detail: error.message,
        data: {
          assertionIndex,
          stepIndex: originalAssertion.stepIndex,
          assertion: originalAssertion,
        },
        logStore,
      });

      results.push({
        assertion: originalAssertion,
        result: {
          passed: false,
          actual: '',
          expected: originalAssertion.expected,
          message: error.message,
        },
      });

      if (originalAssertion.continueOnFail !== true && metadata.continueOnFail !== true) {
        return { aborted: true, results };
      }
    }
  }

  return { aborted: false, results };
}

module.exports = {
  collectAssertionQueue,
  runAssertions,
};