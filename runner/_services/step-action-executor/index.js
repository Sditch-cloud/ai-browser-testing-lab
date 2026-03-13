'use strict';

const tools = require('../../tools');

/**
 * Executes a single browser step against the active Playwright page.
 * This adapter is the narrow bridge between runner orchestration and the lower-
 * level browser action registry.
 *
 * @param {object} params
 * @param {object} params.action
 * @param {object} params.context
 * @returns {Promise<{status: string, detail: string, context: object}>}
 */
async function executeStepAction({ action, context }) {
  if (!action || !action.type) {
    throw new Error('step-action-executor: "action.type" is required.');
  }
  if (!context || !context.page) {
    throw new Error('step-action-executor: "context.page" must be a live Playwright Page object.');
  }

  try {
    const actionHandler = tools.browser[action.type];
    if (!actionHandler) {
      throw new Error(`step-action-executor: Unknown action type "${action.type}".`);
    }

    return await actionHandler({ action, context });
  } catch (error) {
    return { status: 'fail', detail: error.message, context };
  }
}

module.exports = {
  executeStepAction,
};