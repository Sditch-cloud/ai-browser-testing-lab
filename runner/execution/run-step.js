'use strict';

const { resolveNavigateStepUrl } = require('../helpers/navigation-utils');
const { prepareDescriptorWithLocator } = require('./resolve-descriptor-locator');

/**
 * Executes one browser step, including URL normalization, optional locator
 * resolution, action dispatch, and centralized error handling.
 *
 * @param {object} params
 * @returns {Promise<object>} Step execution result with abort metadata.
 */
async function runStep({
  step,
  stepIndex,
  metadata,
  context,
  skills,
  hooks,
  logStore,
}) {
  let stepToExecute = resolveNavigateStepUrl(step, metadata);

  try {
    stepToExecute = await prepareDescriptorWithLocator({
      descriptor: stepToExecute,
      descriptorKind: 'step',
      descriptorIndex: stepIndex,
      context,
      skills,
      logStore,
    });

    const stepExecutionResult = await skills.executeStepAction({ action: stepToExecute, context });
    const stepStatus = stepExecutionResult.status === 'pass' ? 'pass' : 'fail';

    await skills.recordLog({
      event: `browser-action:${stepToExecute.type}`,
      status: stepStatus,
      detail: stepExecutionResult.detail || stepToExecute.description || stepToExecute.type,
      data: {
        stepIndex,
        step: stepToExecute,
      },
      logStore,
    });

    if (stepStatus === 'fail') {
      throw new Error(stepExecutionResult.detail || `Step ${stepIndex + 1} failed.`);
    }

    return {
      aborted: false,
      context: stepExecutionResult.context || context,
      step: stepToExecute,
    };
  } catch (error) {
    const failureDetails = await hooks.onError({ error, context, stepIndex, metadata });

    await skills.recordLog({
      event: 'hook:on-error',
      status: 'fail',
      detail: failureDetails.errorMessage,
      data: {
        stepIndex,
        screenshotPath: failureDetails.screenshotPath,
        shouldAbort: failureDetails.shouldAbort,
      },
      logStore,
    });

    return {
      aborted: failureDetails.shouldAbort,
      context,
      step: stepToExecute,
      error,
      errorInfo: failureDetails,
    };
  }
}

module.exports = {
  runStep,
};